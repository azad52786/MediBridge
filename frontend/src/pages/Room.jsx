import React, { useCallback, useEffect } from 'react'
import { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom'
import { useUserContext } from '../context/UserContext';
import toast from 'react-hot-toast';

const Room = ({setMyStream}) => {
    const [email , setEmail] = useState("");
    const [roomId , setRoomId] = useState("");
    const [role , setRole] = useState("");
    const socket = useSocket();
    const { setUserRole} = useUserContext();
    const navigate = useNavigate()
    const roomJoinHandeler = useCallback((e) => {
      e.preventDefault();
      console.log(email , roomId , role)
      socket.emit('room:join' , {email , roomId , role});
    } , [socket , email , roomId , role])
    

    const roomJoin = useCallback(async({ roomId , role }) => {
      setUserRole(role);
      navigate(`/room/${roomId}`)
    }, [navigate , setUserRole ]);

    const roomfullHandeler = useCallback((message) => {
      toast.error(message);
    } , [])

    useEffect(() => {
      socket.on('room:join' , roomJoin);
      socket.on('room:full' , roomfullHandeler);

      return () => {
        socket.off('room:join' , roomJoin);
        socket.off('room:full' , roomfullHandeler);
      }
    } , [socket , roomJoin , roomfullHandeler]);



  return (
    
    <form className=" w-full min-h-screen flex flex-col font-inter text-pure-greys-5 items-center justify-center"
        onSubmit={roomJoinHandeler}
    >

          <div className=" w-4/12 mx-auto flex gap-5 items-center">
            <label htmlFor="email"
              className=" font-semibold"
            >Email ID : </label>
            <input id='email' type = 'text' value = {email} onChange={(e) => setEmail(e.target.value)}
              className=" text-lg font-inter px-3 h-10 w-80 bg-richblack-600 border-b border-richblack-300 rounded-md"
            />
          </div>
        <br/>
        <br/>
          <div className=" w-4/12 mx-auto flex gap-5 items-center">
            <label htmlFor="roomId" 
              className=" font-semibold"
              >Room ID : </label>
            <input id='roomId' type = 'text' value = {roomId} onChange={(e) => setRoomId(e.target.value)}
            className=" text-lg font-inter px-3 h-10 w-80 bg-richblack-600 border-b border-richblack-300 rounded-md"
            />
          </div>
      <br/>
      <br/>
          <div  className=" w-4/12 mx-auto flex gap-5 items-center">
          <label htmlFor="role"
            className=" font-semibold"
          >Role :</label>
            <select name="role" id="role"
              value={role}
              onChange={e => setRole(e.target.value)}
              className=" text-lg font-inter px-3 h-10 bg-richblack-600 w-[21rem] ml-6 border-b border-richblack-300 rounded-md"
            >
              <option value="">Select your option</option>
              <option value="Doctor">Doctor</option>
              <option value="Patient">Patient</option>
            </select>
          </div>
      <button
        
        className=" font-semibold p-3 text-richblack-900 mt-8 rounded-md bg-yellow-25 border-b border-pure-greys-50"
      >Join Room</button>

    </form>
  )
}

export default Room