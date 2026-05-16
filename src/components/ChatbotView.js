"use client";

import React, { useState, useEffect, useRef } from 'react';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../app/lib/firebaseConfig'; // Verified configuration path 

export default function ChatbotView({ smeProfile = {} }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const startupName = smeProfile?.startupName || "your venture";
  const industry = smeProfile?.industry || "FinTech";

  // 1. INITIALIZE & LOAD HISTORICAL MEMORY FROM FIRESTORE ON MOUNT
  useEffect(() => {
    async function loadChatMemory() {
      if (!auth.currentUser) return;
      try {
        const docRef = doc(db, "smes", auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().chatHistory) {
          setMessages(docSnap.data().chatHistory);
        } else {
          // System greeting baseline if no history exists yet
          setMessages([
            {
              role: 'assistant',
              content: `Selamat sejahtera! I am your MyKabel Advisor. I have synchronized with your profile details for ${startupName}. Ask me anything about navigating your next steps in the ${industry} ecosystem!`
            }
          ]);
        }
      } catch (err) {
        console.error("Error pulling chat memory loops:", err);
      }
    }
    loadChatMemory();
  }, [startupName, industry]);

  // Auto-scroll mechanics to keep view focused on the latest packets
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 2. DISPATCH MESSAGE & SAVE TO CLOUD MEMORY STACK
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !auth.currentUser) return;

    const userMessage = { role: 'user', content: input };
    
    // Optimistically update local state UI array
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const userDocRef = doc(db, "smes", auth.currentUser.uid);
      
      // Save user's question to Firestore memory immediately
      await updateDoc(userDocRef, {
        chatHistory: arrayUnion(userMessage)
      });

      // Pass full conversation stream to your API so the AI model reads the context memory
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage.content,
          history: [...messages, userMessage], // 👈 SENDS ENTIRE PAST CONVERSATION TO AI FOR TRUE MEMORY
          profile: smeProfile 
        }),
      });

      if (!response.ok) throw new Error("Neural generation channel dropped");
      const data = await response.json();
      
      const assistantMessage = { role: 'assistant', content: data.reply };

      // Update local state UI
      setMessages(prev => [...prev, assistantMessage]);

      // Save assistant's response to Firestore memory
      await updateDoc(userDocRef, {
        chatHistory: arrayUnion(assistantMessage)
      });

    } catch (err) {
      console.error("Chat sync crash:", err);
      setMessages(prev => [...prev, { role: 'assistant', content: "System connection latency detected. Please retry transmission." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[78vh] bg-slate-900/20 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl animate-in fade-in duration-500">
      
      {/* Dynamic Header Displaying Context States */}
      <div className="bg-slate-950/60 border-b border-white/5 p-4 flex justify-between items-center px-6">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            AI Advisory Lounge
          </h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
            Context Locked: <span className="text-amber-400">{startupName}</span> ({industry})
          </p>
        </div>
        <span className="text-[9px] font-black tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded uppercase">
          Memory State Linked 🌐
        </span>
      </div>

      {/* Message Output Terminal Stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gradient-to-b from-transparent to-slate-950/20">
        {messages.map((msg, idx) => (
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

      {/* Input Action Form Tray */}
      <form onSubmit={handleSendMessage} className="p-4 bg-slate-950/40 border-t border-white/5 flex gap-3 px-6 items-center">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          placeholder={`Ask specific strategic questions about expanding your ${industry} business...`}
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
