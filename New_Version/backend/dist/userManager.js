"use strict";
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Socket } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
    },
});
io.on('connection', (socket) => {
    console.log('User connected with socket id ' + socket.id);
    socket.emit("connected");
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
    res.send('Hello, TypeScript!');
});
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
