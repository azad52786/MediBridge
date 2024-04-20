const {Server} = require('socket.io');

const io = new Server(8000 , {
    cors: {
        origin : '*' , 
        credentials : true , 
    }
})


let HashMpa = new Map();
io.on('connection' , (socket) => {
    console.log("connected socket is : " , socket.id);
    socket.join(1111)
    socket.on('room:join' , ({email , roomId , role}) => {
        HashMpa.set(socket.id , email);
        if(HashMpa.size < 3){
            io.to(socket.id).emit('room:join' , {email , roomId , role});
            io.to(roomId).emit('user:join' , {email , newUser : socket.id })
            socket.join(roomId);
        }
        else{
            socket.emit("room:full" , "room is full");
        }
    })
    socket.on("newUser:join", ({to}) => {
        console.log("sending Remote user :- " , to)
        // socket.broadcast.emit('remoteUser:join', { from: socket.id });
        io.to(to).emit('remoteUser:join', { from: socket.id });
    })

    socket.on('user:call' , ({to , offer}) => {
        io.to(to).emit('incomingCall' , {from : socket.id , offer});
    })

    socket.on('call:accepted' , ({to , ans}) => {
        io.to(to).emit('call:accepted:done' , {from : socket.id , ans});
    })

    socket.on('peer:nego:needed' , ({to , offer}) => {
        io.to(to).emit('peer:nego:needed' , {from : socket.id , offer});
    })

    socket.on('peer:nego:done' , ({to , ans}) => {
        io.to(to).emit('peer:nego:done' , {from : socket.id , ans});
    })

    socket.on("newMessage" , ({message , userRole}) => {
        io.to(1111).emit("Message:recived" , {message , user : userRole});
    })
})