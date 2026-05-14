import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import AnimatedPage, { FadeIn, StaggerContainer, StaggerItem } from '../components/AnimatedPage';

export default function Home() {
  const { user } = useAuth();

  return (
    <AnimatedPage>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Cinematic background image with dark overlay */}
        <div className="absolute inset-0 z-[-1]">
          <div className="absolute inset-0 bg-luxury-950/80 mix-blend-multiply z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-950 via-luxury-950/50 to-transparent z-10" />
          <motion.div 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
            className="w-full h-full bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center"
          />
        </div>

        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 relative z-20">
          <div className="max-w-3xl">
            <FadeIn>
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-gold-500/30 bg-luxury-900/50 backdrop-blur-md mb-8">
                <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
                <span className="text-gold-300 text-xs font-semibold tracking-widest uppercase">The Premier Dining Experience</span>
              </div>
            </FadeIn>
            
            <FadeIn delay={0.2}>
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.1] tracking-tight mb-8">
                Reserve Moments, <br />
                <span className="text-gradient-gold italic pr-4">Not Just Tables.</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.4}>
              <p className="text-stone-300 text-lg md:text-xl max-w-xl mb-12 font-light leading-relaxed">
                Step into a world of culinary excellence. Curated spaces, ambient lighting, and unforgettable evenings await.
              </p>
            </FadeIn>

            <FadeIn delay={0.6}>
              <div className="flex flex-col sm:flex-row gap-5">
                <Link to="/restaurants"
                  className="group relative px-8 py-4 bg-gradient-to-r from-gold-600 to-gold-400 text-luxury-950 font-semibold text-lg rounded-full overflow-hidden text-center transition-transform hover:scale-105">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Explore Dining <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                </Link>
                
                {!user && (
                  <Link to="/register"
                    className="px-8 py-4 bg-white/5 border border-white/10 backdrop-blur-md text-white font-medium text-lg rounded-full hover:bg-white/10 transition-colors text-center">
                    Request Membership
                  </Link>
                )}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-32 px-6 relative">
        <div className="max-w-5xl mx-auto text-center">
          <FadeIn>
            <p className="text-gold-500 font-semibold text-sm uppercase tracking-[0.2em] mb-4">Our Philosophy</p>
            <h2 className="font-display text-4xl md:text-5xl text-white mb-10 leading-tight">
              An ambiance crafted for the <br/><span className="italic text-stone-400">extraordinary</span>
            </h2>
          </FadeIn>
          
          <StaggerContainer className="grid md:grid-cols-3 gap-8 mt-20">
            {[
              { num: 'I', title: 'Curated Selections', desc: 'Hand-picked venues meeting rigorous standards of culinary art and atmosphere.' },
              { num: 'II', title: 'Seamless Booking', desc: 'An elegant, frictionless reservation process designed around your schedule.' },
              { num: 'III', title: 'Exclusive Access', desc: 'Priority seating and private dining experiences for our esteemed members.' }
            ].map((feature, idx) => (
              <StaggerItem key={idx}>
                <div className="glass-panel p-8 rounded-3xl h-full flex flex-col items-center text-center group hover:border-gold-500/30 transition-colors duration-500">
                  <span className="font-display italic text-5xl text-gold-900/40 group-hover:text-gold-500/20 transition-colors duration-500 mb-6">{feature.num}</span>
                  <h3 className="font-display text-2xl text-white mb-4">{feature.title}</h3>
                  <p className="text-stone-400 leading-relaxed font-light">{feature.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Cinematic Showcase */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <FadeIn>
                <div className="relative rounded-[2rem] overflow-hidden aspect-[4/5] shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/5">
                  <img src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=1000&auto=format&fit=crop" alt="Fine Dining" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-luxury-950 via-transparent to-transparent" />
                  <div className="absolute bottom-10 left-10 right-10 glass-panel p-6 rounded-2xl">
                    <p className="text-gold-400 font-display italic text-xl mb-1">Chef's Table</p>
                    <p className="text-stone-300 text-sm">Experience culinary theater from the front row.</p>
                  </div>
                </div>
              </FadeIn>
            </div>
            <div className="lg:w-1/2 space-y-10">
              <FadeIn delay={0.2}>
                <h2 className="font-display text-5xl text-white leading-tight">
                  Elevate your <br/><span className="text-gradient-gold italic">evenings</span>
                </h2>
                <p className="text-stone-400 text-lg mt-6 font-light leading-relaxed">
                  Whether it's an intimate anniversary, a high-stakes business dinner, or a celebration of life's milestones, TableBook ensures your setting is as perfect as the occasion itself.
                </p>
              </FadeIn>
              
              <StaggerContainer className="space-y-6">
                {[
                  { stat: '50+', label: 'Michelin-Rated Venues' },
                  { stat: '10k', label: 'Curated Experiences' },
                  { stat: '24/7', label: 'Concierge Support' }
                ].map((item, i) => (
                  <StaggerItem key={i}>
                    <div className="flex items-center gap-6 pb-6 border-b border-white/5">
                      <span className="font-display text-4xl text-gold-500 w-24">{item.stat}</span>
                      <span className="text-stone-300 text-lg tracking-wide">{item.label}</span>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 pt-20 pb-10 px-6 mt-20 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-gold-500/20 flex items-center justify-center text-gold-500 font-display italic text-xl">T</div>
            <span className="font-display text-2xl text-white">Table<span className="text-gold-500 italic">Book</span></span>
          </div>
          <p className="text-stone-500 text-sm font-light tracking-wide">© 2026 TableBook. Curated Dining Excellence.</p>
        </div>
      </footer>
    </AnimatedPage>
  );
}
