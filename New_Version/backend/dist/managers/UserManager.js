"use strict";
// import { Socket } from "socket.io";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const RoomService_1 = require("./RoomService");
// export interface User {
//     socket : string ,
//     userName : string ,
// }
class UserService {
    constructor() {
        this.queue = [];
        this.roomService = new RoomService_1.RoomService();
    }
    addUser(socket, userName, roomId, userImage) {
        // Checking already in the queue or not
        if (this.queue.findIndex((s) => s.socket === socket) !== -1) {
            console.log("You're already inside the Queue ❌❌");
            return;
        }
        // Already present and Click on next button -> Interested to join someone else
        if (roomId) {
            const roomDetails = this.roomService.getRoomDetails(roomId);
            if (!roomDetails)
                return;
            const user1 = roomDetails === null || roomDetails === void 0 ? void 0 : roomDetails.user1;
            const user2 = roomDetails === null || roomDetails === void 0 ? void 0 : roomDetails.user2;
            this.queue.push(user1);
            this.queue.push(user2);
            // remove the room
            this.roomService.removeRoomDetils(roomId);
        }
        // Came for the first time and Click next
        else {
            this.queue.push({
                socket,
                userName,
                userImage
            });
        }
        this.matchingUsers();
    }
    addCallMateOnly(socket, remoteSocketId, roomId) {
        const roomDetails = this.roomService.getRoomDetails(roomId);
        console.log("roomDetails is :", roomId, " ", roomDetails);
        if (!roomDetails)
            return;
        const user1 = roomDetails.user1;
        const user2 = roomDetails.user2;
        console.log(user1, " ", remoteSocketId, " ", user2);
        setTimeout(() => {
            if (user1.socket === remoteSocketId) {
                console.log("new joining of user1");
                this.queue.push(user1);
            }
            else {
                console.log("new joining of user2");
                this.queue.push(user2);
            }
            this.roomService.removeRoomDetils(roomId);
            this.matchingUsers();
        }, 2000);
    }
    matchingUsers() {
        if (this.queue.length < 2) {
            console.log("Queue size is less then 2");
            return;
        }
        const randomIndex1 = Math.floor(Math.random() * this.queue.length);
        const user1 = this.queue.splice(randomIndex1, 1)[0];
        const randomIndex2 = Math.floor(Math.random() * this.queue.length);
        const user2 = this.queue.splice(randomIndex2, 1)[0];
        if (!user1 || !user2)
            return;
        console.log("Matched users are : ", user1, user2);
        this.roomService.createRoom(user1, user2);
    }
    addNextUser(socket1, socket2, roomId) {
        let roomDetails = this.roomService.getRoomDetails(roomId);
        if (!roomDetails)
            return;
        this.roomService.removeRoomDetils(roomId);
        // setTimeout(() => {
        // this.addUser(roomDetails.user1.socket, roomDetails.user1.userName);
        // this.addUser(roomDetails.user2.socket, roomDetails.user2.userName);
        // }, 3000);
    }
    addOneUser(roomId, socket) {
        let roomDetails = this.roomService.getRoomDetails(roomId);
        if (!roomDetails)
            return;
        this.roomService.removeRoomDetils(roomId);
        setTimeout(() => {
            if (roomDetails.user1.socket === socket) {
                // this.addUser(roomDetails.user2.socket, roomDetails.user2.userName);
            }
            else if (roomDetails.user2.socket === socket) {
                // this.addUser(roomDetails.user1.socket, roomDetails.user1.userName);
            }
        }, 1000);
    }
    removeRoom(socket, userService, disconnected = false) {
        let roomId = this.roomService.getRoomBySocket(socket);
        if (!roomId)
            return;
        this.roomService.removeRoomDetils(roomId);
    }
}
exports.UserService = UserService;
