import React, { useCallback, useEffect, useRef, useState } from "react";
import { IoSend } from "react-icons/io5";
import { useSocket } from "../../../Context/SocketContext";

const ChatSection = ({ peer, roomId, socket, setAllChat , remoteUserIdRef , allChat }) => {
  const chatRef = useRef("");
  const bottomRef = useRef("");
  
  const chatUpdateHandeler = (e) => {
    e.preventDefault();
    let message = chatRef.current.value.trim();
    if (message !== "") {
      console.log(message);
      socket.emit("newMessage", {
        message,
        roomId,
        remoteSocket: remoteUserIdRef.current,
      });
      chatRef.current.value = "";
      // console.log(chatRef.current.value)
    }
  };

  const newMessageHandeler = useCallback(
    ({ from, message }) => {
      console.log(from, message);
      setAllChat((pre) => [...pre, { from, message : message.trim() }]);
      console.log(allChat);
    },
    [setAllChat, peer]
  );

  const borderStyleD = {
    borderBottomRightRadius: "0.5rem",
    borderBottomLeftRadius: "0.5rem",
    borderTopRightRadius: "0.5rem",
  };
  const borderStyleP = {
    borderBottomRightRadius: "0.5rem",
    borderBottomLeftRadius: "0.5rem",
    borderTopLeftRadius: "0.5rem",
  };

  useEffect(() => {
    bottomRef.current.scrollIntoView({
      behavior: "smooth"
    });
  }, [allChat]);

  useEffect(() => {
    setAllChat([]);
  }, [peer]);

  useEffect(() => {
    socket.on("Message:recived", newMessageHandeler);

    return () => {
      socket.off("Message:recived", newMessageHandeler);
    };
  }, [socket, newMessageHandeler]);
  return (
    <div className=" w-full h-[90vh] lg:min-h-[95vh] bg-[#242424] rounded-md">
      <div className=" w-full h-full">
        <div
          className=" w-[90%] py-3 flex items-center justify-center mx-auto font-bold text-xl border rounded-md mt-3
       border-violate-500 shadow-[5px_5px_10px_black]"
        >
          Studio Chat
        </div>
        <div className=" h-[80%] py-3  w-full px-2">
          <div className=" h-full overflow-y-scroll py-2 chat-scroll-bar bg-[#3e3c3c] textArea overflow-x-hidden rounded-md px-3 ">
            {allChat.length <= 0 ? (
              <div
                className=" flex items-center justify-center font-semibold text-grey-500
         h-full"
              >
                No Chat Found
              </div>
            ) : (
              allChat.map((ele, index) => {
                return (
                  <div
                    key={index}
                    className={` w-full mb-3 font-edu-sa flex flex-col  ${
                      ele.from === socket.id ? "" : "place-items-end"
                    } `}
                  >
                    {ele.from !== socket.id ? (
                      <div
                        className=" p-1 px-2  bg-accent-primary max-w-[200px] h-fit   "
                        style={borderStyleP}
                      >
                        {/* <p className=' font-semibold text-pink-200'>{ele.user}</p> */}
                        <p className=" text-black break-words">{ele.message}</p>
                      </div>
                    ) : (
                      <div
                        className=" p-1 px-2  bg-violate-600 max-w-[200px] h-fit"
                        style={borderStyleD}
                      >
                        {/* <p className=' font-semibold text-pink-200'>{ele.user}</p> */}
                        <p className=" text-black break-words">{ele.message}</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={bottomRef}></div>
          </div>
        </div>
        <div className=" w-full">
          <form
            className=" flex gap-3 relative w-full px-2 mx-auto"
            onSubmit={chatUpdateHandeler}
          >
            <textarea
              rows="1"
              cols="1"
              placeholder="Enter your Message"
              ref={chatRef}
              className="  bg-[#3e3c3c] overflow-y-scroll chat-scroll-bar
               rounded-md w-full resize-none border-0 pr-10
               outline-none focus:outline-violate-400 outline-1 px-4 py-4"
            ></textarea>
            <button
              type=" submit"
              className=" absolute top-[50%] translate-y-[-50%] right-0 w-9 aspect-square"
            >
              <IoSend className=" w-6 h-6" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatSection;
