import { useState, useReducer, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import EarlyPrimarySidebar from './EarlyPrimarySidebar';
import { UserProgress } from '../App';
import { ArrowLeft, Lock, FlaskConical } from 'lucide-react';
import UpperSecondaryChatbot from './UpperSecondaryChatbot';
import UpperSecondarySimulationArea from './UpperSecondarySimulationArea';
import { GATE_BLOCH_STATES } from './UpperSecondary/BlochSphere';
import { CircuitConfig } from './UpperSecondary/CircuitBuilder';
import ProblemSetPanel from './UpperSecondary/ProblemSetPanel';
import { Problem } from '../curriculum/upperSecondaryProblemSets';
import { curriculumReducer, buildDynamicSystemPrompt } from '../curriculum/curriculumEngine';
import { upperSecondaryCurriculum } from '../curriculum/upperSecondaryCurriculum';
import { BASE_SYSTEM_INSTRUCTION } from '../lib/geminiAgentUpperSecondary';
import { usePersistedProgress, clearProgress, logSessionEvent } from '../hooks/usePersistedProgress';

export type UpperSecondarySimulationType = 'none' | 'shors' | 'grovers' | 'circuit' | 'bloch';

interface UpperSecondaryLabProps {
  onBack: () => void;
}

export default function UpperSecondaryLab({ onBack }: UpperSecondaryLabProps) {
  const [activeSimulation, setActiveSimulation] = useState<UpperSecondarySimulationType>('none');
  const [blochState, setBlochState] = useState(GATE_BLOCH_STATES['|0⟩']);
  const [circuitConfig, setCircuitConfig] = useState<CircuitConfig>([
    [null, null, null, null, null],
    [null, null, null, null, null]
  ]);
  const [progress, setProgress] = usePersistedProgress('upper_secondary');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProblemPanelOpen, setIsProblemPanelOpen] = useState(false);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [problemStatus, setProblemStatus] = useState<Record<string, { score: number, feedback: string, xpAwarded: number }>>({});
  const [externalMessage, setExternalMessage] = useState<{ text: string, timestamp: number } | undefined>(undefined);
  const [isResearchMode, setIsResearchMode] = useState(() => {
    return localStorage.getItem('qkitty_us_research_mode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('qkitty_us_research_mode', String(isResearchMode));
  }, [isResearchMode]);

  const [curriculumState, dispatch] = useReducer(curriculumReducer, {
    topics: upperSecondaryCurriculum,
    currentTopicIndex: 0,
    completedTopicIds: new Set<string>(),
    mode: 'guided' as 'guided' | 'free'
  });

  const topicsCompletedCount = curriculumState.completedTopicIds.size;
  const canUnlockResearch = progress.points >= 500 && topicsCompletedCount >= 4;

  const systemInstruction = useMemo(() => {
    let base = buildDynamicSystemPrompt(BASE_SYSTEM_INSTRUCTION, curriculumState);
    if (currentProblem) {
      base += `\n\n[PROBLEM SET MODE ACTIVE]
You are currently evaluating the student's answer for this specific problem:
QUESTION: ${currentProblem.question}
RUBRIC: ${currentProblem.rubric}
MAX XP: ${currentProblem.maxXP}

INSTRUCTIONS:
1. Wait for the student's response.
2. When they provide an answer, use the 'evaluate_problem_response' tool.
3. Provide constructive feedback based on the rubric.
4. XP Awarded should be proportional to the score (0.0 to 1.0) * ${currentProblem.maxXP}.
5. If the student asks for a hint, give them one of these (in order): ${currentProblem.hints.join(' | ')}.
6. Once evaluated, stay in this mode unless they close the problem.`;
    }
    return base;
  }, [curriculumState, currentProblem]);

  // Sync simulation to current topic initially
  useEffect(() => {
    if (curriculumState.mode === 'guided' && curriculumState.topics[curriculumState.currentTopicIndex]) {
       const sim = curriculumState.topics[curriculumState.currentTopicIndex].simulationType as UpperSecondarySimulationType;
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
    <div className="flex flex-col md:flex-row h-screen text-slate-200 font-sans overflow-hidden bg-slate-950">
      
      {/* Mobile Overlay for Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] md:hidden" onClick={() => setIsSidebarOpen(false)}>
          <div className="w-80 h-full flex" onClick={(e) => e.stopPropagation()}>
            <EarlyPrimarySidebar 
              progress={progress} 
              onBack={onBack} 
              onClose={() => setIsSidebarOpen(false)}
              title="Quantum Architecture"
              subtitle="Advanced Computing Ops 💻"
            >
               <div className="space-y-4">
                  <div className={`p-5 rounded-3xl border-2 transition-all ${canUnlockResearch ? 'bg-purple-900/20 border-purple-500/50 shadow-[0_0_15px_rgba(147,51,234,0.2)]' : 'bg-slate-800/50 border-slate-700 opacity-60'}`}>
                    <div className="flex items-center gap-3 mb-3">
                      {canUnlockResearch ? (
                         <div className="p-2 bg-purple-600 rounded-lg text-white"><FlaskConical size={18} /></div>
                      ) : (
                         <div className="p-2 bg-slate-700 rounded-lg text-slate-500"><Lock size={18} /></div>
                      )}
                      <h4 className="font-black text-sm uppercase tracking-tighter">Research Mode</h4>
                    </div>
                    
                    {!canUnlockResearch ? (
                      <div className="space-y-2">
                         <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest">Complete standard modules to unlock 🔓</p>
                         <div className="flex gap-2 text-[10px] font-black">
                            <span className={progress.points >= 500 ? 'text-emerald-400' : 'text-rose-400'}>{progress.points}/500 XP</span>
                            <span className="text-slate-600">|</span>
                            <span className={topicsCompletedCount >= 4 ? 'text-emerald-400' : 'text-rose-400'}>{topicsCompletedCount}/4 Topics</span>
                         </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-[10px] font-bold text-purple-300 leading-relaxed uppercase tracking-widest animate-pulse">University-level seminar access unlocked!</p>
                        <button
                          onClick={() => setIsResearchMode(!isResearchMode)}
                          className={`w-full py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg ${isResearchMode ? 'bg-rose-600 text-white hover:bg-rose-500 shadow-rose-900/20' : 'bg-purple-600 text-white hover:bg-purple-500 shadow-purple-900/20'}`}
                        >
                          {isResearchMode ? 'Deactivate Research' : 'Activate Research'}
                        </button>
                      </div>
                    )}
                  </div>
               </div>
            </EarlyPrimarySidebar>
          </div>
        </div>
      )}

      {/* Mobile Actions Overlay */}
      <div className="absolute top-4 left-4 z-50 md:hidden flex gap-2">
        <button onClick={onBack} aria-label="Back to Hub" className="p-2.5 bg-slate-800/80 backdrop-blur rounded-2xl shadow-xl text-slate-300 border border-slate-700 hover:bg-slate-700">
           <ArrowLeft size={20} aria-hidden="true" />
        </button>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 bg-slate-800/80 backdrop-blur rounded-2xl shadow-xl text-emerald-400 border border-slate-700 font-bold text-xs uppercase tracking-wider px-4">
           Status
        </button>
      </div>

      <EarlyPrimarySidebar 
        progress={progress} 
        onBack={onBack} 
        title="Quantum Architecture"
        subtitle="Advanced Computing Ops 💻"
        className="hidden md:flex"
      >
         <div className="space-y-4">
            <div className={`p-5 rounded-3xl border-2 transition-all ${canUnlockResearch ? 'bg-purple-900/20 border-purple-500/50 shadow-[0_0_15px_rgba(147,51,234,0.2)]' : 'bg-slate-800/50 border-slate-700 opacity-60'}`}>
              <div className="flex items-center gap-3 mb-3">
                {canUnlockResearch ? (
                   <div className="p-2 bg-purple-600 rounded-lg text-white"><FlaskConical size={18} /></div>
                ) : (
                   <div className="p-2 bg-slate-700 rounded-lg text-slate-500"><Lock size={18} /></div>
                )}
                <h4 className="font-black text-sm uppercase tracking-tighter">Research Mode</h4>
              </div>
              
              {!canUnlockResearch ? (
                <div className="space-y-2">
                   <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest">Complete standard modules to unlock 🔓</p>
                   <div className="flex gap-2 text-[10px] font-black">
                      <span className={progress.points >= 500 ? 'text-emerald-400' : 'text-rose-400'}>{progress.points}/500 XP</span>
                      <span className="text-slate-600">|</span>
                      <span className={topicsCompletedCount >= 4 ? 'text-emerald-400' : 'text-rose-400'}>{topicsCompletedCount}/4 Topics</span>
                   </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-purple-300 leading-relaxed uppercase tracking-widest animate-pulse">University-level seminar access unlocked!</p>
                  <button
                    onClick={() => setIsResearchMode(!isResearchMode)}
                    className={`w-full py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg ${isResearchMode ? 'bg-rose-600 text-white hover:bg-rose-500 shadow-rose-900/20' : 'bg-purple-600 text-white hover:bg-purple-500 shadow-purple-900/20'}`}
                  >
                    {isResearchMode ? 'Deactivate Research' : 'Activate Research'}
                  </button>
                </div>
              )}
            </div>
         </div>
      </EarlyPrimarySidebar>
      
      {/* Mobile Header */}
      <div className="md:hidden flex flex-col items-center pt-16 pb-4 px-4 bg-slate-900 border-b border-slate-800 shrink-0 z-10">
        <h1 className="font-black text-xl text-slate-100 tracking-widest uppercase">
          Architecture
        </h1>
        <div className="mt-2 flex gap-4 items-center bg-slate-800/80 px-5 py-2 rounded-full border border-slate-700 shadow-lg">
          <div className="text-sm font-bold text-emerald-400 font-mono">{progress.points} XP</div>
          {progress.badges.length > 0 && (
             <div className="text-sm font-bold text-blue-400 flex items-center gap-1.5 border-l border-slate-700 pl-3">
               <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></span>
               🏅 {progress.badges.length}
             </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden p-2 md:p-4 gap-3 md:gap-4 font-mono">
        {/* Top half: Simulation */}
        <div className="h-[40%] md:h-[45%] shrink-0 bg-slate-900 rounded-[2rem] border border-slate-800 shadow-2xl relative flex flex-col overflow-hidden">
            <div className="flex bg-slate-800/30 border-b border-slate-800 p-2 gap-2 overflow-x-auto shrink-0 z-20 items-center no-scrollbar">
               <span className="text-slate-600 font-bold uppercase tracking-widest text-[10px] px-2 whitespace-nowrap">MODULES:</span>
               <button onClick={() => setActiveSimulation('none')} className={`px-3 py-1.5 rounded-xl font-bold text-[10px] md:text-sm transition-all focus:outline-none whitespace-nowrap ${activeSimulation === 'none' ? 'bg-slate-700 text-white shadow-lg border border-slate-600' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300 border border-transparent'}`}>ROOT</button>
               <button onClick={() => setActiveSimulation('shors')} className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl font-bold text-xs md:text-sm transition-all focus:outline-none whitespace-nowrap ${activeSimulation === 'shors' ? 'bg-emerald-600/20 text-emerald-400 shadow-lg border border-emerald-500/50' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'}`}>Shor's Algorithm</button>
               <button onClick={() => setActiveSimulation('grovers')} className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl font-bold text-xs md:text-sm transition-all focus:outline-none whitespace-nowrap ${activeSimulation === 'grovers' ? 'bg-rose-600/20 text-rose-400 shadow-lg border border-rose-500/50' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'}`}>Grover's Search</button>
               <button onClick={() => setActiveSimulation('circuit')} className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl font-bold text-xs md:text-sm transition-all focus:outline-none whitespace-nowrap ${activeSimulation === 'circuit' ? 'bg-blue-600/20 text-blue-400 shadow-lg border border-blue-500/50' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'}`}>Circuit Builder</button>
               <button onClick={() => setActiveSimulation('bloch')} className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl font-bold text-xs md:text-sm transition-all focus:outline-none whitespace-nowrap ${activeSimulation === 'bloch' ? 'bg-indigo-600/20 text-indigo-400 shadow-lg border border-indigo-500/50' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'}`}>Bloch Sphere</button>
               <button onClick={() => setIsProblemPanelOpen(true)} className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl font-bold text-xs md:text-sm transition-all focus:outline-none whitespace-nowrap ${isProblemPanelOpen ? 'bg-amber-600/20 text-amber-400 shadow-lg border border-amber-500/50' : 'text-amber-500/60 hover:bg-amber-900/20 border border-transparent flex items-center gap-2'}`}>
                  <span>Challenges</span>
                  {Object.keys(problemStatus).length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
               </button>
            </div>
            <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden">
               <UpperSecondarySimulationArea activeSimulation={activeSimulation} blochState={blochState} circuitConfig={circuitConfig} />
               
               {activeSimulation === 'bloch' && (
                 <motion.div 
                   initial={{ y: 20, opacity: 0 }} 
                   animate={{ y: 0, opacity: 1 }}
                   className="mt-2 flex flex-wrap justify-center gap-2 p-3 bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700 mx-4 z-20"
                 >
                   {Object.keys(GATE_BLOCH_STATES).map((gate) => (
                     <button
                       key={gate}
                       onClick={() => setBlochState(GATE_BLOCH_STATES[gate])}
                       className="px-4 py-2 bg-slate-900 hover:bg-emerald-600/20 text-emerald-400 border border-slate-700 hover:border-emerald-500/50 rounded-xl font-bold text-xs transition-all flex items-center gap-2"
                     >
                       <span className="opacity-50 font-normal">State:</span> {gate}
                     </button>
                   ))}
                 </motion.div>
               )}
            </div>
        </div>
        
        {/* Bottom half: Chatbot */}
        <div className="flex-1 overflow-hidden bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl flex flex-col">
            <UpperSecondaryChatbot 
              onAwardPoints={awardPoints} 
              onAwardBadge={awardBadge} 
              onSetSimulation={setActiveSimulation} 
              onSetBlochState={(stateName) => {
                if (GATE_BLOCH_STATES[stateName]) {
                  setBlochState(GATE_BLOCH_STATES[stateName]);
                  setActiveSimulation('bloch');
                }
              }}
              onSetCircuit={(presetName) => {
                const presets: Record<string, CircuitConfig> = {
                  'Hadamard': [['H', null, null, null, null], [null, null, null, null, null]],
                  'Bell State': [['H', 'CNOT', null, null, null], [null, null, null, null, null]],
                  'GHZ-like': [['H', 'CNOT', 'H', null, null], [null, null, 'H', 'CNOT', null]]
                };
                if (presets[presetName]) {
                  setCircuitConfig(presets[presetName]);
                  setActiveSimulation('circuit');
                }
              }}
              onEvaluateProblem={(score, feedback, xp) => {
                if (currentProblem) {
                  setProblemStatus(prev => ({
                    ...prev,
                    [currentProblem.id]: { score, feedback, xpAwarded: xp }
                  }));
                  awardPoints(xp);
                  setCurrentProblem(null); // Return to normal mode after evaluation
                }
              }}
              externalMessage={externalMessage}
              systemInstruction={systemInstruction}
              onCompleteTopic={() => {
                dispatch({ type: 'COMPLETE_TOPIC' });
                dispatch({ type: 'ADVANCE' });
              }}
              onSetFreeMode={() => dispatch({ type: 'SET_FREE_MODE' })}
              isResearchMode={isResearchMode}
              setIsResearchMode={setIsResearchMode}
              canUnlockResearch={canUnlockResearch}
            />
        </div>
      </div>

      <AnimatePresence>
        {isProblemPanelOpen && (
          <ProblemSetPanel 
            onClose={() => setIsProblemPanelOpen(false)}
            onSelectSet={() => {}}
            onSelectProblem={(p) => {
              setCurrentProblem(p);
              setIsProblemPanelOpen(false);
              setExternalMessage({ text: `I'm ready to attempt problem: ${p.question}`, timestamp: Date.now() });
            }}
            problemStatus={problemStatus}
            onRequestHint={() => {
              setExternalMessage({ text: "Can I have a hint?", timestamp: Date.now() });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
