import {useMemo } from "react";
import PropTypes from "prop-types";
import { io } from "socket.io-client";
import { SocketProvidor } from "./SocketProvidor";



const SocketContext = ({ children }) => {
	// const socket = useMemo(() => io("http://localhost:3000"), []);
	const socket = useMemo(() => io("https://liveloop-h6no.onrender.com"), []);
	return (
		<SocketProvidor.Provider value={socket}>{children}</SocketProvidor.Provider>
	);
};

SocketContext.propTypes = {
	children: PropTypes.node.isRequired
}

export default SocketContext;
