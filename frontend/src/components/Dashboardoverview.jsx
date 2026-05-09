import React from 'react'
import useAuth from '../Hooks/useAuth'
import { useNavigate } from 'react-router-dom';
import { FaBolt, FaProjectDiagram, FaFire, FaTrophy ,FaBook} from 'react-icons/fa'
import trophy from '../assets/Trophy.svg'
import { ReactTyped } from "react-typed";



function Dashboardoverview() {
  const { user,refreshUserProfile  } = useAuth()
  const navigate = useNavigate();
  const stat = [
    {label: 'Total Projects', value: user?.totalProjectsCompleted  || 0, icon: <FaProjectDiagram className='text-2xl text-cyan-400' />, to: '/dashboard/projects'},
    {label: 'Total Stories', value: user?.totalStories || 0, icon: <FaBook className='text-2xl text-yellow-400' />, to: '/dashboard/stories'},
    {label: 'Current Streak', value: user?.dailyQuestStreak || 0, icon: <FaFire className='text-2xl text-red-400' />, to: '/dashboard/daily-quests'},
    {label: 'Bonus Points', value: user?.bonusPoints || 0, icon: <FaBolt className='text-2xl text-blue-400' />, to: '/dashboard/daily-quests'},
    {label:'level',value: user?.rank || 0, icon: <img src={trophy} alt='trophy' className='w-6' />, to: '/dashboard/profile'},

  ]

  return (
    <div className='min-h-screen bg-[#0a0f1e] p-6 text-white'>
        <div className='bg-gradient-to-r from-sky-400 to-blue-400 rounded-xl p-8 mb-8'>
            <p className='text-xs uppercase tracking-widest text-white mb-2'>welcome back hunter {user?.name}</p>
            <h1 className='text-4xl font-bold text-white mb-3'>Arise</h1>
            <ReactTyped
            strings={["you need to level up  hunter!",
                "complete quests, gain points, and climb the ranks to become the ultimate hunter!"]}
            typeSpeed={40}
            backSpeed={20}
            loop
            className='text-white font-semibold text-lg mt-2'
            />
        
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6'>
            {stat.map((item, index) => (
                <div key={index} className='bg-neutral-800 p-4 rounded-lg flex items-center gap-4 border border-violet-500/50 cursor-pointer hover:bg-neutral-700 transition'
                 onClick={()=>navigate(item.to)}>
                    <div>{item.icon}</div>
                    <div>
                        <p className='text-sm text-gray-400'>{item.label}</p>
                        <p className='text-xl font-bold'>{item.value}</p>
                    </div>
                </div>
            ))}
        </div>
    
    </div>
  )
}

export default Dashboardoverview