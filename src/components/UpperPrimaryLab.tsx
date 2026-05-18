import { useState, useReducer, useMemo, useEffect } from 'react';
import UpperPrimarySidebar from './UpperPrimarySidebar';
import UpperPrimarySimulationArea from './UpperPrimarySimulationArea';
import UpperPrimaryChatbot from './UpperPrimaryChatbot';
import MissionBriefing from './UpperPrimary/MissionBriefing';
import { UserProgress } from '../App';
import { ArrowLeft } from 'lucide-react';
import { curriculumReducer, buildDynamicSystemPrompt } from '../curriculum/curriculumEngine';
import { upperPrimaryCurriculum } from '../curriculum/upperPrimaryCurriculum';
import { BASE_SYSTEM_INSTRUCTION } from '../lib/geminiAgentUpperPrimary';
import { usePersistedProgress, clearProgress, logSessionEvent } from '../hooks/usePersistedProgress';

export type UpperPrimarySimulationType = 'none' | 'interference' | 'measurement' | 'entanglement';

interface UpperPrimaryLabProps {
  onBack: () => void;
}

export default function UpperPrimaryLab({ onBack }: UpperPrimaryLabProps) {
  const [activeSimulation, setActiveSimulation] = useState<UpperPrimarySimulationType>('none');
  const [progress, setProgress] = usePersistedProgress('upper_primary');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showBriefing, setShowBriefing] = useState(true);
  const [lastShownTopicIndex, setLastShownTopicIndex] = useState(0);

  const [curriculumState, dispatch] = useReducer(curriculumReducer, {
    topics: upperPrimaryCurriculum,
    currentTopicIndex: 0,
    completedTopicIds: new Set<string>(),
    mode: 'guided' as 'guided' | 'free'
  });

  const systemInstruction = useMemo(() => buildDynamicSystemPrompt(BASE_SYSTEM_INSTRUCTION, curriculumState), [curriculumState]);

  useEffect(() => {
    if (curriculumState.currentTopicIndex !== lastShownTopicIndex) {
      setShowBriefing(true);
      setLastShownTopicIndex(curriculumState.currentTopicIndex);
    }
  }, [curriculumState.currentTopicIndex, lastShownTopicIndex]);

  // Sync simulation to current topic initially
  useEffect(() => {
    if (curriculumState.mode === 'guided' && curriculumState.topics[curriculumState.currentTopicIndex]) {
       const sim = curriculumState.topics[curriculumState.currentTopicIndex].simulationType as UpperPrimarySimulationType;
       setActiveSimulation(sim);
    }
  }, [curriculumState.currentTopicIndex, curriculumState.mode, curriculumState.topics]);

  const awardPoints = (amount: number) => {
    setProgress((prev) => ({ ...prev, points: prev.points + amount }));
  };

  const awardBadge = (badge: string) => {
    logSessionEvent('badge', badge);
    setProgress((prev) => {
      if (prev.badges.includes(badge)) return prev;
      return { ...prev, badges: [...prev.badges, badge] };
    });
  };

  return (
    <div 
      className="flex flex-col md:flex-row h-screen text-slate-800 font-sans overflow-hidden bg-[#e0e7ff]"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {showBriefing && (
        <MissionBriefing 
          mission={{
            title: curriculumState.topics[curriculumState.currentTopicIndex].title,
            briefingText: curriculumState.topics[curriculumState.currentTopicIndex].openingPrompt,
            objectives: ['Observe the simulation', 'Identify patterns', 'Complete the challenge'],
            simulationType: curriculumState.topics[curriculumState.currentTopicIndex].simulationType
          }}
          onAccept={() => setShowBriefing(false)}
          onSkip={() => setShowBriefing(false)}
        />
      )}
      
      {/* Mobile Overlay for Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] md:hidden" onClick={() => setIsSidebarOpen(false)}>
          <div className="w-80 h-full flex" onClick={(e) => e.stopPropagation()}>
            <UpperPrimarySidebar 
              progress={progress} 
              onBack={onBack} 
              onClose={() => setIsSidebarOpen(false)}
              title="Quantum Explorers"
              subtitle="Subatomic Journey! 🚀"
              topics={curriculumState.topics}
              completedTopicIds={curriculumState.completedTopicIds}
              currentTopicIndex={curriculumState.currentTopicIndex}
            />
          </div>
        </div>
      )}

      {/* Mobile Actions Overlay */}
      <div className="absolute top-4 left-4 z-50 md:hidden flex gap-2">
        <button onClick={onBack} aria-label="Back to Hub" className="p-2.5 bg-white/70 backdrop-blur rounded-2xl shadow-lg text-indigo-900 border border-white focus:ring-4 focus:ring-indigo-300">
           <ArrowLeft size={20} aria-hidden="true" />
        </button>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 bg-white/70 backdrop-blur rounded-2xl shadow-lg text-indigo-700 border border-white font-bold text-xs uppercase tracking-wider px-4">
           Explorer Log
        </button>
      </div>

      <UpperPrimarySidebar 
        progress={progress} 
        onBack={onBack} 
        title="Quantum Explorers"
        subtitle="Subatomic Journey! 🚀"
        topics={curriculumState.topics}
        completedTopicIds={curriculumState.completedTopicIds}
        currentTopicIndex={curriculumState.currentTopicIndex}
        className="hidden md:flex"
      />
      
      {/* Mobile Header */}
      <div className="md:hidden flex flex-col items-center pt-16 pb-4 px-4 bg-white/40 backdrop-blur-md border-b-4 border-white/60 shrink-0 z-10">
        <h1 className="font-black text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm text-center">
          Quantum Explorers
        </h1>
        <div className="mt-2 flex gap-3 items-center bg-white/60 px-5 py-2.5 rounded-full border-2 border-white shadow-md">
          <div className="text-sm font-black text-indigo-700">{progress.points} XP ⭐️</div>
          {progress.badges.length > 0 && (
             <div className="text-sm font-black text-blue-600 flex items-center gap-1.5 border-l border-white/50 pl-3">
               <span className="w-2 h-2 rounded-full bg-blue-400"></span>
               🏅 {progress.badges.length}
             </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden p-2 md:p-4 gap-3 md:gap-4">
        <div className="h-[35%] md:h-3/5 shrink-0 bg-white/30 backdrop-blur-md rounded-[2.5rem] border-4 border-white/50 shadow-xl relative flex items-center justify-center overflow-hidden">
            <UpperPrimarySimulationArea activeSimulation={activeSimulation} />
        </div>
        <div className="flex-1 overflow-hidden bg-white/40 backdrop-blur-md rounded-[2.5rem] border-4 border-white/50 shadow-xl flex flex-col">
            <UpperPrimaryChatbot 
              onAwardPoints={awardPoints} 
              onAwardBadge={awardBadge} 
              onSetSimulation={setActiveSimulation} 
              systemInstruction={systemInstruction}
              onCompleteTopic={() => {
                dispatch({ type: 'COMPLETE_TOPIC' });
                dispatch({ type: 'ADVANCE' });
              }}
              onSetFreeMode={() => dispatch({ type: 'SET_FREE_MODE' })}
            />
        </div>
      </div>
    </div>
  );
}
