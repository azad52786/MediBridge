import React from 'react'
import { useSearchParams } from 'react-router-dom'

const CallPageHome = () => {
  const [searchParams , setSearchParams] = useSearchParams();
  const name = searchParams.get('userName');
  return (
    <div>
      This is Call page
    </div>
  )
}

export default CallPageHome
