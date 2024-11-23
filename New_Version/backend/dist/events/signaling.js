"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSignalingEvents = void 0;
const handleSignalingEvents = (io, socket, userService) => {
    socket.on("call:offer", ({ roomId, from, name, to, offer }) => {
        io.to(to).emit("call:offer", {
            remoteSocketId: from,
            remoteUserName: name,
            roomId,
            offer,
        });
    });
    socket.on("call:accepted", ({ to, answer }) => {
        io.to(to).emit("call:accepted:done", { answer });
    });
    socket.on("negotiation:handshake", ({ to, offer }) => {
        io.to(to).emit("negotiation:handshake", { from: socket.id, offer });
    });
    socket.on("negotiation:answer", ({ to, ans }) => {
        io.to(to).emit("negotiation:final", { from: socket.id, ans });
    });
};
exports.handleSignalingEvents = handleSignalingEvents;
