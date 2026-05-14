import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { HiOutlineLocationMarker, HiOutlineSearch } from 'react-icons/hi';
import { motion } from 'framer-motion';
import AnimatedPage, { FadeIn, StaggerContainer, StaggerItem } from '../components/AnimatedPage';
import { CardSkeleton } from '../components/Skeleton';

// Premium stock images array to cycle through for seeded restaurants without images
const stockImages = [
  "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800&auto=format&fit=crop"
];

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/restaurants', { params: search ? { search } : {} });
      setRestaurants(data.restaurants);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRestaurants(); }, []);

  const handleSearch = (e) => { e.preventDefault(); fetchRestaurants(); };

  return (
    <AnimatedPage className="pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-white/10 pb-10">
            <div>
              <p className="text-gold-500 font-semibold text-xs uppercase tracking-[0.2em] mb-3">The Collection</p>
              <h1 className="font-display text-5xl md:text-6xl text-white">Featured <span className="italic text-stone-400">Venues</span></h1>
            </div>
            
            <form onSubmit={handleSearch} className="relative w-full md:w-96 group">
              <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 group-focus-within:text-gold-500 transition-colors" size={20} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                className="luxury-input luxury-input-icon"
                style={{ borderRadius: '9999px' }}
                placeholder="Search venues or locations..." />
            </form>
          </div>
        </FadeIn>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : restaurants.length === 0 ? (
          <FadeIn>
            <div className="glass-panel p-16 text-center rounded-3xl">
              <p className="font-display italic text-3xl text-stone-400 mb-2">No venues discovered.</p>
              <p className="text-stone-500 font-light">Refine your search parameters to explore our collection.</p>
            </div>
          </FadeIn>
        ) : (
          <StaggerContainer className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {restaurants.map((r, index) => {
              const bgImg = r.image_url || stockImages[index % stockImages.length];
              return (
                <StaggerItem key={r.id}>
                  <Link to={`/book/${r.id}`} className="block group">
                    <div className="relative rounded-[2rem] overflow-hidden aspect-[4/3] sm:aspect-[16/9] md:aspect-[4/3] border border-white/5 shadow-2xl shadow-black bg-luxury-900">
                      {/* Image & Overlay */}
                      <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-gradient-to-t from-luxury-950 via-luxury-950/40 to-transparent z-10" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700 z-10" />
                        <motion.div 
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 1.5, ease: 'easeOut' }}
                          className="w-full h-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${bgImg})` }}
                        />
                      </div>

                      {/* Content */}
                      <div className="absolute inset-0 z-20 p-8 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div className="glass-panel px-3 py-1.5 rounded-full flex items-center gap-2 border-white/10">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] uppercase tracking-widest text-white font-semibold">Accepting Reservations</span>
                          </div>
                        </div>

                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          <h2 className="font-display text-3xl md:text-4xl text-white mb-2">{r.name}</h2>
                          <p className="text-gold-400 flex items-center gap-1.5 text-sm uppercase tracking-wider font-semibold mb-4">
                            <HiOutlineLocationMarker /> {r.location}
                          </p>
                          
                          <div className="h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-500 overflow-hidden">
                            <p className="text-stone-300 text-sm font-light leading-relaxed mb-6 line-clamp-2">
                              {r.description}
                            </p>
                            <div className="inline-flex items-center gap-2 text-white font-medium border-b border-gold-500 pb-1">
                              Reserve Table <span className="text-gold-500">→</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        )}
      </div>
    </AnimatedPage>
  );
}
