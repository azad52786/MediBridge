import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useSocket } from '../context/SocketContext';
import { useUserContext } from '../context/UserContext';

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
        <div className=' w-[38%] min-h-[560px] rounded-md'>
            {/* screen  */}
            <div className=' h-[90%] bg-richblue-300 p-4 overflow-y-scroll rounded-md'>
            {
                allChat.map((ele , index) => {
                    return (
                        <div key={index}
                            className={` w-full mb-3 flex flex-col  ${ele.user === userRole ? "" : "place-items-end"}`}
                        >
                        {
                            ele.user !== userRole
                            ? 
                           (<div className=' p-1 bg-white w-fit h-fit '
                                style={borderStyleP}
                           >
                                <p className=' font-semibold text-pink-200'>{ele.user}</p>
                                <p className=' font-inter text-black'>{ele.message}</p>
                           </div>)
                            : (
                            <div className=' p-1 bg-white w-fit h-fit'
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
            <form className=' flex' 
                onSubmit={chatUpdateHandeler}
            >
                <input type="text" ref={chat} className=' w-[80%] h-[60px] rounded-md'/>
                <button type=' submit' className=' w-[20%] font-semibold p-3 text-richblack-900 rounded-md bg-yellow-25 border-b border-pure-greys-50'>Send</button>
            </form>
        </div>
    }
    </>
  )
}

export default ChattingPage