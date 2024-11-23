"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleChatEvents = void 0;
const handleChatEvents = (io, socket) => {
    socket.on('newMessage', ({ message, roomId, remoteSocket }) => {
        console.log(message, roomId, "message send");
        if (remoteSocket) {
            io.to(socket.id).emit("Message:recived", { from: socket.id, message });
            io.to(remoteSocket).emit("Message:recived", { from: socket.id, message });
        }
    });
};
exports.handleChatEvents = handleChatEvents;
