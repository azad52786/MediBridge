import React from 'react'
import CallPageHome from '../components/videoCallComponent/callComponent/CallPageHome'
import { useSocket } from '../Context/SocketContext'
import { useStreamContext } from '../Context/StreamContext';

const Call = () => {
  // const socket = useSocket();
  // const { localStream } = useStreamContext();
  // console.log("This is Local Stream form CallPage" , localStream);
  // console.log(socket);
  return (
    <CallPageHome />
  )
}

export default Call
