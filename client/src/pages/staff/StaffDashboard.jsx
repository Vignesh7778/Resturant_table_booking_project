import { useState, useEffect } from 'react';
import API from '../../services/api';
import toast from 'react-hot-toast';
import AnimatedPage, { FadeIn } from '../../components/AnimatedPage';
import { TableSkeleton } from '../../components/Skeleton';
import { HiOutlineCheck, HiOutlineX, HiOutlineRefresh } from 'react-icons/hi';

const getStatusConfig = (status) => {
  switch(status) {
    case 'approved': return { color: 'text-emerald-400', dot: 'bg-emerald-500' };
    case 'pending': return { color: 'text-amber-400', dot: 'bg-amber-500' };
    case 'rejected': return { color: 'text-red-400', dot: 'bg-red-500' };
    default: return { color: 'text-stone-500', dot: 'bg-stone-600' };
  }
};

export default function StaffDashboard() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = filter ? { status: filter } : {};
      const { data } = await API.get('/staff/bookings', { params });
      setBookings(data.bookings);
    } catch (err) { toast.error('Failed to load operations data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, [filter]);

  const handleAction = async (id, action) => {
    try {
      await API.put(`/staff/${action}/${id}`);
      toast.success(`Reservation ${action}d`);
      fetchBookings();
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
  };

  const tabs = [
    { id: '', label: 'All Operations' },
    { id: 'pending', label: 'Action Required' },
    { id: 'approved', label: 'Confirmed' },
    { id: 'rejected', label: 'Declined' },
    { id: 'cancelled', label: 'Retracted' }
  ];

  return (
    <AnimatedPage className="max-w-7xl mx-auto px-6 py-20">
      <FadeIn>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/5 pb-6">
          <div>
            <h1 className="font-display text-4xl text-white mb-2">Operations Center</h1>
            <p className="text-stone-400 font-light">Monitor and manage venue reservations</p>
          </div>

          <div className="flex gap-2 bg-luxury-900/50 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md overflow-x-auto no-scrollbar">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setFilter(t.id)}
                className={`px-6 py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${
                  filter === t.id 
                    ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' 
                    : 'text-stone-500 hover:text-stone-300 hover:bg-white/5 border border-transparent'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="glass-panel rounded-3xl overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/5">
            <h3 className="text-white font-display text-xl">Active Queue</h3>
            <button onClick={fetchBookings} className="text-stone-400 hover:text-gold-400 transition-colors p-2 cursor-pointer">
              <HiOutlineRefresh size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {loading ? (
            <div className="p-8"><TableSkeleton rows={6} /></div>
          ) : bookings.length === 0 ? (
            <div className="p-24 text-center">
              <p className="font-display italic text-2xl text-stone-500 mb-2">Queue is clear</p>
              <p className="text-stone-600 font-light text-sm">No operations require attention under this filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-luxury-900/80 border-b border-white/5 text-stone-500 text-[10px] font-semibold uppercase tracking-widest">
                    <th className="px-8 py-5">Patron</th>
                    <th className="px-8 py-5">Venue & Arrangement</th>
                    <th className="px-8 py-5">Schedule</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {bookings.map((b) => {
                    const statusCfg = getStatusConfig(b.booking_status);
                    return (
                      <tr key={b.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-8 py-5">
                          <p className="font-medium text-white mb-0.5">{b.customer_name}</p>
                          <p className="text-stone-500 text-xs font-light">{b.customer_email}</p>
                        </td>
                        <td className="px-8 py-5">
                          <p className="font-medium text-stone-200 mb-0.5">{b.restaurant_name}</p>
                          <p className="text-stone-500 text-xs font-light">Table {b.table_number} <span className="text-gold-500 mx-1">•</span> {b.capacity} Seats</p>
                        </td>
                        <td className="px-8 py-5">
                          <p className="font-medium text-stone-200 mb-0.5">{b.booking_date}</p>
                          <p className="text-stone-500 text-xs font-light">{b.booking_time}</p>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`flex items-center gap-2 text-[10px] uppercase tracking-widest font-semibold ${statusCfg.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} ${b.booking_status==='pending' ? 'animate-pulse' : ''}`} />
                            {b.booking_status}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          {b.booking_status === 'pending' ? (
                            <div className="flex gap-2 justify-end opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleAction(b.id, 'approve')} title="Confirm"
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500 transition-all cursor-pointer">
                                <HiOutlineCheck size={18} />
                              </button>
                              <button onClick={() => handleAction(b.id, 'reject')} title="Decline"
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500 transition-all cursor-pointer">
                                <HiOutlineX size={18} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-stone-600 text-xs italic">Processed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </FadeIn>
    </AnimatedPage>
  );
}
