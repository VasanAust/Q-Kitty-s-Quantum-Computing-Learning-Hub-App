import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Monitor, Settings, TrendingUp, Users, GraduationCap, CheckCircle2, XCircle, LogIn } from 'lucide-react';
import { getStorageKey, ModuleKey } from '../hooks/usePersistedProgress';
import { supabase, isSupabaseConfigured, isDemoMode } from '../lib/supabase';

export type CategoryType = 'early_primary' | 'upper_primary' | 'middle_school' | 'upper_secondary';

interface LandingPageProps {
  onSelectCategory: (category: CategoryType) => void;
}

export default function LandingPage({ onSelectCategory }: LandingPageProps) {
  const navigate = useNavigate();
  const [classCode, setClassCode] = useState(localStorage.getItem('qkitty_class_code') || '');
  const [isJoining, setIsJoining] = useState(false);
  const [joinStatus, setJoinStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [joinedClassName, setJoinedClassName] = useState<string | null>(null);

  const getProgressSummary = (moduleKey: ModuleKey) => {
    const stored = localStorage.getItem(getStorageKey(moduleKey));
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.points > 0 || (parsed.badges && parsed.badges.length > 0)) {
          return `${parsed.points || 0} XP • ${parsed.badges?.length || 0} badges`;
        }
      } catch (e) {
        console.error(`Failed to parse progress for summary of ${moduleKey}`, e);
      }
    }
    return null;
  };

  const handleJoinClass = async () => {
    if (!classCode || classCode.length !== 6) return;
    setIsJoining(true);
    setJoinStatus('idle');

    if (isDemoMode && classCode === 'QUAN01') {
      localStorage.setItem('qkitty_class_code', 'QUAN01');
      setJoinedClassName('Quantum Explorers A (Demo)');
      setJoinStatus('success');
      setTimeout(() => setJoinStatus('idle'), 3000);
      setIsJoining(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('classrooms')
        .select('name')
        .eq('code', classCode.toUpperCase())
        .single();

      if (error || !data) {
        setJoinStatus('error');
      } else {
        localStorage.setItem('qkitty_class_code', classCode.toUpperCase());
        setJoinedClassName(data.name);
        setJoinStatus('success');
        setTimeout(() => setJoinStatus('idle'), 3000);
      }
    } catch (e) {
      setJoinStatus('error');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveClass = () => {
    localStorage.removeItem('qkitty_class_code');
    setClassCode('');
    setJoinedClassName(null);
  };

  return (
    <div className="min-h-screen bg-[#7b8cfb] font-sans flex flex-col items-center py-10 md:py-16 px-4 md:px-12 relative overflow-hidden">
      
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-10 left-10 w-64 h-64 border-4 border-white rounded-full" />
        <div className="absolute bottom-20 right-10 w-96 h-96 border-8 border-white rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/30 rounded-full" />
      </div>

      <div className="w-full max-w-6xl relative z-10 flex flex-col items-center">
        <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-900/10">
              <GraduationCap className="text-[#7b8cfb] w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight">
                Q-Kitty's
                {isDemoMode && <span className="ml-3 text-xs bg-amber-500 text-black px-2 py-0.5 rounded-md align-middle uppercase tracking-widest">Demo</span>}
              </h1>
              <p className="text-white/80 font-bold uppercase tracking-widest text-xs">Quantum Computing Learning Hub App</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-4 shadow-xl border border-white/50 flex flex-col gap-4 w-full md:w-auto">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-indigo-500 rounded-lg text-white">
                  <Users size={16} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-900">Student Classroom</span>
              </div>
              
              {!localStorage.getItem('qkitty_class_code') ? (
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    maxLength={6}
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                    placeholder="CODE"
                    className="bg-white border-2 border-indigo-100 rounded-xl px-4 py-2 w-24 font-black tracking-widest focus:outline-none focus:border-indigo-400 text-indigo-900 transition-all"
                  />
                  <button 
                    onClick={handleJoinClass}
                    disabled={isJoining || classCode.length !== 6}
                    className="bg-[#7b8cfb] hover:bg-indigo-600 text-white font-black px-6 py-2 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50"
                  >
                    JOIN
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">Sync Active</span>
                    <span className="text-xs font-bold text-indigo-900 tracking-tight">{localStorage.getItem('qkitty_class_code')}</span>
                  </div>
                  <button 
                    onClick={handleLeaveClass}
                    className="p-1.5 text-rose-400 hover:text-rose-600 transition-colors"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              )}
              
              <AnimatePresence>
                {joinStatus === 'success' && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-emerald-600 text-[10px] font-black">
                    <CheckCircle2 size={12} /> Joined {joinedClassName}!
                  </motion.div>
                )}
                {joinStatus === 'error' && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-rose-500 text-[10px] font-black">
                    <XCircle size={12} /> Invalid class code.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={() => navigate('/teacher')}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#253245] hover:bg-[#1a2b4b] text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              <LogIn size={14} />
              Teacher Portal
            </button>
          </div>
        </div>

        <div className="relative max-w-5xl w-full">
        {/* Central connecting circle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white rounded-full hidden items-center justify-center shadow-xl z-20 border-[12px] border-[#aab5ff] md:flex">
          <Monitor size={48} className="text-[#3b415a]" aria-hidden="true" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          
          {/* Card 1: Early Primary */}
          <motion.div 
            whileHover={{ y: -5 }}
            onClick={() => onSelectCategory('early_primary')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectCategory('early_primary'); }}
            role="button"
            tabIndex={0}
            aria-label="Select Early Primary phase"
            className="bg-white rounded-3xl p-6 md:p-8 pt-10 md:pt-12 relative shadow-lg cursor-pointer hover:shadow-2xl transition-all h-full focus:ring-4 focus:ring-[#e86014] focus:outline-none"
          >
            <div className="absolute -top-4 rounded-t-xl rounded-bl-xl left-6 md:left-8 bg-[#e86014] text-white text-xs font-bold px-4 md:px-6 py-2 shadow-sm text-center">
              <span className="tracking-widest opacity-90 text-[10px]">PHASE</span><br/>
              <span className="text-lg md:text-xl">01</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6 mt-4 text-center sm:text-left">
              <div className="p-3 md:p-4 bg-[#fff3e6] border-2 border-[#ffdbb8] rounded-2xl text-[#e86014] shrink-0">
                <Settings size={36} className="w-8 h-8 md:w-9 md:h-9" strokeWidth={1.5} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-[#1a2b4b] mb-2 md:mb-3">Early Primary</h2>
                <p className="text-[#647187] leading-relaxed text-sm md:text-[15px]">
                  Q-Kitty's Lab: Playful introduction to quantum concepts using magic boxes, spinning coins, and connected stars. Ages 5-8.
                </p>
                {getProgressSummary('early_primary') && (
                  <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-[#e86014] opacity-80">
                    {getProgressSummary('early_primary')}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Card 2: Upper Primary */}
          <motion.div 
            whileHover={{ y: -5 }}
            onClick={() => onSelectCategory('upper_primary')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectCategory('upper_primary'); }}
            role="button"
            tabIndex={0}
            aria-label="Select Upper Primary phase"
            className="bg-white rounded-3xl p-6 md:p-8 pt-10 md:pt-12 relative shadow-lg cursor-pointer hover:shadow-2xl transition-all h-full focus:ring-4 focus:ring-[#df2323] focus:outline-none"
          >
             <div className="absolute -top-4 rounded-t-xl rounded-br-xl right-6 md:right-8 bg-[#df2323] text-white text-xs font-bold px-4 md:px-6 py-2 shadow-sm text-center">
              <span className="tracking-widest opacity-90 text-[10px]">PHASE</span><br/>
              <span className="text-lg md:text-xl">02</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6 mt-4 text-center sm:text-left">
              <div className="p-3 md:p-4 bg-[#ffecec] border-2 border-[#ffc2c2] rounded-2xl text-[#df2323] shrink-0">
                <TrendingUp size={36} className="w-8 h-8 md:w-9 md:h-9" strokeWidth={1.5} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-[#1a2b4b] mb-2 md:mb-3">Upper Primary</h2>
                <p className="text-[#647187] leading-relaxed text-sm md:text-[15px]">
                  Quantum Explorers: Discover the rules of the quantum world through interactive puzzles and fundamental physics. Ages 9-11.
                </p>
                {getProgressSummary('upper_primary') && (
                  <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-[#df2323] opacity-80">
                    {getProgressSummary('upper_primary')}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Card 3: Middle School */}
          <motion.div 
            whileHover={{ y: -5 }}
            onClick={() => onSelectCategory('middle_school')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectCategory('middle_school'); }}
            role="button"
            tabIndex={0}
            aria-label="Select Middle School phase"
            className="bg-white rounded-3xl p-6 md:p-8 pt-10 md:pt-12 relative shadow-lg cursor-pointer hover:shadow-2xl transition-all h-full focus:ring-4 focus:ring-[#04866f] focus:outline-none"
          >
            <div className="absolute -top-4 rounded-t-xl rounded-bl-xl left-6 md:left-8 bg-[#04866f] text-white text-xs font-bold px-4 md:px-6 py-2 shadow-sm text-center">
              <span className="tracking-widest opacity-90 text-[10px]">PHASE</span><br/>
              <span className="text-lg md:text-xl">03</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6 mt-4 text-center sm:text-left">
              <div className="p-3 md:p-4 bg-[#e6fbf7] border-2 border-[#bdf3e8] rounded-2xl text-[#04866f] shrink-0">
                <Users size={36} className="w-8 h-8 md:w-9 md:h-9" strokeWidth={1.5} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-[#1a2b4b] mb-2 md:mb-3">Middle School</h2>
                <p className="text-[#647187] leading-relaxed text-sm md:text-[15px]">
                  Quantum Mechanics Studio: Dive deeper into wave-particle duality, probability amplitudes, and introductory circuits. Ages 12-14.
                </p>
                {getProgressSummary('middle_school') && (
                  <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-[#04866f] opacity-80">
                    {getProgressSummary('middle_school')}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Card 4: Upper Secondary */}
          <motion.div 
            whileHover={{ y: -5 }}
            onClick={() => onSelectCategory('upper_secondary')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectCategory('upper_secondary'); }}
            role="button"
            tabIndex={0}
            aria-label="Select Upper Secondary phase"
            className="bg-white rounded-3xl p-6 md:p-8 pt-10 md:pt-12 relative shadow-lg cursor-pointer hover:shadow-2xl transition-all h-full focus:ring-4 focus:ring-[#253245] focus:outline-none"
          >
            <div className="absolute -top-4 rounded-t-xl rounded-br-xl right-6 md:right-8 bg-[#253245] text-white text-xs font-bold px-4 md:px-6 py-2 shadow-sm text-center">
              <span className="tracking-widest opacity-90 text-[10px]">PHASE</span><br/>
              <span className="text-lg md:text-xl">04</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6 mt-4 text-center sm:text-left">
              <div className="p-3 md:p-4 bg-[#f1f5f9] border-2 border-[#e2e8f0] rounded-2xl text-[#253245] shrink-0">
                <GraduationCap size={36} className="w-8 h-8 md:w-9 md:h-9" strokeWidth={1.5} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-[#1a2b4b] mb-2 md:mb-3">Upper Secondary</h2>
                <p className="text-[#647187] leading-relaxed text-sm md:text-[15px]">
                  Advanced Quantum Algorithms: Learn about Shor's, Grover's, and build real quantum circuits using simulated hardware. Ages 15-18.
                </p>
                {getProgressSummary('upper_secondary') && (
                  <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-[#253245] opacity-80">
                    {getProgressSummary('upper_secondary')}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

        </div>
        </div>
      </div>
    </div>
  );
}
