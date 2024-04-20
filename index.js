warning: in the working copy of 'frontend/src/index.css', LF will be replaced by CRLF the next time Git touches it
[1mdiff --git a/backend/index.js b/backend/index.js[m
[1mindex a78e9b7..4f61dea 100644[m
[1m--- a/backend/index.js[m
[1m+++ b/backend/index.js[m
[36m@@ -8,17 +8,24 @@[m [mconst io = new Server(8000 , {[m
 })[m
 [m
 [m
[31m-[m
[32m+[m[32mlet HashMpa = new Map();[m
 io.on('connection' , (socket) => {[m
     console.log("connected socket is : " , socket.id);[m
     socket.join(1111)[m
     socket.on('room:join' , ({email , roomId , role}) => {[m
[31m-        io.to(socket.id).emit('room:join' , {email , roomId , role});[m
[31m-        io.to(roomId).emit('user:join' , {email , newUser : socket.id })[m
[31m-        socket.join(roomId);[m
[32m+[m[32m        HashMpa.set(socket.id , email);[m
[32m+[m[32m        if(HashMpa.size < 3){[m
[32m+[m[32m            io.to(socket.id).emit('room:join' , {email , roomId , role});[m
[32m+[m[32m            io.to(roomId).emit('user:join' , {email , newUser : socket.id })[m
[32m+[m[32m            socket.join(roomId);[m
[32m+[m[32m        }[m
[32m+[m[32m        else{[m
[32m+[m[32m            socket.emit("room:full" , "room is full");[m
[32m+[m[32m        }[m
     })[m
     socket.on("newUser:join", ({to}) => {[m
         console.log("sending Remote user :- " , to)[m
[32m+[m[32m        // socket.broadcast.emit('remoteUser:join', { from: socket.id });[m
         io.to(to).emit('remoteUser:join', { from: socket.id });[m
     })[m
 [m
[1mdiff --git a/frontend/src/index.css b/frontend/src/index.css[m
[1mindex bd6213e..a77f580 100644[m
[1m--- a/frontend/src/index.css[m
[1m+++ b/frontend/src/index.css[m
[36m@@ -1,3 +1,21 @@[m
 @tailwind base;[m
 @tailwind components;[m
[31m-@tailwind utilities;[m
\ No newline at end of file[m
[32m+[m[32m@tailwind utilities;[m
[32m+[m
[32m+[m
[32m+[m[32m@layer utilities {[m
[32m+[m[32m      /* Hide scrollbar for Chrome, Safari and Opera */[m
[32m+[m[32m      .no-scrollbar::-webkit-scrollbar {[m
[32m+[m[32m          /* display: none;[m
[32m+[m[32m           */[m
[32m+[m[32m            width: 0px;[m
[32m+[m[32m      }[m
[32m+[m[32m     /* Hide scrollbar for IE, Edge and Firefox */[m
[32m+[m[32m      .no-scrollbar {[m
[32m+[m[32m          -ms-overflow-style: none;  /* IE and Edge */[m
[32m+[m[32m          scrollbar-width: 10px;  /* Firefox */[m
[32m+[m[32m    }[m
[32m+[m[32m    .textArea::-webkit-scrollbar {[m
[32m+[m[32m        display: none;[m
[32m+[m[32m    }[m
[32m+[m[32m  }[m
\ No newline at end of file[m
[1mdiff --git a/frontend/src/pages/CallingPage.jsx b/frontend/src/pages/CallingPage.jsx[m
[1mindex e5b781b..2c5ba0f 100644[m
[1m--- a/frontend/src/pages/CallingPage.jsx[m
[1m+++ b/frontend/src/pages/CallingPage.jsx[m
[36m@@ -169,6 +169,7 @@[m [mconst CallingPage = ({ myStream , setMyStream }) => {[m
         <div className="flex flex-col justify-around items-center w-[48%]">[m
           <div className=" flex justify-around items-center w-full">[m
               <div className=" w-[300px] aspect-square">[m
[32m+[m[32m                <h1 className="text-3xl font-bold text-caribbeangreen-100 mb-3">{userRole}</h1>[m
                   {myStream && ([m
                     <ReactPlayer[m
                       className= ""[m
[36m@@ -176,16 +177,16 @@[m [mconst CallingPage = ({ myStream , setMyStream }) => {[m
                       width={300}[m
                       playing[m
                       muted[m
[31m-                      [m
                       url={myStream}[m
                     />[m
                   )}[m
               </div>[m
               <div className=" w-[300px] aspect-square"> [m
[32m+[m[32m              { userRole === "Patient" ? showChatSection && remoteStream && myStream && <h1 className="text-3xl font-bold text-caribbeangreen-100 mb-3">{userRole === "Doctor" ? "Patient" : "Doctor"}</h1> :  remoteStream && myStream && <h1 className="text-3xl font-bold text-caribbeangreen-100 mb-3">{userRole === "Doctor" ? "Patient" : "Doctor"}</h1>}[m
                 {remoteStream && ([m
                   <ReactPlayer[m
[31m-                    height="600px"[m
[31m-                    width="300px"[m
[32m+[m[32m                  height={300}[m
[32m+[m[32m                  width={300}[m
                     playing [m
                     volume={1}[m
                     url={remoteStream}[m
[1mdiff --git a/frontend/src/pages/ChattingPage.jsx b/frontend/src/pages/ChattingPage.jsx[m
[1mindex 0608984..d2a4967 100644[m
[1m--- a/frontend/src/pages/ChattingPage.jsx[m
[1m+++ b/frontend/src/pages/ChattingPage.jsx[m
[36m@@ -1,6 +1,7 @@[m
 import React, { useCallback, useEffect, useRef, useState } from 'react'[m
 import { useSocket } from '../context/SocketContext';[m
 import { useUserContext } from '../context/UserContext';[m
[32m+[m[32mimport { IoSend } from "react-icons/io5";[m
 [m
 const ChattingPage = ({myStream , remoteStream}) => {[m
     const chat = useRef("");[m
[36m@@ -45,9 +46,10 @@[m [mconst ChattingPage = ({myStream , remoteStream}) => {[m
     <>[m
     { [m
     remoteStream && myStream &&[m
[31m-        <div className=' w-[38%] min-h-[560px] rounded-md'>[m
[32m+[m[32m        <div className=' w-[345px] p-4 h-[620px] rounded-md bg-caribbeangreen-50'>[m
             {/* screen  */}[m
[31m-            <div className=' h-[90%] bg-richblue-300 p-4 overflow-y-scroll rounded-md'>[m
[32m+[m[32m            <h1 className='text-3xl font-bold text-black text-center mt-[-16px]'>Chat-In-Call</h1>[m
[32m+[m[32m            <div className=' h-[90%] overflow-y-scroll textArea overflow-x-hidden no-scrollbar rounded-md'>[m
             {[m
                 allChat.map((ele , index) => {[m
                     return ([m
[36m@@ -57,14 +59,14 @@[m [mconst ChattingPage = ({myStream , remoteStream}) => {[m
                         {[m
                             ele.user !== userRole[m
                             ? [m
[31m-                           (<div className=' p-1 bg-white w-fit h-fit '[m
[32m+[m[32m                           (<div className=' p-1 bg-white w-[200px] h-fit'[m
                                 style={borderStyleP}[m
                            >[m
                                 <p className=' font-semibold text-pink-200'>{ele.user}</p>[m
                                 <p className=' font-inter text-black'>{ele.message}</p>[m
                            </div>)[m
                             : ([m
[31m-                            <div className=' p-1 bg-white w-fit h-fit'[m
[32m+[m[32m                            <div className=' p-1 bg-white w-[200px] h-fit'[m
                             style={borderStyleD}[m
                             >[m
                                 <p className=' font-semibold text-pink-200'>{ele.user}</p>[m
[36m@@ -77,11 +79,11 @@[m [mconst ChattingPage = ({myStream , remoteStream}) => {[m
             }[m
             </div>[m
             {/* input  */}[m
[31m-            <form className=' flex' [m
[32m+[m[32m            <form className=' flex gap-3 relative'[m[41m [m
                 onSubmit={chatUpdateHandeler}[m
             >[m
[31m-                <input type="text" ref={chat} className=' w-[80%] h-[60px] rounded-md'/>[m
[31m-                <button type=' submit' className=' w-[20%] font-semibold p-3 text-richblack-900 rounded-md bg-yellow-25 border-b border-pure-greys-50'>Send</button>[m
[32m+[m[32m                <textarea rows="1" cols="1" placeholder='Enter your Message' ref={chat} class="overflow-y-scroll textArea m-0 rounded-full w-full resize-none border-0 bg-white py-[10px] pr-10 md:py-3.5 md:pr-12 max-h-52  pl-4 md:pl-6"></textarea>[m
[32m+[m[32m                <button type=' submit' className=' absolute top-[50%] translate-y-[-50%] right-2 w-9 aspect-square' ><IoSend className=' w-full h-full'/></button>[m
             </form>[m
         </div>[m
     }[m
[1mdiff --git a/frontend/src/pages/Room.jsx b/frontend/src/pages/Room.jsx[m
[1mindex 23b18db..f4bcd45 100644[m
[1m--- a/frontend/src/pages/Room.jsx[m
[1m+++ b/frontend/src/pages/Room.jsx[m
[36m@@ -3,6 +3,7 @@[m [mimport { useState } from 'react';[m
 import { useSocket } from '../context/SocketContext';[m
 import { useNavigate } from 'react-router-dom'[m
 import { useUserContext } from '../context/UserContext';[m
[32m+[m[32mimport toast from 'react-hot-toast';[m
 [m
 const Room = ({setMyStream}) => {[m
     const [email , setEmail] = useState("");[m
[36m@@ -26,13 +27,19 @@[m [mconst Room = ({setMyStream}) => {[m
       [m
     }, [navigate , setUserRole ]);[m
 [m
[32m+[m[32m    const roomfullHandeler = useCallback((message) => {[m
[32m+[m[32m      toast.error(message);[m
[32m+[m[32m    } , [])[m
[32m+[m
     useEffect(() => {[m
       socket.on('room:join' , roomJoin);[m
[32m+[m[32m      socket.on('room:full' , roomfullHandeler);[m
 [m
       return () => {[m
         socket.off('room:join' , roomJoin);[m
[32m+[m[32m        socket.off('room:full' , roomfullHandeler);[m
       }[m
[31m-    } , [socket , roomJoin]);[m
[32m+[m[32m    } , [socket , roomJoin , roomfullHandeler]);[m
 [m
 [m
 [m
