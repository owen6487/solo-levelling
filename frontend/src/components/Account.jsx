import React from 'react'
import {useNavigate,Link} from 'react-router-dom'
import useAuth from '../Hooks/useAuth'
import { FaUserCircle } from 'react-icons/fa' 


function Account({Dashboard=[]}) {
    // useAuth provides `user`, `isAuthenticated` flag and `logout` action
    const {user,isAuthenticated,logout} = useAuth();
    const navigate = useNavigate();
    const dropdownRef = React.useRef(null);
    const [isOpen, setIsOpen] = React.useState(false);  

     
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


        const toggleDropdown = () => {
            setIsOpen(!isOpen);
        };
        const handlelogout = () => {
            // Call logout from auth context then redirect home
            logout();
            navigate('/');
        }
  return (
    <>
        <div className='relative' ref={dropdownRef}>
            {/* The visible icon/button that toggles the dropdown. When authenticated, show the user's name next to the icon. */}
            <button onClick={toggleDropdown} className='flex items-center gap-2 text-zinc-400 hover:text-violet-400'>
                <FaUserCircle size={24} />
                {isAuthenticated ? <span>{user?.name}</span> : <span>Account</span>}
            </button>

            {/* Dropdown menu: when open, show different items depending on auth state. */}
            {isOpen && (
                <div className='absolute right-0 mt-2 w-48 bg-purple-950 rounded-md shadow-lg py-2 z-20'>
                    {isAuthenticated ? (
                        /* Authenticated users see dashboard/profile/logout */
                        <>
                            <Link to='/dashboard' className='block px-4 py-2 text-sm text-white hover:bg-violet-800'>Dashboard</Link>
                            <Link to='/dashboard/profile' className='block px-4 py-2 text-sm text-white hover:bg-violet-800'>Profile</Link>
                            <button onClick={handlelogout} className=' block px-4 py-2 text-sm text-white hover:bg-violet-800' >Logout</button>
                        </>
                    ) : (
                        /* Unauthenticated users see login/register */
                        <>
                        
                        <Link to='/login' className='block px-4 py-2 text-sm text-white hover:bg-violet-800'>Login</Link>
                        <Link to='/register' className='block px-4 py-2 text-sm text-white hover:bg-violet-800'>Register</Link>
                        </>
                        
                    )}
                </div>
            )}
        </div>
    </>
  )
}

export default Account