import { User } from "./user.interface";

export interface Room {
	roomId?: number;
	user1: User;
	user2: User;
}
