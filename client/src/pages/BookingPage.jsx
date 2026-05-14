import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import AnimatedPage, { FadeIn, StaggerContainer, StaggerItem } from '../components/AnimatedPage';
import { HiOutlineCalendar, HiOutlineClock, HiOutlineUsers, HiOutlineStar, HiOutlineCheck } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

export default function BookingPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [form, setForm] = useState({ date: '', time: '', guests: 2 });
  const [tables, setTables] = useState([]);
  const [meta, setMeta] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    API.get(`/restaurants/${id}`).then(({ data }) => {
      setRestaurant(data.restaurant);
    }).catch(() => toast.error('Restaurant not found'));
  }, [id]);

  const checkAvailability = async () => {
    if (!form.date || !form.time) { toast.error('Select date and time'); return; }
    const today = new Date().toISOString().split('T')[0];
    if (form.date < today) { toast.error('Cannot book in the past'); return; }
    setLoading(true);
    setChecked(false);
    try {
      const { data } = await API.get('/bookings/available-tables', {
        params: { restaurant_id: id, booking_date: form.date, booking_time: form.time, guests: form.guests }
      });
      setTables(data.tables);
      setMeta(data.meta);
      setChecked(true);
      if (data.tables.length === 0) {
        toast.error(`No tables available for ${form.guests} guests in this slot`);
      } else {
        toast.success(`${data.tables.length} matching table${data.tables.length > 1 ? 's' : ''} found`);
        // Auto-select the best match
        const best = data.tables.find(t => t.is_best_match);
        if (best) setSelectedTable(best.id);
      }
    } catch (err) { toast.error('Failed to check availability'); }
    finally { setLoading(false); }
  };

  // Reset when form changes
  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setTables([]);
    setMeta(null);
    setSelectedTable(null);
    setChecked(false);
  };

  const handleBook = async () => {
    if (!user) { navigate('/login'); return; }
    if (!selectedTable) { toast.error('Select a table first'); return; }
    setLoading(true);
    try {
      await API.post('/bookings', {
        table_id: selectedTable, booking_date: form.date, booking_time: form.time, guests: parseInt(form.guests),
      });
      toast.success('🎉 Reservation Confirmed!');
      navigate('/my-bookings');
    } catch (err) { toast.error(err.response?.data?.message || 'Booking failed'); }
    finally { setLoading(false); }
  };

  const selectedTableData = tables.find(t => t.id === selectedTable);

  if (!restaurant) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <AnimatedPage className="pb-24">
      {/* Cinematic Header */}
      <div className="relative h-[35vh] min-h-[280px] flex items-end pb-10 px-6">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center z-[-2]" />
        <div className="absolute inset-0 bg-luxury-950/80 z-[-1]" />
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-950 via-luxury-950/50 to-transparent z-[-1]" />
        <div className="max-w-6xl mx-auto w-full">
          <FadeIn>
            <p className="text-gold-400 font-semibold text-xs uppercase tracking-[0.2em] mb-3">Reserve Your Experience</p>
            <h1 className="font-display text-4xl md:text-6xl text-white mb-3">{restaurant.name}</h1>
            <p className="text-stone-400 max-w-2xl font-light">{restaurant.description}</p>
          </FadeIn>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-10">
        <div className="grid lg:grid-cols-12 gap-10">

          {/* Left Column — Details Form */}
          <div className="lg:col-span-4 space-y-6">
            <FadeIn delay={0.1}>
              <div className="glass-panel p-8 rounded-3xl">
                <h3 className="text-white font-display text-2xl mb-6 pb-4 border-b border-white/5">The Details</h3>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-stone-500 mb-2">Date</label>
                    <div className="relative">
                      <HiOutlineCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" />
                      <input type="date" value={form.date} onChange={e => updateForm('date', e.target.value)}
                        className="luxury-input luxury-input-icon" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-stone-500 mb-2">Time</label>
                    <div className="relative">
                      <HiOutlineClock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" />
                      <input type="time" value={form.time} onChange={e => updateForm('time', e.target.value)}
                        className="luxury-input luxury-input-icon" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-stone-500 mb-2">Number of Guests</label>
                    <div className="relative">
                      <HiOutlineUsers className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" />
                      <input type="number" min="1" max="20" value={form.guests} onChange={e => updateForm('guests', e.target.value)}
                        className="luxury-input luxury-input-icon" placeholder="2" />
                    </div>
                  </div>
                </div>

                <button onClick={checkAvailability} disabled={loading}
                  className="w-full py-4 border border-gold-500/30 bg-gold-500/10 text-gold-400 font-semibold tracking-widest uppercase text-xs rounded-xl hover:bg-gold-500 hover:text-luxury-950 transition-all cursor-pointer disabled:opacity-50">
                  {loading && !checked ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-gold-400/30 border-t-gold-400 rounded-full animate-spin" /> Searching...
                    </span>
                  ) : 'Find Tables'}
                </button>
              </div>
            </FadeIn>

            {/* Booking Summary — shows when a table is selected */}
            <AnimatePresence>
              {selectedTable && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="glass-panel p-8 rounded-3xl relative overflow-hidden" style={{ borderColor: 'rgba(214, 167, 84, 0.2)' }}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 blur-2xl rounded-full" />
                    <h3 className="text-white font-display text-xl mb-5 pb-4 border-b border-white/5">Reservation Summary</h3>
                    <div className="space-y-3 mb-6 text-sm">
                      <div className="flex justify-between"><span className="text-stone-500">Date</span> <span className="text-white font-medium">{form.date}</span></div>
                      <div className="flex justify-between"><span className="text-stone-500">Time</span> <span className="text-white font-medium">{form.time}</span></div>
                      <div className="flex justify-between"><span className="text-stone-500">Party Size</span> <span className="text-white font-medium">{form.guests} Guests</span></div>
                      <div className="flex justify-between items-center pt-3 border-t border-white/5">
                        <span className="text-stone-500">Table</span>
                        <span className="flex items-center gap-2">
                          <span className="text-gold-400 font-bold text-lg font-display">#{selectedTableData?.table_number}</span>
                          <span className="text-stone-500 text-xs">({selectedTableData?.capacity} seats)</span>
                        </span>
                      </div>
                      {selectedTableData?.is_best_match && (
                        <div className="flex items-center justify-center gap-2 py-2 bg-gold-500/10 rounded-lg border border-gold-500/20 text-gold-400 text-xs font-semibold tracking-widest uppercase">
                          <HiOutlineStar size={14} /> Perfect Match
                        </div>
                      )}
                    </div>
                    <button onClick={handleBook} disabled={loading}
                      className="w-full py-4 bg-gradient-to-r from-gold-600 to-gold-400 text-luxury-950 font-bold tracking-widest uppercase text-xs rounded-xl hover:from-gold-500 hover:to-gold-300 transition-all shadow-[0_0_15px_rgba(214,167,84,0.2)] cursor-pointer disabled:opacity-50">
                      {loading ? 'Processing...' : 'Confirm Reservation'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column — Smart Table Selection */}
          <div className="lg:col-span-8">
            <FadeIn delay={0.2}>
              <div className="glass-panel p-8 rounded-3xl min-h-[450px] flex flex-col">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-white/5">
                  <h3 className="text-white font-display text-2xl">Available Tables</h3>
                  {meta && (
                    <div className="flex flex-wrap gap-3 text-[10px] font-semibold tracking-widest uppercase">
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {meta.available} Matching
                      </span>
                      {meta.booked > 0 && (
                        <span className="flex items-center gap-1.5 text-stone-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-stone-600" /> {meta.booked} Booked
                        </span>
                      )}
                      {meta.wrong_size > 0 && (
                        <span className="flex items-center gap-1.5 text-stone-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-stone-700" /> {meta.wrong_size} Wrong Size
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {!checked ? (
                  /* Placeholder state */
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                    <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center mb-6">
                      <HiOutlineUsers size={28} className="text-stone-600" />
                    </div>
                    <p className="text-stone-400 font-display text-xl mb-2">Enter your party details</p>
                    <p className="text-stone-600 font-light text-sm max-w-sm">Select your date, time, and guest count, then click "Find Tables" to see matching availability.</p>
                  </div>
                ) : tables.length === 0 ? (
                  /* Empty state */
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                    <div className="w-16 h-16 rounded-full border border-red-500/20 bg-red-500/5 flex items-center justify-center mb-6">
                      <span className="text-2xl">🪑</span>
                    </div>
                    <p className="text-stone-300 font-display text-xl mb-2">No suitable tables</p>
                    <p className="text-stone-500 font-light text-sm max-w-md">
                      No tables are available for <span className="text-white font-medium">{form.guests} guests</span> at this time.
                      {meta && meta.wrong_size > 0 && (
                        <span className="block mt-1 text-stone-600">{meta.wrong_size} table{meta.wrong_size > 1 ? 's' : ''} excluded (different capacity).</span>
                      )}
                    </p>
                    <p className="text-stone-600 text-xs mt-4">Try a different time, date, or adjust your party size.</p>
                  </div>
                ) : (
                  /* Table Grid */
                  <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {tables.map((t) => {
                      const isSelected = selectedTable === t.id;
                      const isBest = t.is_best_match;

                      return (
                        <StaggerItem key={t.id}>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedTable(t.id)}
                            className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer relative overflow-hidden group ${
                              isSelected
                                ? 'bg-gold-500/10 border-gold-500 shadow-[0_0_20px_rgba(214,167,84,0.15)]'
                                : 'bg-white/[0.02] border-white/5 hover:border-gold-500/30 hover:bg-white/[0.04]'
                            }`}
                          >
                            {/* Best Match badge */}
                            {isBest && (
                              <div className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase ${
                                isSelected ? 'bg-gold-500 text-luxury-950' : 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
                              }`}>
                                <HiOutlineStar size={10} /> Best Match
                              </div>
                            )}

                            <div className="flex items-center gap-4">
                              {/* Table visual */}
                              <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center transition-colors shrink-0 ${
                                isSelected
                                  ? 'bg-gold-500/20 border border-gold-500/40 text-gold-300'
                                  : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 group-hover:border-emerald-400/50'
                              }`}>
                                <span className="font-display font-bold text-lg leading-none">{t.table_number}</span>
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className={`font-semibold mb-0.5 ${isSelected ? 'text-gold-200' : 'text-stone-200'}`}>
                                  Table {t.table_number}
                                </p>
                                <p className={`text-xs ${isSelected ? 'text-gold-400/70' : 'text-stone-500'}`}>
                                  {t.capacity} seat{t.capacity > 1 ? 's' : ''}
                                  {t.capacity_diff === 0
                                    ? ' · Exact fit'
                                    : ` · ${t.capacity_diff} extra seat${t.capacity_diff > 1 ? 's' : ''}`
                                  }
                                </p>
                              </div>

                              {/* Selection indicator */}
                              <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                                isSelected
                                  ? 'bg-gold-500 border-gold-500 text-luxury-950'
                                  : 'border-white/10 text-transparent group-hover:border-white/20'
                              }`}>
                                <HiOutlineCheck size={16} />
                              </div>
                            </div>
                          </motion.button>
                        </StaggerItem>
                      );
                    })}
                  </StaggerContainer>
                )}
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
