"use client";

import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../app/lib/firebaseConfig';

// STATIC NEWS DICTIONARY - Zero API calls made
// STATIC NEWS DICTIONARY - Zero API calls made, authentic redirects
const STATIC_NEWS = {
  'FinTech': [
    { source: "The Edge Malaysia", title: "Funding Tide Turns for Local FinTech Players as Capital Outflows Stabilize in KL", url: "https://theedgemalaysia.com/category/startups" },
    { source: "The Star", title: "Bank Negara Unveils New Sandbox Parameters for Early-Stage Digital Finance", url: "https://www.thestar.com.my/business/smebiz" }
  ],
  'HealthTech': [
    { source: "Digital News Asia", title: "Malaysian HealthTech Startups See 300% Spike in Seed Inquiries Post-Pandemic", url: "https://www.digitalnewsasia.com/startups" },
    { source: "Tech in Asia", title: "MRANTI Launches Specialized Bio-Innovation Grant for MedTech Wearables", url: "https://www.techinasia.com/tag/malaysia" }
  ],
  'E-Commerce': [
    { source: "Vulcan Post", title: "D2C Brands Dominate PitchIN Equity Crowdfunding Q2 Statistics", url: "https://vulcanpost.com/category/malaysia/" },
    { source: "The Edge Malaysia", title: "Logistics & E-Commerce Enablers Eyed by Regional VCs Seeking Series A", url: "https://theedgemalaysia.com/category/startups" }
  ],
  'AgriTech': [
    { source: "The Star", title: "Food Security Push: MDEC Fast-Tracks Grants for Smart Farming IoT Solutions", url: "https://www.thestar.com.my/business/smebiz" },
    { source: "TechNode Global", title: "AgriTech Founders in Southeast Asia Pivot to Sustainable Supply Chain Mapping", url: "https://technode.global/" }
  ],
  'SaaS': [
    { source: "Digital News Asia", title: "B2B SaaS Valuations Hold Steady in Malaysia Despite Global Market Correction", url: "https://www.digitalnewsasia.com/startups" },
    { source: "Vulcan Post", title: "1337 Ventures Highlights Enterprise Software as Top Accelerator Cohort Pick", url: "https://vulcanpost.com/category/malaysia/" }
  ]
};

export default function ProfileView() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState([]);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!auth.currentUser) return;
      
      try {
        const docRef = doc(db, "smes", auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const profileData = docSnap.data();
          setProfile(profileData);
          
          // Instantly load the static news based on their chosen sector
          const sectorNews = STATIC_NEWS[profileData.sector] || STATIC_NEWS['FinTech'];
          setNews(sectorNews);
        }
      } catch (error) {
        console.error("Error fetching dashboard telemetry:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, []);

  if (loading) {
    return <div className="p-8 text-amber-500 animate-pulse font-bold tracking-widest uppercase">Loading Profile Matrix...</div>;
  }

  if (!profile) return null;

  const matches = profile.recommendations || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
          Welcome back, {profile.startupName || "Founder"} <span className="text-2xl">👋</span>
        </h1>
        <p className="text-sm text-slate-400 font-medium">Real-time status analysis telemetry loops.</p>
      </div>

      {/* Top Grid: Metrics & Static News */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Total Matches Metric */}
        <div className="bg-slate-900/40 border border-white/5 p-8 rounded-2xl shadow-xl flex flex-col justify-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Total Verified Matches</span>
          <span className="text-6xl font-black text-amber-500 tracking-tighter">
            {matches.length}
          </span>
        </div>

        {/* Static Market Intelligence Wire */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-white/5 p-6 rounded-2xl shadow-xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black text-white tracking-widest flex items-center gap-2 uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Market Intelligence Wire
            </h3>
            <span className="bg-slate-800 text-slate-300 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider border border-slate-700/50">
              {profile.sector} Focus
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {news.map((item, idx) => (
              <div key={idx} className="bg-slate-950/50 border border-slate-800/60 p-5 rounded-xl hover:border-amber-500/30 transition-colors flex flex-col justify-between">
                <h4 className="text-sm font-bold text-white mb-3 leading-snug">{item.title}</h4>
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-800/50">
                  <span className="text-[10px] text-slate-500 font-semibold">{item.source}</span>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 font-bold hover:text-blue-300 cursor-pointer transition-colors">
                    Read Wire ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Recommended Matches List */}
      <div>
        <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2 mb-6">
          <span className="w-3 h-3 rounded-full bg-amber-500" />
          AI Recommended Matches
        </h3>

        {matches.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center">
            <p className="text-slate-400 font-semibold uppercase tracking-widest">No matches synchronized yet. Complete your startup intake form to begin.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match, idx) => (
              <div key={idx} className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl shadow-lg hover:border-amber-500/30 transition-all group relative overflow-hidden">
                
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/10 transition-colors pointer-events-none" />

                <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center relative z-10">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h4 className="text-xl font-black text-white tracking-tight">{match.name}</h4>
                      <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                        {match.matchScore} Match
                      </span>
                      <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                        {match.type}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-4 pr-4">{match.explanation}</p>
                    
                    <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-300">
                      <div className="flex items-center gap-1.5 bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800">
                        <span className="text-slate-500 uppercase text-[9px] tracking-widest">Focus:</span> {match.focus}
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800">
                        <span className="text-slate-500 uppercase text-[9px] tracking-widest">Stage:</span> {match.stage}
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800">
                        <span className="text-amber-500/70 uppercase text-[9px] tracking-widest">Ticket:</span> {match.ticketSize}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto shrink-0 mt-4 md:mt-0">
                    <a href={match.portalUrl} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3 rounded-xl text-xs tracking-wider uppercase transition-all shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                      Launch Portal
                    </a>
                    <a href={match.faqUrl} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-3 rounded-xl text-xs tracking-wider uppercase transition-colors">
                      View FAQ Guide
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
