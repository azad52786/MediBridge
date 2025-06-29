// import { Socket } from "socket.io";

import { io } from "..";
import { Room } from "../models/room.instance";
import { User } from "../models/user.interface";
import { RoomService } from "../services/RoomService";
import { RedisService } from "./RedisService";

export class UserService {
	private redisService: RedisService;
	private roomService: RoomService;

	constructor() {
		this.redisService = RedisService.getInstance();
		this.roomService = new RoomService(this.redisService);
		this.initializeRedis();
	}

	private async initializeRedis(): Promise<void> {
		try {
			await this.redisService.connect();
		} catch (error) {
			console.error("Failed to connect to Redis:", error);
		}
	}

	async addUser(
		socket: string,
		userName: string,
		roomId: string | null,
		userImage: Base64URLString
	): Promise<void> {
		try {
			// Checking already in the queue or not
			if (await this.redisService.isUserInQueue(socket)) {
				console.log("You're already inside the Queue ❌❌");
				return;
			}

			// Already present and Click on next button -> Interested to join someone else
			if (roomId) {
				const roomDetails = await this.roomService.getRoomDetails(roomId);
				if (!roomDetails) return;
				const user1 = roomDetails?.user1;
				const user2 = roomDetails?.user2;
				await this.redisService.addUserToQueue(user1);
				await this.redisService.addUserToQueue(user2);
				// remove the room
				this.roomService.removeRoomDetils(roomId);
			}
			// Came for the first time and Click next
			else {
				await this.redisService.addUserToQueue({
					socket,
					userName,
					userImage,
				});
			}

			await this.matchingUsers();
		} catch (error) {
			console.error("Error in addUser:", error);
		}
	}

	async addCallMateOnly(
		socket: string,
		remoteSocketId: string,
		roomId: string
	): Promise<void> {
		try {
			const roomDetails = await this.roomService.getRoomDetails(roomId);
			console.log("roomDetails is :", roomId, " ", roomDetails);
			if (!roomDetails) return;
			const user1 = roomDetails.user1;
			const user2 = roomDetails.user2;
			console.log(user1, " ", remoteSocketId, " ", user2);
			setTimeout(async () => {
				if (user1.socket === remoteSocketId) {
					console.log("new joining of user1");
					await this.redisService.addUserToQueue(user1);
				} else {
					console.log("new joining of user2");
					await this.redisService.addUserToQueue(user2);
				}
				this.roomService.removeRoomDetils(roomId);
				await this.matchingUsers();
			}, 2000);
		} catch (error) {
			console.error("Error in addCallMateOnly:", error);
		}
	}

	async matchingUsers(): Promise<void> {
		try {
			const queueLength = await this.redisService.getQueueLength();
			if (queueLength < 2) {
				console.log("Queue size is less then 2");
				return;
			}

			const user1 = await this.redisService.getRandomUserFromQueue();
			const user2 = await this.redisService.getRandomUserFromQueue();

			if (!user1 || !user2) return;
			console.log("Matched users are : ", user1, user2);
			this.roomService.createRoom(user1, user2);
		} catch (error) {
			console.error("Error in matchingUsers:", error);
		}
	}

	async removeRoom(
		socket: string,
		userService: UserService,
		disconnected: boolean = false
	): Promise<void> {
		let roomId: string | null = await this.roomService.getRoomBySocket(socket);
		if (!roomId) return;
		this.roomService.removeRoomDetils(roomId);
	}

	async cleanup(): Promise<void> {
		try {
			await this.redisService.disconnect();
		} catch (error) {
			console.error("Error during cleanup:", error);
		}
	}

	// Helper method to remove user from queue
	async removeUserFromQueue(socket: string): Promise<void> {
		try {
			const isUserInQueue = await this.redisService.isUserInQueue(socket);
			if (isUserInQueue) await this.redisService.removeUserFromQueue(socket);
		} catch (error) {
			console.error("Error removing user from queue:", error);
		}
	}

	// Helper method to get queue status
	async getQueueStatus(): Promise<{ length: number; users: User[] }> {
		try {
			const length = await this.redisService.getQueueLength();
			const users = await this.redisService.getAllQueueUsers();
			return { length, users };
		} catch (error) {
			console.error("Error getting queue status:", error);
			return { length: 0, users: [] };
		}
	}

	async getRoomStatus(): Promise<{
		totalRooms: number;
		totalUsersInRooms: number;
		rooms: { [roomId: string]: Room };
		activeConnections: number;
	}> {
		try {
			const allRooms = await this.roomService.getAllRooms();
			const totalRooms = Object.keys(allRooms).length;
			const totalUsersInRooms = totalRooms * 2;

			const activeConnections = io.engine.clientsCount;

			return {
				rooms: allRooms,
				totalRooms,
				totalUsersInRooms,
				activeConnections,
			};
		} catch (error) {
			console.error("Error getting room status:", error);
			return {
				totalRooms: 0,
				totalUsersInRooms: 0,
				rooms: {},
				activeConnections: 0,
			};
		}
	}
}
