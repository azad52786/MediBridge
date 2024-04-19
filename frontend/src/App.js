import './App.css';
import { Route, Routes } from 'react-router-dom';
import Room from './pages/Room';
import CallingPage from './pages/CallingPage';
import { useState } from 'react';

function App() {
  const [myStream , setMyStream] = useState(null);
  return (
    <div className="w-screen min-h-screen bg-richblack-900">
    <Routes>
      <Route path="/" element = { <Room setMyStream ={setMyStream}/> } />
      <Route path="/room/:roomId" element = { <CallingPage setMyStream ={setMyStream} myStream = {myStream}/> } />
    </Routes>
  </div>
  );
}

export default App;
