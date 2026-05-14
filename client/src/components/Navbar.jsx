import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineMenuAlt3, HiX } from 'react-icons/hi';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navLink = (to, label) => (
    <Link to={to} className={`relative px-4 py-2 text-sm transition-colors duration-300 font-medium tracking-wide ${
      location.pathname === to ? 'text-gold-300' : 'text-stone-400 hover:text-gold-200'
    }`}>
      {label}
      {location.pathname === to && (
        <motion.div layoutId="nav-indicator" className="absolute bottom-1 left-4 right-4 h-[1px] bg-gold-400/50" />
      )}
    </Link>
  );

  return (
    <div className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'py-4' : 'py-6'}`}>
      <nav className={`max-w-6xl mx-auto px-4 sm:px-6 transition-all duration-500 ${
        scrolled ? 'mx-4 sm:mx-auto' : ''
      }`}>
        <div className={`flex justify-between items-center h-16 px-6 transition-all duration-500 ${
          scrolled ? 'glass-pill rounded-full' : 'bg-transparent'
        }`}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-full border border-gold-400/30 flex items-center justify-center text-gold-400 group-hover:border-gold-300 group-hover:text-gold-300 transition-colors bg-luxury-900/50 backdrop-blur-md">
              <span className="font-display italic text-lg leading-none pt-1">T</span>
            </div>
            <span className="text-xl font-display font-semibold tracking-wide text-white group-hover:text-gold-50 transition-colors">
              Table<span className="text-gold-400 italic font-normal">Book</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {navLink('/', 'Home')}
            {navLink('/restaurants', 'Dining')}
            {user && navLink('/my-bookings', 'Reservations')}
            {user && (user.role === 'staff' || user.role === 'admin') && navLink('/staff', 'Operations')}
            {user && user.role === 'admin' && navLink('/admin', 'Analytics')}
          </div>

          {/* Right section */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-stone-200 leading-tight">{user.name}</p>
                    <p className="text-[10px] uppercase tracking-widest text-gold-500 font-semibold">{user.role}</p>
                  </div>
                  <div className="w-9 h-9 rounded-full border border-gold-500/20 bg-luxury-800 flex items-center justify-center text-gold-200 font-display italic">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="w-px h-6 bg-white/10" />
                <button onClick={handleLogout} className="text-sm text-stone-400 hover:text-red-400 transition-colors uppercase tracking-wider font-semibold text-[11px]">
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-medium text-stone-300 hover:text-gold-300 transition-colors">Sign In</Link>
                <Link to="/register" className="px-5 py-2.5 bg-gradient-to-r from-gold-600 to-gold-500 text-luxury-950 font-semibold text-sm rounded-full hover:from-gold-500 hover:to-gold-400 transition-all shadow-[0_0_15px_rgba(214,167,84,0.3)] hover:shadow-[0_0_25px_rgba(214,167,84,0.5)]">
                  Reserve Table
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)} className="md:hidden text-gold-400 hover:text-gold-200 transition-colors p-1">
            {open ? <HiX size={24} /> : <HiOutlineMenuAlt3 size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            className="absolute top-24 left-4 right-4 glass-panel rounded-2xl overflow-hidden md:hidden"
          >
            <div className="px-4 py-6 space-y-2">
              {[
                ['/', 'Home'], ['/restaurants', 'Dining'],
                ...(user ? [['/my-bookings', 'Reservations']] : []),
                ...(user && (user.role === 'staff' || user.role === 'admin') ? [['/staff', 'Operations']] : []),
                ...(user?.role === 'admin' ? [['/admin', 'Analytics']] : []),
              ].map(([to, label]) => (
                <Link key={to} to={to} className={`block py-3 px-4 rounded-xl text-sm font-medium tracking-wide transition-colors ${
                  location.pathname === to ? 'bg-gold-500/10 text-gold-300 border border-gold-500/20' : 'text-stone-300 hover:bg-white/5'
                }`}>{label}</Link>
              ))}
              
              <div className="h-px bg-white/5 my-4" />
              
              {user ? (
                <button onClick={handleLogout} className="block w-full text-left py-3 px-4 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/10 transition-colors">Sign Out</button>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link to="/login" className="py-3 text-center text-sm font-medium text-stone-300 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">Sign In</Link>
                  <Link to="/register" className="py-3 text-center text-sm font-medium text-luxury-950 bg-gradient-to-r from-gold-500 to-gold-400 rounded-xl">Reserve Table</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
