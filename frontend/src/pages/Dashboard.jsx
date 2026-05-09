import React, { useState } from 'react';
import useAuth from '../Hooks/useAuth';
import { FaHome,FaUser, FaProjectDiagram, FaBook, FaStar } from "react-icons/fa";
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { IoMdMenu } from "react-icons/io";
import Profile from './Profile';
import Projects from './Projects';
import Stories from './Stories';
import DailyQuests from './DailyQuests';  
import  Dashboardoverview from '../components/Dashboardoverview';

function Dashboard() {
  const { user } = useAuth();
  const [hoveredLink, setHoveredLink] = useState(null);
  const location = useLocation();
  const[isopen, setIsOpen] = useState(false);

  const sidebarLinks = [
    { name: 'Dashboard', to: '/dashboard', icon: <FaHome /> },
    { name: 'Profile', to: '/dashboard/profile', icon: <FaUser /> },
    { name: 'Projects', to: '/dashboard/projects', icon: <FaProjectDiagram /> },
    { name: 'Stories', to: '/dashboard/stories', icon: <FaBook /> },
    { name: 'Daily Quests', to: '/dashboard/daily-quests', icon: <FaStar /> },
  ];

  return (
    <div className="flex h-screen bg-[#0a0f1d]">
      {isopen && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setIsOpen(false)}></div>
      )}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0d1526] border-r border-white/10 flex flex-col transform ${isopen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 md:relative md:translate-x-0`}>
      {/* Sidebar */}
      <div className=" bg-[#0d1526] flex flex-col">
        <div className="flex items-center gap-2 px-4 py-6">
          <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold text-xs">
            SL
          </div>
          <span className="text-lg font-bold text-white">Solo Levelling</span>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {sidebarLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.name}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-2.5 w-full transition-colors duration-200 text-sm ${
                  isActive
                    ? 'bg-purple-500/20 text-cyan-400 border-r-2 border-cyan-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                onMouseEnter={() => setHoveredLink(link.name)}
                onMouseLeave={() => setHoveredLink(null)}
              >
                {link.icon}
                <span className="text-sm font-medium">{link.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div>
          <button
            className="md:hidden p-2 m-2 rounded-md text-gray-400 hover:text-white hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white"
            onClick={() => setIsOpen(!isopen)}
          >
            <IoMdMenu size={24} />
          </button>
        </div>
        {/* Header / Welcome Banner */}
        <div className="p-4 border-b border-white/10 bg-[#0d1526]/50">
          <h1 className="text-xl font-semibold text-white">
            Hello {user?.name || 'User'}, welcome to your dashboard!
          </h1>
        </div>

        {/* Routed Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <Routes>
            {/* Default view when visiting /dashboard */}
            <Route path='/' element={<Dashboardoverview />} />
            <Route path="profile" element={<Profile />} />
            <Route path="projects" element={<Projects />} />
            <Route path="stories" element={<Stories />} />
            <Route path="daily-quests" element={<DailyQuests />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;