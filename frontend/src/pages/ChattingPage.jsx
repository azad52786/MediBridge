import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useSocket } from '../context/SocketContext';
import { useUserContext } from '../context/UserContext';
import { IoSend } from "react-icons/io5";

const ChattingPage = ({myStream , remoteStream}) => {
    const chat = useRef("");
    const socket = useSocket();
    
    const [allChat , setAllChat] = useState([]);
    const {userRole} = useUserContext();
    const chatUpdateHandeler = (e) => {
        e.preventDefault();
        // socket.emit("newMessage" , ())
        let message = chat.current.value.trim();
        if (message !== '') {
            console.log(message)
            socket.emit("newMessage", {message , userRole}); 
            chat.current.value = ''; 
            console.log(chat.current.value)
        }
    }

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
    const messageReciveHandeler = useCallback(( {message , user } ) => {
        setAllChat(pre => [...pre , {user : user , message : message}])
    } , [ setAllChat])

    useEffect(() => {
        socket.on("Message:recived" , messageReciveHandeler);

        return () => {
            socket.off("Message:recived" , messageReciveHandeler);
        }
    } , [socket , messageReciveHandeler])
  return (
    <>
    { 
    remoteStream && myStream &&
        <div className=' w-[345px] p-4 h-[620px] rounded-md bg-caribbeangreen-50'>
            {/* screen  */}
            <h1 className='text-3xl font-bold text-black text-center mt-[-16px]'>Chat-In-Call</h1>
            <div className=' h-[90%] overflow-y-scroll textArea overflow-x-hidden no-scrollbar rounded-md'>
            {
                allChat.map((ele , index) => {
                    return (
                        <div key={index}
                            className={` w-full mb-3 flex flex-col  ${ele.user === userRole ? "" : "place-items-end"}`}
                        >
                        {
                            ele.user !== userRole
                            ? 
                           (<div className=' p-1 bg-white w-[200px] h-fit'
                                style={borderStyleP}
                           >
                                <p className=' font-semibold text-pink-200'>{ele.user}</p>
                                <p className=' font-inter text-black'>{ele.message}</p>
                           </div>)
                            : (
                            <div className=' p-1 bg-white w-[200px] h-fit'
                            style={borderStyleD}
                            >
                                <p className=' font-semibold text-pink-200'>{ele.user}</p>
                                <p className=' font-inter text-black'>{ele.message}</p>
                            </div>)
                        } 
                    </div>
                    )
                })
            }
            </div>
            {/* input  */}
            <form className=' flex gap-3 relative' 
                onSubmit={chatUpdateHandeler}
            >
                <textarea rows="1" cols="1" placeholder='Enter your Message' ref={chat} className="overflow-y-scroll textArea m-0 rounded-full w-full resize-none border-0 bg-white py-[10px] pr-10 md:py-3.5 md:pr-12 max-h-52  pl-4 md:pl-6"></textarea>
                <button type=' submit' className=' absolute top-[50%] translate-y-[-50%] right-2 w-9 aspect-square' ><IoSend className=' w-full h-full'/></button>
            </form>
        </div>
    }
    </>
  )
}

export default ChattingPage