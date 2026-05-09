import React from 'react'
import { useState } from 'react';
import useAuth from '../Hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
    const { register } = useAuth();
   const [name, setName] = useState('');
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [showPassword, setShowPassword] = useState(false);
   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
   const navigate = useNavigate();
   const [error, setError] = useState('');
   const [success, setSuccess] = useState('');
   const [loading, setLoading] = useState(false);

   const handleSubmit = async (e) => {
     e.preventDefault();
     setError('');
     setSuccess('');

     if (password !== confirmPassword) {
       setError('Passwords do not match');
       return;
     }

     try {
       const response = await register({ name, email, password });
       setSuccess(response.message || 'Registration successful! Please log in.');
       // Optionally, redirect to login page after a short delay
       setTimeout(() => {
         navigate('/login');
       }, 2000);
     } catch (err) {
       setError(err.response?.data?.message || 'Registration failed. Please try again.');
     }
   }
   const EyeIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
        </svg>
    );
       const EyeOffIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
        </svg>
    );
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 via-slate-950 to-black px-4'>
             <div className="rounded-xl border border-yellow-700/40 bg-black/60 py-8 px-6 max-w-sm w-full shadow-lg backdrop-blur-md">
                <h2 className="text-2xl font-bold text-yellow-500 mb-6 text-center drop-shadow-[0_0_15px_rgba(234,179,8,0.6)]">Create an Account</h2>
                {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                {success && <p className="text-green-400 text-sm mb-4">{success}</p>}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-300">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-yellow-700/40 rounded-md bg-slate-900/50 text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-yellow-700/40 rounded-md bg-slate-900/50 text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-yellow-700/40 rounded-md bg-slate-900/50 text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"
                            >
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                         <p className="mt-1 text-xs text-slate-400">
                            Min 8 chars, uppercase, lowercase, number &amp; special character
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300">Confirm Password</label>
                        <div className="relative">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-yellow-700/40 rounded-md bg-slate-900/50 text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"

                        />
                        <button 
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"
                        >
                            {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}

                        </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 px-4 bg-yellow-600 hover:bg-yellow-500 text-black font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors"
                    >
                        Register
                    </button>
                    <div>
                        <p className="text-sm text-slate-300 text-center">
                            Already have an account?{' '}
                            <Link to="/login" className="text-yellow-500 hover:text-yellow-400 font-medium">
                                Log in
                            </Link>
                        </p>
                    </div>

                </form>
                </div>



    </div>
  )
}

export default Register