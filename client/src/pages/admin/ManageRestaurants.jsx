import { useState, useEffect } from 'react';
import API from '../../services/api';
import toast from 'react-hot-toast';
import AnimatedPage, { FadeIn } from '../../components/AnimatedPage';
import { HiOutlinePencil, HiOutlineTrash, HiOutlinePlus } from 'react-icons/hi';

export default function ManageRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [form, setForm] = useState({ name: '', location: '', description: '' });
  const [editing, setEditing] = useState(null);

  const fetch = async () => {
    const { data } = await API.get('/restaurants');
    setRestaurants(data.restaurants);
  };

  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.location) { toast.error('Name and location required'); return; }
    try {
      if (editing) {
        await API.put(`/restaurants/${editing}`, form);
        toast.success('Venue updated');
      } else {
        await API.post('/restaurants', form);
        toast.success('Venue added');
      }
      setForm({ name: '', location: '', description: '' });
      setEditing(null);
      fetch();
    } catch (err) { toast.error('Operation failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this venue from the database?')) return;
    try { await API.delete(`/restaurants/${id}`); toast.success('Venue deleted'); fetch(); }
    catch (err) { toast.error('Delete failed'); }
  };

  const handleEdit = (r) => {
    setEditing(r.id);
    setForm({ name: r.name, location: r.location, description: r.description || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatedPage className="max-w-7xl mx-auto px-6 py-20">
      <FadeIn>
        <div className="mb-12 border-b border-white/5 pb-6">
          <p className="text-gold-500 font-semibold text-xs uppercase tracking-[0.2em] mb-2">System Administration</p>
          <h1 className="font-display text-4xl text-white">Venue Management</h1>
        </div>
      </FadeIn>

      <div className="grid lg:grid-cols-12 gap-10 items-start">
        {/* Form */}
        <FadeIn delay={0.1} className="lg:col-span-4">
          <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-3xl sticky top-28">
            <h2 className="font-display text-2xl text-white mb-6 pb-4 border-b border-white/5">
              {editing ? 'Modify Venue' : 'Register Venue'}
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-stone-500 mb-2">Venue Name</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="luxury-input" placeholder="The Golden Fork" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-stone-500 mb-2">Location</label>
                <input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})}
                  className="luxury-input" placeholder="Downtown, City" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-stone-500 mb-2">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows="4"
                  className="luxury-input resize-none" style={{ borderRadius: '12px' }}
                  placeholder="Atmosphere and cuisine description..." />
              </div>
            </div>
            
            <div className="mt-8 flex flex-col gap-3">
              <button type="submit" className="w-full py-4 border border-gold-500/30 bg-gold-500/10 text-gold-400 font-bold tracking-widest uppercase text-xs rounded-xl hover:bg-gold-500 hover:text-luxury-950 transition-all cursor-pointer flex items-center justify-center gap-2">
                {editing ? 'Commit Changes' : <><HiOutlinePlus size={16}/> Register Venue</>}
              </button>
              {editing && (
                <button type="button" onClick={() => { setEditing(null); setForm({ name: '', location: '', description: '' }); }}
                  className="w-full py-3 border border-white/10 text-stone-400 font-semibold tracking-widest uppercase text-xs rounded-xl hover:bg-white/5 transition-all cursor-pointer">
                  Abort
                </button>
              )}
            </div>
          </form>
        </FadeIn>

        {/* List */}
        <FadeIn delay={0.2} className="lg:col-span-8 space-y-4">
          {restaurants.map(r => (
            <div key={r.id} className="glass-panel p-6 rounded-2xl flex items-center justify-between group hover:border-gold-500/30 transition-colors">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-luxury-950 border border-white/10 rounded-xl flex items-center justify-center text-2xl shadow-inner shadow-black">
                  🍽️
                </div>
                <div>
                  <p className="font-display text-xl text-white mb-1 group-hover:text-gold-400 transition-colors">{r.name}</p>
                  <p className="text-stone-500 text-xs font-semibold tracking-wider uppercase">{r.location}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleEdit(r)} title="Edit Configuration"
                  className="w-10 h-10 flex items-center justify-center bg-white/5 text-stone-400 rounded-xl hover:bg-gold-500/20 hover:text-gold-400 border border-transparent hover:border-gold-500/30 transition-all cursor-pointer">
                  <HiOutlinePencil size={18} />
                </button>
                <button onClick={() => handleDelete(r.id)} title="Delete Entry"
                  className="w-10 h-10 flex items-center justify-center bg-white/5 text-stone-400 rounded-xl hover:bg-red-500/20 hover:text-red-400 border border-transparent hover:border-red-500/30 transition-all cursor-pointer">
                  <HiOutlineTrash size={18} />
                </button>
              </div>
            </div>
          ))}
        </FadeIn>
      </div>
    </AnimatedPage>
  );
}
