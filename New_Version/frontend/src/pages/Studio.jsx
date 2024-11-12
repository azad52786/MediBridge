import React from "react";
import { Outlet } from "react-router-dom";
import SocketContext from "../Context/SocketContext";
import StreamContext from "../Context/StreamContext";

const Studio = () => {
  return (
    <div>
      <StreamContext>
        <SocketContext>
          <Outlet />
        </SocketContext>
      </StreamContext>
    </div>
  );
};

export default Studio;
