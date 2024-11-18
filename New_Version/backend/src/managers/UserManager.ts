// import { Socket } from "socket.io";

import { Room } from "../models/room.instance";
import { User } from "../models/user.interface";
import { findOtherSocketId } from "../utils/helperFunction";
import { RoomService } from "./RoomService";



// export interface User {
//     socket : string , 
//     userName : string , 
// }


export class UserService {
    private users : User[];
    private queue : User[];
    private  roomService : RoomService;
    
    constructor() {
        this.users = [];
        this.queue = [];
        this.roomService = new RoomService();
    }
    
    addUser(socket : string , userName : string) : void {
        // maintain the total user in the call page 
        // this.users.push({socket , userName});
        if(this.queue.findIndex(s => s.socket === socket) !== -1) {
            console.log("you're already inside queue!");
            return;
        }
        if(this.roomService.findOtherSocketId(socket)) {
            console.log("user already added")
            return ;
        }
        this.queue.push({socket , userName});
        console.log('User added: ' + userName);
        this.matchingUser(socket);
    }
    
    addNextUser(socket1: string, socket2: string , roomId : string) {
        let roomDetails : Room | undefined = this.roomService.getRoomDetails(roomId);
        if(!roomDetails) return ;
        this.roomService.removeRoomDetils(roomId);
        this.addUser(roomDetails.user1.socket , roomDetails.user1.userName);
        this.addUser(roomDetails.user2.socket , roomDetails.user2.userName);
    }
    
    matchingUser(socket : string) : void {
        if(this.queue.length < 2) {
            console.log("queue kahli hea");
            return ;
        }
        
        let user1 = this.queue.shift();
        let user2 = this.queue.shift();
        if(!user1 || !user2) return ;
        console.log("Two user are " , user1, user2);
        this.roomService.createRoom(user1, user2);  
    }
    
    removeRoom(socket : string , userService : UserService , disconnected : boolean = false) : void {
        let roomId : string | null = this.roomService.getRoomBySocket(socket);
        if(!roomId) return;
        this.roomService.removeRoomDetils(roomId);
    }
}



