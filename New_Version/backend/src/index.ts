import express from 'express'
import http from 'http';
import { Socket } from'socket.io';
import { Server } from 'socket.io';
import { UserService } from './managers/UserManager';
import { handleMatchmakingEvents } from './events/matchmaking';
import { handleSignalingEvents } from './events/signaling';
const app = express();
const server = http.createServer(app);

export const io = new Server(server , {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const userService = new UserService();

io.on('connection', (socket : Socket) => {
   console.log(`User connected: ${socket.id}`);

    // Register matchmaking events
    handleMatchmakingEvents(io, socket , userService);

    // Register signalling events
    handleSignalingEvents(io, socket , userService);
});


const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello, TypeScript!');
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
