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
    // signalling is done here 

    socket.on('call:request', ({name}) => {
        console.log("request: " + name);
        userService.addUser(socket.id, name);
    });
    
    socket.on("call:offer" , ({roomId , from , name , to , offer}) => {
       io.to(to).emit("call:offer" , {remoteSocketId : from, remoteUserName : name, roomId , offer});
    })
  
    
    socket.on('call:accepted' , ({ to  , answer }) => {
       io.to(to).emit("call:accepted:done" , {answer});
       console.log("call done");
    })

    socket.on("negotiation:handshake" , ({ to , offer}) => {
       io.to(to).emit("negotiation:handshake" , {from : socket.id , offer});
    })
    
    socket.on("negotiation:answer" , ({ to , answer }) => {
      io.to(to).emit("negotiation:final" , {from : socket.id , answer});
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
