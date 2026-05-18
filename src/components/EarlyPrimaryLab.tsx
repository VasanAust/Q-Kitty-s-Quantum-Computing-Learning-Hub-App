import { useState, useReducer, useMemo, useEffect, useRef } from 'react';
import EarlyPrimarySidebar from './EarlyPrimarySidebar';
import EarlyPrimarySimulationArea from './EarlyPrimarySimulationArea';
import EarlyPrimaryChatbot from './EarlyPrimaryChatbot';
import { SimulationType, UserProgress } from '../App';
import { ArrowLeft } from 'lucide-react';
import { curriculumReducer, buildDynamicSystemPrompt } from '../curriculum/curriculumEngine';
import { earlyPrimaryCurriculum } from '../curriculum/earlyPrimaryCurriculum';
import { BASE_SYSTEM_INSTRUCTION } from '../lib/geminiAgentEarlyPrimary';
import { usePersistedProgress, clearProgress, logSessionEvent } from '../hooks/usePersistedProgress';
import TeacherView, { SessionLog } from './EarlyPrimary/TeacherView';

interface EarlyPrimaryLabProps {
  onBack: () => void;
}

export default function EarlyPrimaryLab({ onBack }: EarlyPrimaryLabProps) {
  const [activeSimulation, setActiveSimulation] = useState<SimulationType>('none');
  const [progress, setProgress] = usePersistedProgress('early_primary');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTeacherViewOpen, setIsTeacherViewOpen] = useState(false);

  // Session Tracking Refs
  const sessionStartTimeRef = useRef<number>(Date.now());
  const topicsVisitedRef = useRef<Set<string>>(new Set());
  const questionsAskedRef = useRef<number>(0);
  const stickersEarnedRef = useRef<Set<string>>(new Set());

  // Secret Gesture Refs
  const tapCountRef = useRef<number>(0);
  const lastTapTimeRef = useRef<number>(0);

  const handleKittyTap = () => {
    const now = Date.now();
    if (now - lastTapTimeRef.current < 3000) {
      tapCountRef.current += 1;
    } else {
      tapCountRef.current = 1;
    }
    lastTapTimeRef.current = now;

    if (tapCountRef.current >= 5) {
      setIsTeacherViewOpen(true);
      tapCountRef.current = 0;
    }
  };

  useEffect(() => {
    return () => {
      // Save session log on unmount
      const durationMs = Date.now() - sessionStartTimeRef.current;
      const durationMinutes = Math.max(1, Math.round(durationMs / 60000));
      
      const newLog: SessionLog = {
        date: new Date().toISOString(),
        durationMinutes,
        topicsVisited: Array.from(topicsVisitedRef.current),
        stickersEarned: Array.from(stickersEarnedRef.current),
        questionsAsked: questionsAskedRef.current,
        correctAnswers: 0 // Placeholder
      };

      const existingLogsRaw = localStorage.getItem('qkitty_ep_session_logs');
      let logs: SessionLog[] = [];
      if (existingLogsRaw) {
        try {
          logs = JSON.parse(existingLogsRaw);
        } catch (e) {}
      }
      logs.push(newLog);
      localStorage.setItem('qkitty_ep_session_logs', JSON.stringify(logs));
    };
  }, []);

  const [curriculumState, dispatch] = useReducer(curriculumReducer, {
    topics: earlyPrimaryCurriculum,
    currentTopicIndex: 0,
    completedTopicIds: new Set<string>(),
    mode: 'guided' as 'guided' | 'free'
  });

  const systemInstruction = useMemo(() => buildDynamicSystemPrompt(BASE_SYSTEM_INSTRUCTION, curriculumState), [curriculumState]);

  // Sync simulation to current topic initially
  useEffect(() => {
    if (curriculumState.mode === 'guided' && curriculumState.topics[curriculumState.currentTopicIndex]) {
       const topic = curriculumState.topics[curriculumState.currentTopicIndex];
       const sim = topic.simulationType as SimulationType;
       setActiveSimulation(sim);
       if (sim !== 'none') {
         logSessionEvent('simulation', sim);
         topicsVisitedRef.current.add(topic.title);
       }
    }
  }, [curriculumState.currentTopicIndex, curriculumState.mode, curriculumState.topics]);

  const awardPoints = (amount: number) => {
    setProgress((prev) => ({ ...prev, points: prev.points + amount }));
  };

  const awardBadge = (badge: string) => {
    logSessionEvent('badge', badge);
    stickersEarnedRef.current.add(badge);
    setProgress((prev) => {
      if (prev.badges.includes(badge)) return prev;
      return { ...prev, badges: [...prev.badges, badge] };
    });
  };

  return (
    <div 
      className="flex flex-col md:flex-row h-screen text-slate-800 font-sans overflow-hidden bg-[#f8f9ff]"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Mobile Overlay for Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] md:hidden" onClick={() => setIsSidebarOpen(false)}>
          <div className="w-80 h-full flex" onClick={(e) => e.stopPropagation()}>
            <EarlyPrimarySidebar progress={progress} onBack={onBack} onClose={() => setIsSidebarOpen(false)} onKittyTap={handleKittyTap} />
          </div>
        </div>
      )}

      <div className="absolute top-4 left-4 z-50 md:hidden flex gap-2">
        <button onClick={onBack} aria-label="Back to Quantum Hub" className="flex items-center gap-2 p-2.5 bg-white/60 backdrop-blur rounded-2xl shadow-lg text-indigo-700 border border-white/80 focus:ring-4 focus:ring-indigo-200 focus:outline-none">
           <ArrowLeft size={20} aria-hidden="true" />
           <span className="font-bold">Back to Quantum Hub</span>
        </button>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 bg-white/60 backdrop-blur rounded-2xl shadow-lg text-indigo-700 border border-white/80 font-bold text-xs uppercase tracking-wider px-4">
           Progress
        </button>
      </div>

      <EarlyPrimarySidebar progress={progress} onBack={onBack} onKittyTap={handleKittyTap} className="hidden md:flex" />
      
      {/* Mobile Header */}
      <div className="md:hidden flex flex-col items-center pt-16 pb-4 px-4 bg-transparent shrink-0 z-10 w-full">
        <h1 
          className="font-black text-2xl bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent drop-shadow-sm text-center select-none cursor-pointer"
          onClick={handleKittyTap}
        >
          ✨ Q-Kitty's Lab ✨
        </h1>
        <div className="mt-2 flex gap-3 items-center bg-white/60 backdrop-blur px-5 py-2.5 rounded-full border-2 border-white/80 shadow-md">
          <div className="text-sm font-black text-purple-700">{progress.points} XP ⭐️</div>
          {progress.badges.length > 0 && (
             <div className="text-sm font-black text-pink-500 flex items-center gap-1">
               <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse"></span>
               🏅 {progress.badges.length}
             </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden p-3 md:p-4 gap-3 md:gap-4">
        <div className="h-[35%] md:h-3/5 shrink-0 bg-white/20 rounded-[2.5rem] border-4 border-white/40 shadow-xl relative flex items-center justify-center overflow-hidden backdrop-blur-sm">
            <EarlyPrimarySimulationArea activeSimulation={activeSimulation} />
        </div>
        <div className="flex-1 overflow-hidden bg-white/20 rounded-[2.5rem] border-4 border-white/40 shadow-xl flex flex-col backdrop-blur-sm">
            <EarlyPrimaryChatbot 
              onAwardPoints={awardPoints} 
              onAwardBadge={awardBadge} 
              onSetSimulation={(sim) => {
                setActiveSimulation(sim);
                // Also track as topic if it's a specific simulation
                if (sim !== 'none') topicsVisitedRef.current.add(sim);
              }} 
              systemInstruction={systemInstruction}
              onMessageSent={() => {
                questionsAskedRef.current += 1;
              }}
              onCompleteTopic={() => {
                dispatch({ type: 'COMPLETE_TOPIC' });
                dispatch({ type: 'ADVANCE' });
              }}
              onSetFreeMode={() => dispatch({ type: 'SET_FREE_MODE' })}
            />
        </div>
      </div>

      {isTeacherViewOpen && (
        <TeacherView onClose={() => setIsTeacherViewOpen(false)} />
      )}
    </div>
  );
}
