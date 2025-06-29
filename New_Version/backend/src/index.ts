import express from "express";
import http from "http";
import { Socket } from "socket.io";
import { Server } from "socket.io";
import { UserService } from "./services/UserService";
import { handleMatchmakingEvents } from "./events/matchmaking";
import { handleSignalingEvents } from "./events/signaling";
import { handleChatEvents } from "./events/chatEvents";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const server = http.createServer(app);

export const io = new Server(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
		credentials: true,
	},
});

const userService = new UserService();

io.on("connection", (socket: Socket) => {
	console.log(`User connected: ${socket.id}`);

	// Register match-making events
	handleMatchmakingEvents(io, socket, userService);

	// Register signalling events
	handleSignalingEvents(io, socket, userService);

	// Register Chat Events
	handleChatEvents(io, socket);
});

const PORT = process.env.PORT || 3000;
console.log(process.env.PORT);

app.get("/", (req, res) => {
	res.send("Hello, TypeScript!");
});

// API endpoint to monitor queue and rooms
app.get("/api/status", async (req, res) => {
	try {
		const queueStatus = await userService.getQueueStatus();
		const roomStatus = await userService.getRoomStatus();

		res.json({
			queue: queueStatus,
			rooms: roomStatus,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error("Error getting status:", error);
		res.status(500).json({ error: "Failed to get status" });
	}
});

// Handle graceful shutdown
process.on("SIGINT", async () => {
	console.log("Shutting down server...");
	await userService.cleanup();
	process.exit(0);
});

process.on("SIGTERM", async () => {
	console.log("Shutting down server...");
	await userService.cleanup();
	process.exit(0);
});

server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
