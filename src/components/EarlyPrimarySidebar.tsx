import { UserProgress } from '../App';
import { Award, Star, Shield, Zap, ArrowLeft, RefreshCcw } from 'lucide-react';
import { motion } from 'motion/react';
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
  onClose?: () => void; // Added for mobile
  onKittyTap?: () => void;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}

export default function EarlyPrimarySidebar({ progress, onBack, onClose, onKittyTap, title = "✨ Q-Kitty's Lab ✨", subtitle = "Quantum Magic! 🐾", children, className = "" }: SidebarProps) {
  const level = Math.floor(progress.points / 100) + 1;
  const progressToNext = progress.points % 100;

  // Derive theme from title to make it adaptive since we reuse it across modules
  const isDarkTheme = title === 'Quantum Architecture';

  const handleReset = () => {
    const moduleKey = isDarkTheme ? 'upper_secondary' : 'early_primary';
    if (confirm(`Are you sure you want to reset your progress for ${title}? This cannot be undone.`)) {
      clearProgress(moduleKey);
      window.location.reload();
    }
  };

  return (
    <div className={`w-80 h-[calc(100%-2rem)] md:h-auto border-4 shadow-xl rounded-[2.5rem] m-4 p-6 flex flex-col gap-6 md:gap-8 shrink-0 overflow-y-auto ${className} ${isDarkTheme ? 'bg-slate-900 border-slate-700/50 text-slate-200' : 'bg-transparent border-white/30 text-indigo-900'}`}>
      
      <div className="flex justify-between items-center w-full">
        <button onClick={onBack} aria-label="Back to Quantum Hub" className={`font-bold flex items-center gap-2 transition w-fit px-4 py-2 rounded-xl border shadow-sm cursor-pointer focus:outline-none ${isDarkTheme ? 'text-slate-300 hover:text-white bg-slate-800 border-slate-700 hover:bg-slate-700 focus:ring-4 focus:ring-slate-600' : 'text-indigo-800 hover:text-indigo-600 bg-white/40 border-white/50 hover:bg-white/60 focus:ring-4 focus:ring-indigo-300'}`}>
          <ArrowLeft size={16} aria-hidden="true" /> Back to Quantum Hub
        </button>

        {onClose && (
          <button onClick={onClose} className="md:hidden p-2 rounded-xl bg-white/20 text-slate-400">
            Close
          </button>
        )}
      </div>

      <div className={`text-center p-4 rounded-3xl border-2 shadow-sm ${isDarkTheme ? 'bg-slate-800/80 border-slate-700' : 'bg-gradient-to-b from-white/60 to-white/20 border-white/50'}`}>
        <h1 
          className={`text-xl lg:text-3xl font-black drop-shadow-sm mb-2 select-none cursor-pointer ${isDarkTheme ? 'text-slate-100 uppercase tracking-widest' : 'bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent'}`}
          onClick={onKittyTap}
        >
          {title}
        </h1>
        <p className={`font-bold text-xs inline-block px-3 py-1 rounded-full shadow-sm ${isDarkTheme ? 'text-emerald-400 bg-slate-900 border border-slate-700' : 'text-purple-700 bg-white/60'}`}>{subtitle}</p>
      </div>

      <div className={`space-y-4 p-5 rounded-3xl border-2 shadow-sm relative overflow-hidden ${isDarkTheme ? 'bg-slate-800/80 border-slate-700' : 'bg-white/40 border-white/50'}`}>
        <div className="absolute top-0 right-0 text-5xl opacity-20 translate-x-3 -translate-y-3">🏆</div>
        <div>
          <div className="flex justify-between items-end mb-3 relative z-10">
            <span className={`font-black text-base backdrop-blur px-3 py-1 rounded-full shadow-sm ${isDarkTheme ? 'text-slate-100 bg-slate-900/80' : 'text-indigo-800 bg-white/70'}`}>Level {level}</span>
            <span className={`font-black text-lg drop-shadow-md ${isDarkTheme ? 'text-emerald-400' : 'text-pink-600'}`}>{progress.points} XP ⭐️</span>
          </div>
          <div 
            className={`w-full rounded-full h-5 overflow-hidden border-2 shadow-inner relative z-10 ${isDarkTheme ? 'bg-slate-900 border-slate-700' : 'bg-white/40 border-white/60'}`}
            role="progressbar"
            aria-valuenow={progressToNext}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progress to next level"
          >
            <motion.div 
              className={`h-full rounded-full relative ${isDarkTheme ? 'bg-gradient-to-r from-emerald-600 to-teal-400' : 'bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400'}`}
              initial={{ width: 0 }}
              animate={{ width: `${progressToNext}%` }}
              transition={{ duration: 0.5 }}
            >
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIvPjwvc3ZnPg==')] opacity-50"></div>
            </motion.div>
          </div>
          <p className={`text-xs font-bold mt-2 text-center relative z-10 ${isDarkTheme ? 'text-emerald-400' : 'text-blue-600'}`}>ONLY {100 - progressToNext} XP to level up! 🚀</p>
        </div>
      </div>

      <div className="flex-1">
        <h3 className={`text-lg font-black mb-4 flex items-center justify-center gap-2 ${isDarkTheme ? 'text-slate-300' : 'text-purple-800'}`}>
          <Star className="text-yellow-400" fill="currentColor" /> My Badges <Star className="text-yellow-400" fill="currentColor" />
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {progress.badges.length === 0 ? (
            <div className={`border-2 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center text-center col-span-2 ${isDarkTheme ? 'bg-slate-800/50 border-slate-700 text-slate-500' : 'bg-purple-50/50 border-purple-200 text-purple-500'}`}>
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
                  className={`border-4 shadow-xl rounded-3xl p-4 flex flex-col items-center justify-center text-center gap-3 relative overflow-hidden group ${isDarkTheme ? 'bg-slate-800 border-slate-700' : 'bg-gradient-to-b from-white to-purple-50 border-white'}`}
                >
                  <div className={`p-3 rounded-full text-white shadow-inner mb-1 transform transition-transform group-hover:scale-110 ${isDarkTheme ? 'bg-slate-700 text-emerald-400' : 'bg-gradient-to-br from-pink-400 to-purple-500'}`}>
                    <Icon size={28} />
                  </div>
                  <span className={`text-xs font-black leading-tight ${isDarkTheme ? 'text-slate-200' : 'text-indigo-900'}`}>{badge}</span>
                  <div className="absolute top-0 right-0 w-8 h-8 bg-white/60 rounded-full blur -translate-y-4 translate-x-2"></div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {children && (
        <div className="mt-8 pt-6 border-t border-slate-700/50">
          {children}
        </div>
      )}

      {progress.points > 0 && (
        <button 
          onClick={handleReset}
          className={`mt-auto flex items-center justify-center gap-2 p-3 rounded-2xl font-bold transition-colors text-xs uppercase tracking-widest border shrink-0 ${
            isDarkTheme 
              ? 'text-rose-400 hover:bg-rose-900/20 border-rose-500/20' 
              : 'text-rose-500 hover:bg-rose-50 border-rose-100'
          }`}
        >
          <RefreshCcw size={14} /> Reset My Progress
        </button>
      )}
    </div>
  );
}
