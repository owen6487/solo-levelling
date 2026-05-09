import React,{useState,useEffect} from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../Hooks/api';

function verifycode() {
    const [loading ,setloading]=useState("");
    const[error,seterror]=useState("");
    const[success,setsuccess]=useState("");
    const[resendLoading,setresendLoading]=useState("");
    const [timer, setTimer] = useState(0);
    const [code, setCode] = useState('');
    const[canResend,setcanResend]=useState(false);
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email');
    const navigate = useNavigate();
    useEffect(() => {
        if (!email) {
            navigate('/forgotpassword');
        }
    }, [email, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        seterror('');
        setsuccess('');
        setloading(true);
        const trimmedcode = code.trim();
        if(!/^\d{6}$/.test(trimmedcode)){
            seterror('Please enter a valid 6-digit code');
            setloading(false);
            return;
        }
        try {
            setsuccess('Code verified! Redirecting...');
            setTimeout(() => {
                navigate(`/resetpassword?email=${encodeURIComponent(email)}&token=${encodeURIComponent(trimmedcode)}`);
            }, 2000);
        } catch (error) {
            seterror(error.response?.data?.message || error.message || 'Verification failed');
        } finally {
            setloading(false);
        }
    };

    const handleResend = async () => {
        seterror('');
        setsuccess('');
        setresendLoading(true);
        try {
            const response = await api.post('/api/users/forgetpassword', { email });
            setsuccess(response.message || 'Verification code resent! Please check your email.');
            setTimer(60);
            setcanResend(false);
        }
        catch (error) {
            seterror(error.response?.data?.message || 'Failed to resend code');
        } finally {
            setresendLoading(false);
        }
    };
    useEffect(() => {
        let interval = null;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        } else {
            setcanResend(true);
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timer]);





  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 via-slate-950 to-black px-4'>
        <div className="rounded-xl border border-yellow-700/40 bg-black/60 py-8 px-6 max-w-sm w-full shadow-lg backdrop-blur-md">
            <h2 className="text-2xl font-bold text-yellow-500 mb-6 text-center drop-shadow-[0_0_15px_rgba(234,179,8,0.6)]">Verify Code</h2>
            <p className="text-slate-300 mb-4">Enter the 6-digit code sent to your email to reset your password.</p>
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            {success && <p className="text-green-400 text-sm mb-4">{success}</p>}
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-300">Verification Code</label>
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                        maxLength={6}
                        className="mt-1 block w-full px-3 py-2 border border-yellow-700/40 rounded-md bg-slate-900/50 text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 px-4 bg-yellow-600 text-black font-semibold rounded-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Verifying...' : 'Verify Code'}
                </button>
            </form>
            <div className="mt-4 text-center">
                <button
                    onClick={handleResend}
                    disabled={!canResend || resendLoading}
                    className={`text-sm text-yellow-500 hover:text-yellow-400 ${(!canResend || resendLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {resendLoading ? 'Resending...' : canResend ? 'Resend Code' : `Resend in ${timer}s`}
                </button>
            </div>
            <div className="mt-4 text-center">
                <button onClick={() => navigate('/forgotpassword')} className="text-sm text-yellow-500 hover:text-yellow-400">
                    Change Email
                </button>
            </div>
        </div>


    </div>
  )
}

export default verifycode