import './App.css';
import { Route, Routes } from 'react-router-dom';
import Room from './pages/Room';
import CallingPage from './pages/CallingPage';
import { useContext, useState } from 'react';
import HomePage from './pages/HomePage';
import UserContext from './context/UserContext';
import SocketContext from './context/SocketContext';

function App() {
  const [myStream , setMyStream] = useState(null);
  return (
    <div className="w-screen min-h-screen bg-richblack-900">
    <Routes>
      <Route path='/' element={<HomePage/>}></Route>
      <Route path="/room" element = {<UserContext><SocketContext><Room setMyStream ={setMyStream}/> </SocketContext></UserContext>} />
      <Route path="/room/:roomId" element = {<UserContext><SocketContext> <CallingPage setMyStream ={setMyStream} myStream = {myStream}/></SocketContext> </UserContext> } />
    </Routes>
  </div>
  );
}

export default App;
