import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import ChangeDevice from "./ChangeDevice";
import { HiOutlineSpeakerWave } from "react-icons/hi2";
import { useStreamContext } from "../../../Context/StreamContext";
import { CiMicrophoneOn, CiMicrophoneOff } from "react-icons/ci";
import { IoVideocamOutline, IoVideocamOffOutline } from "react-icons/io5";
import LeftSideBarComponent from "./LeftSideBarComponent";
import AudioDeviceComponent from "./AudioDeviceComponent";
import {
  findTracksHandler,
  muteAndUnmuteHandeler,
} from "../../../utils/handelerFunction";
import { TRACKS } from "../../../utils/constant";
import { useLocation } from "react-router-dom";

export const REACT_ICONS = {
  AUDIO_UNMUTE: <CiMicrophoneOn />,
  AUDIO_MUTE: <CiMicrophoneOff style={{ color: "red" }} />,
  VIDEO_ON: <IoVideocamOutline />,
  VIDEO_OFF: <IoVideocamOffOutline style={{ color: "red" }} />,
};

const StudioHome = () => {
  const {
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
    isVideoMute,
    setIsVideoMute,
    isAudioMute,
    setIsAudioMute,
  } = useStreamContext();
  const videoRef = useRef(null);
  const location = useLocation();
  const getUserMedia = useCallback(async () => {
    try {
      const userStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      if (!userStream) return;
      setLocalStream(userStream);
      const getAllDevices = await navigator.mediaDevices.enumerateDevices();
      if (getAllDevices.length > 0) {
        const videoDevices = getAllDevices.filter(
          (d) => d.kind === "videoinput"
        );
        const audioInputDevices = getAllDevices.filter(
          (d) => d.kind === "audioinput"
        );
        const audioOutputDevices = getAllDevices.filter(
          (d) => d.kind === "audiooutput"
        );
        setVideoDevices(videoDevices);
        setAudioInputDevices(audioInputDevices);
        if (videoDevices.length > 0) {
          setCurrentVideoDevice(videoDevices[0]);
        }
        if (audioInputDevices.length > 0) {
          setCurrentAudioDevice(audioInputDevices[0]);
        }
        setAudioOutputDevices(audioOutputDevices);
      }
    } catch (error) {
      if (error.name === "NotAllowedError") {
        console.warn("User denied access to media devices.");

        alert(
          "Please allow access to the camera and microphone in your browser settings."
        );
      } else {
        console.error("Error accessing media devices:", error);
      }
    }
  }, [setLocalStream]);

  useEffect(() => {
    getUserMedia();
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  // updation of the audio and video devices parsent over system
  useEffect(() => {
    (async function () {
      if (!currentAudioDevice || !currentVideoDevice) return;
      try {
        let newStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId: currentAudioDevice?.deviceId
              ? { exact: currentAudioDevice?.deviceId }
              : undefined,
          },
          video: {
            deviceId: currentVideoDevice?.deviceId
              ? { exact: currentVideoDevice?.deviceId }
              : undefined,
          },
        });

        if (!newStream) return;
        // set the steam mute and unmute as perviously it has
        let audioTrack = findTracksHandler(newStream, TRACKS.AUDIO_TRACK);
        let videoTrack = findTracksHandler(newStream, TRACKS.VIDEO_TRACK);
        if (isAudioMute) {
          muteAndUnmuteHandeler(audioTrack, false);
        }
        if (isVideoMute) {
          muteAndUnmuteHandeler(videoTrack, false);
        }
        setLocalStream(newStream);
      } catch (error) {
        if (error.name === "NotAllowedError") {
          console.warn("User denied access to media devices.");

          alert(
            "Please allow access to the camera and microphone in your browser settings."
          );
          // Optionally, display instructions to manually enable permissions
        } else {
          console.error("Error accessing media devices:", error);
        }
      }
    })();
  }, [currentAudioDevice, currentVideoDevice]);

  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [localStream]);

  return (
    <div className=" w-full h-full flex items-center justify-center">
      <div className="lg:w-[70%] w-[90%] max-w-[420px] md:max-w-full  grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10 lg:gap-24 py-5">
        <div className=" w-full bg-[#1D1D1D] p-4 rounded-md  border border-violate-600 border-opacity-35 ">
          <div className=" w-full rounded-md">
            {
              <div className=" w-full h-[250px] overflow-hidden">
                {!localStream ? (
                  <div className=" h-full w-full bg-[#2B2B2B] animate-pulse rounded-md"></div>
                ) : (
                  <div className=" w-full h-full relative">
                    <video
                      className="w-full h-full rounded-md"
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      style={{
                        transform: "scale(-1, 1)",
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    ></video>
                    <div className=" absolute bottom-2 w-full text-center text-3xl flex justify-center items-center gap-2">
                      <div
                        onClick={() =>
                          setIsAudioMute((pre) => {
                            let audioTracks = findTracksHandler(
                              localStream,
                              TRACKS.AUDIO_TRACK
                            );
                            muteAndUnmuteHandeler(audioTracks, pre);
                            return !pre;
                          })
                        }
                        className={`bg-grey-800 p-2 rounded-md bg-opacity-50 cursor-pointer ${
                          isAudioMute ? "text-accent-primary" : ""
                        } `}
                      >
                        {!isAudioMute ? (
                          <CiMicrophoneOn />
                        ) : (
                          <CiMicrophoneOff />
                        )}
                      </div>
                      <div
                        onClick={() =>
                          setIsVideoMute((pre) => {
                            let videoTracks = findTracksHandler(
                              localStream,
                              TRACKS.VIDEO_TRACK
                            );
                            muteAndUnmuteHandeler(videoTracks, pre);
                            return !pre;
                          })
                        }
                        className={`bg-grey-800 p-2 rounded-md bg-opacity-50 cursor-pointer ${
                          isVideoMute ? "text-accent-secondary" : ""
                        } `}
                      >
                        {!isVideoMute ? (
                          <IoVideocamOutline />
                        ) : (
                          <IoVideocamOffOutline />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              // localStream && <ReactPlayer className="w-full h-full" playing muted url={localStream} height={200} />
            }

            <div>
              <ChangeDevice
                name={"videoDevices"}
                devices={videoDevices}
                ChangeHandeler
                setCurrentDevice={setCurrentVideoDevice}
                currentDevice={currentVideoDevice}
                icon={<IoVideocamOutline />}
              />
              <ChangeDevice
                name={"audioInputDevices"}
                devices={audioInputDevices}
                setCurrentDevice={setCurrentAudioDevice}
                currentDevice={currentAudioDevice}
                ChangeHandeler
                icon={<CiMicrophoneOn />}
              />
              <ChangeDevice
                name={"audioOutputDevices"}
                devices={audioOutputDevices}
                currentDevice={null}
                ChangeHandeler
                icon={<HiOutlineSpeakerWave />}
              />
            </div>
          </div>
        </div>
        <LeftSideBarComponent localStream={localStream} className=" " />
      </div>
    </div>
  );
};

export default StudioHome;
