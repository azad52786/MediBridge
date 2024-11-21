import { Server, Socket } from "socket.io";

export const handleChatEvents = (io: Server, socket: Socket) => {
    socket.on('newMessage', ({message , roomId , remoteSocket}) => {
        console.log(message , roomId , "message send");
        if(remoteSocket){
            io.to(socket.id).emit("Message:recived" , {from: socket.id , message});
            io.to(remoteSocket).emit("Message:recived" , {from: socket.id , message});
        }
    });
}