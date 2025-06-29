import { Server, Socket } from "socket.io";
import { UserService } from "../services/UserService";

export const handleMatchmakingEvents = (
	io: Server,
	socket: Socket,
	userService: UserService
) => {
	// new Added
	socket.on(
		"request-room",
		async ({
			name,
			roomId,
			userImage,
		}: {
			name: string;
			roomId: string | null;
			userImage: Base64URLString;
		}) => {
			console.log(`Matchmaking request from : ${name}`);
			await userService.addUser(socket.id, name, roomId, userImage);
		}
	);

	socket.on("stop-call", async ({ roomId, remoteSocketId, name }) => {
		console.log("remote socketId is :", remoteSocketId);
		io.to(remoteSocketId).emit("stop-by-remote-user");
		await userService.addCallMateOnly(socket.id, remoteSocketId, roomId);
	});

	socket.on("disconnect", async () => {
		console.log(`User disconnected: ${socket.id}`);
		await userService.removeUserFromQueue(socket.id);
		await userService.removeRoom(socket.id, userService, true);
	});
};
