"use client";

import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../app/lib/firebaseConfig';

export default function StartupIntakeForm({ onComplete }) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Updated state: Swapped lookingFor out for a Business Description
  const [formData, setFormData] = useState({
    startupName: '',
    description: '', 
    sector: 'FinTech',
    stage: 'Ideation / MVP Concept',
    teamSize: '1-5',
    fundingMin: '',
    fundingMax: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const processAndSync = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (!auth.currentUser) throw new Error("Authentication missing. Please reload.");

      // Formatted payload for the AI matching engine
      const telemetryPacket = {
        startupName: formData.startupName,
        description: formData.description,
        sector: formData.sector,
        stage: formData.stage,
        teamSize: formData.teamSize,
        fundingNeededMin: formData.fundingMin, 
        fundingNeededMax: formData.fundingMax,
        lookingFor: ["Matches Generated"], // Failsafe array so your Profile UI doesn't crash
        setupComplete: true,
        createdAt: new Date().toISOString()
      };

      // Save core profile to Firebase immediately
      await setDoc(doc(db, "smes", auth.currentUser.uid), telemetryPacket, { merge: true });

      // Trigger the AI Analysis Pipeline
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(telemetryPacket)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.details || `Server Error ${response.status}: AI timeout or token limit reached.`);
      }

      const matchData = await response.json();

      // Save AI generated matches back to the profile
      await setDoc(doc(db, "smes", auth.currentUser.uid), { 
        recommendations: matchData.recommendations,
        metrics: { matches: matchData.recommendations?.length || 0 }
      }, { merge: true });

      // Success! Move to Step 3 briefly...
      setStep(3);
      
      // THE FIX: Force a hard refresh after 1.5 seconds to guarantee dashboard load
      setTimeout(() => {
        if (onComplete) onComplete();
        window.location.reload(); 
      }, 1500);

    } catch (error) {
      console.error("Pipeline Error:", error);
      setErrorMsg(error.message.includes("JSON") 
        ? "The AI model timed out while generating matches. Please hit retry." 
        : error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = "w-full bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-sm text-white focus:border-amber-500 outline-none transition-all";
  const labelStyle = "text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-2";

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] animate-in fade-in duration-500">
        <h2 className="text-xl font-black text-amber-500 tracking-widest uppercase animate-pulse mb-4">
          Syncing Cloud Matrix...
        </h2>
        <div className="w-48 h-1 bg-slate-900 rounded-full overflow-hidden">
          <div className="h-full bg-amber-500 w-1/2 animate-[ping_1.5s_inifinite_ease-in-out]" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-slate-900/40 border border-white/5 rounded-3xl shadow-2xl backdrop-blur-md">
      
      {/* Top Stepper UI */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-amber-500' : 'text-slate-600'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 1 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>1</div>
          <span className="text-xs font-bold uppercase tracking-wider">Basic Info</span>
        </div>
        <div className={`w-16 h-px ${step >= 2 ? 'bg-amber-500/50' : 'bg-slate-800'}`} />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-amber-500' : 'text-slate-600'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 2 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>2</div>
          <span className="text-xs font-bold uppercase tracking-wider">Startup Info</span>
        </div>
        <div className={`w-16 h-px ${step >= 3 ? 'bg-amber-500/50' : 'bg-slate-800'}`} />
        <div className={`flex items-center gap-2 ${step >= 3 ? 'text-amber-500' : 'text-slate-600'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 3 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>3</div>
          <span className="text-xs font-bold uppercase tracking-wider">Review & Match</span>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-semibold flex items-center justify-between">
          <span>🚨 Pipeline Failed: {errorMsg}</span>
        </div>
      )}

      {/* STEP 1: Updated with Description Field */}
      {step === 1 && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight mb-2">Entity Initialization</h2>
            <p className="text-slate-400 text-sm">Define your core enterprise identity and business model.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className={labelStyle}>Startup / Entity Name</label>
              <input type="text" name="startupName" value={formData.startupName} onChange={handleChange} placeholder="e.g. MyKabel Technologies Sdn Bhd" className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Business Description</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                placeholder="Describe your product, target audience, and current traction..." 
                className={`${inputStyle} resize-none h-32`} 
              />
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <button onClick={() => setStep(2)} disabled={!formData.startupName || !formData.description} className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black px-8 py-3 rounded-xl tracking-wider uppercase transition-all">
              Next Step &rarr;
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight mb-2">Financial & Vertical Footprint</h2>
            <p className="text-slate-400 text-sm">Configure operational thresholds for your matrix calculation pipelines.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelStyle}>Industry Vertical</label>
              <select name="sector" value={formData.sector} onChange={handleChange} className={`${inputStyle} appearance-none`}>
                {['FinTech', 'HealthTech', 'E-Commerce', 'AgriTech', 'SaaS'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelStyle}>Current Growth Stage</label>
              <select name="stage" value={formData.stage} onChange={handleChange} className={`${inputStyle} appearance-none`}>
                {['Ideation / MVP Concept', 'Pre-Seed', 'Seed', 'Series A'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelStyle}>Active Team Size</label>
              <select name="teamSize" value={formData.teamSize} onChange={handleChange} className={`${inputStyle} appearance-none`}>
                {['1-5', '6-10', '11-20', '21-50', '50+'].map(s => <option key={s} value={s}>{s} members</option>)}
              </select>
            </div>
            <div className="bg-slate-950/30 p-4 rounded-xl border border-slate-800">
              <label className={labelStyle}>Target Funding Amount (RMK)</label>
              <div className="flex items-center gap-3">
                <input type="number" name="fundingMin" value={formData.fundingMin} onChange={handleChange} placeholder="Min" className={`${inputStyle} py-2 text-center`} />
                <span className="text-slate-500 font-bold">-</span>
                <input type="number" name="fundingMax" value={formData.fundingMax} onChange={handleChange} placeholder="Max" className={`${inputStyle} py-2 text-center`} />
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-6 border-t border-slate-800/50">
            <button onClick={() => setStep(1)} className="text-slate-400 hover:text-white font-bold px-4 py-3 tracking-wider uppercase transition-colors">
              &larr; Back
            </button>
            <button onClick={processAndSync} className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-8 py-3 rounded-xl tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              Calculate Matches &rarr;
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="text-center py-12 animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">Matrix Synchronized</h2>
          <p className="text-slate-400 text-sm">Initializing your personalized dashboard...</p>
        </div>
      )}
    </div>
  );
}
