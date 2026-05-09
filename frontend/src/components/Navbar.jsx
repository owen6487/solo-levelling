import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { IoMenu } from "react-icons/io5";
import Account from './Account';
import useAuth from '../Hooks/useAuth';

function Navbar() {
    // `useAuth` exposes `isAuthenticated` in the Auth context
    // use that flag here to determine whether to show Dashboard
    const { user} = useAuth();

    // Base navigation links. Add the Dashboard link conditionally
    // instead of trying to place an `if` inside the array literal.
    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
    ];

    // If `isUser` is truthy (user is logged in), include Dashboard.
    if (user) {
        navLinks.push({ name: 'Dashboard', path: '/dashboard' });
    }

    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll()
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div className={`flex justify-between items-center sticky top-0 z-10 px-4 py-2 backdrop-blur-sm transition-colors duration-200 ${scrolled ? 'bg-neutral-950/90 shadow-md border-violet-500/20' : 'bg-purple-900 border'}`}>
            <Link to='/' className='text-2xl font-bold text-gray-800'>Solo Levelling</Link>
             <div className="flex items-center gap-6">
            <div className='flex gap-4'>
                {navLinks.map((link) => (
                    <Link key={link.name} to={link.path} className='text-zinc-400 hover:text-violet-400'>{link.name}</Link>
                ))}
            </div>
            <Account />
            </div>
        </div>
    )
}

export default Navbar
