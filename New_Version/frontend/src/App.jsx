import { useEffect, useState } from "react";

import "./App.css";
import { Outlet, useLocation } from "react-router-dom";
import NavbarHome from "./components/navbar/NavbarHome";


function App() {
  const location = useLocation();
  const [showNavBar , setShowNavBar ] = useState(true);
  console.log("Came in Home Page");
  useEffect(() => {
    if(location.pathname == '/studio' || location.pathname == '/studio/call'){
      setShowNavBar(false);
    }else{
      setShowNavBar(true);  
    }
  } , [location.pathname]);
  return (
  <div className=" w-screen min-h-screen overflow-x-hidden">
  {
    showNavBar && 
  <NavbarHome/>
  }
    <Outlet />
  </div>
  );
}

export default App;
