import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LeftSideBarComponent = ({ localStream }) => {
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const submitHandler = (e) => {
    e.preventDefault();
    if (!localStream) {
      alert("Please give video permission first.");
      return;
    }
    if (name.trim() === "") return;
    navigate(`/studio/call?userName=${name.trim()}`);
  };
  return (
    <div className=" w-full text-start flex flex-col justify-center">
      <p
        className=" font-mono font-semibold mt-10
        
           text-base text-grey-500 
        "
      >
        You're about to join in Live Loop{" "}
      </p>
      <h1 className=" text-3xl mt-2 font-semibold font-edu-sa text-alert-success"
        style={{
                backgroundImage: "linear-gradient(111deg, #5238ff, #a0fbcd)",
                color: "transparent",
                backgroundClip: "text",
              }}
      >
        Let’s check your cam and mic
      </h1>
      <form onSubmit={submitHandler}
        className=" flex flex-col
         gap-2"
      >
        <input
          type="text"
          placeholder="Enter Your Name"
          required
          onChange={(e) => setName(e.target.value)}
          className=" block bg-[#2B2B2B] py-2 mt-4 px-4 w-[80%]  rounded-md focus:outline outline-violate-500 "
        />
        <div>
        
        <p className=" mt-4 text-sm  text-grey-500 font-edu-sa">
          The world is just a call away.
        </p>
        <p className="text-sm  text-grey-500 font-edu-sa"> Be seen, be heard, be connected.</p>
        <p className="text-sm text-grey-500 font-edu-sa">
          Conversations made simple, personal, and powerful
        </p>
        </div>
        <button className=" w-fit font-edu-sa mt-3 py-2 font-bold px-4 border border-white
        rounded-md hover:shadow-lg scale-90 hover:scale-100 transition-all duration-300"
        style={{
                  backgroundImage:
                    "linear-gradient(to right,#28c76f 0%,#5a4aff 47.92%,#ff3739 100%)",
                  color: "transparent",
                  backgroundClip: "text",
                }}
        >
          Let's Start
        </button>
      </form>
    </div>
  );
};

export default LeftSideBarComponent;
