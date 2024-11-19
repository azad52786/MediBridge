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
import { PeerService } from "../../../service/peer";
import { TRACKS } from "../../../utils/constant";
import {
  findTracksHandler,
  muteAndUnmuteHandeler,
} from "../../../utils/handelerFunction";
import { toast } from "react-toastify";
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
  const [peer, setPeer] = useState(null);
  const socket = useSocket();
  const remoteUserIdRef = useRef(null);
  
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
  }, [localStream , peer]);


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
     sendStream()
      console.log("Connection Done");
    },
    [peer, localStream , sendStream]
  );
  const startCallingHandeler = () => {
    console.log("calling Again...");
    // it's not check for first time .. it's for stop -> then start 
    if(peer && peer.peer === null){
      console.log("peer.peer is null");
      setPeer(null);
    }
    socket.emit("call:request", { name });
  };

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

  const skipHandeler = () => {
    setRemoteStream(null);
    peer.disconnectPeer();
    peer = null;
    socket.emit("newConnection", {
      name,
      remoteSocket: remoteUserDetails?.remoteSocketId,
      roomId,
    });
    setRoomId(null);
    setRemoteUserDetails(null);
  };

 

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
            setPeer(null);
            break;
          case "failed":
            // toast("Next Match");
            
            console.log(peer);
            console.log(localStream)
           // why suddenly localstream is null here  
            console.log(localStream)
            console.error(
              "Connection failed. Please check the network or configuration."
            );
            break;
          case "closed":
            // when anyone stop the peer connection 
            // peer.disconnectPeer();
            console.log("Connection closed.");
            break;
          default:
            console.log("Connection state:", connectionState);
        }
      };
      
      peer.peer.onclose = (ev) => {
        console.log("Connection closed");
      }

      peer.peer.onnegotiationneeded = negotiationHandeler;

      peer.peer.ontrack = (ev) => {
        const remoteStream = ev.streams;
        if (remoteStream.length < 1) return;
        console.log("tracks came in: " + remoteStream[0])
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

    return () => {
      socket.off("match:done", sendOffer);
      socket.off("call:offer", sendAnswer);
      socket.off("call:accepted:done", callAccepted);
      socket.off("negotiation:handshake", negotiationAnswerHandeler);
      socket.off("negotiation:final", negotiationFinalHandeler);
      socket.off("make:new:peer", disconnectPeerHandeler);
      socket.off("connection:end", disconnectHandeler);
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

        if (!newStream) return;

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
    if(remoteStream) sendStream();
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
    <div onClick={() => {
      toast('🦄 Wow so easy!');
    }}>toast Btn</div>
      <div className="bg-button-record px-2" onClick={startCallingHandeler}>
        This is Call page
      </div>
      {
        remoteStream && <div className="bg-button-record px-2  mt-3" onClick={() => {
        peer.peer.close();
        socket.emit("call:stop", {
          roomId,
        });
        peer.peer = null;
        // reset all useState
        setRemoteStream(null);
      }}>
        stop Calling
      </div>
      }
      
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
            transform: "scale(-1, 1)",
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
