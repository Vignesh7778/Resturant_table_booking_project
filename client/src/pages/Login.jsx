import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import AnimatedPage, { FadeIn } from '../components/AnimatedPage';
import { HiOutlineEye, HiOutlineEyeOff, HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('All fields required'); return; }
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}`);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'staff') navigate('/staff');
      else navigate('/restaurants');
    } catch (err) { toast.error(err.response?.data?.message || 'Authentication failed'); }
    finally { setLoading(false); }
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen flex">
        {/* Left - Form */}
        <div className="w-full lg:w-5/12 flex flex-col justify-center px-8 sm:px-16 lg:px-20 pt-20 relative z-10">
          <FadeIn>
            <Link to="/" className="inline-block mb-12 text-stone-500 hover:text-gold-400 transition-colors text-sm font-medium tracking-widest uppercase">
              ← Return
            </Link>
            <h1 className="font-display text-4xl text-white mb-2">Welcome Back</h1>
            <p className="text-stone-400 font-light mb-10">Access your exclusive dining portfolio.</p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-stone-500 mb-2">Email Address</label>
                <div className="relative">
                  <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="luxury-input luxury-input-icon"
                    placeholder="you@example.com" autoComplete="email" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-stone-500 mb-2">Password</label>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    className="luxury-input luxury-input-icon pr-12"
                    placeholder="Enter your password" autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 hover:text-gold-400 transition-colors cursor-pointer">
                    {showPw ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-gold-600 to-gold-400 text-luxury-950 font-bold tracking-widest uppercase text-sm rounded-full hover:from-gold-500 hover:to-gold-300 transition-all shadow-[0_0_20px_rgba(214,167,84,0.15)] hover:shadow-[0_0_30px_rgba(214,167,84,0.3)] disabled:opacity-50 cursor-pointer">
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <span className="w-4 h-4 border-2 border-luxury-950/30 border-t-luxury-950 rounded-full animate-spin" /> Authenticating...
                    </span>
                  ) : 'Sign In'}
                </button>
              </div>

              <p className="text-center text-sm text-stone-500 font-light mt-6">
                Don't have a membership? <Link to="/register" className="text-gold-500 hover:text-gold-400 transition-colors font-medium ml-1">Request Access</Link>
              </p>
            </form>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="mt-16 pt-8 border-t border-white/5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-600 mb-4 font-semibold">Concierge Access (Demo)</p>
              <div className="flex gap-4 text-xs text-stone-400 font-light">
                <div className="glass-panel px-4 py-2 rounded-lg border-white/5">
                  <span className="text-gold-500">Admin</span><br/>admin@restaurant.com<br/>pw: admin123
                </div>
                <div className="glass-panel px-4 py-2 rounded-lg border-white/5">
                  <span className="text-gold-500">Staff</span><br/>staff@restaurant.com<br/>pw: admin123
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Right - Image */}
        <div className="hidden lg:block lg:w-7/12 relative">
          <div className="absolute inset-0 bg-luxury-950/40 z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-luxury-900 via-transparent to-transparent z-10" />
          <img src="https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=2000&auto=format&fit=crop" alt="Restaurant Interior" className="w-full h-full object-cover" />
          <div className="absolute bottom-16 right-16 z-20 text-right">
            <h2 className="font-display italic text-4xl text-white mb-2">The Golden Fork</h2>
            <p className="text-gold-400 tracking-widest text-sm uppercase">Featured Venue</p>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
