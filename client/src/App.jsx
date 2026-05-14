import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import ProtectedRoute from './routes/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Restaurants from './pages/Restaurants';
import BookingPage from './pages/BookingPage';
import MyBookings from './pages/MyBookings';
import StaffDashboard from './pages/staff/StaffDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageRestaurants from './pages/admin/ManageRestaurants';
import ManageUsers from './pages/admin/ManageUsers';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/restaurants" element={<Restaurants />} />
        <Route path="/book/:id" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
        <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        <Route path="/staff" element={<ProtectedRoute roles={['staff', 'admin']}><StaffDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/restaurants" element={<ProtectedRoute roles={['admin']}><ManageRestaurants /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><ManageUsers /></ProtectedRoute>} />
      </Routes>
    </AnimatePresence>
  );
}

function AmbientBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none" style={{ background: '#0a0a0a' }}>
      {/* Subtle radial vignette — warm gold from center, fading to black edges */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(98, 54, 32, 0.08) 0%, transparent 70%)'
      }} />
      {/* Fine noise texture for depth */}
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")',
        backgroundSize: '128px 128px'
      }} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AmbientBackground />
        <Toaster 
          position="top-center" 
          toastOptions={{ 
            duration: 4000,
            style: { 
              background: 'rgba(20, 20, 20, 0.8)', 
              color: '#d6a754', 
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(214, 167, 84, 0.2)',
              borderRadius: '16px', 
              fontSize: '14px',
              fontFamily: "'Outfit', sans-serif"
            }
          }} 
        />
        <div className="min-h-screen flex flex-col selection:bg-gold-500/30 selection:text-white">
          <Navbar />
          <main className="flex-1 flex flex-col relative z-10">
            <AnimatedRoutes />
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
