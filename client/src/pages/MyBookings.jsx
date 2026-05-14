import { useState, useEffect } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';
import AnimatedPage, { FadeIn, StaggerContainer, StaggerItem } from '../components/AnimatedPage';
import { CardSkeleton } from '../components/Skeleton';
import { HiOutlineCalendar, HiOutlineClock, HiOutlineUsers, HiOutlineLocationMarker, HiOutlineX } from 'react-icons/hi';

const getStatusConfig = (status) => {
  switch(status) {
    case 'approved': return { color: 'text-emerald-400', border: 'border-emerald-500/30', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]', dot: 'bg-emerald-500' };
    case 'pending': return { color: 'text-amber-400', border: 'border-amber-500/30', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]', dot: 'bg-amber-500' };
    case 'rejected': return { color: 'text-red-400', border: 'border-red-500/30', glow: '', dot: 'bg-red-500' };
    default: return { color: 'text-stone-500', border: 'border-stone-700', glow: '', dot: 'bg-stone-600' };
  }
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const { data } = await API.get('/bookings/my');
      setBookings(data.bookings);
    } catch (err) { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const cancel = async (id) => {
    if (!window.confirm('Retract this reservation?')) return;
    try {
      await API.put(`/bookings/${id}/cancel`);
      toast.success('Reservation retracted');
      fetchBookings();
    } catch (err) { toast.error(err.response?.data?.message || 'Cancel failed'); }
  };

  return (
    <AnimatedPage className="max-w-5xl mx-auto px-6 py-20">
      <FadeIn>
        <div className="mb-12 border-b border-white/5 pb-6">
          <h1 className="font-display text-4xl text-white mb-2">My Portfolio</h1>
          <p className="text-stone-400 font-light">Your upcoming and past dining experiences</p>
        </div>
      </FadeIn>

      {loading ? (
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : bookings.length === 0 ? (
        <FadeIn>
          <div className="glass-panel p-20 text-center rounded-3xl">
            <h3 className="font-display italic text-3xl text-stone-400 mb-2">The canvas is blank</h3>
            <p className="text-stone-500 font-light">You have no reservations on record.</p>
          </div>
        </FadeIn>
      ) : (
        <StaggerContainer className="grid gap-6">
          {bookings.map(b => {
            const config = getStatusConfig(b.booking_status);
            return (
              <StaggerItem key={b.id}>
                <div className={`glass-panel p-6 sm:p-8 rounded-3xl border ${config.border} ${config.glow} transition-all relative overflow-hidden group`}>
                  
                  {/* Subtle background glow for active bookings */}
                  {(b.booking_status === 'pending' || b.booking_status === 'approved') && (
                    <div className={`absolute top-0 right-0 w-64 h-64 ${config.dot} opacity-[0.03] blur-3xl rounded-full`} />
                  )}

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`flex items-center gap-2 text-[10px] uppercase tracking-widest font-semibold ${config.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${config.dot} ${b.booking_status==='pending' ? 'animate-pulse' : ''}`} />
                          {b.booking_status}
                        </span>
                      </div>
                      <h3 className="font-display text-2xl text-white mb-1 group-hover:text-gold-400 transition-colors">{b.restaurant_name}</h3>
                      <p className="text-stone-500 text-sm flex items-center gap-1.5 font-light">
                        <HiOutlineLocationMarker /> {b.location}
                      </p>
                    </div>

                    <div className="flex flex-wrap md:flex-nowrap items-center gap-8 md:px-8 md:border-x border-white/5">
                      <div>
                        <p className="text-[10px] text-stone-500 uppercase tracking-widest mb-1">Date & Time</p>
                        <p className="text-white font-medium">{b.booking_date} <span className="text-gold-500 px-1">•</span> {b.booking_time}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-stone-500 uppercase tracking-widest mb-1">Arrangement</p>
                        <p className="text-white font-medium">Table {b.table_number} <span className="text-gold-500 px-1">•</span> {b.guests} Ppl</p>
                      </div>
                    </div>

                    <div className="md:w-32 flex justify-end">
                      {(b.booking_status === 'pending' || b.booking_status === 'approved') && (
                        <button onClick={() => cancel(b.id)}
                          className="px-4 py-2 border border-red-500/20 text-red-400 rounded-lg text-xs font-semibold tracking-wider uppercase hover:bg-red-500/10 transition-colors cursor-pointer">
                          Retract
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}
    </AnimatedPage>
  );
}
