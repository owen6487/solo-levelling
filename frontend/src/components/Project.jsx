import React, {useState} from 'react'
import { useNavigate } from 'react-router-dom';
import api from '../Hooks/api';
import { useEffect } from 'react';
import useAuth from '../Hooks/useAuth';
function Project() {
    const { user, refreshUserProfile } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); 
    const[completing, setCompleting] = useState(false);
    const[liveurl, setLiveurl] = useState('');
      const [urlError, setUrlError] = useState('');
     const navigate = useNavigate();
     
    const fetchProjects = async () => {
        try {
            const response = await api.get('/api/projects');
            setProjects(response.data.projects || []);
        } catch (error) {
            console.error('Error fetching projects:', error.message);
            setError('Failed to load projects. Please try again later.');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchProjects();
    }, []);

    const openModal = (projectId)=>{
        setCompleting(projectId);
        setLiveurl('');
        setUrlError('');
    }
    const closeModal =()=>{
        setCompleting(false);
        setLiveurl('');
        setUrlError('');
    }
    const handleComplete = async (projectId) => {
        if(!liveurl){
            setUrlError('Please enter the live URL of your completed project.');
            return;
        }
        try {
            new URL(liveurl);
        } catch (error) {
            setUrlError('Please enter a valid URL.');
            return;
        }
        try {
            const response = await api.put(`/api/projects/${projectId}/complete`, { liveUrl: liveurl });
            setProjects((prevProjects) =>
                prevProjects.map((project) =>
                    project._id === projectId ? { ...project, status: 'completed', liveUrl: liveurl, completedAt: response.data.completedAt || new Date().toISOString() } : project
                )
            );
            if (refreshUserProfile) await refreshUserProfile();
            closeModal();
        } catch (error) {
            console.error('Error completing project:', error.message);
            setError('Failed to complete project. Please try again.');
        }
    }
    const filteredProjects = projects.filter(project => {
        if (filter === 'all') return true;
        return project.status === filter;
    });
    const handleDelete = async (projectId) => { 
        try {
            await api.delete(`/api/projects/${projectId}`);
            setProjects((prevProjects) => prevProjects.filter((project) => project._id !== projectId));
        } catch (error) {
            console.error('Error deleting project:', error.message);
            setError('Failed to delete project. Please try again.');
        }
    }
  return (
    <div className='min-h-screen bg-neutral-900 p-6'>
        <div className='mb-8'>
            <span className='text-xs font-bold tracking-widest text-violet-400 border border-violet-500/50 px-3 py-1 rounded'>
            MISSION BOARD
            </span>
            <h1 className='text-3xl font-bold text-white tracking-wide'>Projects</h1>
            <p className='text-white'>{user?.name} you current rank is <span className='text-yellow-400'>{user?.rank}</span>. Keep completing projects and quests to level up and climb the ranks!</p>
            <p className='text-gray-500 mt-1'>
                {filteredProjects.filter(p=>p.status!=="completed").length} active projects. Complete them to earn XP and level up!
            </p>
           

        </div>
        {error && (
                <p className='text-red-400 mb-4 text-sm'>{error}</p>
            )}
        <div className='flex gap-3 mb-8 flex-wrap'>
            <button className='px-4 rounded border border-green-500/50 text-violet-300 text-sm hover:bg-yellow-500/20 transition-colors' onClick={() => setFilter('all')}>
            All</button>
            <button className='px-4 rounded border border-green-500/50 text-violet-300 text-sm hover:bg-yellow-500/20 transition-colors' onClick={() => setFilter('upcoming')}>
            pending</button>
            <button className='px-4 rounded border border-green-500/50 text-violet-300 text-sm hover:bg-yellow-500/20 transition-colors' onClick={() => setFilter('completed')}>
            Completed</button>
            <button  className='ml-auto px-5 py-1 rounded bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-sm hover:bg-cyan-500/30 transition-colors tracking-wider' 
            onClick={()=>navigate('/addproject')}>
            Add Project
            </button>

        </div>
        {filteredProjects.length === 0 ? (
            <div className='text-gray-400'>No projects found. Add a new project to get started!</div>
        ): (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredProjects.map((project) => (
                <div key={project._id} className='bg-gray-800 p-4 rounded shadow cursor-pointer' onClick={() => {
                    if (project.liveUrl) {
                        window.open(project.liveUrl, '_blank');
                    }
                }}>  
                     <span className='absolute top-4 right-4 text-xs text-gray-500 border border-gray-700 px-2 py-0.5 rounded tracking-wider uppercase'>
                                {project.category}
                            </span>

                            {/* Project ID number like your screenshot */}
                            <p className='text-gray-600 text-xs mb-2 font-mono'>
                                #{String(filteredProjects.indexOf(project) + 1).padStart(2, '0')}
                            </p>
                    
                    <h3 className='text-xl font-bold mb-2 group-hover:text-violet-300 transition-colors'>
                        {project.title}</h3>
                    <p className='text-gray-400 mb-4 line-clamp-2'>{project.description}</p>
                    <p className='text-violet-400/60 text-xs mb-3 italic'>{project.inspiration}</p>
                    <p className='text-cyan-400 text-xs mb-5 font-mono'>{project.xpReward} XP</p>
                    <p className='text-gray-500 text-sm mb-4'>{project.expectedLook}</p>
                    <p >{project.category}</p>

                    <p className={`text-sm font-medium mb-4 ${project.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}`}>
                        Status: {project.status}
                    </p>    
                    <p>{project.completedAt ? `Completed on ${new Date(project.completedAt).toLocaleDateString()}` : 'Not completed yet'}</p>

                    <div className='flex justify-end space-x-2'>
                        {project.status !== 'completed' && (
                            <button className='bg-green-500 text-white px-3 py-1 rounded shadow hover:bg-green-600 transition-colors' onClick={(e) => { e.stopPropagation(); openModal(project._id); }}>
                                Complete
                            </button>
                        )}
                        <button className='bg-red-500 text-white px-3 py-1 rounded shadow hover:bg-red-600 transition-colors' onClick={(e) => { e.stopPropagation(); handleDelete(project._id); }}>
                            Delete
                        </button>
                    </div>
                </div>
            ))}
        </div>
        )}

        {/* Complete modal */}
        {completing && (
            <div className='fixed inset-0 flex items-center justify-center bg-black/50 z-50'>
                <div className='bg-neutral-800 p-6 rounded-lg w-full max-w-md'>
                    <h2 className='text-lg font-bold mb-3 text-white'>Enter live URL</h2>
                    {urlError && <p className='text-red-400 text-sm mb-2'>{urlError}</p>}
                    <input
                        type='url'
                        placeholder='https://example.com'
                        value={liveurl}
                        onChange={(e) => { setLiveurl(e.target.value); setUrlError(''); }}
                        className='w-full px-3 py-2 rounded bg-neutral-700 text-white mb-4'
                    />
                    <div className='flex justify-end gap-2'>
                        <button className='px-3 py-1 rounded bg-gray-600 text-white' onClick={() => closeModal()}>Cancel</button>
                        <button className='px-3 py-1 rounded bg-green-500 text-white' onClick={() => handleComplete(completing)}>Save</button>
                    </div>
                </div>
            </div>
        )}
    

    </div>

  )
}

export default Project