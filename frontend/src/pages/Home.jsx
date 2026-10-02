import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAction = () => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/bookings');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="relative min-h-[85vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 animate-slideup overflow-hidden">
      {/* Dynamic Animated Ambient Background */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden select-none">
        {/* Animated Floating Gradient Orb 1 (Top Left) */}
        <div className="absolute -top-24 -left-20 w-[480px] h-[480px] rounded-full bg-gradient-to-br from-orange-400/25 via-amber-300/15 to-transparent blur-3xl animate-float-orb-1" />

        {/* Animated Floating Gradient Orb 2 (Top Right) */}
        <div className="absolute top-10 -right-24 w-[450px] h-[450px] rounded-full bg-gradient-to-bl from-orange-500/20 via-amber-400/15 to-transparent blur-3xl animate-float-orb-2" />

        {/* Animated Floating Gradient Orb 3 (Center Bottom) */}
        <div className="absolute -bottom-20 left-1/3 w-[520px] h-[520px] rounded-full bg-gradient-to-tr from-amber-400/15 via-orange-300/10 to-transparent blur-3xl animate-float-orb-3" />

        {/* Rotating Architectural Geometry Ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] border border-orange-500/10 rounded-full animate-rotate-slow pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-orange-400/40" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-400/30" />
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2 h-2 rounded-full bg-orange-500/30" />
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-3 h-3 rounded-full bg-amber-500/40" />
          {/* Inner concentric ring */}
          <div className="absolute inset-16 border border-dashed border-orange-400/10 rounded-full" />
        </div>

        {/* Subtle Decorative Floating Sparkles */}
        <div className="absolute top-28 left-[15%] w-1.5 h-1.5 rounded-full bg-orange-400/50 animate-drift-soft" />
        <div className="absolute top-44 right-[20%] w-2 h-2 rounded-full bg-amber-400/50 animate-drift-soft" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-32 left-[25%] w-1.5 h-1.5 rounded-full bg-orange-500/40 animate-drift-soft" style={{ animationDelay: '4s' }} />
      </div>

      <div className="max-w-5xl mx-auto text-center relative z-10">

        {/* Grand Headline */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight font-heading text-slate-900 leading-[1.15]">
          Discover & reserve your <br />
          <span className="bg-gradient-to-r from-district via-orange-600 to-amber-600 bg-clip-text text-transparent">
            perfect dining table
          </span>
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-sans">
          Explore real-time seating availability on our architectural floor plan. Choose panoramic skyline windows, open-air garden terrace, or the exclusive Chef's VIP pass with instant confirmation.
        </p>

        {/* CTA Buttons - pure clean typography */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleAction}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm text-white bg-district hover:bg-orange-600 transition-all active:scale-[0.99] shadow-sm"
          >
            {user ? 'Explore Floor Plan' : 'Book a Table on Floor Plan'}
          </button>

          {!user && (
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 transition-all shadow-xs"
            >
              Sign In to Your Account
            </button>
          )}
        </div>

        {/* Hero Preview Showcase Banner */}
        <div className="mt-12 relative rounded-3xl overflow-hidden border border-slate-200 shadow-2xl group max-h-[380px]">
          <img
            src="/images/hero_dining.jpg"
            alt="ReservePrime Dining Atmosphere"
            className="w-full h-[280px] sm:h-[360px] object-cover object-center group-hover:scale-[1.02] transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent flex flex-col justify-end p-6 sm:p-8 text-left">
            <span className="text-xs font-mono font-bold text-orange-300 uppercase tracking-widest mb-1">
              Architectural Floor Plan & Table Selection
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white font-heading">
              Reserve Your Exact Preferred Table in Real-Time
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              10 curated dining settings engineered for optimal acoustics, skyline sightlines, and sommelier service.
            </p>
          </div>
        </div>

        {/* 4 Curated Dining Spaces with Editorial Photography */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          {/* Zone 1 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card hover:border-slate-300 hover:shadow-lg transition-all overflow-hidden flex flex-col">
            <div className="h-36 overflow-hidden relative">
              <img
                src="/images/zone_window.jpg"
                alt="Window Alcove"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-slate-950/70 backdrop-blur-xs text-[10px] font-mono font-bold text-sky-300 uppercase tracking-wider">
                Zone 01 / North
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 font-heading">Window Alcove</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Double-height architectural glass overlooking the evening city skyline.</p>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 mt-3 block">Tables 1–2 • Up to 2 Guests</span>
            </div>
          </div>

          {/* Zone 2 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card hover:border-slate-300 hover:shadow-lg transition-all overflow-hidden flex flex-col">
            <div className="h-36 overflow-hidden relative">
              <img
                src="/images/zone_terrace.jpg"
                alt="Garden Terrace"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-slate-950/70 backdrop-blur-xs text-[10px] font-mono font-bold text-emerald-300 uppercase tracking-wider">
                Zone 02 / Alfresco
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 font-heading">Garden Terrace</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Open-air teakwood veranda with starlight fire pits and ambient greenery.</p>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 mt-3 block">Tables 3–4 • Up to 4 Guests</span>
            </div>
          </div>

          {/* Zone 3 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card hover:border-slate-300 hover:shadow-lg transition-all overflow-hidden flex flex-col">
            <div className="h-36 overflow-hidden relative">
              <img
                src="/images/zone_main.jpg"
                alt="Main Dining Hall"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-slate-950/70 backdrop-blur-xs text-[10px] font-mono font-bold text-orange-300 uppercase tracking-wider">
                Zone 03 / Reserve
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 font-heading">Main Dining Hall</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Bespoke crystal chandeliers, acoustics, and rare vintage wine cellar.</p>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 mt-3 block">Tables 5–8 • Up to 6 Guests</span>
            </div>
          </div>

          {/* Zone 4 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card hover:border-slate-300 hover:shadow-lg transition-all overflow-hidden flex flex-col">
            <div className="h-36 overflow-hidden relative">
              <img
                src="/images/zone_chef.jpg"
                alt="Chef's VIP Pass"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-slate-950/70 backdrop-blur-xs text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider">
                Zone 04 / Exclusive
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 font-heading">Chef's VIP Pass</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Dedicated sommelier, open kitchen expo view, and exclusive tasting flights.</p>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 mt-3 block">Tables 9–10 • Up to 8 Guests</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}