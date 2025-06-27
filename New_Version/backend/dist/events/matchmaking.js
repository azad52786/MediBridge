"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMatchmakingEvents = void 0;
const handleMatchmakingEvents = (io, socket, userService) => {
    // new Added
    socket.on("request-room", ({ name, roomId, userImage, }) => {
        console.log(`Matchmaking request from : ${name}`);
        userService.addUser(socket.id, name, roomId, userImage);
    });
    socket.on("newConnection", ({ name, remoteSocket, roomId }) => {
        io.to(remoteSocket).emit("connection:end");
        userService.addNextUser(socket.id, remoteSocket, roomId);
    });
    // socket.on("call:stop", ({ roomId }) => {
    // 	userService.addOneUser(roomId, socket.id);
    // });
    socket.on("stop-call", ({ roomId, remoteSocketId, name }) => {
        console.log("remote socketId is :", remoteSocketId);
        io.to(remoteSocketId).emit("stop-by-remote-user");
        userService.addCallMateOnly(socket.id, remoteSocketId, roomId);
    });
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        userService.removeRoom(socket.id, userService, true);
    });
};
exports.handleMatchmakingEvents = handleMatchmakingEvents;
