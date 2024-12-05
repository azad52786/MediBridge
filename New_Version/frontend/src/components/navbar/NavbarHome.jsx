import React, { useState } from "react";
import navbarlogo from "../../assets/smallnavbarlogo.png";
import { MdOutlineWifiCalling3 } from "react-icons/md";
import { NavLink } from "react-router-dom";
import { CgMenuRightAlt } from "react-icons/cg";

const NavbarHome = () => {
  const [showMobileMenuBar, setShowMobileMenuBar] = useState(false);
  return (
    <div className=" ">
      <div
        className=" fixed left-[2%] md:left-[15%] font-karla lg:font-edu-sa top-5 rounded-full 
        z-30 bg-transparent backdrop-blur-sm 
         w-[95%] md:w-[70%] h-12 md:h-16 lg:h-16 border lg:bg-white lg:bg-opacity-10
         border-purple-300 flex py-2 px-2  items-center justify-between"
      >
        <div className="h-full overflow-hidden gap-2 w-fit flex">
          <img
            src={navbarlogo}
            alt="navbarLogo"
            className=" h-full aspect-square object-center rounded-full"
          />
          <h1 className=" font-bold text-lg md:text-2xl flex justify-center items-center h-full text-violate-500 ">
            Live Loop
          </h1>
        </div>
        <div>
          <ul className=" hidden md:flex md:gap-4 lg:gap-10 md:text-base  lg:text-lg text-grey-600">
            <NavLink
              to={""}
              className={({ isActive }) => {
                return isActive ? "text-yellow-5" : "text-grey-600";
              }}
            >
              <li>Home</li>
            </NavLink>
            <NavLink
              to={"/about"}
              className={({ isActive }) => {
                return isActive ? "text-yellow-5" : "text-grey-600";
              }}
            >
              <li>About</li>
            </NavLink>
            <NavLink
              to={"/contact-us"}
              className={({ isActive }) => {
                return isActive ? "text-yellow-5" : "text-grey-600";
              }}
            >
              <li>Contect Us</li>
            </NavLink>
          </ul>
        </div>

        <div className="flex items-center gap-1 mr-3 ">
          <button
            className=" flex gap-3 scale-90 hover:scale-100 duration-300 bg-violate-600
            lg:py-2 lg:px-4 py-1 px-2
          font-bold text-lg md:text-2xl items-center justify-center rounded-md mr-3 text-alert-success"
          >
            <MdOutlineWifiCalling3 />
            Call
          </button>
          <div
            className=" block md:hidden relative"
            onClick={() => {
              console.log("hello!");
              setShowMobileMenuBar((pre) => !pre);
            }}
          >
            <CgMenuRightAlt className=" w-8 h-8 cursor-pointer" />
            {showMobileMenuBar && (
              <ul
                className={`absolute ${
                  showMobileMenuBar ? "translate-animation-on" : ""
                }
             text-nowrap justify-center 
             items-center flex flex-col  bg-richblack-600 
             bg-opacity-70 text-lg py-6 gap-2 top-10  transition-all
              duration-700 
             -right-40 backdrop-blur-sm rounded-md px-3`}
              >
                <NavLink
                  to={""}
                  className={({ isActive }) => {
                    return isActive
                      ? "text-yellow-5 flex items-center justify-center w-full bg-richblack-500 bg-opacity-35 px-4 py-2 rounded-md"
                      : "text-grey-600 px-4 py-2 rounded-md w-full flex items-center justify-center hover:bg-richblack-800 bg-opacity-25";
                  }}
                >
                  <li>Home</li>
                </NavLink>
                <NavLink
                  to={"/about"}
                  className={({ isActive }) => {
                    return isActive
                      ? "text-yellow-5 w-full flex items-center justify-center bg-richblack-500 bg-opacity-35 px-4 py-2 rounded-md"
                      : "text-grey-600 px-4 py-2 rounded-md w-full flex items-center justify-center hover:bg-richblack-800 bg-opacity-25";
                  }}
                >
                  <li>About</li>
                </NavLink>
                <NavLink
                  to={"/contact-us"}
                  className={({ isActive }) => {
                    return isActive
                      ? "text-yellow-5 flex items-center justify-center w-full px-4 py-2 rounded-md bg-richblack-500 bg-opacity-35"
                      : "text-grey-600 px-4 py-2 rounded-md flex items-center justify-center w-full hover:bg-richblack-800 bg-opacity-25";
                  }}
                >
                  <li>Contect Us</li>
                </NavLink>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavbarHome;
