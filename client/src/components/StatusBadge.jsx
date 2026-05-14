const styles = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
  cancelled: 'bg-stone-500/10 text-stone-400 border-stone-700',
  available: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  reserved: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  maintenance: 'bg-red-500/10 text-red-400 border-red-500/30',
  admin: 'bg-red-500/10 text-red-400 border-red-500/30',
  staff: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  user: 'bg-white/5 text-stone-300 border-white/10',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
}
