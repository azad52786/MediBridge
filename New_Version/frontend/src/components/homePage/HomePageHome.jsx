import React from 'react'
import { Link } from 'react-router-dom'

const HomePageHome = () => {
  return (
    <div>
      <Link to={'/studio'}><button className=' p-6 bg-violate-600 rounded-md'>Call</button></Link>
    </div>
  )
}

export default HomePageHome
