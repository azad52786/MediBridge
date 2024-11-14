import React, { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSocket } from '../../../Context/SocketContext';

const CallPageHome = () => {
  const [searchParams , setSearchParams] = useSearchParams();
  const name = searchParams.get('userName');
  const socket = useSocket();
  useEffect(() => {
    socket.emit("call:request" , { name });
  } , [])
  useEffect(() => {
    socket.on("match:done" , ({roomId , remoteUserName , remoteSocketId})=> {
      console.log(roomId, remoteUserName, remoteSocketId)
    })
  } , [socket])
  return (
    <div>
      This is Call page
    </div>
  )
}

export default CallPageHome
