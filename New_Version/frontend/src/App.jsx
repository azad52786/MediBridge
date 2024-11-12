import { useEffect, useState } from "react";

import "./App.css";
import { Outlet } from "react-router-dom";
import { useSocket } from "./Context/SocketContext";


function App() {
  const [count, setCount] = useState(0);
  const socket = useSocket();
  
  console.log("Came in Home Page");

  return (
     <Outlet />
  );
}

export default App;
