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
exports.handleMatchmakingEvents = void 0;
const handleMatchmakingEvents = (io, socket, userService) => {
    // new Added
    socket.on("request-room", (_a) => __awaiter(void 0, [_a], void 0, function* ({ name, roomId, userImage, }) {
        console.log(`Matchmaking request from : ${name}`);
        yield userService.addUser(socket.id, name, roomId, userImage);
    }));
    socket.on("stop-call", (_a) => __awaiter(void 0, [_a], void 0, function* ({ roomId, remoteSocketId, name }) {
        console.log("remote socketId is :", remoteSocketId);
        io.to(remoteSocketId).emit("stop-by-remote-user");
        yield userService.addCallMateOnly(socket.id, remoteSocketId, roomId);
    }));
    socket.on("disconnect", () => __awaiter(void 0, void 0, void 0, function* () {
        console.log(`User disconnected: ${socket.id}`);
        yield userService.removeUserFromQueue(socket.id);
        yield userService.removeRoom(socket.id, userService, true);
    }));
};
exports.handleMatchmakingEvents = handleMatchmakingEvents;
