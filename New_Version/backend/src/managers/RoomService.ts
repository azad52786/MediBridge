import { io } from "..";
import { User } from "./UserManager";


const GLOBAL_ROOM_ID = 1;

export interface Room {
    user1 : User , 
    user2 : User 
}



export class RoomService {
    private rooms : Map<string, Room>;
    constructor(){
        this.rooms = new Map<string ,Room>();
    }
    
    createRoom(user1 : User , user2 : User){
        let roomId = GLOBAL_ROOM_ID.toString();
        this.rooms.set(roomId, {user1 , user2});
        // send the socket Id of User 2 for sending offer 
        io.to(user1.socket).emit("match:done", {roomId , remoteUserName : user2.userName , remoteSocketId : user2.socket});
    }
}