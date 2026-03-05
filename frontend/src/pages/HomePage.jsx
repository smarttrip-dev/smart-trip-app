import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans flex flex-col items-center justify-center p-4 z-0">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(66,153,132,0.15),_transparent_45%),radial-gradient(circle_at_20%_20%,_rgba(190,242,100,0.05),_transparent_35%)]" />
      <div className="pointer-events-none absolute inset-0 mix-blend-screen opacity-30" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

      {/* Hero Section */}
      <div className="relative mx-auto max-w-[1400px] p-4 sm:p-6">
        <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 shadow-2xl min-h-[85vh]">
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: 'linear-gradient(180deg, rgba(15,23,42,0.1) 0%, rgba(15,23,42,0.8) 100%), url(https://images.unsplash.com/photo-1506905925246-26f42046cae7?auto=format&fit=crop&w=2000&q=80)',
              backgroundSize: 'cover',
              backgroundPosition: 'center 30%',
            }}
          />
          
          {/* Header */}
          <header className="relative z-10 flex items-center justify-between p-6 sm:px-10 sm:py-8">
            <Link to="/" className="flex items-center gap-3 text-white/90">
              <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-6">
                <svg className="h-5 w-5 text-[#BFBD31]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </Link>

            <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-6">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none w-24 focus:w-32 transition-all placeholder:text-slate-500" />
              </div>
              <span className="bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-6"></span>
              {['Adventure', 'About', 'Blogs'].map((item) => (
                <Link key={item} to="#" className="text-sm font-medium text-slate-200 hover:text-[#BFBD31] transition-colors">{item}</Link>
              ))}
              <span className="bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-6"></span>
              <Link to="/packages" className="text-sm font-medium text-slate-200 hover:text-[#BFBD31] transition-colors">Book Now</Link>
            </div>

            <Link to="/login" className="rounded-full border border-[#BFBD31]/40 px-6 py-2.5 text-sm font-medium text-[#BFBD31]/80 backdrop-blur-md transition-colors hover:bg-[#d4d235]/10 hover:text-white">
              Login
            </Link>
          </header>

          {/* Hero Content */}
          <div className="relative z-10 flex flex-col items-center justify-end pb-12 sm:pb-20">
            <h1 className="text-[15vw] sm:text-[12vw] font-black leading-[0.8] tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/40 uppercase pointer-events-none font-gotham">
              Adventure
            </h1>
            <div className="absolute bottom-8 flex flex-col items-center gap-2 text-[#BFBD31]/60 animate-bounce">
              <span className="text-xs uppercase tracking-widest">Scroll</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Steps Section */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-20 lg:py-28">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-medium text-white tracking-wide">Create Your Outdoor Adventure, <span className="text-[#BFBD31]">Discover With Us</span></h2>
        </div>
        
        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4">
          <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-lime-200/20 to-transparent -z-10"></div>
          
          {[
            { id: 1, title: 'Choose your location', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
            { id: 2, title: 'Pick your outdoor adventure', icon: 'M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5' },
            { id: 3, title: 'Earn points and win rewards', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
            { id: 4, title: 'We\'ll take care of the rest.', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }
          ].map((step, idx) => (
            <div key={idx} className="flex flex-col items-center gap-4 text-center group">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#BFBD31]/30 bg-slate-900/80 shadow-[0_0_15px_rgba(190,242,100,0.1)] backdrop-blur transition-transform group-hover:scale-110">
                <svg className="w-6 h-6 text-[#BFBD31]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={step.icon} />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-300 max-w-[150px]">{step.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Wonders of Nature Section */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col md:flex-row items-end justify-between mb-10 gap-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-medium text-white">The Wonders Of Nature</h2>
            <p className="text-sm text-slate-400 max-w-md">We seek to provide the authentic contact for travel far around the world.</p>
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#BFBD31]/20 text-[#BFBD31] hover:bg-[#BFBD31] hover:text-slate-900 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80', title: 'Mountain Trek', label: 'Trek' },
            { img: 'https://images.unsplash.com/photo-1426604908103-eb1e1cb8017c?auto=format&fit=crop&w=600&q=80', title: 'Havana Forest', label: 'Forest' },
            { img: 'https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=600&q=80', title: 'Wildlife Safari', label: 'Safari' },
            { img: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?auto=format&fit=crop&w=600&q=80', title: 'Half Mountain', label: 'Hike' },
          ].map((card, i) => (
            <div key={i} className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-slate-800">
              <img src={card.img} alt={card.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5 w-full">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#BFBD31]"></span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#BFBD31]">{card.label}</span>
                </div>
                <h3 className="text-lg font-medium text-white">{card.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reasons to Choose Us */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-24">
        <div className="mb-16 text-center">
          <h2 className="text-2xl font-medium text-white">Reason For Choosing Us</h2>
        </div>
        
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 text-center pt-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-lime-400/30 to-transparent hidden md:block"></div>
          
          {[
            { title: 'Tried and Trusted', text: 'Serving your excellence. Over 10 million travelers trust us for trips.', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
            { title: 'Reliable Support', text: 'Someone for you. Reach out to us anytime, via phone, email, or chat.', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' },
            { title: 'One-stop Travel Partner', text: 'You search ends here. We got your entire trip covered!', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
          ].map((feat, i) => (
            <div key={i} className="flex flex-col items-center gap-5">
              <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={feat.icon} />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">{feat.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mx-auto max-w-[250px]">{feat.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Vacation Perfect Section */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left Collage */}
          <div className="flex-1 w-full grid grid-cols-2 gap-4 lg:gap-6">
            <div className="flex flex-col gap-4 lg:gap-6 pt-12">
              <img src="https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=600&q=80" alt="Vacation 1" className="rounded-2xl rounded-tr-[40px] aspect-[4/5] object-cover border border-white/10 shadow-xl" />
              <img src="https://images.unsplash.com/photo-1542314831-c6a4d142104d?auto=format&fit=crop&w=600&q=80" alt="Vacation 2" className="rounded-2xl aspect-video object-cover border border-white/10 shadow-xl" />
            </div>
            <div className="flex flex-col gap-4 lg:gap-6">
              <img src="https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=600&q=80" alt="Vacation 3" className="rounded-2xl aspect-square object-cover border border-white/10 shadow-xl" />
              <img src="https://images.unsplash.com/photo-1504280390267-31dc4b64f331?auto=format&fit=crop&w=600&q=80" alt="Vacation 4" className="rounded-2xl rounded-bl-[40px] aspect-[4/5] object-cover border border-white/10 shadow-xl" />
            </div>
          </div>
          
          {/* Right Text */}
          <div className="flex-1 space-y-8 lg:max-w-md">
            <h2 className="text-3xl sm:text-4xl font-medium text-white leading-snug">
              Here's makes a vacation <br className="hidden sm:block"/> perfect for you!
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Whether you're planning a family vacation with your pet, a relaxing weekend getaway, or an adventurous excursion, vacation rentals are ideal for trips of all types. You can find everything from charming mountain cabins and lakeside lodges to breathtaking city apartments.
            </p>
            <button className="bg-[#BFBD31] hover:bg-[#BFBD31] text-slate-950 px-8 py-3.5 rounded-full font-semibold transition-transform hover:scale-105 inline-block">
              Book Now
            </button>
          </div>
        </div>
      </section>

      {/* Explore Section */}
      <section className="relative z-10 mx-auto max-w-[1200px] px-6 py-20 mb-10">
        <div className="text-center mb-16">
          <div className="relative inline-block">
            <h2 className="text-2xl font-medium text-white">Explore The Nature With Us</h2>
            <div className="absolute -bottom-3 right-0 w-2/3 h-px bg-[#BFBD31]"></div>
          </div>
        </div>
        
        <div className="relative rounded-3xl border border-[#BFBD31]/15 overflow-hidden bg-slate-900 aspect-video md:aspect-[21/9] p-8 md:p-12 flex flex-col md:flex-row justify-between" style={{
            backgroundImage: 'linear-gradient(90deg, rgba(7,16,22,0.95) 0%, rgba(7,16,22,0.4) 100%), url(https://images.unsplash.com/photo-1518182170546-076616fdcbdd?auto=format&fit=crop&w=1600&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
         }}>
           <div className="max-w-xs space-y-6 self-center">
             {[
               "Whether you're planning a family vacation with your pet, a relaxing weekend getaway. 2 million trys.",
               "Whether you're planning a family vacation with your pet, a relaxing.",
               "Vacation with your pet, a relaxing weekend."
             ].map((text, idx) => (
                <p key={idx} className={"text-sm text-slate-300/80 leading-relaxed border-l-2 border-[#BFBD31]/50 pl-4 py-1 relative"}>
                  {text}
                  {/* Visual connector lines for desktop */}
                  <span className="bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-6"></span>
                  <span className="hidden md:block absolute top-1/2 -right-[155px] w-2 h-2 rounded-full bg-[#BFBD31] -translate-y-1/2"></span>
                </p>
             ))}
           </div>
           
           <div className="hidden md:block self-end relative rounded-2xl overflow-hidden border-2 border-[#BFBD31]/30 w-72 aspect-[4/3] transform translate-y-8">
              <img src="https://images.unsplash.com/photo-1444464666168-e0d6255131f1?auto=format&fit=crop&w=600&q=80" alt="Featured Nature" className="w-full h-full object-cover"/>
           </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-10 p-6 md:p-10 text-center">
         <p className="text-sm text-slate-500">� 2026 SmartTrip Theme. Adventure awaits.</p>
      </footer>
    </div>
  );
}
