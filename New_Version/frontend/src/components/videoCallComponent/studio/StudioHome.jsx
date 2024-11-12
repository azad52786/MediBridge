import React from 'react'
import { useNavigate } from 'react-router-dom'

const StudioHome = () => {
  const navigate = useNavigate();
  return (
    <h1 className="text-3xl font-bold underline"
      onClick={() => navigate('/studio/call')}
    >
      Hello world!
    </h1>
  )
}

export default StudioHome
