import { useState } from "react";
import PropTypes from 'prop-types'
import { StreamProvider } from "./StreamProvidor";

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


StreamContext.propTypes = {
	children: PropTypes.node.isRequired,
};

export default StreamContext;
