import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';
import AnimatedPage, { FadeIn, StaggerContainer, StaggerItem } from '../../components/AnimatedPage';
import { HiOutlineUsers, HiOutlineOfficeBuilding, HiOutlineCalendar, HiOutlineClock } from 'react-icons/hi';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    API.get('/admin/stats').then(({ data }) => setStats(data.stats)).catch(() => toast.error('Failed to load telemetry'));
  }, []);

  if (!stats) return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"/></div>;

  const cards = [
    { label: 'Registered Members', value: stats.totalUsers, icon: <HiOutlineUsers size={24} />, color: 'from-blue-500/20 to-indigo-500/5', border: 'border-blue-500/30', text: 'text-blue-400' },
    { label: 'Platform Venues', value: stats.totalRestaurants, icon: <HiOutlineOfficeBuilding size={24} />, color: 'from-emerald-500/20 to-teal-500/5', border: 'border-emerald-500/30', text: 'text-emerald-400' },
    { label: 'Total Reservations', value: stats.totalBookings, icon: <HiOutlineCalendar size={24} />, color: 'from-gold-500/20 to-gold-700/5', border: 'border-gold-500/30', text: 'text-gold-400' },
    { label: 'Pending Approvals', value: stats.pendingBookings, icon: <HiOutlineClock size={24} />, color: 'from-amber-500/20 to-orange-500/5', border: 'border-amber-500/30', text: 'text-amber-400' },
  ];

  return (
    <AnimatedPage className="max-w-7xl mx-auto px-6 py-20">
      <FadeIn>
        <div className="mb-12 border-b border-white/5 pb-6">
          <p className="text-gold-500 font-semibold text-xs uppercase tracking-[0.2em] mb-2">System Analytics</p>
          <h1 className="font-display text-4xl text-white">Command Center</h1>
        </div>
      </FadeIn>

      <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {cards.map((c, i) => (
          <StaggerItem key={i}>
            <div className={`glass-panel rounded-3xl p-6 bg-gradient-to-br ${c.color} border ${c.border} relative overflow-hidden group hover:bg-white/5 transition-colors`}>
              <div className="absolute -right-6 -top-6 opacity-10 group-hover:opacity-20 transition-opacity">
                {c.icon}
              </div>
              <div className={`w-10 h-10 rounded-xl bg-luxury-950 border border-white/10 flex items-center justify-center ${c.text} mb-6`}>
                {c.icon}
              </div>
              <p className="font-display text-4xl text-white mb-1">{c.value}</p>
              <p className="text-xs uppercase tracking-widest font-semibold text-stone-500">{c.label}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <FadeIn delay={0.2}>
        <div className="grid md:grid-cols-2 gap-6">
          <Link to="/admin/restaurants" className="glass-panel p-8 rounded-3xl group border-white/5 hover:border-gold-500/30 transition-colors">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-2xl text-white">Venue Database</h3>
              <div className="w-10 h-10 rounded-full border border-stone-700 flex items-center justify-center text-stone-400 group-hover:border-gold-500/50 group-hover:bg-gold-500/10 group-hover:text-gold-400 transition-all">
                →
              </div>
            </div>
            <p className="text-stone-400 font-light text-sm">Add new locations, modify existing venue details, or remove restaurants from the platform network.</p>
          </Link>
          
          <Link to="/admin/users" className="glass-panel p-8 rounded-3xl group border-white/5 hover:border-gold-500/30 transition-colors">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-2xl text-white">Member Directory</h3>
              <div className="w-10 h-10 rounded-full border border-stone-700 flex items-center justify-center text-stone-400 group-hover:border-gold-500/50 group-hover:bg-gold-500/10 group-hover:text-gold-400 transition-all">
                →
              </div>
            </div>
            <p className="text-stone-400 font-light text-sm">Review registered platform members, oversee roles, and manage access to the reservation system.</p>
          </Link>
        </div>
      </FadeIn>
    </AnimatedPage>
  );
}
