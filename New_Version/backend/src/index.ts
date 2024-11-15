// import { Socket } from 'socket.io';
// const express = require('express');
// const http = require('http');
// // const { Server } = require('socket.io')
// import { Server } from 'socket.io';

import express from 'express'
import http from 'http';
import { Socket } from'socket.io';
import { Server } from 'socket.io';
import { UserService } from './managers/UserManager';
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
    console.log('User connected with socket id ' + socket.id);

    socket.emit("connected");

    socket.on('call:request', ({name}) => {
        userService.addUser(socket.id, name);
    });
    
    socket.on("call:offer" , ({roomId , from , name , to , offer}) => {
       io.to(to).emit("call:offer" , {remoteSocketId : from, remoteUserName : name, roomId , offer});
    })
    
    socket.on("call:answer" , ({to , roomId , answer}) => {
       io.to(to).emit("call:accepted" , {answer, roomId});
    })
    
    socket.on('call:accepted' , ({ to  , answer }) => {
       io.to(to).emit("call:accepted:done" , {answer});
    })

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
