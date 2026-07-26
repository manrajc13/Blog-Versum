import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import Home from './pages/Home'
import Home2 from './pages/Home2'
import Settings from './pages/settings/Settings'
import MyJournal from './pages/Myjournal'
import CreatePost from './pages/Createpost'
import ViewBlogPage from './pages/ViewBlogPage'
import Explore from './pages/Explore'
import Creators from './pages/Creators'
import Stories from './pages/Stories'
import MessagePage from './pages/MessagePage'
import { useEffect } from 'react'
import {useAuthStore} from "./store/useAuthStore"
import { Loader } from 'lucide-react'
import Onboarding from './pages/Onboarding'
import SearchPage from './pages/SearchPage'
import ProfilePage from './pages/ProfilePage'
import { AuthGuard, PublicRoute } from './guards/RouteGuards'
import ScrollToTop from './guards/ScrollToTop'

function App() {

  const {authUser, checkAuth ,isCheckingAuth} = useAuthStore();
  // console.log("Auth user", authUser);

  useEffect(() => {
    checkAuth();
  }, []);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className=" size-10 animate-spin" />
      </div>
    )
  }
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster position="top-right" toastOptions={{ duration: 1800 }} />
      <Routes>
        <Route path="/" element={<PublicRoute authUser={authUser}><Home2 /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute authUser={authUser}><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute authUser={authUser}><Signup /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute authUser={authUser}><ForgotPassword /></PublicRoute>} />
        {/* Public discovery — reachable without authentication */}
        <Route path="/creators" element={<Creators />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/discover" element={<Explore authUser={authUser} />} />
        <Route path="/onboarding" element={<AuthGuard authUser={authUser}><Onboarding/></AuthGuard>}/>
        <Route path="/home" element={<AuthGuard authUser={authUser}><Home authUser={authUser} /></AuthGuard>} />
        <Route path="/explore" element={
        <AuthGuard authUser={authUser}>
          <Explore authUser={authUser} />
        </AuthGuard>
      } />
        <Route path="/blog/:id" element={<AuthGuard authUser={authUser}><ViewBlogPage authUser={authUser} /></AuthGuard>} />
        <Route path="/search" element={<AuthGuard authUser={authUser}><SearchPage authUser={authUser} /></AuthGuard>} />
        <Route path="/profile/:username" element={<AuthGuard authUser={authUser}><ProfilePage authUser={authUser} /></AuthGuard>} />
        <Route path="/journal" element={<AuthGuard authUser={authUser}><MyJournal authUser={authUser}/></AuthGuard>} />
        <Route path="/journal/:id" element={<AuthGuard authUser={authUser}><ViewBlogPage authUser={authUser} /></AuthGuard>} />
        <Route path="/journal/create" element={<AuthGuard authUser={authUser}><CreatePost authUser={authUser} /></AuthGuard>} />
        <Route path="/settings" element={<AuthGuard authUser={authUser}><Settings authUser={authUser} /></AuthGuard>} />
        <Route path="/messages" element={<AuthGuard authUser={authUser}><MessagePage authUser={authUser} /></AuthGuard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

// { path: '/journal', element: <MyJournal authUser={authUser} /> }
// { path: '/journal/create', element: <CreatePost authUser={authUser} /> }