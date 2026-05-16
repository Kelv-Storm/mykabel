"use client";

import React, { useState, useEffect } from 'react';

export default function RoadmapTracker() {
  // Pre-loaded state with your requested modifications
  const [tasks, setTasks] = useState([
    { 
      id: 1, 
      category: 'LEGAL', 
      title: 'Register as Sdn Bhd (SSM)', 
      completed: true, 
      link: 'https://ezbiz.ssm.com.my/' 
    },
    { 
      id: 2, 
      category: 'FINANCIAL', 
      title: 'Open Corporate Bank Account', 
      completed: true,
      link: 'https://www.maybank2u.com.my/home/m2u/common/login.do' // <-- Added Link
    },
    { 
      id: 3, 
      category: 'LEGAL', 
      title: 'Draft Initial Cap Table', 
      completed: true,
      link: 'https://wefunder.com/cap-table' // <-- Added Link
    },
    { 
      id: 4, 
      category: 'FINANCIAL', 
      title: 'Prepare 12-Month Financial Projections', 
      completed: true,
      link: 'https://www.liveplan.com/' // <-- Added Link
    },
    { 
      id: 5, 
      category: 'TAX', 
      title: 'Register Corporate Tax Profile (MyTax)', 
      completed: true, 
      link: 'https://mytax.hasil.gov.my/' 
    }
  ]);

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const completedTasks = tasks.filter(task => task.completed).length;
    setProgress(Math.round((completedTasks / tasks.length) * 100));
  }, [tasks]);

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      
      {/* Header */}
      <header>
        <h2 className="text-3xl font-black text-white tracking-tight mb-2 flex items-center gap-3">
          Prerequisite Roadmap
          <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
        </h2>
        <p className="text-sm text-slate-400 font-medium">Complete these mandatory milestones to unlock high-tier investor matches.</p>
      </header>

      {/* Progress Bar Container */}
      <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex justify-between items-end mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Completion</span>
          <span className="text-3xl font-black text-emerald-400 tracking-tighter">{progress}%</span>
        </div>
        
        {/* Dynamic Bar */}
        <div className="w-full bg-slate-950 rounded-full h-3.5 border border-slate-800 overflow-hidden">
          <div 
            className="bg-emerald-400 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(52,211,153,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Task Checklist Grid */}
      <div className="bg-slate-900/40 border border-white/5 rounded-2xl shadow-xl overflow-hidden">
        {tasks.map((task, index) => (
          <div 
            key={task.id} 
            className={`flex items-center justify-between p-6 transition-all duration-300 group
              ${index !== tasks.length - 1 ? 'border-b border-slate-800/60' : ''} 
              ${task.completed ? 'bg-slate-900/20' : 'hover:bg-slate-800/30'}
            `}
          >
            {/* Left Side: Checkbox & Text */}
            <div className="flex items-center gap-6 flex-1 cursor-pointer" onClick={() => toggleTask(task.id)}>
              
              {/* Custom Checkbox */}
              <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 transition-all duration-200 border
                ${task.completed 
                  ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                  : 'bg-slate-950 border-slate-700 group-hover:border-amber-500/50'}`}
              >
                {task.completed && (
                  <svg className="w-4 h-4 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>

              {/* Text Info */}
              <div>
                <span className={`text-[10px] font-black uppercase tracking-wider block mb-1
                  ${task.completed ? 'text-slate-600' : 'text-amber-500'}`}
                >
                  {task.category}
                </span>
                <h4 className={`text-sm font-semibold transition-colors
                  ${task.completed ? 'text-slate-500 line-through decoration-slate-600/50' : 'text-slate-200 group-hover:text-white'}`}
                >
                  {task.title}
                </h4>
              </div>
            </div>

            {/* Right Side: External Portal Links (If applicable) */}
            {task.link && (
              <a 
                href={task.link} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()} // Prevents clicking the link from toggling the checkbox
                className={`ml-4 px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center gap-2
                  ${task.completed 
                    ? 'bg-slate-950/50 text-slate-500 border border-slate-800 hover:text-slate-300' 
                    : 'bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 shadow-lg'}`}
              >
                <span>Launch Portal</span>
                <span className="font-light text-lg leading-none mb-0.5">↗</span>
              </a>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
