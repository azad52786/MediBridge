import React, { useState } from "react";
import { MdOutlineAddIcCall } from "react-icons/md";
import { CiMail } from "react-icons/ci";
import { IoLogoInstagram } from "react-icons/io";
import { CiLinkedin } from "react-icons/ci";
import { CiFacebook } from "react-icons/ci";
import { toast } from "react-toastify";

const formConfig = {
  fields: [
    {
      name: "name",
      label: "Name",
      type: "text",
      placeholder: "Enter your name",
      validation: {
        required: true,
        minLength: 3,
        maxLength: 50,
      },
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "Enter your email",
      validation: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Simple email regex
        message: "Please enter a valid email address",
      },
    },
    {
      name: "phone",
      label: "Phone",
      type: "tel",
      placeholder: "Enter your phone number",
      validation: {
        required: true,
        pattern: /^\d{10}$/, // Regex for international format
        message: "Please enter a valid phone number",
      },
    },
    {
      name: "message",
      label: "Message",
      type: "textarea",
      placeholder: "Write your message",
      validation: {
        required: true,
        minLength: 10,
        maxLength: 500,
      },
    },
  ],
  submitButton: {
    text: "Submit",
    style: {
      color: "#FFFFFF",
      padding: "10px 20px",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
    },
  },
};

const ContactUsHome = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      return {
        ...prevData,
        [name]: value,
      };
    });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Successfully submitted");
    // Form submission logic here
    setFormData({
      name: "",
      email: "",
      phone: "",
      message: "",
    });
  };
  return (
    <div className=" h-screen w-screen pt-32 flex items-center flex-col ">
      <h1 className=" font-bold text-2xl">Contact Us</h1>
      <p className=" mt-2 text-lg">
        Any Question or remarks? Just write us a message
      </p>
      <div className=" w-[60%] bg-white rounded-md h-[65vh] mt-7 flex">
        <div
          className=" w-[40%] text-richblack-900 bg-[#8041f5] rounded-md h-full px-4 py-20 flex flex-col
             items-center justify-around gap-4
        "
        >
          <h1 className=" font-bold text-xl">Contact Information</h1>
          <p className=" text-lg text-wrap text-center font-semibold">
            Fill up the form and our team will get back to you within 24 hours
          </p>
          <p className=" flex gap-3 font-semibold text-lg items-center justify-center  ">
            <MdOutlineAddIcCall className=" w-7 h-7 text-caribbeangreen-100" />{" "}
            <a href="tel:+919679277994">+91 96792 77994</a>
          </p>
          <p className=" flex gap-3 font-semibold text-lg items-center justify-center  ">
            <CiMail className=" w-7 h-7 text-caribbeangreen-100" />{" "}
            <a href="mailto:example@example.com?subject=Inquiry About Live LOop &body=Hello, I have a question about...">
              kajiazadali76@example.com
            </a>
          </p>
          <div className=" w-16 aspect-square rounded-full bg-blue-50 ml-24"></div>
          <div className=" w-10 aspect-square rounded-full bg-pink-50 ml-12 -mt-7"></div>
          <div className=" w-full flex mt-2 justify-center items-center gap-5">
            <IoLogoInstagram
              className=" cursor-pointer  bg-opacity-65
             transition-all hover:bg-blue-100 duration-300
            w-12 h-12 border border-richblack-300 rounded-full p-2"
            />
            <CiLinkedin
              className=" cursor-pointer  bg-opacity-65
             transition-all hover:bg-yellow-100 duration-300
            w-12 h-12 border border-richblack-300 rounded-full p-2"
            />
            <CiFacebook
              className=" cursor-pointer  bg-opacity-65
             transition-all hover:bg-caribbeangreen-100 duration-300
            w-12 h-12 border border-richblack-300 rounded-full p-2"
            />
          </div>
        </div>
        <div className=" flex-grow text-richblack-900 pt-4 pl-5 pr-10">
          <form onSubmit={handleSubmit}>
            {formConfig.fields.map((field) => (
              <div
                key={field.name}
                style={{ marginBottom: "20px" }}
                className=" mt-5"
              >
                <div className=" flex flex-col gap-y-3">
                  <label
                    className=" block font-semibold text-[#210000]"
                    htmlFor={field.name}
                  >
                    {field.label}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      id={field.name}
                      name={field.name}
                      className=" outline-none bg-transparent border-b-2
                       resize-none border-[#973ee6] pl-2 pb-2"
                      placeholder={field.placeholder}
                      onChange={handleChange}
                      value={formData[field.name]}
                      required={field.validation.required}
                      minLength={field.validation.minLength}
                      maxLength={field.validation.maxLength}
                    />
                  ) : (
                    <input
                      id={field.name}
                      type={field.type}
                      name={field.name}
                      className=" outline-none pl-2 pb-2 bg-transparent border-b-2 border-[#973ee6]"
                      placeholder={field.placeholder}
                      onChange={handleChange}
                      value={formData[field.name]}
                      required={field.validation.required}
                      pattern={field.validation.pattern
                        ?.toString()
                        .slice(1, -1)}
                    />
                  )}
                </div>
              </div>
            ))}
            <button
              type="submit"
              className=" mt-4 bg-[#6200ea] hover:bg-[#2700eaea]  transition-all duration-300"
              style={formConfig.submitButton.style}
            >
              {formConfig.submitButton.text}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUsHome;
