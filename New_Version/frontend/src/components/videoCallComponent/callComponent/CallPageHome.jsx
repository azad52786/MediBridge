import React, {
	useCallback,
	useEffect,
	useReducer,
	useRef,
	useState,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import MenuSidebar from "./MenuSidebar";
import navbarlogo from "../../../assets/smallnavbarlogo.png";
import { useSocket } from "../../../Context/SocketProvidor";
import { useStreamContext } from "../../../Context/StreamProvidor";
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
	// const [roomId, setRoomId] = useState(null);
	const [allChat, setAllChat] = useState([]);
	const [remoteUserDetails, setRemoteUserDetails] = useState(null); // NEEDFUL
	const [currentMenuItem, setCurrentMenuItem] = useState(
		ALL_CALL_MENU_BAR_ITEMS.CHAT
	);
	const [matching, setMatching] = useState(false);
	const localVideoRef = useRef(null);
	const remotevideoRef = useRef(null);
	const remoteUserSocketId = useRef(null); // NEEDFUL
	const socket = useSocket();
	const remoteUserIdRef = useRef(null);
	const peer = useRef(null);
	const roomIdRef = useRef(null);
	const navigate = useNavigate();

	// function to close the video call
	const closeVideoCall = useCallback(() => {
		if (peer.current) {
			console.log("close video call called!!!");
			peer.current.peer.ontrack = null;
			peer.current.peer.onremovetrack = null;
			peer.current.peer.onremovestream = null;
			peer.current.peer.onicecandidate = null;
			peer.current.peer.oniceconnectionstatechange = null;
			peer.current.peer.onsignalingstatechange = null;
			peer.current.peer.onicegatheringstatechange = null;
			peer.current.peer.onnegotiationneeded = null;
			peer.current.peer.onconnectionstatechange = null;
			if (remotevideoRef.current && remotevideoRef.current.srcObject) {
				remotevideoRef.current.srcObject
					.getTracks()
					.forEach((track) => track.stop());
				setRemoteStream(null);
				setRemoteUserDetails(null);
				remoteUserIdRef.current = null;
				remotevideoRef.current = null;
				roomIdRef.current = null;
				// setIsConnected(false);
			}
			peer.current.peer.close();
			peer.current = null;
		}
	}, [peer, remotevideoRef, remoteUserIdRef, setRemoteUserDetails]);

	const startCallingHandler = useCallback(() => {
		// Requesting for a new Room
		if (matching) return;
		setMatching(true);
		socket.emit("request-room", { name, roomId: roomIdRef.current });
		// After requesting for new callmate close the call with the ex-callmate
		if (roomIdRef.current || peer.current) {
			closeVideoCall();
		}
	}, [socket, name, closeVideoCall, matching]);
	const trackEventHendler = useCallback(
		(event) => {
			console.log("new track added");
			console.log(event.streams[0]);
			setRemoteStream(event.streams[0]);
		},
		[setRemoteStream]
	);
	const negotiationneededEventHandler = useCallback(async () => {
		if (peer.current instanceof PeerService) {
			const offer = await peer.current.getOffer();
			console.log("CALLING OFFER IS : ", offer);

			// sending the offer to another party
			socket.emit("negotiation-call-offer", {
				offer,
				roomId: roomIdRef.current,
				name,
				remoteSocketId: remoteUserSocketId.current,
			});
		}
	}, [name, peer, remoteUserSocketId, socket]);

	const iceCandidateEventHandler = useCallback(
		(event) => {
			if (event.candidate) {
				socket.emit("send-new-ice-candidates", {
					to: remoteUserSocketId.current,
					candidate: event.candidate,
				});
			}
		},
		[remoteUserSocketId, socket]
	);

	const handleRemoveTrackEvent = useCallback(() => {
		if (remoteStream) {
			const trackLength = remoteStream.getTracks().length;
			if (trackLength === 0) {
				// before closing the video call make a request to backend to remove the room and add a new room
				closeVideoCall();
			}
		}
	}, [closeVideoCall, remoteStream]);

	const handleICEConnectionStateChangeEvent = useCallback(() => {
		switch (peer.current.peer.iceConnectionState) {
			case "closed":
			case "failed":
				console.log(
					"ICE connection state changed to: ",
					peer.current.peer.iceConnectionState
				);
				// before closing the video call make a request to backend to remove the room and add a new room
				closeVideoCall();
				console.log("Closing the video call!");
				break;
			case "connected":
				console.log(
					"ICE connection state changed to: ",
					peer.current.peer.iceConnectionState
				);
				// TODO: Add some UI change when connected (user video)
				break;
			case "disconnected":
				console.log(
					"ICE connection state changed to: ",
					peer.current.peer.iceConnectionState
				);
				// TODO: Add some UI change until it's reconnected (blary effect)
				break;
			default:
				console.log(
					"ICE connection state changed to an unhandled state: ",
					peer.current.peer.iceConnectionState
				);
				break;
		}
	}, [peer, closeVideoCall]);

	// function handleSignalingStateChangeEvent(event) {
	// 	switch (myPeerConnection.signalingState) {
	// 		case "closed":
	// 			closeVideoCall();
	// 			break;
	// 	}
	// }

	const handleSignalingStateChangeEvent = useCallback(() => {
		switch (peer.current.peer.signalingState) {
			case "closed":
				console.log("closeing the signalling state");
				closeVideoCall();
				break;
		}
	}, [peer, closeVideoCall]);

	const handleConnectionStateChangeEvent = useCallback(() => {
		switch (peer.current.peer.connectionState) {
			case "closed":
			case "failed":
			case "disconnected":
				console.log("closeing the connection state");
				// before closing the video call make a request to backend to remove the room and add a new room
				closeVideoCall();
				break;
		}
	}, [peer, closeVideoCall]);

	const createPeerConnection = useCallback(() => {
		const ps = new PeerService();

		ps.peer.onicecandidate = iceCandidateEventHandler;
		ps.peer.ontrack = trackEventHendler;
		ps.peer.onnegotiationneeded = negotiationneededEventHandler;
		ps.peer.onremovetrack = handleRemoveTrackEvent;
		ps.peer.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
		//   ps.peer.onicegatheringstatechange =
		//     handleICEGatheringStateChangeEvent;
		ps.peer.onsignalingstatechange = handleSignalingStateChangeEvent;
		ps.peer.onconnectionstatechange = handleConnectionStateChangeEvent;
		return ps;
	}, [
		iceCandidateEventHandler,
		trackEventHendler,
		negotiationneededEventHandler,
		handleRemoveTrackEvent,
		handleICEConnectionStateChangeEvent,
		handleSignalingStateChangeEvent,
		handleConnectionStateChangeEvent,
	]);

	const newCallGenerator = useCallback(
		({ roomId, remoteUserDetails }) => {
			console.log("NEW CALL STARTING");
			// If already connected with someone. close that first then go for new call
			if (peer.current) closeVideoCall();
			// Adding room and remote user details
			setRemoteUserDetails(remoteUserDetails);
			remoteUserSocketId.current = remoteUserDetails.socket;
			roomIdRef.current = roomId;
			// Now createing the peer connection
			peer.current = createPeerConnection();
			console.log("CREATED PEER SERVICE : ", peer.current);
			// Adding tracks based on the sender already exists or not
			const senders = peer.current.peer.getSenders();
			if (!localStream) {
				console.log("Local Stream is not available");
				return;
			}
			for (let track of localStream.getTracks()) {
				let isTrackExists = senders.some((sender) => sender.track === track);
				if (!isTrackExists) {
					peer.current.peer.addTrack(track, localStream);
				} else {
					console.log("Tracks already exists");
				}
			}
		},
		[peer, closeVideoCall, createPeerConnection, localStream]
	);

	const incomingOfferHandler = useCallback(
		async ({ remoteUserDetails, roomId, offer }) => {
			console.log("NEGOTIATION OFFER CREATEING");
			// If already connected with someone close that call
			if (peer.current) closeVideoCall();
			setRemoteUserDetails(remoteUserDetails);
			remoteUserSocketId.current = remoteUserDetails.socket;
			roomIdRef.current = roomId;
			peer.current = createPeerConnection();
			await peer.current.setRemoteDesc(offer);
			const senders = peer.current.peer.getSenders();
			if (!localStream) {
				console.log("Local Stream is not available");
				return;
			}
			for (let track of localStream.getTracks()) {
				let isTrackExists = senders.some((sender) => sender.track === track);
				if (!isTrackExists) {
					peer.current.peer.addTrack(track, localStream);
				} else {
					console.log("Tracks already exists");
				}
			}
			const answer = await peer.current.getAnswer();
			// Sending the answer to other party
			console.log(remoteUserSocketId.current);
			socket.emit("negotiation-call-answer", {
				ans: answer,
				roomId,
				name,
				remoteSocketId: remoteUserSocketId.current,
			});
			setMatching(false);
		},
		[
			remoteUserSocketId,
			localStream,
			closeVideoCall,
			createPeerConnection,
			socket,
			name,
		]
	);

	const incomingAnswerHandler = useCallback(
		async ({ ans }) => {
			if (!peer.current) return;
			await peer.current.setRemoteDesc(ans);
			setMatching(false);
		},
		[peer]
	);

	const newIceCandidateHandler = useCallback(
		({ candidate }) => {
			if (!peer.current) return;
			const newCandidate = new RTCIceCandidate(candidate);
			peer.current.peer.addIceCandidate(newCandidate);
		},
		[peer]
	);

	// useEffect(() => {
	// 	if (!localStream || !peer) return;
	// 	// Adding Tracks into the new RTCPeerConnection

	// 	// adding the tracks

	// 	if (peer.peer instanceof RTCPeerConnection) {
	// 		peer.peer.ontrack = trackEventHendler;

	// 		//TODO:- negotiationneeded problem go through the negotiationneeded docs agina
	// 		peer.peer.onnegotiationneeded = negotiationneededEventHandler;

	// 		peer.peer.onicecandidate = iceCandidateEventHandler;
	// 	}
	// }, [peer]);
	const stopcallhandler = useCallback(() => {
		if (
			!peer.current ||
			!roomIdRef.current ||
			!remoteStream ||
			!remoteUserSocketId.current
		)
			return;

		socket.emit("stop-call", {
			roomId: roomIdRef.current,
			remoteSocketId: remoteUserSocketId.current,
			name,
		});

		closeVideoCall();
	}, [name, socket, remoteStream, remoteUserSocketId, peer, closeVideoCall]);
	
	const closeFromRemote = useCallback(() => {
		closeVideoCall();
		setMatching(true);
	}, [closeVideoCall])

	useEffect(() => {
		if (!socket) return;
		socket.on("match-done", newCallGenerator);
		socket.on("negotiation-call-offer", incomingOfferHandler);
		socket.on("negotiation-call-answer", incomingAnswerHandler);
		socket.on("new-ice-candidates", newIceCandidateHandler);
		socket.on("stop-by-remote-user", closeFromRemote);

		return () => {
			socket.off("match-done", newCallGenerator);
			socket.off("negotiation-call-offer", incomingOfferHandler);
			socket.off("negotiation-call-answer", incomingAnswerHandler);
			socket.off("new-ice-candidates", newIceCandidateHandler);
			socket.on("stop-by-remote-user", closeFromRemote);
		};
	}, [
		socket,
		newCallGenerator,
		incomingOfferHandler,
		incomingAnswerHandler,
		newIceCandidateHandler,
		closeFromRemote,
	]);

	useEffect(() => {
		if (!currentAudioDevice || !currentVideoDevice) navigate("/studio");
		toast("🦄 Press Click next and wait...");
	}, [navigate, currentAudioDevice, currentVideoDevice]);

	useEffect(() => {
		if (!localStream) return;
		localVideoRef.current.srcObject = localStream;
	}, [localStream]);

	useEffect(() => {
		if (!remoteStream) return;
		remotevideoRef.current.srcObject = remoteStream;
	}, [remoteStream]);

	useEffect(() => {
		// this is the current connected video shareing and audio shareing device
		if (!currentAudioDevice || !currentVideoDevice) return;
		(async () => {
			try {
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
		})();

		return () => {
			if (localStream) {
				localStream.getTracks().forEach((track) => {
					track.stop();
				});
				setLocalStream(null);
			}
			if (remoteStream) {
				remoteStream.getTracks().forEach((track) => {
					track.stop();
				});
				setRemoteStream(null);
			}
		};
	}, []);

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
										className="w-full h-full  rounded-md"
										ref={localVideoRef}
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
								<div className=" w-full h-full overflow-hidden relative">
									<video
										// something wrong heppening here fix height of the video
										className="w-full h-full rounded-md backdrop-blur-lg"
										ref={remotevideoRef}
										autoPlay
										playsInline
										style={{
											// backgroundImage: `url(${bgImage})`,
											backgroundPosition: `center`,
											backdropFilter: true,
											transform: "scale(-1, 1)",
											objectPosition: "center",
											objectFit: "cover",
										}}
									></video>
									<div className=" font-bold text-3xl font-karla lg:font-edu-sa absolute bottom-1 left-2">
										{remoteUserDetails?.userName
											? remoteUserDetails?.userName.substring(0, 30)
											: ""}
									</div>
								</div>
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
							className={`md:w-[70px] md:h-[50px]  w-[50px] h-[40px] glow-on-hover
              font-karla lg:font-edu-sa
              font-bold text-sm md:text-xl ${matching ? "" : "after:bg-black"}`}
							onClick={startCallingHandler}
						>
							Next
						</button>
						<button
							style={{
								"--tw-gradient-angle": `${130}deg`,
							}}
							className={`md:w-[70px] md:h-[50px]  w-[50px] h-[40px] glow-on-hover font-karla lg:font-edu-sa font-bold text-sm md:text-xl after:bg-black ${
								matching
									? "cursor-not-allowed after:bg-black text-white"
									: "cursor-pointer"
							}`}
							onClick={stopcallhandler}
							disabled={matching}
						>
							{" "}
							Stop{" "}
						</button>
						<button
							style={{
								"--tw-gradient-angle": `${280}deg`,
							}}
							className="md:w-[70px] md:h-[50px]  w-[50px] h-[40px]  glow-on-hover font-karla lg:font-edu-sa font-bold text-xl flex items-center justify-center after:bg-black"
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
							className="md:w-[70px] md:h-[50px]  w-[50px] h-[40px] after:bg-black  glow-on-hover font-karla lg:font-edu-sa font-bold text-xl flex items-center justify-center"
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
					peer={peer.current}
					roomId={roomIdRef.current}
					setAllChat={setAllChat}
					socket={socket}
					allChat={allChat}
					remoteUserDetails={remoteUserDetails}
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
