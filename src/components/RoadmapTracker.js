"use client";

import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../app/lib/firebaseConfig';

const DEFAULT_TASKS = [
  { id: 'incorporate', category: 'Legal', text: 'Register as Sdn Bhd (SSM)' },
  { id: 'bank', category: 'Financial', text: 'Open Corporate Bank Account' },
  { id: 'deck', category: 'Pitching', text: 'Finalize 10-Slide Pitch Deck' },
  { id: 'cap', category: 'Legal', text: 'Draft Initial Cap Table' },
  { id: 'financials', category: 'Financial', text: 'Prepare 12-Month Financial Projections' },
];

export default function RoadmapTracker() {
  const [checkedItems, setCheckedItems] = useState({});
  const [loading, setLoading] = useState(true);

  // Load saved checklist states from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "smes", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists() && docSnap.data().roadmapState) {
            setCheckedItems(docSnap.data().roadmapState);
          }
        } catch (error) {
          console.error("Error loading roadmap state:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Update Firestore instantly when a checkbox is clicked
  const handleToggle = async (taskId) => {
    const newState = {
      ...checkedItems,
      [taskId]: !checkedItems[taskId]
    };
    
    // Update UI immediately for responsiveness
    setCheckedItems(newState);

    // Save to database
    if (auth.currentUser) {
      try {
        const docRef = doc(db, "smes", auth.currentUser.uid);
        await updateDoc(docRef, { roadmapState: newState });
      } catch (error) {
        console.error("Failed to save roadmap state:", error);
      }
    }
  };

  const calculateProgress = () => {
    if (DEFAULT_TASKS.length === 0) return 0;
    const completed = DEFAULT_TASKS.filter(task => checkedItems[task.id]).length;
    return Math.round((completed / DEFAULT_TASKS.length) * 100);
  };

  if (loading) {
    return <div className="text-slate-500 animate-pulse text-sm text-center py-10">Synchronizing Prerequisite Telemetry...</div>;
  }

  const progress = calculateProgress();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-black text-white tracking-tight mb-2">Prerequisite Roadmap</h2>
        <p className="text-sm text-slate-400 font-medium">Complete these mandatory milestones to unlock high-tier investor matches.</p>
      </header>

      {/* Progress Bar Container */}
      <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-end mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Completion</span>
          <span className="text-2xl font-black text-emerald-400">{progress}%</span>
        </div>
        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist Rendering */}
      <div className="bg-slate-900/20 border border-white/5 rounded-2xl overflow-hidden shadow-lg">
        {DEFAULT_TASKS.map((task, index) => (
          <label 
            key={task.id}
            className={`flex items-center gap-4 p-5 cursor-pointer transition-colors group ${
              index !== DEFAULT_TASKS.length - 1 ? 'border-b border-white/5' : ''
            } ${checkedItems[task.id] ? 'bg-emerald-500/5 hover:bg-emerald-500/10' : 'hover:bg-slate-900/50'}`}
          >
            <div className="relative flex items-center justify-center">
              <input 
                type="checkbox" 
                checked={!!checkedItems[task.id]}
                onChange={() => handleToggle(task.id)}
                className="peer appearance-none w-6 h-6 border-2 border-slate-700 rounded-md checked:bg-emerald-500 checked:border-emerald-500 transition-colors cursor-pointer"
              />
              <svg 
                className={`absolute w-4 h-4 text-slate-950 pointer-events-none transition-transform duration-200 ${checkedItems[task.id] ? 'scale-100' : 'scale-0'}`} 
                fill="none" 
                strokeWidth="3" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-amber-500 mb-1 block">
                {task.category}
              </span>
              <span className={`text-sm font-medium transition-colors ${checkedItems[task.id] ? 'text-slate-500 line-through' : 'text-slate-200 group-hover:text-white'}`}>
                {task.text}
              </span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
