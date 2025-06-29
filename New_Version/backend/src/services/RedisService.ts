import { createClient, RedisClientType } from "redis";
import { User } from "../models/user.interface";
import { Room } from "../models/room.instance";

export class RedisService {
	private static instance: RedisService;
	private client: RedisClientType;
	private queueKey = "user_queue";
	private roomKey = "rooms";
	private socketToRoomKey = "socket_to_room";

	private constructor() {
		this.client = createClient({
			username: process.env.REDIS_USERNAME,
			password: process.env.REDIS_PASSWORD,
			socket: {
				host: process.env.REDIS_HOST,
				port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : undefined,
			},
		});

		this.client.on("error", (err) => {
			console.log("Redis Client Error :", err);
		});

		this.client.on("connect", () => {
			console.log("Redis client is connected.");
		});
	}

	// Optimizeing the performance by applying singletan Pattern
	public static getInstance(): RedisService {
		if (!RedisService.instance) {
			RedisService.instance = new RedisService();
		}
		return RedisService.instance;
	}

	async connect(): Promise<void> {
		if (!this.client.isOpen) {
			await this.client.connect();
		}
	}

	async disconnect(): Promise<void> {
		if (this.client.isOpen) {
			await this.client.disconnect();
		}
	}

	// =========================== User Management Methods ==========================

	async addUserToQueue(user: User): Promise<void> {
		try {
			await this.client.lPush(this.queueKey, JSON.stringify(user));
			console.log(`user ${user?.userName} added to the Queue`);
		} catch (error) {
			console.log(
				`Error Occur while adding ${user?.userName} to the Queue : ${error}`
			);
			throw error;
		}
	}

	async getQueueLength(): Promise<number> {
		try {
			return await this.client.lLen(this.queueKey);
		} catch (error) {
			console.log(
				`Error Occur while finding the length of the Queue: ${error}`
			);
			throw error;
		}
	}

	async getRandomUserFromQueue(): Promise<User | null> {
		try {
			const lengthOfQueue = await this.getQueueLength();
			if (lengthOfQueue === 0) {
				console.log("No user Inside the Queue.");
				return null;
			}

			// Finding the Random Index
			const randomIndex = Math.floor(Math.random() * lengthOfQueue);

			// Get user at random Index
			const userData = await this.client.lIndex(this.queueKey, randomIndex);
			if (!userData) return null;

			//Remove that user from the Queue
			await this.client.lSet(this.queueKey, randomIndex, "__DELETED__");
			await this.client.lRem(this.queueKey, 1, "__DELETED__");

			return JSON.parse(userData) as User;
		} catch (error) {
			console.log(`Error Occur while getting the Random user : ${error}`);
			throw error;
		}
	}

	async getAllQueueUsers(): Promise<User[]> {
		try {
			const userData = await this.client.lRange(this.queueKey, 0, -1);
			return userData.map((user) => JSON.parse(user) as User);
		} catch (error) {
			console.log("Error Occur while finding all the Queue user: ", error);
			throw error;
		}
	}

	async isUserInQueue(socket: string): Promise<boolean> {
		try {
			const userDataSet = await this.client.lRange(this.queueKey, 0, -1); // 0-> start Index , -1 -> End Index
			return userDataSet.some((userData) => {
				const user = JSON.parse(userData) as User;
				return user.socket === socket;
			});
		} catch (error) {
			console.log(
				`Error Occure while checking user present in the Queue or not`
			);
			throw error;
		}
	}

	async removeUserFromQueue(socket: string): Promise<boolean> {
		try {
			const userDataSet = await this.client.lRange(this.queueKey, 0, -1);
			for (let userData of userDataSet) {
				let user = JSON.parse(userData) as User;
				if (user.socket === socket) {
					this.client.lRem(this.queueKey, 1, userData);
					console.log(`Deleteing user ${user.userName} from the Queue`);
					return true;
				}
			}
			return false;
		} catch (error) {
			console.log(`Error Occur While Removing the user from Queue.`);
			throw error;
		}
	}

	async clearQueue(): Promise<void> {
		try {
			await this.client.del(this.queueKey);
			console.log("Queue Cleared");
		} catch (error) {
			console.log(`Error occur while clearing the Queue: ${error}`);
			throw error;
		}
	}

	// ================================= Room Management Methods ==========================

	async createRoom(roomId: string, room: Room): Promise<void> {
		try {
			// Store room data
			await this.client.hSet(this.roomKey, roomId, JSON.stringify(room));

			// mapping each socket to roomId for quick lookup
			await this.client.hSet(this.socketToRoomKey, room.user1.socket, roomId);
			await this.client.hSet(this.socketToRoomKey, room.user2.socket, roomId);

			console.log(
				`Room ${roomId} is created for users ${room.user1.userName} and ${room.user2.userName}`
			);
		} catch (error) {
			console.log(`Error occur while createing room: ${error}`);
			throw error;
		}
	}

	async getRoomDetails(roomId: string): Promise<Room | null> {
		try {
			const roomDetails = await this.client.hGet(this.roomKey, roomId);
			if (!roomDetails) return null;

			return JSON.parse(roomDetails) as Room;
		} catch (error) {
			console.log(`Error occur while finding room details: ${error}`);
			throw error;
		}
	}

	async getRoomBySocket(socket: string): Promise<string | null> {
		try {
			return await this.client.hGet(this.socketToRoomKey, socket);
		} catch (error) {
			console.log(`Error occur while getting roomId by using socket: ${error}`);
			throw error;
		}
	}

	async removeRoom(roomId: string): Promise<boolean> {
		try {
			const room = (await this.getRoomDetails(roomId)) as Room;
			if (!room) return false;

			await this.client.hDel(this.socketToRoomKey, room.user1.socket);
			await this.client.hDel(this.socketToRoomKey, room.user2.socket);

			const result = await this.client.hDel(this.roomKey, roomId);

			console.log(`Removing room ${roomId}.`);

			return result > 0;
		} catch (error) {
			console.log(`Error occur while removeing room : ${error}`);
			throw error;
		}
	}

	async getAllRooms(): Promise<{
		[roomId: string]: Room;
	}> {
		try {
			const allRooms = await this.client.hGetAll(this.roomKey);
			const rooms: { [roomId: string]: Room } = {};

			for (let [roomId, roomDetails] of Object.entries(allRooms)) {
				rooms[roomId] = JSON.parse(roomDetails) as Room;
			}
			return rooms;
		} catch (error) {
			console.log(`Error occur while finding all rooms : ${error}`);
			throw error;
		}
	}

	async getRoomCount(): Promise<number> {
		try {
			return await this.client.hLen(this.roomKey);
		} catch (error) {
			console.log(`Error occur while finding room count: ${error}`);
			throw error;
		}
	}

	async roomExists(roomId: string): Promise<boolean> {
		try {
			const result = await this.client.hExists(this.roomKey, roomId);
			return result > 0;
		} catch (error) {
			console.log(`Error checking if room exists: ${error}`);
			throw error;
		}
	}

	async updateRoom(roomId: string, room: Room): Promise<void> {
		try {
			await this.client.hSet(this.roomKey, roomId, JSON.stringify(room));
			console.log(`Room ${roomId} updated`);
		} catch (error) {
			console.log(`Error occur while updateing the room: ${error}`);
			throw error;
		}
	}

	// Clean up orphaned socket mappings (utility method)
	async cleanupOrphanedSocketMappings(): Promise<void> {
		try {
			const socketMappings = await this.client.hGetAll(this.socketToRoomKey);
			const existingRooms = await this.client.hKeys(this.roomKey);
			const existingRoomSet = new Set(existingRooms);

			for (const [socket, roomId] of Object.entries(socketMappings)) {
				if (!existingRoomSet.has(roomId)) {
					await this.client.hDel(this.socketToRoomKey, socket);
					console.log(
						`Cleaned up orphaned socket mapping: ${socket} -> ${roomId}`
					);
				}
			}
		} catch (error) {
			console.error("Error cleaning up orphaned socket mappings:", error);
			throw error;
		}
	}

	// Clear all rooms and socket mappings
	async clearAllRooms(): Promise<void> {
		try {
			await this.client.del(this.roomKey);
			await this.client.del(this.socketToRoomKey);
			console.log("All rooms and socket mappings cleared");
		} catch (error) {
			console.error("Error clearing all rooms:", error);
			throw error;
		}
	}
}
