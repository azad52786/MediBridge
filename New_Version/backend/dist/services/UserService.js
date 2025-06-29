"use strict";
// import { Socket } from "socket.io";
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
exports.UserService = void 0;
const __1 = require("..");
const RoomService_1 = require("../services/RoomService");
const RedisService_1 = require("./RedisService");
class UserService {
    constructor() {
        this.redisService = RedisService_1.RedisService.getInstance();
        this.roomService = new RoomService_1.RoomService(this.redisService);
        this.initializeRedis();
    }
    initializeRedis() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.redisService.connect();
            }
            catch (error) {
                console.error("Failed to connect to Redis:", error);
            }
        });
    }
    addUser(socket, userName, roomId, userImage) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Checking already in the queue or not
                if (yield this.redisService.isUserInQueue(socket)) {
                    console.log("You're already inside the Queue ❌❌");
                    return;
                }
                // Already present and Click on next button -> Interested to join someone else
                if (roomId) {
                    const roomDetails = yield this.roomService.getRoomDetails(roomId);
                    if (!roomDetails)
                        return;
                    const user1 = roomDetails === null || roomDetails === void 0 ? void 0 : roomDetails.user1;
                    const user2 = roomDetails === null || roomDetails === void 0 ? void 0 : roomDetails.user2;
                    yield this.redisService.addUserToQueue(user1);
                    yield this.redisService.addUserToQueue(user2);
                    // remove the room
                    this.roomService.removeRoomDetils(roomId);
                }
                // Came for the first time and Click next
                else {
                    yield this.redisService.addUserToQueue({
                        socket,
                        userName,
                        userImage,
                    });
                }
                yield this.matchingUsers();
            }
            catch (error) {
                console.error("Error in addUser:", error);
            }
        });
    }
    addCallMateOnly(socket, remoteSocketId, roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const roomDetails = yield this.roomService.getRoomDetails(roomId);
                console.log("roomDetails is :", roomId, " ", roomDetails);
                if (!roomDetails)
                    return;
                const user1 = roomDetails.user1;
                const user2 = roomDetails.user2;
                console.log(user1, " ", remoteSocketId, " ", user2);
                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    if (user1.socket === remoteSocketId) {
                        console.log("new joining of user1");
                        yield this.redisService.addUserToQueue(user1);
                    }
                    else {
                        console.log("new joining of user2");
                        yield this.redisService.addUserToQueue(user2);
                    }
                    this.roomService.removeRoomDetils(roomId);
                    yield this.matchingUsers();
                }), 2000);
            }
            catch (error) {
                console.error("Error in addCallMateOnly:", error);
            }
        });
    }
    matchingUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const queueLength = yield this.redisService.getQueueLength();
                if (queueLength < 2) {
                    console.log("Queue size is less then 2");
                    return;
                }
                const user1 = yield this.redisService.getRandomUserFromQueue();
                const user2 = yield this.redisService.getRandomUserFromQueue();
                if (!user1 || !user2)
                    return;
                console.log("Matched users are : ", user1, user2);
                this.roomService.createRoom(user1, user2);
            }
            catch (error) {
                console.error("Error in matchingUsers:", error);
            }
        });
    }
    removeRoom(socket_1, userService_1) {
        return __awaiter(this, arguments, void 0, function* (socket, userService, disconnected = false) {
            let roomId = yield this.roomService.getRoomBySocket(socket);
            if (!roomId)
                return;
            this.roomService.removeRoomDetils(roomId);
        });
    }
    cleanup() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.redisService.disconnect();
            }
            catch (error) {
                console.error("Error during cleanup:", error);
            }
        });
    }
    // Helper method to remove user from queue
    removeUserFromQueue(socket) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const isUserInQueue = yield this.redisService.isUserInQueue(socket);
                if (isUserInQueue)
                    yield this.redisService.removeUserFromQueue(socket);
            }
            catch (error) {
                console.error("Error removing user from queue:", error);
            }
        });
    }
    // Helper method to get queue status
    getQueueStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const length = yield this.redisService.getQueueLength();
                const users = yield this.redisService.getAllQueueUsers();
                return { length, users };
            }
            catch (error) {
                console.error("Error getting queue status:", error);
                return { length: 0, users: [] };
            }
        });
    }
    getRoomStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const allRooms = yield this.roomService.getAllRooms();
                const totalRooms = Object.keys(allRooms).length;
                const totalUsersInRooms = totalRooms * 2;
                const activeConnections = __1.io.engine.clientsCount;
                return {
                    rooms: allRooms,
                    totalRooms,
                    totalUsersInRooms,
                    activeConnections,
                };
            }
            catch (error) {
                console.error("Error getting room status:", error);
                return {
                    totalRooms: 0,
                    totalUsersInRooms: 0,
                    rooms: {},
                    activeConnections: 0,
                };
            }
        });
    }
}
exports.UserService = UserService;
