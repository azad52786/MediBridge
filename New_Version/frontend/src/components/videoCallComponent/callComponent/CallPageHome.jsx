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
	const [matching, setMatching] = useState(false);
	const localvideoRef = useRef("");
	const remotevideoRef = useRef("");
	const socket = useSocket();
	const remoteUserIdRef = useRef(null);
	const navigate = useNavigate();

	const startCallingHandler = useCallback(() => {
		// Requesting for a new Room
		setMatching(true);
		socket.emit("request-room", { name, roomId });
	}, [socket, name, roomId]);

	const newCallGenerator = useCallback(
		({ roomId, remoteUserDetails }) => {
			console.log("NEW CALL STARTING");
			// If already connected with someone. close that first then go for new call
			if (peer.current) closeVideoCall();
			// Adding room and remote user details
			setRemoteUserDetails(remoteUserDetails);
			setRoomId(roomId);
			setPeer(new PeerService());
		},
		[setRemoteUserDetails, setRoomId, setPeer]
	);

	const incomingOfferHandler = useCallback(
		async ({ remoteUserDetails, roomId, offer }) => {
			console.log("NEGOTIATION OFFER CREATEING");
			// If already connected with someone close that call
			if (peer.current) closeVideoCall();
			setRemoteUserDetails(remoteUserDetails);
			setRoomId(roomId);
			const newPeer = new PeerService();
			await newPeer.setRemoteDesc(offer);
			setPeer(newPeer);
			const answer = await newPeer.getAnswer();
			// Sending the answer to other party
			socket.emit("negotiation-call-answer", {
				ans: answer,
				roomId,
				name,
				remoteSocketId: remoteUserDetails.socket,
			});
		},
		[setRemoteUserDetails, setRoomId, setPeer, socket, name]
	);

	const incomingAnswerHandler = useCallback(
		async ({ ans }) => {
			if (!peer) return;

			await peer.setRemoteDesc(ans);
		},
		[peer]
	);

	const newIceCandidateHandler = useCallback(
		({ candidate }) => {
			if (!peer) return;
			peer.peer.addIceCandidate(candidate);
		},
		[peer]
	);

	useEffect(() => {
		if (!localStream || !peer) return;
		// Adding Tracks into the new RTCPeerConnection

		localStream
			.getTracks()
			.forEach((track) => peer.peer.addTrack(track, localStream));

		if (peer.peer instanceof RTCPeerConnection) {
			peer.peer.ontrack = (event) => {
				setRemoteStream(event.streams[0]);
			};

			// TODO:- negotiationneeded problem go through the negotiation needed docs agina
			peer.peer.onnegotiationneeded = async () => {
				const offer = await peer.getOffer();
				// sending the offer to another party
				socket.emit("negotiation-call-offer", {
					offer,
					roomId,
					name,
					remoteSocketId: remoteUserDetails.socket,
				});
			};

			peer.peer.onicecandidate = (event) => {
				socket.emit("send-new-ice-candidates", {
					to: remoteUserDetails.socket,
					candidate: event.candidate,
				});
			};
		}
	}, [peer]);

	useEffect(() => {
		if (!socket) return;
		socket.on("match-done", newCallGenerator);
		socket.on("negotiation-call-offer", incomingOfferHandler);
		socket.on("negotiation-call-answer", incomingAnswerHandler);
		socket.on("new-ice-candidates", newIceCandidateHandler);

		return () => {
			socket.off("match-done", newCallGenerator);
			socket.off("negotiation-call-offer", incomingOfferHandler);
			socket.off("negotiation-call-offer", incomingAnswerHandler);
			socket.off("new-ice-candidates", newIceCandidateHandler);
		};
	}, [
		socket,
		newCallGenerator,
		incomingOfferHandler,
		incomingAnswerHandler,
		newIceCandidateHandler,
	]);

	useEffect(() => {
		if (!currentAudioDevice || !currentVideoDevice) navigate("/studio");
		toast("🦄 Press Click next and wait...");
	}, [navigate, currentAudioDevice, currentVideoDevice]);

	useEffect(() => {
		if (!localStream) return;
		localvideoRef.current.srcObject = localStream;
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
              font-bold text-sm md:text-xl ${matching ? "" : "after:bg-black"}`}
							onClick={startCallingHandler}
						>
							Next
						</button>
						<button
							style={{
								"--tw-gradient-angle": `${130}deg`,
							}}
							className="md:w-[70px] md:h-[50px]  w-[50px] h-[40px] glow-on-hover font-karla lg:font-edu-sa font-bold text-sm md:text-xl"
							// onClick={stopCallHandeler}
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
