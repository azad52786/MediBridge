import { createContext, useContext } from "react";

export const SocketProvidor = createContext(null);

export const useSocket = () => {
	return useContext(SocketProvidor);
};