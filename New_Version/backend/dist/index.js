"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const UserService_1 = require("./services/UserService");
const matchmaking_1 = require("./events/matchmaking");
const signaling_1 = require("./events/signaling");
const chatEvents_1 = require("./events/chatEvents");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
exports.io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
    },
});
const userService = new UserService_1.UserService();
exports.io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    // Register match-making events
    (0, matchmaking_1.handleMatchmakingEvents)(exports.io, socket, userService);
    // Register signalling events
    (0, signaling_1.handleSignalingEvents)(exports.io, socket, userService);
    // Register Chat Events
    (0, chatEvents_1.handleChatEvents)(exports.io, socket);
});
const PORT = process.env.PORT || 3000;
console.log(process.env.PORT);
app.get("/", (req, res) => {
    res.send("Hello, TypeScript!");
});
// API endpoint to monitor queue and rooms
app.get("/api/status", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const queueStatus = yield userService.getQueueStatus();
        const roomStatus = yield userService.getRoomStatus();
        res.json({
            queue: queueStatus,
            rooms: roomStatus,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error("Error getting status:", error);
        res.status(500).json({ error: "Failed to get status" });
    }
}));
// Handle graceful shutdown
process.on("SIGINT", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Shutting down server...");
    yield userService.cleanup();
    process.exit(0);
}));
process.on("SIGTERM", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Shutting down server...");
    yield userService.cleanup();
    process.exit(0);
}));
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
