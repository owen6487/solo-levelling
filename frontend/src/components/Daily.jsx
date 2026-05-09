import React from 'react'
import useAuth from '../Hooks/useAuth';
import { useEffect,useState } from 'react';
import api from '../Hooks/api';

function Daily() {
    const { user, refreshUserProfile } = useAuth();
    const[dailyQuests, setDailyQuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userstats, setUserStats] = useState({
        bonusPoints: 0,
        dailyQuestStreak: 0,
        completedDailyQuestsId: []
    });


    const fecthDailyQuests = async () => {
        try {
            const response = await api.get(`/api/users/daily-quests`);
            const quests = response.data.dailyQuests || [];
            const completedId = (response.data.user && response.data.user.completedDailyQuestsId) || [];
            const updatedQuests = quests.map(quest => ({
                ...quest,
                completed: completedId.includes(quest.id)
            }));
            setDailyQuests(updatedQuests);
            setUserStats({
                bonusPoints: response.data.user.bonusPoints || 0,
                dailyQuestStreak: response.data.user.dailyQuestStreak || 0,
                completedDailyQuests: completedId
            });
        } catch (error) {
            setError(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }

        

        
    };
    const streakBonus = (streak) => {
        if (streak > 0 && streak % 7 === 0) {
            return { bonus: 25, message: `${streak}-day streak! +25 bonus points!` };
        } else if (streak > 0 && streak % 3 === 0) {
            return { bonus: 10, message: `${streak}-day streak! +10 bonus points!` };
        }
        return { bonus: 0, message: '' };
    };
    useEffect(() => {
            fecthDailyQuests();
        }, []);
    const handleCompleteQuest = async (questId) => {
        try {
            // Backend expects POST /api/users/complete-quest with { questId }
            const res = await api.post(`/api/users/complete-quest`, { questId });
            if (res.data && res.data.success) {
                setDailyQuests((prevQuests) =>
                    prevQuests.map((quest) =>
                        quest.id === questId ? { ...quest, completed: true } : quest
                    )
                );
                setUserStats((prevStats) => ({
                    ...prevStats,
                    bonusPoints: prevStats.bonusPoints + (res.data.pointsEarned || 0),
                    dailyQuestStreak: res.data.newStreak || prevStats.dailyQuestStreak
                }));
                if (refreshUserProfile) await refreshUserProfile();
            } else {
                setError(res.data.message || 'Failed to complete quest');
            }
        } catch (error) {
            setError(error.response?.data?.message || error.message);
        }
    };
  return (
    <div>
       ({loading ?(<p>Loading daily quests...</p>) : error ? 
       <p className="text-red-500">Error: {error}</p> : null}):(
        <div className="space-y-4">
            <h1 className='font-bold text-2xl text-white'>Daily Quests</h1>
                <p className='text-gray-400'>Complete these quests daily to earn bonus points and level up faster! {user?.name}</p>
                <p className='text-sm text-gray-500'>Current Streak: {userstats.dailyQuestStreak || 0} day(s) {streakBonus(userstats.dailyQuestStreak || 0).message}</p>
                <p className='text-sm text-yellow-400'>Bonus Points: {userstats.bonusPoints || 0}</p>
                <p className='text-sm text-green-400'>Completed Quests: {(userstats.completedDailyQuests || userstats.completedDailyQuestsId || []).length}</p>
            <ul className='space-y-2'>
                {dailyQuests.map((quest) => (
                    <li key={quest.id} className={`flex justify-between items-center p-4 border rounded ${quest.completed ? 'bg-green-600 border-green-400' : 'bg-gray-800 border-blue-400'}`}>
                        <div>
                            <h2 className='font-semibold text-2xl text-gray-700'>{quest.title}</h2>
                            <p className='text-sm text-white'>{quest.description}</p>
                            <p className='text-lg text-red-500'>+{quest.bonusPoints} Points</p>
                        </div>
                        <button onClick={() => handleCompleteQuest(quest.id)} 
                        className={`px-4 py-2 rounded ${quest.completed ? 'bg-yellow-500 text-white cursor-default' : 'bg-orange-500 text-white hover:bg-blue-600'}`} disabled={quest.completed}>
                            {quest.completed ? 'Completed' : 'Complete'}
                        </button>
                    </li>
                ))}
            </ul>
        </div>

       )
    </div>
  )
}

export default Daily