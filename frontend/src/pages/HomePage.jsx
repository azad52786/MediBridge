import React from 'react'
import { Link } from 'react-router-dom'

const HomePage = () => {
  return (
    <div className=' w-screen h-screen flex items-center justify-center'>
        <Link to={'/room'}><button  className=" font-semibold p-3 text-richblack-900 mt-8 rounded-md bg-yellow-25 border-b border-pure-greys-50">Calling Page</button></Link>
    </div>
  )
}

export default HomePage