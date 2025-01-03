// import { Socket } from "socket.io";

import { io } from "..";
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
        let alreadyJoinedroomId = this.roomService.getRoomBySocket(socket);
        if(alreadyJoinedroomId) {
            console.log("user already added && call for Skip this Call");
            let roomDetails : Room | undefined = this.roomService.getRoomDetails(alreadyJoinedroomId);
            if(roomDetails) {
                this.roomService.removeRoomDetils(alreadyJoinedroomId);
            }
            let user1Socket = roomDetails?.user1.socket;
            let user2Socket = roomDetails?.user2.socket;
            console.log("first userID " , user1Socket)
            console.log("Second userId " , user2Socket)
            if(user1Socket) io.to(user1Socket).emit("please:join:for:new:call");
            if(user2Socket) io.to(user2Socket).emit("please:join:for:new:call");
            return;
        }
        this.queue.push({socket , userName});
        console.log('User added: ' + userName);
        this.matchingUser(socket);
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
    
    addNextUser(socket1: string, socket2: string , roomId : string) {
        let roomDetails : Room | undefined = this.roomService.getRoomDetails(roomId);
        if(!roomDetails) return ;
        this.roomService.removeRoomDetils(roomId);
        // setTimeout(() => {
            this.addUser(roomDetails.user1.socket , roomDetails.user1.userName);
            this.addUser(roomDetails.user2.socket , roomDetails.user2.userName);
        // }, 3000);
    } 
    
    addOneUser( roomId : string , socket : string ) : void {
        let roomDetails : Room | undefined = this.roomService.getRoomDetails(roomId);
        if(!roomDetails) return ;
        this.roomService.removeRoomDetils(roomId);
        setTimeout(() => {
            if(roomDetails.user1.socket === socket){
                this.addUser(roomDetails.user2.socket , roomDetails.user2.userName);
            }else if(roomDetails.user2.socket === socket){
                this.addUser(roomDetails.user1.socket , roomDetails.user1.userName);
            }
        }, 1000);
    }
    

    
    removeRoom(socket : string , userService : UserService , disconnected : boolean = false) : void {
        let roomId : string | null = this.roomService.getRoomBySocket(socket);
        if(!roomId) return;
        this.roomService.removeRoomDetils(roomId);
    }
}



