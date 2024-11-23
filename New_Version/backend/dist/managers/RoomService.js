"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomService = void 0;
const __1 = require("..");
const constant_1 = require("../utils/constant");
class RoomService {
    constructor() {
        this.findOtherSocketId = (socket) => {
            for (let room of this.rooms.values()) {
                if (room.user1.socket === socket) {
                    return room;
                }
                if (room.user2.socket === socket) {
                    return room;
                }
            }
            return null;
        };
        this.rooms = new Map();
    }
    createRoom(user1, user2) {
        let roomId = constant_1.GLOBAL_ROOM_ID.toString();
        constant_1.GLOBAL_ROOM_ID++;
        this.rooms.set(roomId, { user1, user2 });
        // send the socket Id of User 2 for sending offer
        __1.io.to(user1.socket).emit("match:done", {
            roomId,
            remoteUserName: user2.userName,
            remoteSocketId: user2.socket,
        });
    }
    getRoomDetails(roomId) {
        return this.rooms.get(roomId);
    }
    getRoomBySocket(socketId) {
        for (let [roomid, users] of this.rooms.entries()) {
            if (users.user1.socket === socketId || users.user2.socket === socketId) {
                return roomid;
            }
        }
        return null;
    }
    removeRoomDetils(roomId) {
        this.rooms.delete(roomId);
        console.log("Room Deleted");
    }
}
exports.RoomService = RoomService;
