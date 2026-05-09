import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import api from '../Hooks/api';

function Forgotpassword() {
    const [email, setmail] = useState('');
    const [Success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
         const response =await api.post('/api/users/forgetpassword', { email });
            setSuccess(response.data.message || 'Password reset code sent to your email!');
            setTimeout(() => {
                navigate(`/verify-code?email=${encodeURIComponent(email)}`);
            }, 3000);
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'Failed to send password reset code');
        } finally {
            setLoading(false);
        }
    }   
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 via-slate-950 to-black px-4'>
        <div className="rounded-xl border border-yellow-700/40 bg-black/60 py-8 px-6 max-w-sm w-full shadow-lg backdrop-blur-md">
            <h2 className="text-2xl font-bold text-yellow-500 mb-6 text-center drop-shadow-[0_0_15px_rgba(234,179,8,0.6)]">Forgot Password</h2>
            <p className="text-slate-300 mb-4">Enter your email to reset</p>
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            {Success && <p className="text-green-400 text-sm mb-4">{Success}</p>}
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-300">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setmail(e.target.value)}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-yellow-700/40 rounded-md bg-slate-900/50 text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 px-4 bg-yellow-600 text-black font-semibold rounded-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Sending...' : 'Send Reset Code'}
                </button>
            </form>
            <div className="mt-4 text-center">
                <Link to="/login" className="text-sm text-yellow-500 hover:text-yellow-400">Back to Login</Link>
            </div>
        </div>

    </div>


    
  )
}

export default Forgotpassword