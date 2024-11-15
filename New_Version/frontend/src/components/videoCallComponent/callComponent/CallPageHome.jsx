import React, { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSocket } from '../../../Context/SocketContext';
import { useStreamContext } from '../../../Context/StreamContext';
import peer from '../../../service/peer';
import { TRACKS } from '../../../utils/constant';
import { findTracksHandler, muteAndUnmuteHandeler } from '../../../utils/handelerFunction';

const CallPageHome = () => {
  const { currentAudioDevice , currentVideoDevice , isAudioMute, isVideoMute} = useStreamContext();
  const [callpageStream , setCallpageStream ] = useState(null);
  const [searchParams , setSearchParams] = useSearchParams();
  const name = searchParams.get('userName');
  const [ roomId , setRoomId] = useState(null);
  const [ remoteUserDetails , setRemoteUserDetails] = useState(null)
  const socket = useSocket();
  const sendOffer = useCallback(async({roomId , remoteUserName , remoteSocketId})=> {
      setRoomId(roomId);
      setRemoteUserDetails({
        remoteUserName , 
        remoteSocketId
      });
      const offer = await peer.getOffer();
      socket.emit("call:offer" , {roomId , from : socket.id , name , to:remoteSocketId , offer });
    }, [socket , setRoomId , setRemoteUserDetails]);
  const sendAnswer = useCallback(async (remoteSocketId , remoteUserName , roomId , offer )=> {
      setRemoteUserDetails({remoteSocketId , remoteUserName});
      setRoomId(roomId)
      const answer = await peer.getAnswer(offer);
      // do from here
      socket.emit("call:accepted" , { to : remoteSocketId , answer });
    } , [socket , setRoomId , setRemoteUserDetails])
useEffect(() => {
  const initializeStream = async () => {
    try {
      console.log(currentAudioDevice , currentVideoDevice)
      if (!currentAudioDevice || !currentVideoDevice) return;

      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: currentAudioDevice?.deviceId
          ? { deviceId: { exact: currentAudioDevice.deviceId } }
          : true, // Fallback to default audio if no device specified
        video: currentVideoDevice?.deviceId
          ? { deviceId: { exact: currentVideoDevice.deviceId } }
          : true, // Fallback to default video if no device specified
      });
      console.log(newStream);

      if (!newStream) return;

      // Restore previous mute states
      const audioTrack = findTracksHandler(newStream, TRACKS.AUDIO_TRACK);
      const videoTrack = findTracksHandler(newStream, TRACKS.VIDEO_TRACK);

      if (isAudioMute) {
        muteAndUnmuteHandeler(audioTrack, false);
      }
      if (isVideoMute) {
        muteAndUnmuteHandeler(videoTrack, false);
      }

      // Set the stream for the call page
      setCallpageStream(newStream);

      // Add tracks to the peer connection
      audioTrack.forEach((track) => {
        if(track === currentAudioDevice) peer.addTrack(track, newStream);
      })
      
      videoTrack.forEach((track) => {
        if(track === currentVideoDevice) peer.addTrack(track, newStream);
      })
    } catch (error) {
      console.error("Error initializing media stream:", error);
    }
  };

  // Emit call request and initialize media stream
  socket.emit("call:request", { name });
  initializeStream();
}, []);

   useEffect(() => {
    peer.addEventListener('track' , ev => {
      const remoteStream = ev.streams;
      console.log(ev)
      console.log(remoteStream)
    })
  } , [])
  useEffect(() => {
    socket.on("call:offer" , sendOffer);
    socket.on("call:answer" , sendAnswer)
    socket.on("call:accepted:done" , async({answer}) => {
      await peer.setRemoteDesc(answer);
      console.log("call accepted")
    })
    
    return () => {
      socket.off("call:offer" , sendOffer);
      socket.off("call:answer" , sendAnswer)
    }
  } , [socket , sendAnswer , sendOffer])
  return (
    <div>
      This is Call page
    </div>
  )
}

export default CallPageHome
