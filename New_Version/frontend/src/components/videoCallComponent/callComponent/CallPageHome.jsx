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
import navbarlogo from "../../../assets/smallnavbarlogo.png";
import bgImage from "../../../assets/peopleImage/Untitled design.png";
const CallPageHome = () => {
  const {
    currentAudioDevice,
    currentVideoDevice,
    isAudioMute,
    isVideoMute,
    setIsAudioMute,
    setIsVideoMute,
  } = useStreamContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const name = searchParams.get("userName");
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [allChat, setAllChat] = useState([]);
  const [remoteUserDetails, setRemoteUserDetails] = useState(null);
  const [peer, setPeer] = useState(null);
  const [currentMenuItem, setCurrentMenuItem] = useState(
    ALL_CALL_MENU_BAR_ITEMS.CHAT
  );
  const localvideoRef = useRef("");
  const remotevideoRef = useRef("");
  const socket = useSocket();
  const remoteUserIdRef = useRef(null);
  const navigate = useNavigate();

  const sendStream = useCallback(() => {
    if (localStream) {
      const existingSenders = peer.peer.getSenders();

      for (let track of localStream.getTracks()) {
        const isTrackAlreadyAdded = existingSenders.some(
          (sender) => sender.track === track
        );

        if (!isTrackAlreadyAdded) {
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
      // cross checking of peer before creating new connection
      // if(!peer || !peer.peer) setPeer(null);
      const offer = await peer.getOffer();
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
      const answer = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: remoteSocketId, answer });
    },
    [peer, socket, setRoomId, setRemoteUserDetails]
  );

	const callAccepted = useCallback(
		async ({ answer }) => {
			await peer.setRemoteDesc(answer);
			sendStream();
		},
		[peer, localStream, sendStream]
	);
	const startCallingHandeler = useCallback(() => {
		console.log("calling Again... in fix");
		// it's not check for first time .. it's for stop -> then start
		if (peer && peer.peer === null) {
			setPeer(null);
		}
		socket.emit("call:request", { name });
	}, [peer, socket, setPeer, name]);

  const negotiationHandeler = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("negotiation:handshake", {
      to: remoteUserIdRef.current,
      offer,
    });
  }, [peer, socket]);

  const negotiationAnswerHandeler = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
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
    toast("🦄 Press Click next and wait...");
  }, []);

  useEffect(() => {
    if (remoteUserDetails)
      remoteUserIdRef.current = remoteUserDetails.remoteSocketId;
  }, [remoteUserDetails]);
  useEffect(() => {
    if (!peer || !peer?.peer) {
      let newPeerConnection = new PeerService();
      setPeer(newPeerConnection);
      return;
    }
    /// skip is pending
    if (peer && peer.peer) {
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
            console.error(
              "Connection failed. Please check the network or configuration."
            );
            break;
          case "closed":
            console.log("Connection closed.");
            break;
          default:
            console.log("Connection state:", connectionState);
        }
      };

      peer.peer.onclose = (ev) => {
        console.log("Connection closed");
      };
      peer.peer.onicecandidateerror = (ev) => {
        setRemoteStream(null);
        setPeer(null);
      };

      peer.peer.onnegotiationneeded = negotiationHandeler;

      peer.peer.ontrack = (ev) => {
        const remoteStream = ev.streams;
        if (remoteStream.length < 1) return;
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

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          track.stop();
        });
        setLocalStream(null);
      }
    };
  }, []);

  useEffect(() => {
    if (localStream && localvideoRef.current) {
      localvideoRef.current.srcObject = localStream;
    }

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
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
      title: "chat",
      icon: <BsChatText className=" w-7 h-7" />,
    },
  ];
  return (
    <div className=" w-full h-fit lg:max-h-screen lg:h-screen">
      {" "}
      <div className="w-[97%] max-w-[500px] md:max-w-full mx-auto h-fit lg:h-full grid grid-cols-1 lg:grid-cols-[73%_20%_5%] gap-4">
        <div className=" w-full h-screen ">
          <div className="flex gap-3 pt-2  w-full h-[7%] pb-1 font-karla  lg:font-edu-sa text-3xl font-bold">
            <img src={navbarlogo} className=" w-fit h-full rounded-md ml-3 " />
            <h1 className=" font-bold text-lg md:text-2xl flex justify-center items-center h-full text-violate-500 ">
              Live Loop
            </h1>
          </div>
          <div
            className=" w-full  flex md:flex-row flex-col gap-5 max-h-[80%] h-[80%] mt-2
           items-center md:justify-between"
          >
            <div className=" w-full md:w-[49%] h-[48%] md:h-full">
              {localStream ? (
                <div className=" w-full h-full overflow-hidden relative">
                  <video
                    className="w-full h-full  rounded-md bg-violate-800"
                    ref={localvideoRef}
                    autoPlay
                    muted
                    playsInline
                    style={{
                      transform: "scale(-1, 1)",
                      objectPosition: "center",
                      objectFit: "cover",
                    }}
                  ></video>
                  <div className=" font-bold text-3xl font-karla lg:font-edu-sa absolute bottom-1 left-2">
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
            <div className="w-full md:w-[49%] h-[48%] md:h-full overflow-hidden">
              {remoteStream ? (
                <video
                  // something wrong heppening here fix height of the video
                  className="w-full h-full rounded-md backdrop-blur-lg"
                  ref={remotevideoRef}
                  autoPlay
                  // playsInline
                  style={{
                    backgroundImage: `url(${bgImage})`,
                    backgroundPosition: `center`,
                    backdropFilter: true,
                    transform: "scale(-1, 1)",
                    objectPosition: "center",
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
           items-center justify-center gap-2 md:gap-10 flex-grow"
          >
            <button
              style={{
                "--tw-gradient-angle": `${45}deg`,
              }}
              className=" md:w-[70px] md:h-[50px]  w-[50px] h-[40px] glow-on-hover
              font-karla lg:font-edu-sa
              font-bold text-sm md:text-xl"
              onClick={startCallingHandeler}
            >
              Next
            </button>
            <button
              style={{
                "--tw-gradient-angle": `${130}deg`,
              }}
              className="md:w-[70px] md:h-[50px]  w-[50px] h-[40px] glow-on-hover font-karla lg:font-edu-sa font-bold text-sm md:text-xl"
              onClick={stopCallHandeler}
            >
              {" "}
              Stop{" "}
            </button>
            <button
              style={{
                "--tw-gradient-angle": `${280}deg`,
              }}
              className="md:w-[70px] md:h-[50px]  w-[50px] h-[40px]  glow-on-hover font-karla lg:font-edu-sa font-bold text-xl flex items-center justify-center"
              onClick={() =>
                setIsVideoMute((pre) => {
                  let videoTracks = findTracksHandler(
                    localStream,
                    TRACKS.VIDEO_TRACK
                  );
                  muteAndUnmuteHandeler(videoTracks, pre);
                  return !pre;
                })
              }
            >
              {" "}
              {isVideoMute ? (
                <IoVideocamOffOutline className=" w-7 h-7" />
              ) : (
                <IoVideocamOutline className=" w-7 h-7" />
              )}
            </button>
            <button
              style={{
                "--tw-gradient-angle": `${240}deg`,
              }}
              className="md:w-[70px] md:h-[50px]  w-[50px] h-[40px]  glow-on-hover font-karla lg:font-edu-sa font-bold text-xl flex items-center justify-center"
              onClick={() =>
                setIsAudioMute((pre) => {
                  let audioTracks = findTracksHandler(
                    localStream,
                    TRACKS.AUDIO_TRACK
                  );
                  muteAndUnmuteHandeler(audioTracks, pre);
                  return !pre;
                })
              }
            >
              {" "}
              {isAudioMute ? (
                <CiMicrophoneOff className=" w-7 h-7" />
              ) : (
                <CiMicrophoneOn className=" w-7 h-7" />
              )}
            </button>
          </div>
        </div>
        <ChatSection
          peer={peer}
          roomId={roomId}
          setAllChat={setAllChat}
          socket={socket}
          allChat={allChat}
          remoteUserIdRef={remoteUserIdRef}
        />

        <MenuSidebar
          currentMenuItem={currentMenuItem}
          setCurrentMenuItem={setCurrentMenuItem}
        />
      </div>
    </div>
  );
};

export default CallPageHome;
