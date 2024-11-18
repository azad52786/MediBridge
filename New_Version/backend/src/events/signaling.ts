import { Server, Socket } from "socket.io";
import { UserService } from "../managers/UserManager";

export const handleSignalingEvents = (io: Server, socket: Socket ,  userService : UserService) => {
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
        console.log("Call accepted" , answer);
    });

    socket.on("negotiation:handshake", ({ to , offer }) => {
        io.to(to).emit("negotiation:handshake", { from: socket.id, offer });
    });

    socket.on("negotiation:answer", ({ to, ans }) => {
        io.to(to).emit("negotiation:final", { from: socket.id, ans });
    });
};
