import React from 'react'
import CallPageHome from '../components/videoCallComponent/callComponent/CallPageHome'
import { useSocket } from '../Context/SocketContext'

const Call = () => {
  const socket = useSocket();
  console.log(socket);
  return (
    <CallPageHome />
  )
}

export default Call
