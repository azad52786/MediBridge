import { useCallback, useEffect, useRef, useState } from "react";
import { IoSend } from "react-icons/io5";
import PropTypes from "prop-types";

// Add custom animations styles
const ChatSection = ({
	peer,
	roomId,
	socket,
	setAllChat,
	remoteUserDetails,
	allChat,
}) => {
	const chatRef = useRef("");
	const bottomRef = useRef(null);
	const [shouldScroll, setShouldScroll] = useState(false);

	// Add custom styles for animations
	useEffect(() => {
		const styleElement = document.createElement("style");
		styleElement.textContent = `
			@keyframes fade-in-right {
				from { opacity: 0; transform: translateX(30px); }
				to { opacity: 1; transform: translateX(0); }
			}
			@keyframes fade-in-left {
				from { opacity: 0; transform: translateX(-30px); }
				to { opacity: 1; transform: translateX(0); }
			}
			@keyframes pulse-glow {
				0%, 100% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.3); }
				50% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.4); }
			}
			.animate-fade-in-right { animation: fade-in-right 0.6s ease-out; }
			.animate-fade-in-left { animation: fade-in-left 0.6s ease-out; }
			.animate-pulse-glow { animation: pulse-glow 2s infinite; }
			.border-3 { border-width: 3px; }
		`;
		document.head.appendChild(styleElement);
		return () => document.head.removeChild(styleElement);
	}, []);

	const chatUpdateHandeler = (e) => {
		e.preventDefault();
		if (!remoteUserDetails.socket) return;
		let message = chatRef.current.value.trim();
		console.log(message);
		console.log(remoteUserDetails);
		if (message !== "") {
			socket.emit("newMessage", {
				message,
				roomId,
				remoteSocket: remoteUserDetails?.socket,
			});
			chatRef.current.value = "";
		}
	};

	const newMessageHandeler = useCallback(
		({ from, message }) => {
			setAllChat((pre) => [...pre, { from, message: message.trim() }]);
		},
		[setAllChat]
	);

	const borderStyleD = {
		borderBottomLeftRadius: "1rem",
		borderTopLeftRadius: "1rem",
		borderTopRightRadius: "1rem",
	};
	const borderStyleP = {
		borderBottomRightRadius: "1rem",
		borderTopLeftRadius: "1rem",
		borderTopRightRadius: "1rem",
	};

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				setShouldScroll(entry.isIntersecting);
			},
			{ threshold: 1.0 }
		);

		if (bottomRef.current) {
			observer.observe(bottomRef.current);
		}

		return () => {
			if (bottomRef.current) observer.unobserve(bottomRef.current);
		};
	}, []);

	useEffect(() => {
		if (shouldScroll) {
			bottomRef.current.scrollIntoView({
				behavior: "smooth",
			});
		}
	}, [allChat]);

	useEffect(() => {
		setAllChat([]);
	}, [peer]);

	useEffect(() => {
		socket.on("Message:recived", newMessageHandeler);

		return () => {
			socket.off("Message:recived", newMessageHandeler);
		};
	}, [socket, newMessageHandeler]);

	return (
		<div className="w-full h-[90vh] lg:min-h-[96vh] bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-2xl mt-0 lg:mt-3 shadow-2xl border border-blue-500/30 backdrop-blur-lg">
			<div className="w-full h-full">
				<div className="w-[90%] py-4 flex items-center justify-center mx-auto font-bold text-xl border-2 rounded-2xl mt-4 border-cyan-400 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 shadow-xl backdrop-blur-md text-white hover:shadow-cyan-400/50 transition-all duration-300">
					<span className="text-violate-500 font-extrabold drop-shadow-lg animate-pulse">
						Studio Chat
					</span>
				</div>
				<div className="h-[80%] py-4 w-full px-3">
					<div className="h-full overflow-y-scroll py-3 chat-scroll-bar bg-gradient-to-b from-gray-800/60 to-gray-900/80 textArea overflow-x-hidden rounded-2xl px-4 border border-blue-400/30 backdrop-blur-md shadow-inner">
						{allChat.length <= 0 ? (
							<div className="flex items-center justify-center font-semibold text-gray-300 h-full">
								<div className="text-center animate-bounce">
									<div className="mb-3 text-5xl animate-pulse">💬</div>
									<div className="text-xl">No messages yet</div>
									<div className="text-sm text-blue-300 mt-2 animate-pulse">
										Start a conversation!
									</div>
								</div>
							</div>
						) : (
							allChat.map((ele, index) => {
								return (
									<div
										key={index}
										className={`w-full mb-4 font-karla lg:font-edu-sa flex flex-col ${
											ele.from === socket.id ? "items-end" : "items-start"
										}`}
									>
										{ele.from === socket.id ? (
											// Your messages (right side) - Vibrant & Interactive
											<div className="flex justify-end mb-4 animate-fade-in-right">
												<div className="relative max-w-[340px] group">
													<div
														className="p-3 px-4 bg-gradient-to-br from-blue-500 via-cyan-500 to-sky-500 shadow-2xl hover:shadow-blue-500/60 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 border-2 border-blue-300/40 hover:border-blue-300/80 backdrop-blur-sm relative overflow-hidden"
														style={borderStyleD}
													>
														{/* Animated background shimmer */}
														<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
														<p className="text-white font-semibold leading-relaxed relative z-10 drop-shadow-lg">
															{ele.message}
														</p>
													</div>
													<div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-400 via-cyan-400 to-sky-400 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-xl border-3 border-white/30 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 animate-pulse-glow">
														<span className="animate-bounce">M</span>
													</div>
												</div>
											</div>
										) : (
											// Other user's messages (left side) - Orange-Amber Theme
											<div className="flex justify-start mb-4 animate-fade-in-left">
												<div className="relative max-w-[340px] group">
													<div
														className="p-3 px-4 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 shadow-2xl hover:shadow-pink-500/60 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 border-2 border-pink-300/40 hover:border-pink-300/80 backdrop-blur-sm relative overflow-hidden"
														style={borderStyleP}
													>
														{/* Animated background shimmer */}
														<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
														<p className="text-white font-semibold leading-relaxed relative z-10 drop-shadow-lg">
															{ele.message}
														</p>
													</div>
													<div className="absolute -bottom-2 -left-2 w-8 h-8 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-xl border-3 border-white/30 group-hover:scale-125 group-hover:-rotate-12 transition-all duration-300 animate-pulse-glow">
														<span className="animate-bounce">U</span>
													</div>
												</div>
											</div>
										)}
									</div>
								);
							})
						)}
						<div ref={bottomRef}></div>
					</div>
				</div>
				<div className="w-full px-3 pb-4">
					<form
						className="flex gap-3 relative w-full mx-auto"
						onSubmit={chatUpdateHandeler}
					>
						<div className="relative w-full group">
							<textarea
								rows="1"
								cols="1"
								placeholder="Type your message..."
								ref={chatRef}
								className="bg-gray-800/90 backdrop-blur-md overflow-y-scroll chat-scroll-bar rounded-2xl w-full resize-none border-2 border-blue-400/50 pr-16 outline-none focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 focus:shadow-lg focus:shadow-cyan-400/30 px-5 py-4 text-white placeholder-gray-300 transition-all duration-300 hover:border-blue-300 hover:shadow-md group-hover:bg-gray-700/90"
							></textarea>
							<button
								type="submit"
								className="absolute top-[50%] translate-y-[-50%] right-4 w-9 h-9 bg-gradient-to-r from-blue-500 via-cyan-500 to-sky-500 rounded-xl flex items-center justify-center hover:from-blue-400 hover:via-cyan-400 hover:to-sky-400 transform hover:scale-110 hover:rotate-12 transition-all duration-300 shadow-xl hover:shadow-blue-400/70 border-2 border-blue-300/50 active:scale-95"
							>
								<IoSend className="w-5 h-5 text-white drop-shadow-lg" />
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

ChatSection.propTypes = {
	peer: PropTypes.any,
	roomId: PropTypes.string.isRequired,
	socket: PropTypes.object.isRequired,
	setAllChat: PropTypes.func.isRequired,
	remoteUserDetails: PropTypes.object.isRequired,
	allChat: PropTypes.array.isRequired,
};

export default ChatSection;
