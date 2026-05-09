import React from 'react'
import img from '../assets/img.jpeg'
import { ReactTyped } from "react-typed";
import { useNavigate } from 'react-router-dom';

function Hero() {
  const navigate = useNavigate();
  return (
    <div className='bg-neutral-950  text-2xl text-violet-300'>
      <div className='max-w-6xl mx-auto px-4 py-8 pt-14'>
         <ReactTyped
                strings={['Welcome to The Ultimate Hunter Journey']}
                typeSpeed={50}
                backSpeed={60}
                loop
                className='text-center text-violet-400 text-2xl mb-4'
              />
              <br />
              </div>
        <div className='flex flex-col md:flex-row gap-8 items-center mt-4'>
            <div className='w-full md:w-1/3 shrink-0'><img src={img} alt="Solo Levelling"  className="rounded-md border border-violet-500/50 shadow-glow object-cover w-full"/></div>
            <div className='flex flex-col'>
              
            <div className='w-full md:w-2/3 items-center justify-center  gap-4 border border-violet-500/50 rounded-md p-4 shadow-glow justify-between'>
                <p className='text-center'>In a world where hunters with supernatural abilities fight monsters to protect humanity, Sung Jin-Woo, the weakest of all hunters, discovers a hidden dungeon that grants him immense power. As he rises through the ranks, he must navigate dangerous alliances and face powerful foes to uncover the truth behind his newfound abilities and the mysteries of the dungeons.</p>
                 <p className='text-yellow-600'>Join Sung Jin-Woo on his journey! and also become a powerful developer.</p>
            </div>
            <button className='mt-4 px-6 py-2  text-white rounded-md bg-yellow-600 hover:bg-yellow-500 transition-colors duration-300 self-center' 
            onClick={() =>{navigate('/login')}}>Join the Adventure</button>
            </div>
        </div>
    </div>
  )
}

export default Hero