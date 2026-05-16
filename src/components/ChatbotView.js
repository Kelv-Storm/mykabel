"use client";

import React, { useState, useEffect, useRef } from 'react';

export default function ChatbotView({ smeProfile }) {
  const profile = smeProfile || {};
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const startupName = profile.startupName || "your venture";
  const industry = profile.industry || "FinTech";

  // 1. INITIALIZE WELCOME MESSAGE LOCALLY (NO FIRESTORE CALLS)
  useEffect(() => {
    setMessages([{
      role: 'assistant',
      content: `Selamat sejahtera! I am your MyKabel Advisor. I have synchronized with your profile details for ${startupName}. Ask me anything about navigating your next steps in the ${industry} ecosystem!`
    }]);
  }, [startupName, industry]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const enrichedHistory = [
        { 
          role: 'system', 
          content: `CRITICAL CONTEXT: You are advising a startup named "${startupName}" in the "${industry}" industry.` 
        },
        ...messages, 
        userMessage
      ];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage.content,
          history: enrichedHistory,
          profile: profile 
        }),
      });

      // 🚨 DIAGNOSTIC UPDATE: Grab the real error details from the backend
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || `Server Status ${response.status}`);
      }
      
      const data = await response.json();
      const assistantMessage = { role: 'assistant', content: data.reply };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      console.error("Chat sync crash:", err);
      // 🚨 PRINTS THE ACTUAL CRASH REASON DIRECTLY IN THE UI
      setMessages(prev => [...prev, { role: 'assistant', content: `🚨 PIPELINE CRASH: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[78vh] bg-slate-900/20 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl animate-in fade-in duration-500">
      <div className="bg-slate-950/60 border-b border-white/5 p-4 flex justify-between items-center px-6">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            AI Advisory Lounge
          </h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
            Context Locked: <span className="text-amber-400">{startupName}</span>
          </p>
        </div>
        <span className="text-[9px] font-black tracking-widest text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded uppercase">
          Session Active ⚡
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gradient-to-b from-transparent to-slate-950/20">
        {Array.isArray(messages) && messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-200`}>
            <div className={`max-w-[75%] p-4 rounded-2xl text-xs leading-relaxed font-medium shadow-md ${
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-slate-950 font-bold rounded-tr-none' 
                : 'bg-slate-900/50 border border-white/5 text-slate-300 rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-slate-900/50 border border-white/5 text-slate-500 text-xs p-4 rounded-2xl rounded-tl-none font-bold tracking-widest">
              SYNCHRONIZING REASONING LOOPS...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 bg-slate-950/40 border-t border-white/5 flex gap-3 px-6 items-center">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          placeholder={`Ask specific strategic questions...`}
          className="flex-1 bg-slate-950 border border-slate-800 text-white rounded-xl p-4 text-xs focus:border-amber-500 focus:outline-none placeholder-slate-600 transition-colors"
        />
        <button 
          type="submit" 
          disabled={loading || !input.trim()}
          className="bg-amber-500 hover:bg-amber-400 disabled:opacity-30 text-slate-950 font-black px-6 py-4 rounded-xl text-xs tracking-wider uppercase transition-all shadow-lg flex-shrink-0"
        >
          Consult
        </button>
      </form>
    </div>
  );
}
