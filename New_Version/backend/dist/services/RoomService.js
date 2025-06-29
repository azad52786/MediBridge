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
exports.RoomService = void 0;
const __1 = require("..");
const helperFunction_1 = require("../utils/helperFunction");
const RedisService_1 = require("./RedisService");
class RoomService {
    constructor(redisService) {
        this.redisService = redisService || RedisService_1.RedisService.getInstance();
        this.initializeRedis();
    }
    initializeRedis() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.redisService.connect();
            }
            catch (error) {
                console.error("Failed to connect to Redis in RoomService:", error);
            }
        });
    }
    createRoom(user1, user2) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let roomId = (0, helperFunction_1.generateRoomId)();
                const room = { user1, user2 };
                yield this.redisService.createRoom(roomId, room);
                // Sending the socket id and user details to initiate the call
                __1.io.to(user1.socket).emit("match-done", {
                    roomId,
                    remoteUserDetails: user2,
                });
            }
            catch (error) {
                console.error("Error creating room:", error);
            }
        });
    }
    getRoomDetails(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.redisService.getRoomDetails(roomId);
            }
            catch (error) {
                console.error("Error getting room details:", error);
                return null;
            }
        });
    }
    getRoomBySocket(socketId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.redisService.getRoomBySocket(socketId);
            }
            catch (error) {
                console.error("Error getting room by socket:", error);
                return null;
            }
        });
    }
    removeRoomDetils(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.redisService.removeRoom(roomId);
            }
            catch (error) {
                console.error("Error removing room:", error);
            }
        });
    }
    findOtherSocketId(socket) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const roomId = yield this.redisService.getRoomBySocket(socket);
                if (!roomId)
                    return null;
                return yield this.redisService.getRoomDetails(roomId);
            }
            catch (error) {
                console.error("Error finding other socket ID:", error);
                return null;
            }
        });
    }
    // Additional helper methods for Redis-based room management
    roomExists(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.redisService.roomExists(roomId);
            }
            catch (error) {
                console.error("Error checking if room exists:", error);
                return false;
            }
        });
    }
    updateRoom(roomId, room) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.redisService.updateRoom(roomId, room);
            }
            catch (error) {
                console.error("Error updating room:", error);
            }
        });
    }
    getAllRooms() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.redisService.getAllRooms();
            }
            catch (error) {
                console.error("Error getting all rooms:", error);
                return {};
            }
        });
    }
    getRoomCount() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.redisService.getRoomCount();
            }
            catch (error) {
                console.error("Error getting room count:", error);
                return 0;
            }
        });
    }
    cleanup() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.redisService.disconnect();
            }
            catch (error) {
                console.error("Error during room service cleanup:", error);
            }
        });
    }
}
exports.RoomService = RoomService;
