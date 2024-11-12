import React from 'react'
import { Outlet } from 'react-router-dom'
import SocketContext from '../Context/SocketContext'

const Studio = () => {
  return (
    <div>
      <SocketContext >
        <Outlet />
      </SocketContext>
    </div>
  )
}

export default Studio
