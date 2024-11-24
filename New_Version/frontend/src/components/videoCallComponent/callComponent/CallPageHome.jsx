import React, {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSocket } from "../../../Context/SocketContext";
import { useStreamContext } from "../../../Context/StreamContext";
import { PeerService } from "../../../service/peer";
import { ALL_CALL_MENU_BAR_ITEMS, TRACKS } from "../../../utils/constant";
import {
  findTracksHandler,
  muteAndUnmuteHandeler,
} from "../../../utils/handelerFunction";
import { toast } from "react-toastify";
import Spinner from "../../core/Spinner";
import { CiMicrophoneOn, CiMicrophoneOff } from "react-icons/ci";
import { IoVideocamOutline, IoVideocamOffOutline } from "react-icons/io5";
import ChatSection from "./ChatSection";
import { BsChatText } from "react-icons/bs";
import MenuSidebar from "./MenuSidebar";

const CallPageHome = () => {
  const { currentAudioDevice, currentVideoDevice, isAudioMute, isVideoMute , setIsAudioMute , setIsVideoMute } =
    useStreamContext();
    const [searchParams, setSearchParams] = useSearchParams();
    const name = searchParams.get("userName");
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [allChat, setAllChat] = useState([]);
  const [remoteUserDetails, setRemoteUserDetails] = useState(null);
  const [peer, setPeer] = useState(null);
  const [currentMenuItem , setCurrentMenuItem] = useState(ALL_CALL_MENU_BAR_ITEMS.CHAT);
  const localvideoRef = useRef("");
  const remotevideoRef = useRef("");
  const socket = useSocket();
  const remoteUserIdRef = useRef(null);
  const navigate = useNavigate();

  const sendStream = useCallback(() => {
    console.log("sending stream");
    if (localStream) {
      const existingSenders = peer.peer.getSenders();

      for (let track of localStream.getTracks()) {
        const isTrackAlreadyAdded = existingSenders.some(
          (sender) => sender.track === track
        );

        if (!isTrackAlreadyAdded) {
          console.log("Adding new track:", track);
          peer.peer.addTrack(track, localStream);
        } else {
          console.log("Track already added:", track);
        }
      }
    }
  }, [localStream, peer]);

  const sendOffer = useCallback(
    async ({ roomId, remoteUserName, remoteSocketId }) => {
      console.log("match done called and creating offer");
      setRoomId(roomId);
      setRemoteUserDetails({
        remoteUserName,
        remoteSocketId,
      });
      console.log("remoteusedetails updated");
      console.log(peer);
      // cross checking of peer before creating new connection
      // if(!peer || !peer.peer) setPeer(null);
      const offer = await peer.getOffer();
      console.log("offer is ", offer);
      socket.emit("call:offer", {
        roomId,
        from: socket.id,
        name,
        to: remoteSocketId,
        offer,
      });
    },
    [peer, socket]
  );
  const sendAnswer = useCallback(
    async ({ remoteSocketId, remoteUserName, roomId, offer }) => {
      setRemoteUserDetails({ remoteSocketId, remoteUserName });
      setRoomId(roomId);
      console.log("answer creating", offer);
      const answer = await peer.getAnswer(offer);
      console.log("ans in calling page ", answer);
      socket.emit("call:accepted", { to: remoteSocketId, answer });
    },
    [peer, socket, setRoomId, setRemoteUserDetails]
  );

  const callAccepted = useCallback(
    async ({ answer }) => {
      console.log("setting remote desc by user 1", answer);
      await peer.setRemoteDesc(answer);
      sendStream();
      console.log("Connection Done");
    },
    [peer, localStream, sendStream]
  );
  const startCallingHandeler = useCallback(() => {
    console.log("calling Again...");
    // it's not check for first time .. it's for stop -> then start
    if (peer && peer.peer === null) {
      console.log("peer.peer is null");
      setPeer(null);
    }
    console.log(peer);
    socket.emit("call:request", { name });
  }, [peer, socket, setPeer, name]);

  const negotiationHandeler = useCallback(async () => {
    const offer = await peer.getOffer();
    console.log("negotiation handshake offer created");
    console.log(remoteUserIdRef.current);
    socket.emit("negotiation:handshake", {
      to: remoteUserIdRef.current,
      offer,
    });
  }, [peer, socket]);

  const negotiationAnswerHandeler = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      console.log("negotiation answer received");
      console.log(ans, from);
      socket.emit("negotiation:answer", { to: from, ans });
    },
    [peer, socket]
  );

  const negotiationFinalHandeler = useCallback(
    async ({ from, ans }) => {
      await peer.setRemoteDesc(ans);
      console.log("negotiation done");
    },
    [peer]
  );

  const disconnectPeerHandeler = useCallback(async () => {
    startCallingHandeler();
  }, []);

  const disconnectHandeler = useCallback(() => {
    console.log("event disconnected");
    setRoomId(null);
    setRemoteStream(null);
    setRemoteUserDetails(null);
    // startCallingHandeler();
  }, []);

  const skipAndNewCallHandeler = useCallback(() => {
    console.log("skipAndNewCallHandeler");
    if (peer && peer?.peer) {
      peer.peer.close();
      peer.peer = null;
      console.log("peer closed");
    }
    // // reset all useState
    setRemoteStream(null);
    startCallingHandeler();
  }, [peer, setRemoteStream, startCallingHandeler]);

  const stopCallHandeler = useCallback(() => {
    if (!remoteStream) return;
    peer.peer.close();
    socket.emit("call:stop", {
      roomId,
    });
    peer.peer = null;
    // reset all useState
    setRemoteStream(null);
  }, [socket, remoteStream, peer, roomId, setRemoteStream]);

  useEffect(() => {
    if (!currentAudioDevice || !currentVideoDevice) navigate("/studio");
    toast("🦄 Press next and wait...");
  }, []);

  useEffect(() => {
    if (remoteUserDetails)
      remoteUserIdRef.current = remoteUserDetails.remoteSocketId;
  }, [remoteUserDetails]);
  useEffect(() => {
    if (!peer || !peer?.peer) {
      console.log("It's new peer connection");
      let newPeerConnection = new PeerService();
      setPeer(newPeerConnection);
      return;
    }
    /// skip is pending
    console.log("adding all of these theing for new peer connection");
    if (peer && peer.peer) {
      console.log("event added");
      peer.peer.onconnectionstatechange = (event) => {
        const connectionState = peer.peer.connectionState;
        switch (connectionState) {
          case "connected":
            console.log("Peer connection established.");
            break;
          case "disconnected":
            console.log("Peer disconnected.");
            setRemoteStream(null);
            setPeer(null);
            break;
          case "failed":
            // toast("Next Match");

            console.log(peer);
            console.log(localStream);
            // why suddenly localstream is null here
            console.log(localStream);
            console.error(
              "Connection failed. Please check the network or configuration."
            );
            break;
          case "closed":
            // when anyone closed stop the peer connection
            // peer.disconnectPeer();
            console.log("Connection closed.");
            break;
          default:
            console.log("Connection state:", connectionState);
        }
      };

      peer.peer.onclose = (ev) => {
        console.log("Connection closed");
      };

      peer.peer.onnegotiationneeded = negotiationHandeler;

      peer.peer.ontrack = (ev) => {
        const remoteStream = ev.streams;
        if (remoteStream.length < 1) return;
        console.log("tracks came in: " + remoteStream[0]);
        setRemoteStream(remoteStream[0]);
      };
    }
  }, [peer]);

  useEffect(() => {
    socket.on("match:done", sendOffer);
    socket.on("call:offer", sendAnswer);
    socket.on("call:accepted:done", callAccepted);
    socket.on("negotiation:handshake", negotiationAnswerHandeler);
    socket.on("negotiation:final", negotiationFinalHandeler);
    socket.on("make:new:peer", disconnectPeerHandeler);
    socket.on("connection:end", disconnectHandeler);
    socket.on("please:join:for:new:call", skipAndNewCallHandeler);

    return () => {
      socket.off("match:done", sendOffer);
      socket.off("call:offer", sendAnswer);
      socket.off("call:accepted:done", callAccepted);
      socket.off("negotiation:handshake", negotiationAnswerHandeler);
      socket.off("negotiation:final", negotiationFinalHandeler);
      socket.off("make:new:peer", disconnectPeerHandeler);
      socket.off("connection:end", disconnectHandeler);
      socket.off("please:join:for:new:call", skipAndNewCallHandeler);
    };
  }, [
    socket,
    sendAnswer,
    sendOffer,
    callAccepted,
    negotiationAnswerHandeler,
    negotiationFinalHandeler,
    disconnectPeerHandeler,
    disconnectHandeler,
    skipAndNewCallHandeler,
  ]);
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
        // const newStream = null;

        if (!newStream) {
          navigate("/studio");
          return;
        }

        const audioTrack = findTracksHandler(newStream, TRACKS.AUDIO_TRACK);
        const videoTrack = findTracksHandler(newStream, TRACKS.VIDEO_TRACK);
        if (isAudioMute) {
          muteAndUnmuteHandeler(audioTrack, false);
        }
        if (isVideoMute) {
          muteAndUnmuteHandeler(videoTrack, false);
        }

        setLocalStream(newStream);
      } catch (error) {
        console.error("Error initializing media stream:", error);
      }
    };
    if (currentAudioDevice && currentVideoDevice) initializeStream();
  }, []);

  useEffect(() => {
    console.log("Local Stream Updated : ", localStream);
    if (localStream && localvideoRef.current) {
      localvideoRef.current.srcObject = localStream;
    }
  }, [localStream]);
  useEffect(() => {
    if (remoteStream) sendStream();
    if (remoteStream && remotevideoRef.current) {
      remotevideoRef.current.srcObject = remoteStream;
      remotevideoRef.current.onloadedmetadata = () => {
        remotevideoRef.current.play().catch((error) => {
          console.error("Error playing video after metadata load:", error);
        });
      };
    }
  }, [remoteStream]);
  
  const CALL_SIDE_BAR_MENU_ITEMS = [
    {
      title : "chat" , 
      icon : <BsChatText className=" w-7 h-7"/>
    }
  ]
  return (

    <div className=" w-full h-screen py-4">
      {" "}
      <div className="w-[97%] mx-auto h-full grid grid-cols-[73%_20%_5%] gap-4">
        <div className=" w-full h-full ">
          <div className=" w-full h-[7%] pb-1  font-edu-sa text-3xl font-bold">
            App Name
          </div>
          <div
            className=" w-full flex gap-5 h-[80%] mt-2
           items-center justify-between"
          >
            <div className=" w-[49%] h-full">
              {localStream ? (
                <div className=" w-full h-full relative">
                  <video
                    className="w-full h-full overflow-hidden rounded-md bg-violate-800"
                    ref={localvideoRef}
                    autoPlay
                    muted
                    playsInline
                    style={{
                      transform: "scale(-1, 1)",
                      objectPosition : "center" , 
                      objectFit: "cover",
                    }}
                  ></video>
                  <div className=" font-bold text-3xl font-edu-sa absolute bottom-1 left-2">
                    {name ? name.substring(0, 30) : ""}
                  </div>
                </div>
              ) : (
                <div
                  className=" w-full h-full flex
               items-center justify-center bg-[#242424] rounded-md "
                >
                  <Spinner />
                </div>
              )}
            </div>
            <div className=" w-[49%] h-full">
              {remoteStream ? (
                <video
                // something wrong heppening here fix height of the video 
                  className="w-full h-full overflow-hidden rounded-md bg-violate-800"
                  ref={remotevideoRef}
                  autoPlay
                  // playsInline
                  style={{
                    transform: "scale(-1, 1)",
                    objectPosition : "center" ,  
                    objectFit: "cover",
                  }}
                ></video>
              ) : (
                <div
                  className=" w-full h-full flex
               items-center justify-center bg-[#242424] rounded-md"
                >
                  <Spinner />
                </div>
              )}
            </div>
          </div>

          <div
            className="  bg-[#242424] flex mt-2 rounded-md w-full h-[10%] py-3
           items-center justify-center gap-10 flex-grow"
          >
            <button
              className=" glow-on-hover font-edu-sa font-bold text-xl"
              onClick={startCallingHandeler}
            >
              {" "}
              Next{" "}
            </button>
            <button
              className=" glow-on-hover font-edu-sa font-bold text-xl"
              onClick={stopCallHandeler}
            >
              {" "}
              Stop{" "}
            </button>
            <button className=" glow-on-hover font-edu-sa font-bold text-xl flex items-center justify-center"
              onClick={() => setIsVideoMute(pre => {
                          let videoTracks = findTracksHandler(localStream , TRACKS.VIDEO_TRACK);
                          muteAndUnmuteHandeler(videoTracks  , pre);
                          return !pre;
                        })}
            >
              {" "}
              {isVideoMute ? (
                <IoVideocamOffOutline className=" w-7 h-7" />
              ) : (
                <IoVideocamOutline className=" w-7 h-7" />
              )}
            </button>
            <button className=" glow-on-hover font-edu-sa font-bold text-xl flex items-center justify-center"
              onClick={() => setIsAudioMute(pre => {
                          let audioTracks = findTracksHandler(localStream , TRACKS.AUDIO_TRACK);
                          muteAndUnmuteHandeler(audioTracks , pre);
                          return !pre;
                        })}
            >
              {" "}
              {isAudioMute ? (
                <CiMicrophoneOff className=" w-7 h-7" />
              ) : (
                <CiMicrophoneOn className=" w-7 h-7" />
              )}
            </button>
          </div>
          <div></div>
        </div>
        <ChatSection peer={peer} roomId={roomId} setAllChat={setAllChat} socket={socket} allChat={allChat} remoteUserIdRef={remoteUserIdRef} />
        
          <MenuSidebar currentMenuItem = {currentMenuItem}  setCurrentMenuItem = {setCurrentMenuItem}/>
      </div>
    </div>
  );
};

export default CallPageHome;
