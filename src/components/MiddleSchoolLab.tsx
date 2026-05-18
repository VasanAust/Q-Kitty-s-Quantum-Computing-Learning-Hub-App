import { useState, useReducer, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import MiddleSchoolSidebar from './MiddleSchoolSidebar';
import MiddleSchoolSimulationArea from './MiddleSchoolSimulationArea';
import MiddleSchoolChatbot from './MiddleSchoolChatbot';
import MiddleSchoolQuiz from './MiddleSchoolQuiz';
import StudyJournal from './StudyJournal';
import CollabJoinPanel from './CollabJoinPanel';
import { useCollabSession } from '../hooks/useCollabSession';
import { UserProgress } from '../App';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { curriculumReducer, buildDynamicSystemPrompt } from '../curriculum/curriculumEngine';
import { middleSchoolCurriculum } from '../curriculum/middleSchoolCurriculum';
import { BASE_SYSTEM_INSTRUCTION } from '../lib/geminiAgentMiddleSchool';
import { buildMiddleSchoolSystemPrompt, PREREQUISITES, MASTERY_DESCRIPTIONS, MiddleSchoolConceptId } from '../curriculum/middleSchoolPrerequisites';
import { usePersistedProgress, clearProgress, logSessionEvent } from '../hooks/usePersistedProgress';

export type MiddleSchoolSimulationType = 'none' | 'wave_particle' | 'probability' | 'quantum_gates';

interface MiddleSchoolLabProps {
  onBack: () => void;
}

export default function MiddleSchoolLab({ onBack }: MiddleSchoolLabProps) {
  const [activeSimulation, setActiveSimulation] = useState<MiddleSchoolSimulationType>('none');
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [progress, setProgress] = usePersistedProgress('middle_school');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [masteredConcepts, setMasteredConcepts] = useState<MiddleSchoolConceptId[]>([]);
  const [journalContent, setJournalContent] = useState<string | null>(localStorage.getItem('qkitty_ms_journal'));
  const [isGeneratingJournal, setIsGeneratingJournal] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [collabRoomCode, setCollabRoomCode] = useState<string | null>(null);
  const [isCollabMode, setIsCollabMode] = useState(false);
  const [isJoiningCollab, setIsJoiningCollab] = useState(false);
  const [studentName, setStudentName] = useState("Student");

  const studentId = useMemo(() => Math.random().toString(36).substring(2, 9), []);
  const collab = useCollabSession(collabRoomCode, studentId, studentName);
  
  // Sync simulation...
  useEffect(() => {
    if (isCollabMode && collab.remoteSimulation) {
        setActiveSimulation(collab.remoteSimulation as MiddleSchoolSimulationType);
    }
  }, [collab.remoteSimulation, isCollabMode]);
  
  useEffect(() => {
    if (isCollabMode && activeSimulation !== collab.remoteSimulation) {
        collab.setSharedSimulation(activeSimulation);
    }
  }, [activeSimulation, isCollabMode]);

  useEffect(() => {
    const saved = localStorage.getItem('qkitty_ms_mastery');
    if (saved) setMasteredConcepts(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('qkitty_ms_mastery', JSON.stringify(masteredConcepts));
    localStorage.setItem('qkitty_ms_journal', journalContent || '');
  }, [masteredConcepts, journalContent]);

  const onGenerateJournal = (journal: string) => {
    setJournalContent(journal);
    setIsGeneratingJournal(false);
  };

  const onMarkMastered = (concept: string) => {
    if (!masteredConcepts.includes(concept as MiddleSchoolConceptId)) {
      setMasteredConcepts(prev => [...prev, concept as MiddleSchoolConceptId]);
    }
  };

  const onToggleMastered = (concept: MiddleSchoolConceptId) => {
    if (masteredConcepts.includes(concept)) {
      setMasteredConcepts(prev => prev.filter(c => c !== concept));
    } else {
      setMasteredConcepts(prev => [...prev, concept]);
    }
  };

  const [curriculumState, dispatch] = useReducer(curriculumReducer, {
    topics: middleSchoolCurriculum,
    currentTopicIndex: 0,
    completedTopicIds: new Set<string>(),
    mode: 'guided' as 'guided' | 'free'
  });

  const systemInstruction = useMemo(() => {
    const base = buildDynamicSystemPrompt(BASE_SYSTEM_INSTRUCTION, curriculumState);
    return buildMiddleSchoolSystemPrompt(base, masteredConcepts);
  }, [curriculumState, masteredConcepts]);

  useEffect(() => {
    if (curriculumState.mode === 'guided' && curriculumState.topics[curriculumState.currentTopicIndex]) {
       const sim = curriculumState.topics[curriculumState.currentTopicIndex].simulationType as MiddleSchoolSimulationType;
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
      className="flex flex-col md:flex-row h-screen text-slate-800 font-sans overflow-hidden bg-[#e6fbf7]"
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
            <MiddleSchoolSidebar                
              progress={progress} 
              onBack={onBack} 
              onClose={() => setIsSidebarOpen(false)}
              masteredConcepts={masteredConcepts}
              onToggleMastered={onToggleMastered}
              onGenerateJournal={() => {
                  setIsGeneratingJournal(true);
                  setIsJournalOpen(true);
              }}
              canGenerateJournal={true}
              onToggleCollab={() => setIsJoiningCollab(true)}
              isCollabMode={isCollabMode}
              title="Mechanics Studio"
              subtitle="Analytic Engine Online ⚛️"
            />
          </div>
        </div>
      )}

      {/* Mobile Actions Overlay */}
      <div className="absolute top-4 left-4 z-50 md:hidden flex gap-2">
        <button onClick={onBack} aria-label="Back to Hub" className="p-2.5 bg-white/70 backdrop-blur rounded-2xl shadow-lg text-teal-900 border border-white">
           <ArrowLeft size={20} aria-hidden="true" />
        </button>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 bg-white/70 backdrop-blur rounded-2xl shadow-lg text-teal-700 border border-white font-bold text-xs uppercase tracking-wider px-4">
           Studio Ops
        </button>
      </div>

      <MiddleSchoolSidebar 
        progress={progress} 
        onBack={onBack} 
        masteredConcepts={masteredConcepts}
        onToggleMastered={onToggleMastered}
        onGenerateJournal={() => {
            setIsGeneratingJournal(true);
            setIsJournalOpen(true);
        }}
        canGenerateJournal={true}
        onToggleCollab={() => setIsJoiningCollab(true)}
        isCollabMode={isCollabMode}
        title="Mechanics Studio"
        subtitle="Analytic Engine Online ⚛️"
        className="hidden md:flex"
      />
      
      {isJoiningCollab && (
        <CollabJoinPanel onJoin={(roomCode, name) => {
            setCollabRoomCode(roomCode);
            setStudentName(name);
            setIsCollabMode(true);
            setIsJoiningCollab(false);
        }} />
      )}
      
      <StudyJournal 
          content={journalContent} 
          isOpen={isJournalOpen} 
          onClose={() => setIsJournalOpen(false)}
          isGenerating={isGeneratingJournal}
      />
      
      {/* Mobile Header */}
      <div className="md:hidden flex flex-col items-center pt-16 pb-4 px-4 bg-white/40 backdrop-blur-md border-b-4 border-white/60 shrink-0 z-10 w-full">
        <h1 className="font-black text-2xl bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent drop-shadow-sm text-center">
          Mechanics Studio
        </h1>
        <div className="mt-2 flex gap-3 items-center bg-white/60 px-5 py-2.5 rounded-full border-2 border-white shadow-md">
          <div className="text-sm font-black text-teal-700">{progress.points} XP</div>
          {progress.badges.length > 0 && (
             <div className="text-sm font-black text-cyan-600 flex items-center gap-1.5 border-l border-white/50 pl-3">
               <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
               🏅 {progress.badges.length}
             </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden p-2 md:p-4 gap-3 md:gap-4 relative px-3">
        {isQuizActive && (
           <MiddleSchoolQuiz 
              simulationType={activeSimulation}
              onClose={() => setIsQuizActive(false)}
              onComplete={(pts, b) => {
                 awardPoints(pts);
                 awardBadge(b);
                 setIsQuizActive(false);
              }}
           />
        )}
        <div className="h-[35%] md:h-3/5 shrink-0 bg-white/20 backdrop-blur-md rounded-[2.5rem] border-4 border-white/40 shadow-xl relative flex items-center justify-center overflow-hidden">
            <MiddleSchoolSimulationArea 
              activeSimulation={activeSimulation} 
              onQuizRequest={() => setIsQuizActive(true)}
            />
        </div>
        <div className="flex-1 overflow-hidden bg-white/20 backdrop-blur-md rounded-[2.5rem] border-4 border-white/40 shadow-xl flex flex-col">
            <MiddleSchoolChatbot 
              onAwardPoints={awardPoints} 
              onAwardBadge={awardBadge} 
              onSetSimulation={setActiveSimulation} 
              onTriggerQuiz={() => setIsQuizActive(true)}
              systemInstruction={systemInstruction}
              onSetCircuitPreset={(preset) => {
                console.log("Setting circuit preset:", preset);
                // Implementation can be added relative to simulation area if needed
              }}
              onCompleteTopic={() => {
                dispatch({ type: 'COMPLETE_TOPIC' });
                dispatch({ type: 'ADVANCE' });
                
                // When a topic is completed, mark its concept as mastered
                const topic = curriculumState.topics[curriculumState.currentTopicIndex];
                if (topic) onMarkMastered(topic.id as MiddleSchoolConceptId);
              }}
              onSetFreeMode={() => dispatch({ type: 'SET_FREE_MODE' })}
              onMarkMastered={onMarkMastered}
              onGenerateJournal={() => {
                setIsGeneratingJournal(true);
                setIsJournalOpen(true);
              }}
              isCollabMode={isCollabMode}
              participants={collab.participants}
              messagesCount={collab.messages.length}
            />
        </div>
      </div>
    </div>
  );
}
