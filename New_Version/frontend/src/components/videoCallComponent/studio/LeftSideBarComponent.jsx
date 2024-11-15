import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

const LeftSideBarComponent = ({localStream}) => {

  const [name, setName] = useState("");
  const navigate = useNavigate();
  const submitHandler = (e) => {
    e.preventDefault();
    if (!localStream) {
      alert("Please give video permission first.");
      return;
    }
    if (name.trim() === "") return;
    navigate(`/studio/call?userName=${name}`);
  };
  return (
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
          <form onSubmit={submitHandler}>
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

  )
}

export default LeftSideBarComponent
