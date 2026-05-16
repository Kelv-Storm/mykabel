"use client";

import React, { useState, useEffect } from 'react';

export default function ProfileView({ userName, metrics, recommendations, smeProfile, onApply, onNavigateToChat, onNavigateToOnboarding, onNavigateToRoadmap, onNavigateToAnalytics }) {
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);

  // Fetch real-time tailored ecosystem news based on the startup's profile
  useEffect(() => {
    async function fetchLiveEcosystemNews() {
      try {
        setLoadingNews(true);
        const businessSector = smeProfile?.industry || "FinTech and Tech Startups";
        
        const response = await fetch(`/api/news?sector=${encodeURIComponent(businessSector)}`);
        if (!response.ok) throw new Error("Failed to pull fresh ecosystem wires");
        
        const data = await response.json();
        setNews(data.articles || []);
      } catch (err) {
        console.error("News Wire Error:", err);
      } finally {
        setLoadingNews(false);
      }
    }

    fetchLiveEcosystemNews();
  }, [smeProfile]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight mb-1">Welcome back, {userName || 'Founder'} 👋</h2>
          <p className="text-sm text-slate-500 font-medium">Real-time status analysis telemetry loops.</p>
        </div>
        <button 
          onClick={onNavigateToChat}
          className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-amber-400 font-bold px-5 py-3 rounded-xl text-xs tracking-wide hover:border-amber-400 hover:text-white transition-all shadow-lg flex items-center justify-center gap-2 group self-start sm:self-center"
        >
          <span>💬 Ask MyKabel AI Advisor</span>
          <span className="transform group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </header>

      {/* Dynamic Upper Section: Metric Highlight + Live News Wire */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Streamlined Total Matches Card */}
        <div className="lg:col-span-3 bg-slate-900/30 backdrop-blur-xl border border-white/5 rounded-2xl p-6 relative overflow-hidden h-full flex flex-col justify-center min-h-[140px]">
          <span className="text-xs font-bold uppercase text-slate-500 tracking-wider block mb-1">Total Verified Matches</span>
          <span className="text-5xl font-black text-amber-500 tracking-tighter">{metrics?.matches || recommendations?.length || 0}</span>
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-2xl rounded-full" />
        </div>

        {/* Live AI-Driven News Wire Module */}
        <div className="lg:col-span-9 bg-slate-900/40 border border-white/5 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Market Intelligence Wire
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Real-time macro trends mapped against your onboarded niche metrics.</p>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 bg-slate-800 px-2 py-1 rounded">
              {smeProfile?.industry || "FinTech"} Focus
            </span>
          </div>

          {loadingNews ? (
            <div className="space-y-3 py-2">
              {[1, 2].map((n) => (
                <div key={n} className="animate-pulse flex gap-4 items-center bg-slate-950/40 p-3 rounded-xl border border-white/5">
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-800 rounded w-3/4" />
                    <div className="h-2 bg-slate-900 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : news.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {news.slice(0, 2).map((item, idx) => (
                <a 
                  key={idx} 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-slate-950/40 hover:bg-slate-900/50 border border-white/5 hover:border-slate-700 p-4 rounded-xl transition-all flex flex-col justify-between group shadow-inner"
                >
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-900 text-[9px] text-slate-500 font-semibold">
                    <span>{item.source}</span>
                    <span className="text-blue-400 group-hover:translate-x-0.5 transition-transform">Read Wire ↗</span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-500 font-medium">
              Ecosystem intelligence lines clear. Mapped updates will queue here.
            </div>
          )}
        </div>

      </div>

      {/* Recommendations Cards Grid */}
      <div>
        <h3 className="text-lg font-bold text-white mb-6 tracking-tight flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          AI Recommended Matches
        </h3>

        {recommendations && recommendations.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {recommendations.map((rec, index) => {
              const scoreInt = parseInt(rec.matchScore) || 90;
              return (
                <div key={index} className="bg-slate-900/40 border border-white/5 hover:border-amber-500/20 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between group shadow-xl">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-inner">
                          {rec.name ? rec.name.charAt(0) : 'M'}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-base tracking-tight line-clamp-1">{rec.name || 'Match'}</h4>
                          <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded uppercase tracking-wider">{rec.type || 'Investor'}</span>
                        </div>
                      </div>

                      <div className="relative w-11 h-11 flex items-center justify-center flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path className="text-slate-800" strokeWidth="3px" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          <path className="text-amber-500" strokeDasharray={`${scoreInt}, 100`} strokeWidth="3px" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <span className="absolute text-[10px] font-black text-zinc-100">{scoreInt}%</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-400 mb-4 border-t border-b border-slate-800/50 py-3 my-3">
                      <div><span className="font-bold text-slate-500 inline-block w-24">Sector Focus:</span> {rec.focus || 'N/A'}</div>
                      <div><span className="font-bold text-slate-500 inline-block w-24">Stage Criteria:</span> {rec.stage || 'N/A'}</div>
                      <div><span className="font-bold text-slate-500 inline-block w-24">Ticket Limits:</span> <span className="text-emerald-400 font-semibold">{rec.ticketSize || 'N/A'}</span></div>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed min-h-[36px] mb-4">{rec.explanation || 'No description provided.'}</p>
                  </div>

                  {/* 👇 RECONFIGURED CAPTIONS & PORTAL ROUTERS FOR SCREENSHOT 3 👇 */}
                  <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-3">
                    
                    {/* Primary Interactive Match Save Vector */}
                    <button 
                      onClick={() => onApply && onApply(rec)}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-center py-3 rounded-xl text-xs tracking-wide shadow-md shadow-amber-500/10 transition-all flex items-center justify-center gap-2"
                    >
                      <span>Save & Predict Odds</span>
                      <span className="font-light">+</span>
                    </button>

                    {/* Reintroduced Official Digital Application Interface Portal Link */}
                    <a 
                      href={rec.faqUrl || "#"} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full bg-slate-950 hover:bg-slate-900 border border-white/5 hover:border-slate-800 text-slate-300 text-center py-3 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 shadow-inner"
                    >
                      <span>Visit Application Website</span>
                      <span className="text-slate-500 font-normal">↗</span>
                    </a>

                    {/* Highly Spaced Sub-Layer Institutional Support Link */}
                    <div className="pt-1.5 text-center">
                      <a 
                        href={rec.faqUrl || "#"} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-slate-600 hover:text-slate-400 transition-colors uppercase tracking-wider"
                      >
                        Read Institutional Guidelines & FAQ
                      </a>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl p-12 text-center">
            <p className="text-sm text-slate-500 font-medium mb-4">No match data detected. Onboard your business parameters.</p>
            <button onClick={onNavigateToOnboarding} className="bg-amber-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs hover:bg-amber-400 transition-all">
              Initialize Onboarding Wizard
            </button>
          </div>
        )}

        {/* Action Redirect Block */}
        {recommendations && recommendations.length > 0 && (
          <div className="mt-16 p-8 bg-slate-900/40 border border-amber-500/30 rounded-3xl text-center shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5 group-hover:opacity-100 transition-opacity" />
            <h3 className="text-2xl font-black text-white mb-2 relative z-10">Ready to take action?</h3>
            <p className="text-sm text-slate-400 mb-6 relative z-10">
              Complete your legal prerequisites, or run our AI model to predict your exact acceptance odds for your saved matches.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <button 
                onClick={onNavigateToRoadmap} 
                className="bg-slate-800 hover:bg-slate-700 text-white font-black px-8 py-4 rounded-2xl text-sm tracking-widest uppercase transition-all"
              >
                View Prerequisites 📋
              </button>
              <button 
                onClick={onNavigateToAnalytics} 
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-8 py-4 rounded-2xl text-sm tracking-widest uppercase shadow-[0_0_40px_rgba(245,158,11,0.2)] transition-all transform hover:scale-105"
              >
                Predict Approval Odds 🔮
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
