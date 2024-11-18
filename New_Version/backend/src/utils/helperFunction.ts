import { Room } from "../models/room.instance"
import { User } from "../models/user.interface";

export let findOtherSocketId = (socket : string , rooms : Map<string , Room>) : Room | null => {
    for(let room of rooms.values()){
        if(room.user1.socket === socket){
            return room;
        }
        if(room.user2.socket === socket){
            return room;
        }
    }
    return null;
}