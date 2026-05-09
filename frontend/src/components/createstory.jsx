import React from 'react'
import { Link, useNavigate } from 'react-router';
import api from '../Hooks/api';
import { useState } from 'react';

function createstory() {
  const navigate = useNavigate();
  const[loading, setLoading] = useState(false);
  const[error, setError] = useState("");
  const[success, setSuccess] = useState("");
  const[storydata,setstorydata] = useState({
    title: '',
    content: '',
    struggles: '',
  });

  const handleChange =(e)=>{
    const {name, value}=e.target;
    setstorydata((prev)=>({
      ...prev,
      [name]: value,
    }))
  };
   const resetStoryData =()=>{
    setstorydata({
      title: '',
      content: '',
      struggles: '',
    })
   };
   const handlesubmit =async(e)=>{
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await api.post('/api/stories', storydata);
      setSuccess(response.data.message || "Story created successfully!");
      resetStoryData();
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      
    } catch (error) {
      setError(error.response.data.message || "Failed to create story.");
    }
   }
  return (
    <div className='min-h-screen flex w-full bg-gradient-to-br from-purple-950 via-slate-950 to-black '>
       <div className="rounded-xl border border-yellow-700/40 bg-black/60 py-8 px-6 w-full shadow-lg backdrop-blur-md">
        <h2 className='text-2xl text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.6)] font-bold mb-4'>Create Your Daily Story</h2>
        {error && <div className='bg-red-500 text-white p-2 mb-4 rounded'>{error}</div>}
        {success && <div className='bg-green-500 text-white p-2 mb-4 rounded'>{success}</div>}
        <div>
          <form onSubmit={handlesubmit} className='space-y-4 max-w-4xl'>
            <div>
              <label className='block te xt-sm font-medium text-white '>Title</label>
              <input
              type='text'
              name='title'
              value={storydata.title}
              onChange={handleChange}
              required
              className='w-full px-3 py-2 border rounded border-yellow-700/40 rounded-md bg-slate-900/50 text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-white'>Content</label>
              <textarea
              name='content'
              value={storydata.content}
              onChange={handleChange}
              required
              className='w-full px-3 py-2 border rounded border-yellow-700/40 rounded-md bg-slate-900/50 text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500'
              />
          
            </div>
              <div>
              <label className='block text-sm font-medium text-white'>Struggles (optional)</label>
              <textarea
              name='struggles'
              value={storydata.struggles}
              onChange={handleChange}
              className='w-full px-3 py-2 border rounded border-yellow-700/40 rounded-md bg-slate-900/50 text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500'
              />
            </div>
            <button
            type='submit'
            disabled={loading}
            className='bg-blue-500 text-white px-4 py-2 rounded'
            >{loading ? "creating...": "Create Story"}</button>
              <Link to='/Dashboard/stories' className='ml-4 text-gray-400 hover:text-white'>Cancel</Link>
          </form>
          </div>
        </div>    
    </div>
  )
}

export default createstory