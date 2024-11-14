// import { Socket } from "socket.io";

import { RoomService } from "./RoomService";


export interface User {
    socket : string , 
    userName : string , 
    // location : string , // later 
}


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
        this.users.push({socket , userName});
        this.queue.push({socket , userName});
        console.log('User added: ' + userName);
        this.matchingUser(socket);
    }
    
    matchingUser(socket : string) : void {
        if(this.queue.length < 2) return;
        
        let user1 = this.queue.shift();
        let user2 = this.queue.shift();
        if(!user1 || !user2) return ;
        console.log("Two user are " , user1, user2);
        
        this.roomService.createRoom(user1, user2);
        
        
        
    }
}



