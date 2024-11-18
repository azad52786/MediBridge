import { Server, Socket } from "socket.io";
import { UserService } from "../managers/UserManager";



export const handleMatchmakingEvents = (io: Server, socket: Socket ,  userService : UserService) => {
    socket.on("call:request", ({ name }) => {
        console.log(`Matchmaking request from: ${name}`);
        userService.addUser(socket.id, name);
    });
    
    socket.on("newConnection" , ({name , remoteSocket , roomId}) => {
        io.to(remoteSocket).emit("connection:end");
        userService.addNextUser(socket.id, remoteSocket , roomId);
        
    })

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        userService.removeRoom(socket.id , userService ,  true );
    });
};
