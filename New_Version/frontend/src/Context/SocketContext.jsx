import { createContext, useContext, useMemo } from "react";
import React from "react";
import { io } from "socket.io-client";

const SocketProvidor = createContext(null);

export const useSocket = () => {
	return useContext(SocketProvidor);
};

const SocketContext = ({ children }) => {
	const socket = useMemo(() => io("http://localhost:3000"), []);
	// const socket = useMemo(() => io("https://liveloop-h6no.onrender.com") , []);
	return (
		<SocketProvidor.Provider value={socket}>{children}</SocketProvidor.Provider>
	);
};

export default SocketContext;
