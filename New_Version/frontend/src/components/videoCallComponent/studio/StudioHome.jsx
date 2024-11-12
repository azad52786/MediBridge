import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactPlayer from "react-player";
import ChangeDevice from "./ChangeDevice";
import { IoVideocamOutline } from "react-icons/io5";
import { CiMicrophoneOn } from "react-icons/ci";
import { HiOutlineSpeakerWave } from "react-icons/hi2";
import { useStreamContext } from "../../../Context/StreamContext";

const StudioHome = () => {
  const navigate = useNavigate();
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
  } = useStreamContext();
  const [name, setName] = useState("");
  const videoRef = useRef(null); 

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
  
  const submitHandler = (e) => {
    e.preventDefault();
    if(!localStream){

      alert("Please give video permission first.");
      return;
    }
    if (name.trim() === "") return;
    navigate(`/studio/call?userName=${name}`);
  }

  useEffect(() => {
    getUserMedia();
  }, []);

  // updation of the audio and video devices parsent over system
  useEffect(() => {

    (async function () {
      if(!currentAudioDevice || !currentVideoDevice) return ;
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
    if (videoRef.current && localStream)
      videoRef.current.srcObject = localStream;
    return () => {
      if (localStream) localStream.getTracks().forEach((track) => track.stop());
    };
  }, [localStream]);

  return (
    <div className=" w-fit h-full flex items-center justify-center">
      <div className="w-[85%] grid grid-cols-2 gap-10">
        <div className=" w-full text-start">
          <p
            className=" font-edu-sa font-semibold mt-10
        
           text-base text-grey-500 
        "
          >
            You're about to join in Omegal{" "}
          </p>
          <h1 className=" text-3xl mt-2 font-semibold font-mono">
            Let’s check your cam and mic
          </h1>
          <form
            onSubmit={submitHandler}
          >
            <input
              type="text"
              placeholder="Enter Your Name"
              required
              onChange={(e) => setName(e.target.value)}
              className=" block bg-[#2B2B2B] py-2 mt-4 px-4 w-[80%]  rounded-md focus:outline outline-violate-500 "
            />
            <button className=" mt-6 py-2 font-bold px-4 bg-violate-600 rounded-md hover:shadow-lg">
              Let's Start
            </button>
          </form>
        </div>

        <div className=" w-full bg-[#1D1D1D] p-4 rounded-md">
          <div className=" w-full rounded-md">
            {
              <div className=" w-full h-[200px] overflow-hidden">
                {!localStream ? (
                  <div className=" h-full w-full bg-[#2B2B2B] animate-pulse rounded-md"></div>
                ) : (
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
      </div>
    </div>
  );
};

export default StudioHome;
