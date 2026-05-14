import { useState, useEffect } from 'react';
import API from '../../services/api';
import toast from 'react-hot-toast';
import AnimatedPage, { FadeIn } from '../../components/AnimatedPage';
import { TableSkeleton } from '../../components/Skeleton';
import { HiOutlineTrash } from 'react-icons/hi';

const getRoleConfig = (role) => {
  switch(role) {
    case 'admin': return { color: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/10' };
    case 'staff': return { color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10' };
    default: return { color: 'text-stone-400', border: 'border-white/10', bg: 'bg-white/5' };
  }
};

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/users');
      setUsers(data.users);
    } catch (err) { toast.error('Failed to query user database'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Terminate access for user "${name}"?`)) return;
    try { await API.delete(`/admin/users/${id}`); toast.success('Access terminated'); fetch(); }
    catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
  };

  return (
    <AnimatedPage className="max-w-7xl mx-auto px-6 py-20">
      <FadeIn>
        <div className="mb-12 border-b border-white/5 pb-6">
          <p className="text-gold-500 font-semibold text-xs uppercase tracking-[0.2em] mb-2">System Administration</p>
          <h1 className="font-display text-4xl text-white">Member Directory</h1>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="glass-panel rounded-3xl overflow-hidden">
          {loading ? (
            <div className="p-8"><TableSkeleton rows={5} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-luxury-900/80 border-b border-white/5 text-stone-500 text-[10px] font-semibold uppercase tracking-widest">
                    <th className="px-8 py-5">Identity</th>
                    <th className="px-8 py-5">Access Level</th>
                    <th className="px-8 py-5">Onboarding Date</th>
                    <th className="px-8 py-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map(u => {
                    const rCfg = getRoleConfig(u.role);
                    return (
                      <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full border border-stone-700 bg-luxury-950 flex items-center justify-center font-display italic text-stone-300">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-stone-200 mb-0.5">{u.name}</p>
                              <p className="text-stone-500 text-xs font-light tracking-wide">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${rCfg.border} ${rCfg.bg} ${rCfg.color}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-stone-400 text-sm font-light">
                          {new Date(u.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-8 py-5 text-right">
                          {u.role !== 'admin' ? (
                            <button onClick={() => handleDelete(u.id, u.name)} title="Revoke Access"
                              className="w-9 h-9 inline-flex items-center justify-center rounded-xl bg-red-500/5 border border-transparent text-red-500 hover:bg-red-500/20 hover:border-red-500/30 transition-all cursor-pointer opacity-100 md:opacity-0 md:group-hover:opacity-100">
                              <HiOutlineTrash size={16} />
                            </button>
                          ) : (
                            <span className="text-[10px] font-semibold tracking-widest uppercase text-stone-600 px-3 py-1">Protected</span>
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
