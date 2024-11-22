import React from "react";
import { Link } from "react-router-dom";
import bgGradientImage from "../../assets/loopBgImage.jpg";
import heroImage from "../../assets/heroiamge.jpeg";
import { TypeAnimation } from "react-type-animation";
// <Link to={'/studio'}><button className=' p-6 bg-violate-600 rounded-md'>Call</button></Link>

const HomePageHome = () => {
  return (
    <div className=" w-full h-screen  bg-[#18181B] lg:overflow-hidden">
      {/* bg-[#18181B] */}
      <div className=" w-[95%] mx-auto h-full">
        <div className=" w-full h-full relative">
          <img
            src={heroImage}
            alt="backgrounImage"
            width={650}
            height={550}
            className=" absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
          />
          <div className=" absolute z-20  w-full h-full flex gap-3 flex-col justify-center items-center ">
            <div className=" w-full h-fit p-3 flex flex-col items-center justify-center gap-y-2">
              <p
                className="  text-6xl font-edu-sa  font-bold block"
                style={{
                  backgroundImage: "linear-gradient(111deg, #f85d7f, #6b81fa)",
                  color: "transparent",
                  backgroundClip: "text",
                }}
              >
                All-in-one
              </p>

              <p
                className="  text-5xl font-edu-sa  font-bold"
                style={{
                  backgroundImage: "linear-gradient(111deg, #5238ff, #a0fbcd)",
                  color: "transparent",
                  backgroundClip: "text",
                }}
              >
                Calling app
              </p>
            </div>
            <div style={{
              //  backgroundImage : "linear-gradient(to right,#28c76f 0%,#5a4aff 47.92%,#ff3739 100%)" , 
              //     color : "transparent" ,
              //     backgroundClip : "text"
            }} >
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
                style={{ fontSize: "2em" , 
                 
                }}
                repeat={Infinity}
              />
            </div>
            <div className=" md:px-10 lg:px-[5rem] mt-1 text-center">
              <h1 className=" font-semibold text-3xl font-edu-sa "
                style={{
                  backgroundImage : "linear-gradient(to right,#28c76f 0%,#5a4aff 47.92%,#ff3739 100%)" , 
                  color : "transparent" ,
                  backgroundClip : "text"
                }}
              >
              Connect with strangers, make new friends, and explore the world!
              </h1> 
            </div>
           <Link to={'/studio'}> <button className=" mt-7 px-4 py-3 rounded-md bg-violate-600 font-edu-sa hover:scale-100 scale-90 transition-all duration-300">
              Let's Start
            </button></Link>
          </div>
        </div>
        <div></div>
      </div>
    </div>
  );
};

export default HomePageHome;
