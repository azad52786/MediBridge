"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const redis_1 = require("redis");
class RedisService {
    constructor() {
        this.queueKey = "user_queue";
        this.roomKey = "rooms";
        this.socketToRoomKey = "socket_to_room";
        this.client = (0, redis_1.createClient)({
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
    static getInstance() {
        if (!RedisService.instance) {
            RedisService.instance = new RedisService();
        }
        return RedisService.instance;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client.isOpen) {
                yield this.client.connect();
            }
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.client.isOpen) {
                yield this.client.disconnect();
            }
        });
    }
    // =========================== User Management Methods ==========================
    addUserToQueue(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.lPush(this.queueKey, JSON.stringify(user));
                console.log(`user ${user === null || user === void 0 ? void 0 : user.userName} added to the Queue`);
            }
            catch (error) {
                console.log(`Error Occur while adding ${user === null || user === void 0 ? void 0 : user.userName} to the Queue : ${error}`);
                throw error;
            }
        });
    }
    getQueueLength() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.client.lLen(this.queueKey);
            }
            catch (error) {
                console.log(`Error Occur while finding the length of the Queue: ${error}`);
                throw error;
            }
        });
    }
    getRandomUserFromQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const lengthOfQueue = yield this.getQueueLength();
                if (lengthOfQueue === 0) {
                    console.log("No user Inside the Queue.");
                    return null;
                }
                // Finding the Random Index
                const randomIndex = Math.floor(Math.random() * lengthOfQueue);
                // Get user at random Index
                const userData = yield this.client.lIndex(this.queueKey, randomIndex);
                if (!userData)
                    return null;
                //Remove that user from the Queue
                yield this.client.lSet(this.queueKey, randomIndex, "__DELETED__");
                yield this.client.lRem(this.queueKey, 1, "__DELETED__");
                return JSON.parse(userData);
            }
            catch (error) {
                console.log(`Error Occur while getting the Random user : ${error}`);
                throw error;
            }
        });
    }
    getAllQueueUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userData = yield this.client.lRange(this.queueKey, 0, -1);
                return userData.map((user) => JSON.parse(user));
            }
            catch (error) {
                console.log("Error Occur while finding all the Queue user: ", error);
                throw error;
            }
        });
    }
    isUserInQueue(socket) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userDataSet = yield this.client.lRange(this.queueKey, 0, -1); // 0-> start Index , -1 -> End Index
                return userDataSet.some((userData) => {
                    const user = JSON.parse(userData);
                    return user.socket === socket;
                });
            }
            catch (error) {
                console.log(`Error Occure while checking user present in the Queue or not`);
                throw error;
            }
        });
    }
    removeUserFromQueue(socket) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userDataSet = yield this.client.lRange(this.queueKey, 0, -1);
                for (let userData of userDataSet) {
                    let user = JSON.parse(userData);
                    if (user.socket === socket) {
                        this.client.lRem(this.queueKey, 1, userData);
                        console.log(`Deleteing user ${user.userName} from the Queue`);
                        return true;
                    }
                }
                return false;
            }
            catch (error) {
                console.log(`Error Occur While Removing the user from Queue.`);
                throw error;
            }
        });
    }
    clearQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.del(this.queueKey);
                console.log("Queue Cleared");
            }
            catch (error) {
                console.log(`Error occur while clearing the Queue: ${error}`);
                throw error;
            }
        });
    }
    // ================================= Room Management Methods ==========================
    createRoom(roomId, room) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Store room data
                yield this.client.hSet(this.roomKey, roomId, JSON.stringify(room));
                // mapping each socket to roomId for quick lookup
                yield this.client.hSet(this.socketToRoomKey, room.user1.socket, roomId);
                yield this.client.hSet(this.socketToRoomKey, room.user2.socket, roomId);
                console.log(`Room ${roomId} is created for users ${room.user1.userName} and ${room.user2.userName}`);
            }
            catch (error) {
                console.log(`Error occur while createing room: ${error}`);
                throw error;
            }
        });
    }
    getRoomDetails(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const roomDetails = yield this.client.hGet(this.roomKey, roomId);
                if (!roomDetails)
                    return null;
                return JSON.parse(roomDetails);
            }
            catch (error) {
                console.log(`Error occur while finding room details: ${error}`);
                throw error;
            }
        });
    }
    getRoomBySocket(socket) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.client.hGet(this.socketToRoomKey, socket);
            }
            catch (error) {
                console.log(`Error occur while getting roomId by using socket: ${error}`);
                throw error;
            }
        });
    }
    removeRoom(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const room = (yield this.getRoomDetails(roomId));
                if (!room)
                    return false;
                yield this.client.hDel(this.socketToRoomKey, room.user1.socket);
                yield this.client.hDel(this.socketToRoomKey, room.user2.socket);
                const result = yield this.client.hDel(this.roomKey, roomId);
                console.log(`Removing room ${roomId}.`);
                return result > 0;
            }
            catch (error) {
                console.log(`Error occur while removeing room : ${error}`);
                throw error;
            }
        });
    }
    getAllRooms() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const allRooms = yield this.client.hGetAll(this.roomKey);
                const rooms = {};
                for (let [roomId, roomDetails] of Object.entries(allRooms)) {
                    rooms[roomId] = JSON.parse(roomDetails);
                }
                return rooms;
            }
            catch (error) {
                console.log(`Error occur while finding all rooms : ${error}`);
                throw error;
            }
        });
    }
    getRoomCount() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.client.hLen(this.roomKey);
            }
            catch (error) {
                console.log(`Error occur while finding room count: ${error}`);
                throw error;
            }
        });
    }
    roomExists(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.client.hExists(this.roomKey, roomId);
                return result > 0;
            }
            catch (error) {
                console.log(`Error checking if room exists: ${error}`);
                throw error;
            }
        });
    }
    updateRoom(roomId, room) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.hSet(this.roomKey, roomId, JSON.stringify(room));
                console.log(`Room ${roomId} updated`);
            }
            catch (error) {
                console.log(`Error occur while updateing the room: ${error}`);
                throw error;
            }
        });
    }
    // Clean up orphaned socket mappings (utility method)
    cleanupOrphanedSocketMappings() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const socketMappings = yield this.client.hGetAll(this.socketToRoomKey);
                const existingRooms = yield this.client.hKeys(this.roomKey);
                const existingRoomSet = new Set(existingRooms);
                for (const [socket, roomId] of Object.entries(socketMappings)) {
                    if (!existingRoomSet.has(roomId)) {
                        yield this.client.hDel(this.socketToRoomKey, socket);
                        console.log(`Cleaned up orphaned socket mapping: ${socket} -> ${roomId}`);
                    }
                }
            }
            catch (error) {
                console.error("Error cleaning up orphaned socket mappings:", error);
                throw error;
            }
        });
    }
    // Clear all rooms and socket mappings
    clearAllRooms() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.del(this.roomKey);
                yield this.client.del(this.socketToRoomKey);
                console.log("All rooms and socket mappings cleared");
            }
            catch (error) {
                console.error("Error clearing all rooms:", error);
                throw error;
            }
        });
    }
}
exports.RedisService = RedisService;
