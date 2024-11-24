import React from "react";

const callSetupSteps = [
  {
    step: 1,
    title: "Set Up",
    description:
      "Grant your microphone and camera access to ensure a high-quality calling experience. This allows you to seamlessly connect and communicate with others.",
    gradient: "linear-gradient(90deg, rgba(11, 203, 129, 1) 0%, rgba(26, 98, 241, 1) 10%, rgba(11, 203, 129, 1) 20%, rgba(26, 98, 241, 1) 30%, rgba(11, 203, 129, 1) 40%, rgba(26, 98, 241, 1) 50%, rgba(11, 203, 129, 1) 60%, rgba(26, 98, 241, 1) 70%, rgba(11, 203, 129, 1) 80%, rgba(26, 98, 241, 1) 90%, rgba(11, 203, 129, 1) 100%)", // Tailwind gradient classes
  },
  {
    step: 2,
    title: "Match",
    description:
      "Click 'Next' to proceed to your call. Our system ensures that you're ready to connect instantly with no additional setup required.",
    gradient: "linear-gradient(90deg, rgba(245, 206, 105, 1) 0%, rgba(241, 39, 26, 1) 10%, rgba(245, 206, 105, 1) 20%, rgba(241, 39, 26, 1) 30%, rgba(245, 206, 105, 1) 40%, rgba(241, 39, 26, 1) 50%, rgba(245, 206, 105, 1) 60%, rgba(241, 39, 26, 1) 70%, rgba(245, 206, 105, 1) 80%, rgba(241, 39, 26, 1) 90%, rgba(245, 206, 105, 1) 100%)", // Tailwind gradient classes
  },
  {
    step: 3,
    title: "Enjoy",
    description:
      "Enjoy your call and chat effortlessly. Connect with friends, colleagues, or loved ones in a seamless and uninterrupted experience.",
    gradient: "linear-gradient(90deg, rgba(136, 93, 254, 1) 0%, rgba(79, 118, 255, 1) 10%, rgba(136, 93, 254, 1) 20%, rgba(79, 118, 255, 1) 30%, rgba(136, 93, 254, 1) 40%, rgba(79, 118, 255, 1) 50%, rgba(136, 93, 254, 1) 60%, rgba(79, 118, 255, 1) 70%, rgba(136, 93, 254, 1) 80%, rgba(79, 118, 255, 1) 90%, rgba(136, 93, 254, 1) 100%)", // Tailwind gradient classes
  },
];

const SetUpSection = () => {
  return (
    <div className=" w-full h-full mt-20 font-edu-sa">
      <p
        className=" text-4xl font-bold w-full flex items-center justify-center"
        style={{
          backgroundImage: "linear-gradient(to right, #a855f7, #f43f5e)",
          color: "transparent",
          backgroundClip: "text",
        }}
      >
        From Setup to Connection, Simplified
      </p>

      <div className=" w-full flex flex-col gap-16 mt-20">
        {callSetupSteps.map((ele, index) => (
        <>
          <div className=" flex" key={ele.step}>
            <div className=" w-[25%] text-3xl font-bold flex gap-4 items-center"
                style={{
                    backgroundImage : ele.gradient , 
                    color : "transparent" , 
                    backgroundClip : "text"
                }}
            >
              <p>{index + 1}.</p>
              <p>{ele.title}</p>
            </div>
            <div className=" w-[75%] text-richblack-200">{ele.description}</div>
          </div>
            <div className=" h-[1px] w-full bg-richblack-600"></div></>
        ))}
      </div>
    </div>
  );
};

export default SetUpSection;
