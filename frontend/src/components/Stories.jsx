import React from 'react'
import useAuth from '../Hooks/useAuth';
import { useEffect,useState } from 'react';
import api from '../Hooks/api';
import { useNavigate } from 'react-router-dom';


function Stories() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const[expandedStories, setExpandedStories] = useState({}); 

  const toggleReadMore = (id) => {
    setExpandedStories(prev => ({
      ...prev,
      [id]: !prev[id] 
  }))};

  const truncate = (text, limit = 150) => {
     if(!text) return '';
     if(text.length <= limit) return text;
     return text.slice(0, limit) + '...';
  };

  const fetchStories = async () => {
      try {
          const response = await api.get('/api/stories');
          setStories(response.data.stories || []);
      } catch (error) {
          setError(error.message);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchStories();
  }, []);

  const handleDeleteStory = async (id) => {
      try {
          await api.delete(`/api/stories/${id}`);
          setStories(stories.filter(story => story._id !== id));
      } catch (error) {
          setError(error.message);
      }
  };

  return (
    <div>
        <div className='flex justify-between items-center mb-6'>
        <h1 className='font-bold text-2xl text-white mb-4'>User Stories</h1>
        <div className="bg-cyan-500/20 text-cyan-400 border border-cyan-400 px-3 py-1 rounded font-bold text-sm tracking-widest">
                RANK: {user?.rank }
            </div>
        </div>
        <button onClick={()=>navigate('/createstory')} className='bg-cyan-500/20 text-cyan-400 border border-cyan-400 px-3 py-1 rounded font-bold text-sm tracking-widest hover:bg-blue-500/50 hover:text-blue-200'>Create Story</button>
        <div className='space-y-4 mt-4'>
            {loading ? (
                <p className="text-gray-400">Loading stories...</p>
            ) : error ? (
                <p className="text-red-500">Error: {error}</p>
            ) : stories.length === 0 ? (
                <p className='text-gray-400'>No stories yet. Be the first to share your journey!</p>
            ) : (
                stories.map(story => {
                    // Fix: Access expandedStories[id] directly for boolean check
                    const isExpanded = expandedStories[story._id];
                    // Fix: Use 'struggles' to match component/backend consistency
                    const contentisLong = story.content && story.content.length > 150;
                    const struggleisLong = story.struggles && story.struggles.length > 150;
                    
                    return (
                        <div key={story._id} className='bg-gray-800 p-4 rounded border border-gray-700'>
                            <div className='flex justify-between items-center mb-2'>
                                <h2 className='font-bold text-lg text-white'>{story.title}</h2>
                            </div>
                            <p className='text-gray-300 mb-2 whitespace-pre-wrap'>
                                {isExpanded ? story.content : truncate(story.content)}
                            </p>
                            {story.struggles && (
                                <p className='text-red-400 italic mb-2 text-sm'>
                                    Struggle: {isExpanded ? story.struggles : truncate(story.struggles)}
                                </p>
                            )}
                            {(contentisLong || struggleisLong) && (
                                <button onClick={() => toggleReadMore(story._id)} className='text-sm text-blue-400 hover:underline'>
                                    {isExpanded ? 'Show Less' : 'Read More'}
                                </button>
                            )}
                          
                            <button onClick={() => handleDeleteStory(story._id)} className='text-sm text-red-500 hover:underline ml-4'>
                                Delete
                            </button>
                        </div>
                    );
                })
            )}
        </div>
    </div>
  );
}

export default Stories