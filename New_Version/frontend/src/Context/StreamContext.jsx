import React, { createContext, useContext, useState } from "react";

const StreamProvider = createContext(null);

export const useStreamContext = () => useContext(StreamProvider);
const StreamContext = ({ children }) => {
  const [localStream, setLocalStream] = useState(null);
  const [videoDevices, setVideoDevices] = useState(null);
  const [audioInputDevices, setAudioInputDevices] = useState(null);
  const [audioOutputDevices, setAudioOutputDevices] = useState(null);
  const [currentAudioDevice, setCurrentAudioDevice] = useState(null);
  const [currentVideoDevice, setCurrentVideoDevice] = useState(null);
  const [isAudioMute, setIsAudioMute] = useState(false);
  const [isVideoMute, setIsVideoMute] = useState(false);
  const [currentAudioDeviceIndex, setCurrentAudioDeviceIndex] = useState(0);
  const [currentVideoDeviceIndex, setCurrentVideoDeviceIndex] = useState(0);
  return (
    <StreamProvider.Provider
      value={{
        isAudioMute,
        setIsAudioMute,
        isVideoMute,
        setIsVideoMute,
        localStream,
        setLocalStream,
        videoDevices,
        setVideoDevices,
        audioInputDevices,
        setAudioInputDevices,
        audioOutputDevices,
        setAudioOutputDevices,
        currentAudioDevice,
        setCurrentAudioDevice,
        currentVideoDevice,
        setCurrentVideoDevice,
        currentAudioDeviceIndex,
        setCurrentAudioDeviceIndex,
        currentVideoDeviceIndex,
        setCurrentVideoDeviceIndex,
      }}
    >
      {children}
    </StreamProvider.Provider>
  );
};

export default StreamContext;
