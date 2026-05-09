import React ,{use, useEffect, useState}from 'react'
import { useNavigate } from 'react-router'
import api from '../Hooks/api'
import { useSearchParams } from 'react-router-dom'

function resetpassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [ Password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [SearchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const token = SearchParams.get('token');
  const email = SearchParams.get('email');

  const handlesubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (Password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      setLoading(true);
      const response = await api.post('/api/users/resetpassword', {
        email,
        resetToken: token,
        newPassword: Password,
      });
      setSuccess(response.data.message);
      setTimeout(() => {
        navigate('/login',{state:{status:'success'}});
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!token || !email) {
      setError('Invalid password reset link');
    }
  }, [token, email]);


const eyeicon = (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178a1.012 1.012 0 010 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
</svg>);
const eyeofficon = (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c1.657 0 3.243-.31 4.747-.922M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a1.542 1.542 0 01-1.502 2.022M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
</svg>);
return(
  <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 via-slate-950 to-black'>
    <div className='bg-black/60 border border-yellow-700/40 backdrop-blur-md p-8 rounded shadow-md w-full max-w-md'>
      <h2 className='text-2xl font-bold mb-6 text-center text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.6)]'>Reset Password</h2>
      {error && <div className='bg-red-900/30 text-red-400 p-3 rounded mb-4 border border-red-700/40'>{error}</div>}
      {success && <div className='bg-green-900/30 text-green-400 p-3 rounded mb-4 border border-green-700/40'>{success}</div>}
      <form onSubmit={handlesubmit}>
        <div className='mb-4 relative'>
          <label className='block text-slate-300 mb-2'>New Password</label>
          <div className='relative'>
            <input
              type={showPassword ? 'text' : 'password'}
              className='w-full px-3 py-2 border border-yellow-700/40 rounded bg-slate-900/50 text-slate-100 focus:outline-none focus:ring focus:border-yellow-500'
              value={Password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type='button'
              className='absolute inset-y-0 right-0 px-3 flex items-center text-slate-400'
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? eyeofficon : eyeicon}
            </button>
          </div>
        </div>
        <div className='mb-6 relative'>
          <label className='block text-slate-300 mb-2'>Confirm New Password</label>
          <div className='relative'>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              className='w-full px-3 py-2 border border-yellow-700/40 rounded bg-slate-900/50 text-slate-100 focus:outline-none focus:ring focus:border-yellow-500'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type='button'
              className='absolute inset-y-0 right-0 px-3 flex items-center text-slate-400'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? eyeofficon : eyeicon}
            </button>
          </div>
        </div>
        <button
          type='submit'
          className='w-full bg-yellow-600 text-black font-semibold py-2 rounded hover:bg-yellow-500 transition duration-200'
          disabled={loading}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  </div>

          
)
}

export default resetpassword