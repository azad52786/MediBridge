import React from "react";
import FooterImage from "../../assets/logonavbar.png";
import { FooterContent } from "../../utils/constant";

const Footer = () => {
  return (
    <div className=" w-full h-fit py-5 font-karla">
      <div className=" w-[70%] gap-7 md:w-[80%] lg:w-[85%] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 ">
        <div className=" w-full flex items-center lg:items-start justify-center">
          <img
            src={FooterImage}
            width={200}
            alt="FooterImage"
            className=" rounded-md"
          />
        </div>
        {FooterContent.map((footer) => {
          return (
            <div
              key={footer.title}
              className=" w-full h-fit text-center text-sm md:text-base"
            >
              <h3 className="font-bold text-2xl mb-3">{footer.title}</h3>
              <div className=" flex flex-col gap-1 ">
                {footer.subtitle.map((link, index) => (
                  <p key={index} className=" cursor-pointer">
                    {link}
                  </p>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Footer;
