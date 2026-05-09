import React from 'react'
import aboutimg from '../assets/about.jpeg'
import { useNavigate } from 'react-router'
function About() {
    const navigate = useNavigate();
  return (
    /* Deep Solo Levelling theme with purples, golds, and dark atmospherics */
    <div className='min-h-screen bg-gradient-to-br from-purple-950 via-slate-950 to-black text-slate-200'>
        
        {/* Header Section: Dark atmospheric feel with gold accents */}
        <div className='py-12 border-b border-yellow-700/30 backdrop-blur-sm'>
            <h1 className='text-4xl font-bold text-center mb-4 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.6)] italic uppercase tracking-widest'>
                About Solo Levelling
            </h1>
            <p className='text-lg text-yellow-200/60 text-center max-w-2xl mx-auto italic'>
                "Never stop leveling up."
            </p>
        </div>

        <div className='flex flex-wrap pt-12'>
            <div className='w-full md:w-1/2 p-8 flex items-center justify-center'>
                <div className='bg-black/60 p-8 rounded-lg border border-yellow-700/40 backdrop-blur-md shadow-[0_0_25px_rgba(234,179,8,0.15)]'>
                    <h2 className='text-3xl font-bold mb-6 text-yellow-500 border-l-4 border-yellow-600 pl-4'>
                        System Overview
                    </h2>
                    <p className='text-lg mb-4 leading-relaxed'>
                        Solo Levelling is a web application inspired by the popular web novel and manhwa series. 
                        It allows users to create an account, complete <span className='text-yellow-400'>daily quests</span>, and level up their character and become <span className='text-yellow-500 text-lg'>
                            Ultamate DEVELOPER</span>.
                            By completing quests, users earn points that contribute to their overall rank and progress. The application features a <span className='text-purple-300'>ranking system</span> where users can see their progress and compete with others.
                    </p>
                    <p className='text-lg mb-4 leading-relaxed'>
                        The application features a <span className='text-purple-300'>ranking system</span> where users can see their progress and compete with others
                        and also create their own portofolio by sharing their achievements. 
                    </p>
                    <p className='text-lg leading-relaxed text-slate-300'>
                        Built with the <span className='text-yellow-500'>MERN stack</span>, this project serves as a way for fans to track their own progress in a gamified environment.
                    </p>
                     <button className='mt-6 px-6 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-500 transition-colors duration-300 self-center'   
                onClick={() => navigate('/login')}>Join the Adventure</button>
                </div>
               
            </div>

            <div className='w-full md:w-1/2 p-8 flex items-center justify-center'>
                <div className='relative'>
                    {/* Glowing gold frame behind the image - Solo Levelling aesthetic */}
                    <div className='absolute -inset-1 bg-yellow-600 rounded blur opacity-20'></div>
                    <img 
                        src={aboutimg} 
                        alt='About Solo Levelling' 
                        className='relative rounded border border-yellow-600/50 shadow-2xl transition-transform duration-500 hover:scale-105' 
                    />
                </div>
            </div>
        </div>
    </div> 
  )
}

export default About