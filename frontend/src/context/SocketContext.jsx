import { io } from 'socket.io-client'
import React , { createContext, useContext, useMemo } from 'react'

const socketContextProvidor = createContext(null);

export const useSocket = () => useContext(socketContextProvidor)


const SocketContext = ({children}) => {
    const socket = useMemo(() => io('localhost:8000') , []);
  return (
        <socketContextProvidor.Provider value={socket}>
            {children}
        </socketContextProvidor.Provider>
  )
}

export default SocketContext;