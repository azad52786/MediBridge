import React from 'react'

const ChangeDevice = ({name , currentDevice , setCurrentDevice ,  devices , ChangeHandeler , icon}) => {
  return (
  !devices ? (<div className=' w-full mt-3 h-12 rounded-md bg-[#2B2B2B] animate-pulse'></div>) : 
    <div className=' relative'>
        <div className=' absolute left-2  top-[40%] text-2xl'>{icon}</div>
        <select name={name} id={name} className=' py-4 pl-10 pr-2 font-semibold mt-3 bg-[#2B2B2B]
        rounded-md outline-none focus:outline-violate-400 w-full' 
        onChange={(e) => {
          let index = e.target.selectedIndex;
          if(currentDevice) setCurrentDevice(devices[index])
        }}
        >
          {devices &&
            devices.map((device, index) => {
              return (
                <option key={index} value={device.deviceId}
                  
                >
                  {device.label}
                </option>
              );
            })}
        </select>
    </div>
  )
}

export default ChangeDevice
