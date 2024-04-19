import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";
import { useUserContext } from "../context/UserContext";
import ReactPlayer from "react-player";
import peerObject from "../service/peer";
import { AiOutlineAudioMuted } from "react-icons/ai";
import { AiTwotoneAudio } from "react-icons/ai";
import { CiVideoOn } from "react-icons/ci";
import { CiVideoOff } from "react-icons/ci";
import ChattingPage from "./ChattingPage";


// import toast from 'react-hot-toast';

const CallingPage = ({ myStream , setMyStream }) => {
  const [remoteUser, setRemoteUser] = useState(null);
  const [ callButton , setCallButton] = useState(true);
  const [sendStreamBtn , setsendStreamBtn] = useState(true);
  const [ remoteStream , setRemoteStream ] = useState(null);
  const [isMute , setIsmute] = useState(false);
  const [isVideoOff , setIsVideoOff] = useState(false);
  const [ showChatSection , setShowChatSection] = useState(false);
  const socket = useSocket();
  const { userRole } = useUserContext();

  const userJoinHandeler = useCallback(
    ({ email, newUser }) => {
      // set remote user for the 1st person
      socket.emit("newUser:join", { to: newUser });
      setRemoteUser(newUser);
    },
    [socket, setRemoteUser]
  );
  console.log(userRole , remoteUser)

  const remoteUserJoinHandeler = useCallback(
    ({ from }) => {
      // set remote user for the 2nd person
      console.log(userRole , remoteUser)
      console.log(" set remote user for Patient");
      setRemoteUser(from);
      // setCallButton(true);
    },
    [ setRemoteUser , remoteUser , userRole]
  );

  const userCallingHandeler = useCallback(async()=>{
    const stream = await navigator.mediaDevices.getUserMedia({
      audio : true , 
      video : true , 
    })
    setMyStream(stream);
    const offer = await peerObject.getOffer();
    socket.emit('user:call' , {to : remoteUser , offer});
    setCallButton(false)
  },[socket , setMyStream , setCallButton, remoteUser])

  const sendStream = useCallback(() => {
   
    for(const track of myStream.getTracks()){
      peerObject.peer.addTrack(track , myStream);
    }
  } , [myStream])

  const incomingCallHandeler = useCallback(async({from , offer}) => {
    const ans = await peerObject.getAnswer(offer);
    const stream = await navigator.mediaDevices.getUserMedia({
      audio : true , 
      video : true , 
    })
    setMyStream(stream);
    socket.emit('call:accepted' , {to : from , ans});
  } , [socket , setMyStream]);

  const callAcceptDoneHandeler = useCallback(async({from , ans}) => {
    await peerObject.setRemoteDesc(ans);
    // stream shareing is needed 
    sendStream();
  } , [sendStream])

  const negotiationHandeler = useCallback(async() => {
    const offer = await peerObject.getOffer();
    socket.emit('peer:nego:needed' , {to : remoteUser , offer});
  } , [socket , remoteUser]);

  const negotiationIncomeingHandeler  = useCallback(async({from , offer}) => {
    const ans = await peerObject.getAnswer(offer);
    socket.emit('peer:nego:done' , {to : from , ans});
  } , [socket])

  const negotiationFinalHandeler = useCallback(async({from , ans}) => {
    await peerObject.setRemoteDesc(ans);
  } , [])

  const callReciveHandeler = async() => { 
        sendStream();
        setShowChatSection(true)
        setsendStreamBtn(false);
    }
  

  const toggleVideoMute = () => {
    let VideoTracks = myStream.getVideoTracks()[0];
    if(myStream && myStream.getVideoTracks().length > 0){
      VideoTracks.enabled = !VideoTracks.enabled;
    }
    // setMyStream(myStream)
    
    console.log(VideoTracks.enabled)
    console.log(myStream.getAudioTracks()[0].enabled)
  }

  function toggleVoiceMute (){
    if(myStream && myStream.getAudioTracks().length > 0){
      let AudioTracks = myStream.getAudioTracks()[0];
      AudioTracks.enabled = !AudioTracks.enabled;
    }
  }
  useEffect(() => {
    peerObject.peer.addEventListener('track' , ev => {
      const remoteStream = ev.streams;
      setRemoteStream(remoteStream[0]);
    })
  } , [])

  useEffect(() => {
    peerObject.peer.addEventListener('negotiationneeded' , negotiationHandeler);
    return () => {
      peerObject.peer.removeEventListener('negotiationneeded' , negotiationHandeler);
    }
  } , [negotiationHandeler])


  useEffect(() => {
    socket.on("user:join", userJoinHandeler);
    socket.on('remoteUser:join', remoteUserJoinHandeler)
    socket.on('incomingCall' , incomingCallHandeler);
    socket.on('call:accepted:done' , callAcceptDoneHandeler);
    socket.on('peer:nego:needed' , negotiationIncomeingHandeler);
    socket.on('peer:nego:done' , negotiationFinalHandeler);

    return () => {
      socket.off("user:join", userJoinHandeler);
      socket.off('remoteUser:join' , remoteUserJoinHandeler);
      socket.off('incomingCall' , incomingCallHandeler);
      socket.off('call:accepted:done' , callAcceptDoneHandeler);
      socket.off('peer:nego:needed' , negotiationIncomeingHandeler);
      socket.off('peer:nego:done' , negotiationFinalHandeler);
    };
  }, [socket, remoteUserJoinHandeler , userJoinHandeler , incomingCallHandeler , callAcceptDoneHandeler , negotiationIncomeingHandeler , negotiationFinalHandeler]);

  return (
    <div className=" w-screen h-screen overflow-x-hidden">
      {remoteUser !== null && userRole === "Patient" ? (
        <h1 className="text-3xl font-bold text-caribbeangreen-100">
          Doctor is ready for Conversation
        </h1>
      ) : remoteUser !== null && userRole === "Doctor" ? (
        <h1 className="text-3xl font-bold text-caribbeangreen-100">
          Patient is ready for Conversation
        </h1>
      ) : (
        <h1 className="text-3xl font-bold text-caribbeangreen-100">
          Waiting for user...
        </h1>
      )}
      <div className=" flex w-11/12 mx-auto justify-between max-h-fit">
        {/* video player section */}
        <div className="flex flex-col justify-around items-center w-[48%]">
          <div className=" flex justify-around items-center w-full">
              <div className=" w-[300px] aspect-square">
                  {myStream && (
                    <ReactPlayer
                      className= ""
                      height={300}
                      width={300}
                      playing
                      muted
                      
                      url={myStream}
                    />
                  )}
              </div>
              <div className=" w-[300px] aspect-square"> 
                {remoteStream && (
                  <ReactPlayer
                    height="600px"
                    width="300px"
                    playing 
                    volume={1}
                    url={remoteStream}
                  />
                )}
              </div>
          </div>
         { myStream && <div className=" flex w-[30%] mx-auto gap-6">
            <div className= {`w-9 aspect-square rounded-full flex items-center justify-center cursor-pointer ${isMute ? "bg-pink-50" : "bg-white"}`}
              onClick={() => {
                setIsmute(!isMute);
                toggleVoiceMute()
              }}
            >
              {
                isMute ? <AiOutlineAudioMuted  className=" w-7 h-7"/> : <AiTwotoneAudio  className=" w-7 h-7"/>
              }
            </div>
            <div className= {`w-9 aspect-square rounded-full flex items-center justify-center cursor-pointer ${isVideoOff ? "bg-pink-50" : "bg-white"}`}
              onClick={() => {
                setIsVideoOff(!isVideoOff)
                toggleVideoMute()
              }}
            >
              {
                !isVideoOff ? <CiVideoOn  className=" w-7 h-7"/> : <CiVideoOff  className=" w-7 h-7"/>
              }
            </div>
          </div>}
        </div>

        {/* chatting  section*/}
        { 
          userRole === "Patient" ? showChatSection &&
          <ChattingPage myStream = {myStream} remoteStream = {remoteStream}/> : <ChattingPage myStream = {myStream} remoteStream = {remoteStream}/>
        }
      </div>

      {
        userRole === "Doctor" && remoteUser && callButton &&
        <button  
          className=" font-semibold p-3 text-richblack-900 mt-8 rounded-md bg-yellow-25 border-b border-pure-greys-50"
          onClick={userCallingHandeler}
        >Call</button>
      }
      {
        userRole === "Patient" && remoteStream && sendStreamBtn && 
        <button  
          className=" font-semibold p-3 text-richblack-900 mt-8 rounded-md bg-yellow-25 border-b border-pure-greys-50"
          onClick={callReciveHandeler}
        >Recive the Call</button>
      }
    </div>
  );
};

export default CallingPage;
