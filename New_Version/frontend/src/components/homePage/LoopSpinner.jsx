import React from 'react'
import person1 from '../../assets/peopleImage/person1.png'
import person2 from '../../assets/peopleImage/person2.png'
import person3 from '../../assets/peopleImage/person3.png'
import person4 from '../../assets/peopleImage/person4.png'
import person5 from '../../assets/peopleImage/person5.jpg'
import person6 from '../../assets/peopleImage/person6.jpg'
import person7 from '../../assets/peopleImage/person7.jpg'
import person8 from '../../assets/peopleImage/person8.jpg'
import mainimage from '../../assets/peopleImage/mainimage.jpg'

const LoopSpinner = () => {
  return (
     <div className=" w-[250px] md:w-[300px]  lg:w-[350px] lg:h-[350px] aspect-square rounded-full relative  flex justify-center items-center">
              <div className="rotate-div absolute h-full w-full rounded-full border border-dashed border-richblack-300">
                <img
                  src= {person1}
                  className="absolute rotate-img -top-5 left-[40%] w-10 lg:w-12 aspect-square bg-violate-500 rounded-full"
                  alt="person1"
                />
                <img
                  src={person2}
                  className="absolute rotate-img w-10 lg:w-12 top-[40%] -left-5 aspect-square bg-violate-500 rounded-full"
                  alt=""
                />
                <img
                  src={person3}
                  className="absolute rotate-img w-10 lg:w-12 top-[40%] -right-5 aspect-square bg-violate-500 rounded-full"
                  alt=""
                />
                <img
                  src={person4}
                  className="absolute rotate-img w-10 lg:w-12 -bottom-5 left-[40%] aspect-square bg-violate-500 rounded-full"
                  alt=""
                />
              </div>
              <div className="rotate-div-reverse absolute h-[60%] w-[60%] rounded-full border border-dashed border-richblack-300">
                <img
                  src={person5}
                  className="absolute rotate-img-reverse -top-5 left-[40%] w-10 lg:w-12 aspect-square bg-violate-500 rounded-full"
                  alt=""
                />
                <img
                  src={person6}
                  className="absolute rotate-img-reverse w-10 lg:w-12 top-[40%] -left-5 aspect-square bg-violate-500 rounded-full"
                  alt=""
                />
                <img
                  src={person7}
                  className="absolute rotate-img-reverse w-10 lg:w-12 top-[40%] -right-5 aspect-square bg-violate-500 rounded-full"
                  alt=""
                />
               <img
                  src={person8}
                  className="absolute rotate-img-reverse w-10 lg:w-12 -bottom-5 left-[40%] aspect-square bg-violate-500 rounded-full"
                  alt=""
                />
              </div>
              <img src={mainimage} alt="mainImage" className=' rounded-full' />
            </div>
  )
}

export default LoopSpinner
