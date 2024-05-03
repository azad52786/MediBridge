const {Server} = require('socket.io');

const io = new Server(8000 , {
    cors: {
        origin : '*' , 
        credentials : true , 
    }
})


let HashMaP = new Map();
let UserRoleToSocketMap = new Map();
io.on('connection' , (socket) => {
    console.log("connected socket is : " , socket.id);
    socket.join(1111)
    socket.on('room:join' , ({email , roomId , role}) => {
        HashMaP.set(socket.id , email);
        UserRoleToSocketMap.set(role , socket.id);
        if(HashMaP.size < 3){
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

    socket.on("call:end" , () => {
        console.log("call end call")
        HashMaP.delete(socket.id);
        // let socket = UserRoleToSocketMap.get(userRole);
        let currSkt = 'abcd';
        for(let [key, value] of HashMaP){
            console.log(key);
            currSkt = key;
        }
        console.log('present User :- ' , currSkt);
        HashMaP.delete(currSkt);
        io.to(currSkt).emit('call:end');
    })
    socket.on('disconnect', () => {
        HashMaP.delete(socket.id);
        console.log(HashMaP.size)
        let currSkt = 'abcd';
        for(let [key, value] of HashMaP){
            console.log(key);
            currSkt = key;
        }
        console.log('present User :- ' , currSkt);
        io.to(currSkt).emit('user:disconnect');
    });
})