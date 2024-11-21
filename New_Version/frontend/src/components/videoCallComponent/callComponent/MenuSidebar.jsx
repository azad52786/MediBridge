import React from "react";
import { BsChatText } from "react-icons/bs";

const CALL_SIDE_BAR_MENU_ITEMS = [
  {
    title: "chat",
    icon: <BsChatText className="w-9 h-9 p-1" />,
  },
];

const MenuSidebar = ({currentMenuItem , setCurrentMenuItem}) => {
  return (
    <div className="w-full bg-[#242424] rounded-md h-full bg-gray-800 flex items-center justify-center ">
      {CALL_SIDE_BAR_MENU_ITEMS.map((ele) => {
        return (
          <div
            key={ele.title}
            className={` w-fit h-fit  relative p-2 cursor-pointer group ${currentMenuItem === ele.title ? "bg-black rounded-md " : ""} `}
            onClick={() => {
              console.log(`${ele.title} clicked`);
            }}
          >
            {ele.icon}
            <div className=" absolute top-0 group-hover:translate-x-[-120%] ml-2 
            text-sm text-white bg-[#3e3c3c] px-1 rounded-t-md
            rounded-bl-md opacity-0 group-hover:opacity-100 transition-all duration-200">{ele.title}</div>
          </div>
        );
      })}
    </div>
  );
};

export default MenuSidebar;
