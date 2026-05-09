import React, { useEffect, useState } from 'react'
import useAuth from '../Hooks/useAuth'
import { useNavigate } from 'react-router-dom'

function ProfileAc() {
    const { user, refreshUserProfile } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [error] = useState(null)

    useEffect(() => {
        const loadProfile = async () => {
            if (refreshUserProfile) {
                await refreshUserProfile()
            }
            setLoading(false)
        }
        loadProfile()
    }, [])

    const initials = (user?.name || 'U').split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()

    if (loading) return <p className='text-gray-300'>Loading profile...</p>
    if (error) return <p className='bg-red-500 text-white p-2 mb-4 rounded'>{error}</p>

    return (
        <div className='min-h-screen bg-neutral-900 p-6'>
            <div className='max-w-4xl mx-auto space-y-6'>
                {/* Profile card */}
                <div className='bg-gray-800 rounded-lg border border-gray-700 p-6 flex items-center gap-6'>
                    <div className='w-28 h-28 rounded-full bg-indigo-600 flex items-center justify-center text-3xl font-bold text-white'>
                        {initials}
                    </div>
                    <div className='flex-1'>
                        <h2 className='text-2xl font-bold text-white'>{user?.name}</h2>
                        <p className='text-sm text-gray-300 mt-1'>Rank: <span className='text-yellow-400 font-semibold'>{user?.rank}</span></p>
                        <p className='text-sm text-gray-400 mt-1'>Total XP: <span className='text-cyan-400 font-medium'>{user?.totalXP ?? 0}</span></p>
                        <div className='mt-4 flex gap-3'>
                            <button onClick={() => navigate('/dashboard')} className='px-4 py-2 rounded bg-cyan-500/20 border border-cyan-400 text-cyan-300'>Dashboard</button>
                    
                        </div>
                    </div>
                </div>

                {/* Details table */}
                <div className='bg-gray-800 rounded-lg border border-gray-700 p-4 overflow-x-auto'>
                    <h3 className='text-lg font-semibold text-white mb-3'>Profile Details</h3>
                    <table className='min-w-full text-sm text-left'>
                        <tbody>
                            <tr className='border-b border-gray-700'>
                                <td className='px-4 py-3 text-gray-300 w-40'>Email</td>
                                <td className='px-4 py-3 text-white'>{user?.email}</td>
                            </tr>
                            <tr className='border-b border-gray-700'>
                                <td className='px-4 py-3 text-gray-300'>Phone</td>
                                <td className='px-4 py-3 text-white'>{user?.phone || '—'}</td>
                            </tr>
                            <tr className='border-b border-gray-700'>
                                <td className='px-4 py-3 text-gray-300'>Total Projects Completed</td>
                                <td className='px-4 py-3 text-white'>{user?.totalProjectsCompleted ?? 0}</td>
                            </tr>
                            <tr className='border-b border-gray-700'>
                                <td className='px-4 py-3 text-gray-300'>Streak Days</td>
                                <td className='px-4 py-3 text-white'>{user?.dailyQuestStreak ?? 0}</td>
                            </tr>
                            <tr className='border-b border-gray-700'>
                                <td className='px-4 py-3 text-gray-300'>Bonus Points</td>
                                <td className='px-4 py-3 text-white'>{user?.bonusPoints ?? 0}</td>
                            </tr>
                            <tr>
                                <td className='px-4 py-3 text-gray-300'>Last Login</td>
                                <td className='px-4 py-3 text-white'>{user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : '—'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default ProfileAc