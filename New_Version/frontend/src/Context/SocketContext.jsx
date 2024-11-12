import { createContext, useContext, useMemo } from "react"
import React from 'react'
import { io } from "socket.io-client"


const SocketProvidor = createContext(null);

export const useSocket = () => {
    return useContext(SocketProvidor);
}


const SocketContext = ({children}) => {
  const socket = useMemo(() => io("localhost:3000") , [])
  return (
    <SocketProvidor.Provider value={socket}>
    {children}
    </SocketProvidor.Provider>
  )
}

export default SocketContext
