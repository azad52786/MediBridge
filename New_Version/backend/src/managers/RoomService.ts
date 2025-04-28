import { io } from "..";
import { Room } from "../models/room.instance";
import { User } from "../models/user.interface";
import { findOtherSocketId, generateRoomId } from "../utils/helperFunction";
import { UserService } from "./UserManager";

export class RoomService {
	private rooms: Map<string, Room>;
	constructor() {
		this.rooms = new Map<string, Room>();
	}

	createRoom(user1: User, user2: User) {
		let roomId = generateRoomId();
		this.rooms.set(roomId, { user1, user2 });
		// send the socket Id of User 2 for sending offer
		io.to(user1.socket).emit("match-done", {
			roomId,
			remoteUserDetails: user2,
		});
	}

	getRoomDetails(roomId: string): Room | undefined {
		return this.rooms.get(roomId);
	}

	getRoomBySocket(socketId: string): string | null {
		for (let [roomid, users] of this.rooms.entries()) {
			if (users.user1.socket === socketId || users.user2.socket === socketId) {
				return roomid;
			}
		}
		return null;
	}

	removeRoomDetils(roomId: string): void {
		this.rooms.delete(roomId);
	}

	findOtherSocketId = (socket: string): Room | null => {
		for (let room of this.rooms.values()) {
			if (room.user1.socket === socket) {
				return room;
			}
			if (room.user2.socket === socket) {
				return room;
			}
		}
		return null;
	};
}
