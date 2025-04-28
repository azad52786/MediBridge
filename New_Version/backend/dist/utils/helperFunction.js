"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOtherSocketId = void 0;
exports.generateRoomId = generateRoomId;
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
function generateRoomId() {
    return (Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15));
}
