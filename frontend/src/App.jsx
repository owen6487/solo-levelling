import Navbar from './components/Navbar'
import './index.css'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/Aboutpage'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Addproject from './components/Addproject'
import Project from './components/Project'
// PrivateRoute guards pages that require the user to be logged in
import PrivateRoute from './components/PrivateRoute'
import Createstory from './components/createstory'
import Register from './pages/Register'
import Forgotpassword from './components/Forgotpassword'
import Verifycode from './components/verifycode'
import Resetpassword from './components/resetpassword'
import Aboutpage from './pages/Aboutpage'
import Stories from './components/Stories'


function App() {
  
  return (
    <div>
        {/* Only render Navbar when NOT on the login page */}
         <Navbar />
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/about' element={<Aboutpage />} />
            <Route path='/login' element={<Login />} />
            <Route path='/dashboard/*' element={<Dashboard />} />
            <Route path='/createstory' element={<Createstory />} />
            <Route path='/addproject' element={<Addproject />} />
            <Route path='/projects' element={<Project />} />
            <Route path='/register' element={<Register />} />
            <Route path='/forgotpassword' element={<Forgotpassword />} />
            <Route path='/verify-code' element={<Verifycode />} />
            <Route path='/resetpassword' element={<Resetpassword />} />
            <Route path='/stories' element={<Stories />} />
            {/* Dashboard is protected — only logged-in users can access it.
                If not authenticated, PrivateRoute redirects to /login. */}
            <Route path='/dashboard' element={
                <PrivateRoute>
                    <Dashboard />
                </PrivateRoute>
            } />
        </Routes>
    </div>
  )
}

export default App

