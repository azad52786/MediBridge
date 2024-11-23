"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOtherSocketId = void 0;
let findOtherSocketId = (socket, rooms) => {
    for (let room of rooms.values()) {
        if (room.user1.socket === socket) {
            return room;
        }
        if (room.user2.socket === socket) {
            return room;
        }
    }
    return null;
};
exports.findOtherSocketId = findOtherSocketId;
