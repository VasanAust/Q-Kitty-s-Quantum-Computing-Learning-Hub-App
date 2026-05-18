import { UserProgress } from '../App';
import { Award, Star, Shield, Zap, ArrowLeft, RefreshCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { CurriculumTopic } from '../curriculum/curriculumEngine';
import ExplorerMap from './UpperPrimary/ExplorerMap';
import { clearProgress } from '../hooks/usePersistedProgress';

const BADGE_ICONS: Record<string, any> = {
  'First Question': Star,
  'Superposition Master': Shield,
  'Entanglement Expert': Zap,
  'Qubit Explorer': Award,
};

interface SidebarProps {
  progress: UserProgress;
  onBack: () => void;
  onClose?: () => void;
  title?: string;
  subtitle?: string;
  topics: CurriculumTopic[];
  completedTopicIds: Set<string>;
  currentTopicIndex: number;
  className?: string;
}

export default function UpperPrimarySidebar({ 
  progress, 
  onBack, 
  onClose, 
  title = "Quantum Explorers", 
  subtitle = "Subatomic Journey! 🚀",
  topics,
  completedTopicIds,
  currentTopicIndex,
  className = ""
}: SidebarProps) {
  
  const handleReset = () => {
    if (confirm("Are you sure you want to reset your progress for this module? This cannot be undone.")) {
      clearProgress('upper_primary');
      window.location.reload();
    }
  };

  return (
    <div className={`w-80 h-[calc(100%-2rem)] md:h-auto border-4 shadow-xl rounded-[2.5rem] m-4 p-6 flex flex-col gap-6 md:gap-8 shrink-0 overflow-y-auto bg-transparent border-white/60 text-indigo-900 ${className}`}>
      
      <div className="flex justify-between items-center w-full">
        <button onClick={onBack} aria-label="Back to Quantum Hub" className="font-bold flex items-center gap-2 transition w-fit px-4 py-2 rounded-xl border shadow-sm cursor-pointer focus:outline-none text-indigo-800 hover:text-indigo-600 bg-white/40 border-white/50 hover:bg-white/60 focus:ring-4 focus:ring-indigo-300">
          <ArrowLeft size={16} aria-hidden="true" /> Back to Quantum Hub
        </button>

        {onClose && (
          <button onClick={onClose} className="md:hidden p-2 rounded-xl bg-white/20 text-slate-400">
            Close
          </button>
        )}
      </div>

      <div className="text-center p-4 rounded-3xl border-2 shadow-sm bg-gradient-to-b from-white/60 to-white/20 border-white/50">
        <h1 className="text-xl lg:text-3xl font-black drop-shadow-sm mb-2 bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="font-bold text-xs inline-block px-3 py-1 rounded-full shadow-sm text-purple-700 bg-white/60">{subtitle}</p>
      </div>

      <div className="p-5 rounded-3xl border-2 shadow-sm relative overflow-hidden bg-white/40 border-white/50">
        <h3 className="text-lg font-black mb-4 flex items-center justify-center gap-2 text-purple-800">
            Explorer Map
        </h3>
        <ExplorerMap 
            completedIds={Array.from(completedTopicIds)}
            currentId={topics[currentTopicIndex]?.id || ''}
        />
        <p className="text-xs font-bold mt-2 text-center text-blue-600">{progress.points} XP ⭐️</p>
      </div>

      <div className="flex-1">
        <h3 className="text-lg font-black mb-4 flex items-center justify-center gap-2 text-purple-800">
          <Star className="text-yellow-400" fill="currentColor" /> My Badges <Star className="text-yellow-400" fill="currentColor" />
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {progress.badges.length === 0 ? (
            <div className="border-2 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center text-center col-span-2 bg-purple-50/50 border-purple-200 text-purple-500">
              <div className="text-5xl mb-2 opacity-50">😿</div>
              <p className="font-bold text-sm">No badges yet.<br/>Start chatting to earn some!</p>
            </div>
          ) : (
            progress.badges.map((badge) => {
              const Icon = BADGE_ICONS[badge] || Award;
              return (
                <motion.div 
                  initial={{ scale: 0, opacity: 0, rotate: -10 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  key={badge} 
                  className="border-4 shadow-xl rounded-3xl p-4 flex flex-col items-center justify-center text-center gap-3 relative overflow-hidden group bg-gradient-to-b from-white to-purple-50 border-white"
                >
                  <div className="p-3 rounded-full text-white shadow-inner mb-1 transform transition-transform group-hover:scale-110 bg-gradient-to-br from-pink-400 to-purple-500">
                    <Icon size={28} />
                  </div>
                  <span className="text-xs font-black leading-tight text-indigo-900">{badge}</span>
                  <div className="absolute top-0 right-0 w-8 h-8 bg-white/60 rounded-full blur -translate-y-4 translate-x-2"></div>
                </motion.div>
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
