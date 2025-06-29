import { io } from "..";
import { Room } from "../models/room.instance";
import { User } from "../models/user.interface";
import { findOtherSocketId, generateRoomId } from "../utils/helperFunction";
import { RedisService } from "./RedisService";

export class RoomService {
	private redisService: RedisService;

	constructor(redisService?: RedisService) {
		this.redisService = redisService || RedisService.getInstance();
		this.initializeRedis();
	}

	private async initializeRedis(): Promise<void> {
		try {
			await this.redisService.connect();
		} catch (error) {
			console.error("Failed to connect to Redis in RoomService:", error);
		}
	}

	async createRoom(user1: User, user2: User): Promise<void> {
		try {
			let roomId = generateRoomId();
			const room: Room = { user1, user2 };

			await this.redisService.createRoom(roomId, room);

			// Sending the socket id and user details to initiate the call
			io.to(user1.socket).emit("match-done", {
				roomId,
				remoteUserDetails: user2,
			});
		} catch (error) {
			console.error("Error creating room:", error);
		}
	}

	async getRoomDetails(roomId: string): Promise<Room | null> {
		try {
			return await this.redisService.getRoomDetails(roomId);
		} catch (error) {
			console.error("Error getting room details:", error);
			return null;
		}
	}

	async getRoomBySocket(socketId: string): Promise<string | null> {
		try {
			return await this.redisService.getRoomBySocket(socketId);
		} catch (error) {
			console.error("Error getting room by socket:", error);
			return null;
		}
	}

	async removeRoomDetils(roomId: string): Promise<void> {
		try {
			await this.redisService.removeRoom(roomId);
		} catch (error) {
			console.error("Error removing room:", error);
		}
	}

	async findOtherSocketId(socket: string): Promise<Room | null> {
		try {
			const roomId = await this.redisService.getRoomBySocket(socket);
			if (!roomId) return null;

			return await this.redisService.getRoomDetails(roomId);
		} catch (error) {
			console.error("Error finding other socket ID:", error);
			return null;
		}
	}

	// Additional helper methods for Redis-based room management
	async roomExists(roomId: string): Promise<boolean> {
		try {
			return await this.redisService.roomExists(roomId);
		} catch (error) {
			console.error("Error checking if room exists:", error);
			return false;
		}
	}

	async updateRoom(roomId: string, room: Room): Promise<void> {
		try {
			await this.redisService.updateRoom(roomId, room);
		} catch (error) {
			console.error("Error updating room:", error);
		}
	}

	async getAllRooms(): Promise<{ [roomId: string]: Room }> {
		try {
			return await this.redisService.getAllRooms();
		} catch (error) {
			console.error("Error getting all rooms:", error);
			return {};
		}
	}

	async getRoomCount(): Promise<number> {
		try {
			return await this.redisService.getRoomCount();
		} catch (error) {
			console.error("Error getting room count:", error);
			return 0;
		}
	}

	async cleanup(): Promise<void> {
		try {
			await this.redisService.disconnect();
		} catch (error) {
			console.error("Error during room service cleanup:", error);
		}
	}
}
