"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const UserManager_1 = require("./managers/UserManager");
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
const userService = new UserManager_1.UserService();
exports.io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    // Register matchmaking events
    (0, matchmaking_1.handleMatchmakingEvents)(exports.io, socket, userService);
    // Register signalling events
    (0, signaling_1.handleSignalingEvents)(exports.io, socket, userService);
    // Register Chat Events
    (0, chatEvents_1.handleChatEvents)(exports.io, socket);
});
const PORT = process.env.PORT || 3000;
console.log(process.env.PORT);
app.get('/', (req, res) => {
    res.send('Hello, TypeScript!');
});
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
