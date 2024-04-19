import React, { createContext, useContext, useState } from 'react'

const userContextProvider = createContext(null);

export const useUserContext = () => useContext(userContextProvider);

const UserContext = ({children}) => {
    const [userRole , setUserRole] = useState(null);
  return (
    <userContextProvider.Provider value={{userRole , setUserRole}}>
        {children}
    </userContextProvider.Provider>
  )
}

export default UserContext