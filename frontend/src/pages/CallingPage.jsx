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
import toast from "react-hot-toast";
import { MdCallEnd } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { LuScreenShare } from "react-icons/lu";
import { MdStopScreenShare } from "react-icons/md";



// import toast from 'react-hot-toast';

const CallingPage = ({ myStream , setMyStream }) => {
  const [ remoteUser, setRemoteUser] = useState(null);
  const [ callButton , setCallButton] = useState(true);
  const [ sendStreamBtn , setsendStreamBtn] = useState(true);
  const [ remoteStream , setRemoteStream ] = useState(null);
  const [isMute , setIsmute] = useState(false);
  const [isVideoOff , setIsVideoOff] = useState(false);
  const [ showChatSection , setShowChatSection ] = useState(false);
  const [isScreenShare , setIsScreenShare ] = useState(false);
  const [screenStream , setScreenStream ] = useState(null)
  const socket = useSocket();
  const { userRole } = useUserContext();
  const navigate = useNavigate();

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
    // console.log(myStream);
    try{
      if(!myStream){
        const stream = await navigator.mediaDevices.getUserMedia({
          audio : true , 
          video : true , 
        })
        setMyStream(stream);
      }
    }catch(e){
      console.log(e);
    }
    const offer = await peerObject.getOffer();
    socket.emit('user:call' , {to : remoteUser , offer});
    setCallButton(false)
  },[socket , myStream , setMyStream , setCallButton, remoteUser])

  const sendStream = useCallback(() => {
   if(myStream){
     for(const track of myStream.getTracks()){
       const senders = peerObject.peer.getSenders();
       let senderExits = false;
       console.log(track);
       console.log(senders);
       senders.forEach((sender) => {
          if(sender.track === track) senderExits = true;
       })
       // when call end remove user also possible
       if(!senderExits){
          peerObject.peer.addTrack(track , myStream);
       }
       else{
        console.log("Sender already exists for the track");
       }
       
     }
   }
  } , [myStream])

  const incomingCallHandeler = useCallback(async({from , offer}) => {
    const ans = await peerObject.getAnswer(offer);
    try{
      if(!myStream){
        const stream = await navigator.mediaDevices.getUserMedia({
          audio : true , 
          video : true , 
        })
        setMyStream(stream);
      }
    }catch(e){
      console.log(e);
    }
    socket.emit('call:accepted' , {to : from , ans});
  } , [socket , myStream , setMyStream]);

  const callAcceptDoneHandeler = useCallback(async({from , ans}) => {
    await perObject.setRemoteDesc(ans);
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
  }

  const disconnectHandeler = useCallback(() => {
    if(userRole === "Doctor"){
      toast("Patient is not available in the room. You may end the call or call Again",
        {
          icon: '👏',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        }
      );
      
      setRemoteStream(null);
      setRemoteUser(null);
      setShowChatSection(false);
      setCallButton(true);
    }
    else{
      setRemoteStream(null);
      setRemoteUser(null);
      setShowChatSection(false);
      toast("Doctor is not available in the room. You may end the call.",
      {
        icon: '👏',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      }
      );
    }
    
  } , [ userRole ,  setRemoteStream , setShowChatSection , setRemoteUser])


  function toggleVoiceMute (){
    if(myStream && myStream.getAudioTracks().length > 0){
      let AudioTracks = myStream.getAudioTracks()[0];
      AudioTracks.enabled = !AudioTracks.enabled;
    }
  }

  const shareScreenHandeler = async() => {
    const senders = peerObject.peer.getSenders();
    const videoSender = senders.find(sender => sender.track.kind === 'video');
    
    if(videoSender && !isScreenShare){
      try{
        const screen = await navigator.mediaDevices.getDisplayMedia({video : true})
        setScreenStream(screen);
        await videoSender.replaceTrack(screen.getVideoTracks()[0]);
        setIsScreenShare(true);
      }catch(e){
        console.log(e);
      }
    }
    else{
      await videoSender.replaceTrack(myStream.getVideoTracks()[0])
      setIsScreenShare(false);
    }
  }

  

  const removeTrack = useCallback(() => {
    if(myStream){
      myStream.getTracks().forEach(track => {track.stop()})
    }
    
    if(peerObject.peer){
      const senders = peerObject.peer.getSenders();
      senders.forEach(sender => {
        peerObject.peer.removeTrack(sender);
      })
    }
  } , [myStream])

  const callendHandeler = useCallback(() => {
    removeTrack()
    setRemoteUser(null)
    setCallButton(false);
    setsendStreamBtn(false)
    setRemoteStream(null)
    setIsmute(false);
    setIsVideoOff(false)
    setShowChatSection(false);
    socket.emit("call:end");
    navigate('/');
    window.location.reload(); 
  } , [socket , navigate , removeTrack])


  const callendReciveHandeler = useCallback(() => {
    removeTrack();
    setRemoteUser(null)
    setCallButton(false);
    setsendStreamBtn(false)
    setRemoteStream(null)
    setIsmute(false);
    setIsVideoOff(false)
    setShowChatSection(false);
    socket.emit("call:end");
    navigate('/')
    window.location.reload();
  } , [ socket , navigate , removeTrack])

  useEffect(() => {
    peerObject.peer.addEventListener('track' , ev => {
      const remoteStream = ev.streams;
      // console.log("track exchange done")
      // here we have lots of streams array like audio,video / screen shareing we just want audio video
      setRemoteStream(remoteStream[0]);
    })
  } , [])

  

useEffect(() => {
  peerObject.peer.addEventListener('negotiationneeded', negotiationHandeler);
  return () => {
    peerObject.peer.removeEventListener('negotiationneeded', negotiationHandeler);
  };
}, [negotiationHandeler]);


  useEffect(() => {
    socket.on("user:join", userJoinHandeler);
    socket.on('remoteUser:join', remoteUserJoinHandeler)
    socket.on('incomingCall' , incomingCallHandeler);
    socket.on('call:accepted:done' , callAcceptDoneHandeler);
    socket.on('peer:nego:needed' , negotiationIncomeingHandeler);
    socket.on('peer:nego:done' , negotiationFinalHandeler);
    socket.on('user:disconnect' , disconnectHandeler);
    socket.on('call:end' , callendReciveHandeler);

    return () => {
      socket.off("user:join", userJoinHandeler);
      socket.off('remoteUser:join' , remoteUserJoinHandeler);
      socket.off('incomingCall' , incomingCallHandeler);
      socket.off('call:accepted:done' , callAcceptDoneHandeler);
      socket.off('peer:nego:needed' , negotiationIncomeingHandeler);
      socket.off('peer:nego:done' , negotiationFinalHandeler);
      socket.off('user:disconnect' , disconnectHandeler);
      socket.off('call:end' , callendReciveHandeler);
    };
  }, [socket, callendReciveHandeler ,  remoteUserJoinHandeler , userJoinHandeler , incomingCallHandeler , callAcceptDoneHandeler , negotiationIncomeingHandeler , negotiationFinalHandeler , disconnectHandeler]);

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
        <div className="flex flex-col items-center gap-12 w-[48%]">
          <div className=" flex w-full">
              <div className="ml-[-150px]">
                <h1 className="text-2xl font-bold text-caribbeangreen-100 text-center mb-1">{userRole}</h1>
                  {myStream && (
                    <ReactPlayer
                    className=''
                      height={200}
                      width={500}
                      playing
                      muted
                      url={myStream}
                    />
                  )}
              </div>
              <div className="ml-[-100px]"> 
              { userRole === "Patient" ? showChatSection && remoteStream && myStream && <h1 className="text-2xl font-bold text-center text-caribbeangreen-100 ">{userRole === "Doctor" ? "Patient" : "Doctor"}</h1> :  remoteStream && myStream && <h1 className="text-2xl font-bold text-center text-caribbeangreen-100">{userRole === "Doctor" ? "Patient" : "Doctor"}</h1>}
                { userRole === "Patient" ? showChatSection && remoteStream && (
                  <ReactPlayer
                  height={500}
                  width={780}
                    playing 
                    volume={1}
                    url={remoteStream}
                  /> ): (
                    remoteStream && 
                      <ReactPlayer
                      height={500}
                      width={780}
                        playing 
                        volume={1}
                        url={remoteStream}
                      />
                  )

                }
              </div>
          </div>
         { myStream && <div className=" flex w-[30%] mx-auto gap-6">
            <div className= {`w-9 aspect-square rounded-full flex items-center justify-center cursor-pointer ${isMute ? "bg-pink-50" : "bg-white"}`}
              onClick={() => {
                setIsmute(pre => !pre);
                toggleVoiceMute()
              }}
            >
              {
                isMute ? <AiOutlineAudioMuted  className=" w-7 h-7"/> : <AiTwotoneAudio  className=" w-7 h-7"/>
              }
            </div>
            <div className= {`w-9 aspect-square rounded-full flex items-center justify-center cursor-pointer ${isVideoOff ? "bg-pink-50" : "bg-white"}`}
              onClick={() => {
                setIsVideoOff(pre => !pre)
                toggleVideoMute()
              }}
            >
              {
                !isVideoOff ? <CiVideoOn  className=" w-7 h-7"/> : <CiVideoOff  className=" w-7 h-7"/>
              }
            </div>
            {
              myStream && 
              <div className= {`w-9 aspect-square rounded-full flex items-center justify-center cursor-pointer}`}
                style={{background : "red"}}
                onClick={() => {
                callendHandeler();
                }}
              >
                <MdCallEnd  className=" cursor-pointer w-7 h-7"/> 
              </div>
            }
            {
              userRole === "Patient" && remoteStream && sendStreamBtn && 
              <button  
                  className="w-9 aspect-square bg-caribbeangreen-400 rounded-full  flex items-center justify-center"
                onClick={callReciveHandeler}
                ><MdCallEnd className=" cursor-pointer w-7 h-7"/>
              </button>
            }
            { userRole === "Patient" ? showChatSection && remoteStream && myStream &&
              <button
              className= {`w-9 aspect-square rounded-full flex items-center justify-center cursor-pointer}`}
                style={{background : "yellow"}}
                onClick={shareScreenHandeler}
              >{isScreenShare ? (<LuScreenShare className=" cursor-pointer w-7 h-7"/>) : (<MdStopScreenShare className=" cursor-pointer w-7 h-7"/>)}</button>
              : remoteStream && myStream &&
              <button
              className= {`w-9 aspect-square rounded-full flex items-center justify-center cursor-pointer}`}
                style={{background : "yellow"}}
                onClick={shareScreenHandeler}
              >{isScreenShare ? (<LuScreenShare className=" cursor-pointer w-7 h-7"/>) : (<MdStopScreenShare className=" cursor-pointer w-7 h-7"/>)}</button>
            }
          </div>
          }
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
      
    </div>
  );
};

export default CallingPage;
