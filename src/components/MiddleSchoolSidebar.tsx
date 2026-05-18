import { UserProgress } from '../App';
import { Award, Star, Shield, Zap, ArrowLeft, CheckCircle, RefreshCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { MiddleSchoolConceptId, MASTERY_DESCRIPTIONS } from '../curriculum/middleSchoolPrerequisites';
import { clearProgress } from '../hooks/usePersistedProgress';

const BADGE_ICONS: Record<string, any> = {
  'Double-Slit Detective': Star,
  'Probability Navigator': Shield,
  'Circuit Builder': Zap,
  'Schrödinger\'s Apprentice': Award,
};

interface SidebarProps {
  progress: UserProgress;
  onBack: () => void;
  onClose?: () => void;
  masteredConcepts: MiddleSchoolConceptId[];
  onToggleMastered: (concept: MiddleSchoolConceptId) => void;
  onGenerateJournal: () => void;
  canGenerateJournal: boolean;
  onToggleCollab: () => void;
  isCollabMode: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function MiddleSchoolSidebar({ progress, onBack, onClose, masteredConcepts, onToggleMastered, onGenerateJournal, canGenerateJournal, onToggleCollab, isCollabMode, title = "Mechanics Studio", subtitle = "Analytic Engine Online ⚛️", className = "" }: SidebarProps) {
  const level = Math.floor(progress.points / 100) + 1;
  const progressToNext = progress.points % 100;

  const concepts: MiddleSchoolConceptId[] = ['wave_particle', 'probability', 'quantum_gates'];

  const handleReset = () => {
    if (confirm("Are you sure you want to reset your progress for this module? This cannot be undone.")) {
      clearProgress('middle_school');
      window.location.reload();
    }
  };

  return (
    <div className={`w-80 h-[calc(100%-2rem)] md:h-auto border-4 border-white/30 shadow-xl rounded-[2.5rem] m-4 p-6 flex flex-col gap-6 shrink-0 overflow-y-auto bg-transparent text-indigo-900 ${className}`}>
      <div className="flex justify-between items-center w-full">
        <button onClick={onBack} className="font-bold flex items-center gap-2 transition w-fit px-4 py-2 rounded-xl border shadow-sm cursor-pointer bg-white/40 border-white/50 hover:bg-white/60 focus:ring-4">
          <ArrowLeft size={16} /> Back
        </button>
        {onClose && (
          <button onClick={onClose} className="md:hidden p-2 rounded-xl bg-white/20 text-indigo-400 font-bold text-xs">
            CLOSE
          </button>
        )}
      </div>

      <div className="text-center p-4 rounded-3xl border-2 shadow-sm bg-gradient-to-b from-white/60 to-white/20 border-white/50">
        <h1 className="text-xl lg:text-3xl font-black drop-shadow-sm mb-2 bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="font-bold text-xs inline-block px-3 py-1 rounded-full shadow-sm text-purple-700 bg-white/60">{subtitle}</p>
      </div>

      <div className="space-y-4 p-5 rounded-3xl border-2 border-white/50 shadow-sm bg-white/40">
        <div className="flex justify-between items-center mb-1">
          <span className="font-black text-indigo-800">Level {level}</span>
          <span className="font-black text-pink-600">{progress.points} XP ⭐️</span>
        </div>
        <div className="w-full bg-white/40 rounded-full h-3 border border-white/60 overflow-hidden shadow-inner">
          <motion.div 
            className="h-full bg-gradient-to-r from-teal-400 to-cyan-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressToNext}%` }}
          />
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-4 p-5 rounded-3xl border-2 border-white/50 shadow-sm bg-white/40">
        <h3 className="font-black text-indigo-900 mb-2">Mastered Concepts</h3>
        {concepts.map((c) => (
          <div key={c} className="flex items-center gap-3 font-bold cursor-pointer" onClick={() => onToggleMastered(c)}>
            {masteredConcepts.includes(c) ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1.2 }}>
                <CheckCircle size={24} className="text-emerald-500" />
              </motion.div>
            ) : (
              <div className="w-6 h-6 rounded-full border-2 border-slate-400" />
            )}
            <span className={masteredConcepts.includes(c) ? 'text-emerald-800' : 'text-slate-500'}>
              {c.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        ))}
        {canGenerateJournal && (
            <button onClick={onGenerateJournal} className="w-full mt-4 p-3 bg-teal-600 text-white font-bold rounded-lg shadow-md hover:bg-teal-700">
                📓 Generate Study Journal
            </button>
        )}
        <button onClick={onToggleCollab} className={`w-full p-3 font-bold rounded-lg shadow-md ${isCollabMode ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
            Lab Partners 🤝 {isCollabMode ? '(Active)' : ''}
        </button>
      </div>

      <div className="flex-1">
        <h3 className="text-lg font-black mb-4 flex items-center justify-center gap-2 text-purple-800 text-center">
          My Badges
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {progress.badges.length === 0 ? (
            <div className="border-2 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center text-center col-span-2 bg-white/40 border-white/60 text-slate-400">
              <p className="font-bold text-xs uppercase tracking-widest">No badges earned</p>
            </div>
          ) : (
            progress.badges.map((badge) => {
              const Icon = BADGE_ICONS[badge] || Award;
              return (
                <div key={badge} className="bg-white/60 rounded-2xl p-3 border border-white/80 shadow-sm flex flex-col items-center gap-2 text-center">
                   <div className="p-2 bg-teal-500/10 rounded-full text-teal-600">
                      <Icon size={20} />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-tighter text-indigo-900">{badge}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {progress.points > 0 && (
        <button 
          onClick={handleReset}
          className="mt-auto flex items-center justify-center gap-2 p-3 rounded-2xl text-rose-500 font-bold hover:bg-rose-50 transition-colors text-xs uppercase tracking-widest border border-rose-100"
        >
          <RefreshCcw size={14} /> Reset My Progress
        </button>
      )}
    </div>
  );
}
