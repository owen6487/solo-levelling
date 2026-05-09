import React from 'react'
import api from '../Hooks/api'
import { Link, useNavigate } from 'react-router';

function Addproject() {
    const navigate = useNavigate();
    const[formdata, setFormdata] = React.useState({
        title: '',
        description: '',
        inspiration: '',
        expectedLook: '',
        category: '',
    });
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [success, setSuccess] = React.useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormdata((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };
    const resetForm =()=>{
        setFormdata({
            title: '',
            description: '',
            inspiration: '',
            expectedLook: '',
            category: '',
        });
    }

    const handlesubmit = async (e)=>{
      e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
        

        try {
            const response = await api.post('/api/projects', formdata);
            setSuccess(response.data.message || 'Project created successfully!');
            resetForm();
                // Redirect to dashboard after a short delay to show success message
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1000);
            
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create project.');
        } finally {
            setLoading(false);
        }
    }

  return (
    <div className='min-h-screen bg-neutral-900 p-6'>
        <div className='mb-8'>
            <span className='text-xs font-bold tracking-widest text-violet-400 border border-violet-500/50 px-3 py-1 rounded'>
            MISSION BOARD
            </span>
            <h1 className='text-3xl font-bold text-white tracking-wide'>Add New Project</h1>
            <p className='text-gray-500 mt-1'>Create a new project to start earning XP and climbing the ranks!</p>
        </div>
        {/* Form goes here */}
        <form onSubmit={handlesubmit} className='space-y-6 max-w-3xl'>
          <div>
            <label className='block text-sm font-medium text-gray-300'>Title</label>
            <input
              type='text'
              name='title'
              value={formdata.title}
              onChange={handleInputChange}
              required
              className='mt-1  px-2 h-12 w-full  bg-neutral-800 border-gray-600 text-white focus:ring-violet-500 focus:border-violet-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-300'>Description</label>
                <textarea
                name='description'
              value={formdata.description}
              onChange={handleInputChange}
              required
              rows={6}
              className='mt-1 block w-full px-5 py-2 rounded-lg bg-neutral-800 border-gray-600 text-white focus:ring-violet-500 focus:border-violet-500 h-32 resize-y'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-300'>Inspiration (optional)</label>
            <input
              type='text'
              name='inspiration'
              value={formdata.inspiration}
              onChange={handleInputChange}
              className='mt-1 block w-full h-12 rounded-md bg-neutral-800 border-gray-600 text-white focus:ring-violet-500 focus:border-violet-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-300'>Expected Look (optional)</label>
            <textarea
              name='expectedLook'
              value={formdata.expectedLook}
              onChange={handleInputChange}
              rows={4}
              className='mt-1 block w-full px-5 py-2 rounded-lg bg-neutral-800 border-gray-600 text-white focus:ring-violet-500 focus:border-violet-500 h-24 resize-y'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-300'>Category (optional)</label>
            <input
              type='text'
              name='category'
              value={formdata.category}
              onChange={handleInputChange}
              className='mt-1 block w-full h-12 rounded-md bg-neutral-800 border-gray-600 text-white focus:ring-violet-500 focus:border-violet-500'
            />
          </div>
          <button 
          type='submit'
          disabled={loading}
          className='px-5 py-2 rounded bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-sm hover:bg-cyan-500/30 transition-colors tracking-wider'
          >
            {loading ? 'Creating...' : 'Create Project'}

            </button>
            <Link to='/dashboard/projects' className='ml-4 text-gray-400 hover:text-white'>Cancel</Link>

            </form>

    </div>
  )
}

export default Addproject