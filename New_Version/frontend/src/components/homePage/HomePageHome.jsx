import React from "react";
import { Link } from "react-router-dom";
import bgGradientImage from "../../assets/loopBgImage.jpg";
import heroImage from "../../assets/heroiamge.jpeg";
import { TypeAnimation } from "react-type-animation";
import { SECTION2_HEADING } from "../../utils/constant";
import LoopSpinner from "./LoopSpinner";
import SetUpSection from "./SetUpSection";
// <Link to={'/studio'}><button className=' p-6 bg-violate-600 rounded-md'>Call</button></Link>

const HomePageHome = () => {
  const fontSize = () => {
    const width = window.innerWidth;
    if(width < 480) return "1.2em";
    if(width < 768) {
        return "0.5em"
    }
    return "2em";
  }
  return (
    <div className=" w-full h-full  bg-[#18181B] overflow-hidden">
      {/* bg-[#18181B] */}
      <div className=" w-[80%] mx-auto h-full">
        <div className=" w-full h-[50vh] lg:h-screen relative">
          <img
            src={heroImage}
            alt="backgrounImage"
            width={650}
            height={550}
            className=" absolute top-[60%] rounded-full left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
          />
          <div className=" relative z-20  w-full h-full flex 
          gap-3 flex-col justify-center items-center ">
            <div className=" w-full h-fit p-3 
              flex flex-col items-center justify-center gap-y-2">
              <p
                className=" text-lg md:text-6xl font-edu-sa
                 font-bold block"
                style={{
                  backgroundImage: "linear-gradient(111deg, #f85d7f, #6b81fa)",
                  color: "transparent",
                  backgroundClip: "text",
                }}
              >
                All-in-one
              </p>

              <p
                className=" text-lg  md:text-5xl font-edu-sa  font-bold"
                style={{
                  backgroundImage: "linear-gradient(111deg, #5238ff, #a0fbcd)",
                  color: "transparent",
                  backgroundClip: "text",
                }}
              >
                Calling app
              </p>
            </div>
            <div
              style={
                {
                  //  backgroundImage : "linear-gradient(to right,#28c76f 0%,#5a4aff 47.92%,#ff3739 100%)" ,
                  //     color : "transparent" ,
                  //     backgroundClip : "text"
                }
              }
            >
              <TypeAnimation
                sequence={[
                  500,
                  "🌍 Global connections",
                  1000,
                  "🎥 High-quality video calls",
                  1000,
                  "🔒 Private & secure",
                  1000,
                  "⚡ No sign-up required",
                  500,
                ]}
                speed={50}
                style={{ fontSize: fontSize() }}
                repeat={Infinity}
              />
            </div>
            <div className=" md:px-10 lg:px-[5rem] mt-1 text-center">
              <h1
                className=" font-semibold text-3xl font-edu-sa "
                style={{
                  backgroundImage:
                    "linear-gradient(to right,#28c76f 0%,#5a4aff 47.92%,#ff3739 100%)",
                  color: "transparent",
                  backgroundClip: "text",
                }}
              >
                Connect with strangers, make new friends, and explore the world!
              </h1>
            </div>
            <Link to={"/studio"}>
              {" "}
              <button className=" mt-7 px-4 py-3 rounded-md bg-violate-600 font-edu-sa hover:scale-100 scale-90 transition-all duration-300">
                Let's Start
              </button>
            </Link>
          </div>
        </div>
        <div className=" mt-32 flex py-12 w-full h-fit items-center min-h-[70vh] font-edu-sa">
          <div className=" w-1/2 flex flex-col justify-center h-full">
            <p
              className=" text-4xl font-bold "
              style={{
                backgroundImage:
                  "linear-gradient(to right,#28c76f 0%,#5a4aff 47.92%,#ff3739 100%)",
                color: "transparent",
                backgroundClip: "text",
              }}
            >
              Stay Connected Anytime
            </p>
            <p
              className=" text-4xl font-bold mb-5 "
              style={{
                backgroundImage: "linear-gradient(111deg, #5238ff, #a0fbcd)",
                color: "transparent",
                backgroundClip: "text",
              }}
            >
              Anywhere
            </p>

            <div className=" flex flex-col gap-y-2">
              {SECTION2_HEADING.map((ele, index) => {
                return (
                  <div key={ele.id} className="flex gap-2 text-sm">
                    <span>{ele.icon}</span>
                    <p className=" text-grey-400">{ele.heading}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className=" relative  h-full flex-grow flex items-center justify-center">
            <img
              src={bgGradientImage}
              alt="backgrounImage"
              width="80%"
              height="80%"
              className=" absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20"
            />
            <LoopSpinner/>
            
          </div>
        </div>
        <SetUpSection/>
      </div>
    </div>
  );
};

export default HomePageHome;
