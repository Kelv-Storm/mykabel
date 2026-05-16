"use client";

import React from 'react';

export default function Sidebar({ activeTab, setActiveTab, onLogout }) {
const tabs = [
    { id: 'profile', label: 'My Profile' },
    { id: 'ai-matching', label: 'AI Matching' },
    { id: 'roadmap', label: 'Prerequisite Roadmap' },
  
    { id: 'chatbot', label: 'AI Chatbot' }
  ];
    
  return (
    <aside className="w-64 bg-slate-900/40 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col z-20 h-screen fixed">
      <div className="mb-10 px-4">
        <h1 className="text-2xl font-black text-white tracking-tighter">
          MyKabel<span className="text-amber-500 animate-pulse">|</span>
        </h1>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Ecosystem Matrix Router</p>
      </div>
      
      <nav className="space-y-1.5 flex-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 text-sm font-bold ${
              activeTab === tab.id 
                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.08)]' 
                : 'text-slate-500 hover:bg-slate-800/40 hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <button
        onClick={onLogout}
        className="w-full mt-auto px-4 py-3 rounded-xl text-left text-xs font-bold uppercase tracking-wider text-red-400/60 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/10 transition-all"
      >
        🚪 Sign Out
      </button>
    </aside>
  );
}
