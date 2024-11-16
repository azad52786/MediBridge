import React, {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";
import { useSocket } from "../../../Context/SocketContext";
import { useStreamContext } from "../../../Context/StreamContext";
import peer from "../../../service/peer";
import { TRACKS } from "../../../utils/constant";
import {
  findTracksHandler,
  muteAndUnmuteHandeler,
} from "../../../utils/handelerFunction";

const CallPageHome = () => {
  const { currentAudioDevice, currentVideoDevice, isAudioMute, isVideoMute } =
    useStreamContext();
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const name = searchParams.get("userName");
  const [roomId, setRoomId] = useState(null);
  const localvideoRef = useRef("");
  const remotevideoRef = useRef("");

  const [remoteUserDetails, setRemoteUserDetails] = useState(null);
  const socket = useSocket();
  const sendOffer = useCallback(
    async ({ roomId, remoteUserName, remoteSocketId }) => {
      console.log("match done called");
      setRoomId(roomId);
      setRemoteUserDetails({
        remoteUserName,
        remoteSocketId,
      });
      const offer = await peer.getOffer();
      console.log(offer);
      socket.emit("call:offer", {
        roomId,
        from: socket.id,
        name,
        to: remoteSocketId,
        offer,
      });
    },
    [socket, setRoomId, setRemoteUserDetails]
  );
  const sendAnswer = useCallback(
    async ({ remoteSocketId, remoteUserName, roomId, offer }) => {
      setRemoteUserDetails({ remoteSocketId, remoteUserName });
      setRoomId(roomId);
      console.log("answer creating", offer);
      const answer = await peer.getAnswer(offer);
      // do from here
      console.log("ans in calling page " , answer);
      socket.emit("call:accepted", { to: remoteSocketId, answer });
    },
    [socket, setRoomId, setRemoteUserDetails]
  );
   
   const callAccepted = useCallback(async ({ answer }) => {
    console.log("setting remote desc by user 1", answer);
    await peer.setRemoteDesc(answer);
    console.log("Connection Done")
  }, []);
  const startCallingHandeler = () => {
    socket.emit("call:request", { name });
  };
  
  const negotiationHandeler = useCallback(async() => {
      const offer = await peer.getOffer();
      console.log("negotiation handshake offer")
      socket.emit("negotiation:handshake", { to : remoteStream , offer})
  } , [socket])


  const negotiationAnswerHandeler = useCallback(async({from, offer}) => {
  
    const ans = await peer.getAnswer(offer);
    console.log("negotiation answer received");
    socket.emit('negotiation:answer' , {to : from , ans});
  } , [socket])
  
  const negotiationFinalHandeler = useCallback(async({from, ans}) => {
    await peer.setRemoteDesc(ans);
    console.log("negotiation done");
  } , [])
  
  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded" , negotiationHandeler);
    return  () => {
      peer.peer.removeEventListener("negotiationneeded" , negotiationHandeler);
    }
  } , [negotiationHandeler])
  useEffect(() => {
    peer.peer.addEventListener("track", (ev) => {
      const remoteStream = ev.streams;
      // why remote stream of 0 there will be more than one stream like mediastream , displaystream (etc...)
      if (remoteStream.length < 1) return;
      setRemoteStream(remoteStream[0]);
    });
  }, []);
  useEffect(() => {
    socket.on("match:done", sendOffer);
    socket.on("call:offer", sendAnswer);
    socket.on("call:accepted:done", callAccepted);
    socket.on("negotiation:handshake" , negotiationAnswerHandeler);
    socket.on("negotiation:final" , negotiationFinalHandeler);

    return () => {
      socket.off("call:offer", sendOffer);
      socket.off("call:answer", sendAnswer);
      socket.off("call:accepted:done", callAccepted);
      socket.off("negotiation:handshake" , negotiationAnswerHandeler);
      socket.off("negotiation:final" , negotiationFinalHandeler);
    };
  }, [socket, sendAnswer, sendOffer, callAccepted , negotiationAnswerHandeler , negotiationFinalHandeler]);
    useEffect(() => {
    const initializeStream = async () => {
      try {
        if (!currentAudioDevice || !currentVideoDevice) return;

        const newStream = await navigator.mediaDevices.getUserMedia({
          audio: currentAudioDevice?.deviceId
            ? { deviceId: { exact: currentAudioDevice.deviceId } }
            : true,
          video: currentVideoDevice?.deviceId
            ? { deviceId: { exact: currentVideoDevice.deviceId } }
            : true,
        });

        if (!newStream) return;
        
        
        const audioTrack = findTracksHandler(newStream, TRACKS.AUDIO_TRACK);
        const videoTrack = findTracksHandler(newStream, TRACKS.VIDEO_TRACK);
        if (isAudioMute) {
          muteAndUnmuteHandeler(audioTrack, false);
        }
        if (isVideoMute) {
          muteAndUnmuteHandeler(videoTrack, false);
        }
        for(let track of newStream.getTracks()){
          peer.peer.addTrack(track, newStream);
        }
        setLocalStream(newStream);

      } catch (error) {
        console.error("Error initializing media stream:", error);
      }
    };
    initializeStream();
  }, []);

  useEffect(() => {
    console.log("Local Stream Updated : " , localStream)
    if (localStream && localvideoRef.current) {
      localvideoRef.current.srcObject = localStream;
    }
  }, [localStream]);
  useEffect(() => {
    if (remoteStream && remotevideoRef.current) {
      remotevideoRef.current.srcObject = remoteStream;
      remotevideoRef.current.onloadedmetadata = () => {
        remotevideoRef.current.play().catch((error) => {
          console.error("Error playing video after metadata load:", error);
        });
      };
    }
  }, [remoteStream]);
  return (
    <div>
      <div className="bg-button-record px-2" onClick={startCallingHandeler}>
        This is Call page
      </div>
      {localStream && (
        <video
          className="w-full h-full rounded-md"
          ref={localvideoRef}
          autoPlay
          muted
          playsInline
          style={{
            transform: "scale(-1, 1)",
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        ></video>
      )}
      {remoteStream && (
        <video
          className="w-fit h-fit rounded-md bg-violate-800"
          ref={remotevideoRef}
          autoPlay
          // playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        ></video>
      )}
    </div>
  );
};

export default CallPageHome;
