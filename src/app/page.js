"use client";
import Sidebar from '../components/Sidebar';
import ProfileView from '../components/ProfileView';
import ChatbotView from '../components/ChatbotView';
import StartupIntakeForm from '../components/StartupIntakeForm';
import RoadmapTracker from '../components/RoadmapTracker';
import InvestorAnalytics from '../components/InvestorAnalytics';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from './lib/firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';

function useMousePosition() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const updateMousePosition = (ev) => {
      setMousePosition({ x: ev.clientX, y: ev.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);
  return mousePosition;
}

export default function Dashboard() {
  const router = useRouter();
  const mousePos = useMousePosition();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile'); 
  const [userName, setUserName] = useState('Founder'); 
  const [smeProfile, setSmeProfile] = useState(null);
  const [activeApplications, setActiveApplications] = useState([]);
  const [metrics, setMetrics] = useState({ matches: 0, opportunities: 0, connections: 0 });
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
      } else {
        let nameToSet = user.displayName || user.email.split('@')[0] || 'Founder';
        try {
          const docRef = doc(db, "smes", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setSmeProfile(data);
            setMetrics(data.metrics || { matches: 0, opportunities: 0, connections: 0 });
            setRecommendations(data.recommendations || []);
            if (data.founderName) nameToSet = data.founderName;
            setActiveTab('profile');
          } else {
            setActiveTab('ai-matching'); 
          }
        } catch (error) {
          console.error("Error loading user profile state mapping:", error);
          setActiveTab('ai-matching');
        }
        setUserName(nameToSet);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleFormSubmissionComplete = async (submittedData) => {
    setLoading(true);
    const user = auth.currentUser;
    if (!user) return router.push('/login');
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submittedData),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown Server Error");
        throw new Error(`Server Status ${response.status}: ${errorText}`);
      }

      const aiData = await response.json();
      const newRecs = aiData.recommendations || [];
      
      // Dynamically link matches to the exact array length, and pull AI generated counts
      const newMetrics = {
        matches: newRecs.length, 
        opportunities: aiData.opportunitiesCount || 0,
        connections: aiData.connectionsCount || 0
      };

      let cleanText = JSON.stringify(newRecs);
      // ADDED { merge: true } TO STOP IT FROM DELETING CHAT HISTORY
      await setDoc(doc(db, "smes", user.uid), {
        ...submittedData,
        metrics: newMetrics,
        recommendations: newRecs,
        userId: user.uid,
        createdAt: new Date()
      }, { merge: true });

      setSmeProfile({
        ...submittedData,
        metrics: newMetrics,
        recommendations: newRecs
      });

      setMetrics(newMetrics);
      setRecommendations(newRecs);
      setUserName(submittedData.founderName || nameToSet);
      setActiveTab('profile');

    } catch (e) {
      alert(`AI Pipeline Failed!\nReason: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };
const handleApplyToOpportunity = async (opportunity) => {
    // 1. Prevent adding the exact same company twice
    if (activeApplications.find(app => app.name === opportunity.name)) {
      setActiveTab(smeProfile?.isRegistered ? 'launch' : 'roadmap');
      return;
    }

    // 2. Format the data for the Kanban board
    const newApp = {
      id: Date.now().toString(),
      name: opportunity.name,
      type: opportunity.type || 'Opportunity',
      status: 'prep', 
      amount: opportunity.ticketSize || 'TBD',
      portalUrl: opportunity.portalUrl
    };

    const updatedApps = [...activeApplications, newApp];
    setActiveApplications(updatedApps);

    // 3. Save it to Firebase so it remembers on refresh
    // Save choice to database silently
    if (auth.currentUser) {
      await setDoc(doc(db, "smes", auth.currentUser.uid), {
        activeApplications: updatedApps
      }, { merge: true });
    }

    // Auto-route straight to Analytics so they can see their odds immediately!
    setActiveTab('analytics');
  };
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Signout termination error:", error);
    }
  }; 

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <div className="text-amber-500 animate-pulse text-xl font-bold tracking-widest uppercase">Syncing Cloud Matrix...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-300 font-sans overflow-hidden relative selection:bg-amber-500/30">
      <div 
        className="pointer-events-none fixed top-0 left-0 w-6 h-6 bg-amber-500/80 rounded-full blur-[6px] transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out z-50"
        style={{ top: mousePos.y, left: mousePos.x }}
      />

      <div className="flex relative z-10 min-h-screen">
        {/* Sidebar abstraction link hooks */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

        {/* Dynamic Margin spacing offsets content layout so sidebar does not overlap fixed components */}
        <main className="flex-1 h-screen overflow-y-auto custom-scrollbar relative z-10 pl-72 pr-12 py-12">
          
          {activeTab === 'profile' && (
            <ProfileView 
              userName={userName} 
              metrics={metrics} 
              recommendations={recommendations} 
              smeProfile={smeProfile}
              onApply={handleApplyToOpportunity} 
              onNavigateToChat={() => setActiveTab('chatbot')}
              onNavigateToOnboarding={() => setActiveTab('ai-matching')}
              onNavigateToRoadmap={() => setActiveTab('roadmap')} 
              onNavigateToAnalytics={() => setActiveTab('analytics')}
            />
          )}

          {activeTab === 'ai-matching' && (
            <div className="space-y-6 animate-in fade-in duration-400">
              <StartupIntakeForm onSubmitSuccess={handleFormSubmissionComplete} />
            </div>
          )}

          {activeTab === 'roadmap' && (
            <RoadmapTracker onCompleteRoadmap={() => setActiveTab('analytics')} />
          )}

          {activeTab === 'analytics' && (
            <InvestorAnalytics 
              activeApplications={activeApplications} 
              smeProfile={smeProfile} 
            />
          )}

          {activeTab === 'chatbot' && <ChatbotView smeProfile={smeProfile} />}

        </main>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0B1120; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}} />
    </div>
  );
}
