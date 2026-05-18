import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Mission {
  title: string;
  briefingText: string;
  objectives: string[];
  simulationType: string;
}

interface Props {
  mission: Mission;
  onAccept: () => void;
  onSkip: () => void;
}

export default function MissionBriefing({ mission, onAccept, onSkip }: Props) {
  const [displayText, setDisplayText] = useState('');
  const [isTypewriterDone, setIsTypewriterDone] = useState(false);
  const [canAccept, setCanAccept] = useState(false);

  useEffect(() => {
    // Typewriter
    let i = 0;
    const interval = setInterval(() => {
      if (i < mission.briefingText.length) {
        setDisplayText((prev) => prev + mission.briefingText.charAt(i));
        i++;
      } else {
        setIsTypewriterDone(true);
        clearInterval(interval);
      }
    }, 30);

    // TTS
    const utterance = new SpeechSynthesisUtterance(mission.briefingText);
    utterance.rate = 1.0;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);

    // Enable timer
    const timer = setTimeout(() => setCanAccept(true), 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
      window.speechSynthesis.cancel();
    };
  }, [mission.briefingText]);

  const isEnabled = isTypewriterDone || canAccept;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative w-full max-w-2xl bg-slate-900 border-4 border-blue-500 p-8 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none -rotate-12 opacity-5">
            <span className="text-[10rem] font-black text-blue-900">CLASSIFIED</span>
        </div>
        
        <h2 className="text-blue-500 font-mono text-xl mb-6 animate-pulse">
            ⚡ MISSION BRIEFING: {mission.title}
        </h2>

        <div className="text-slate-300 font-mono text-lg mb-8 h-32 overflow-y-auto">
            {displayText}
            <span className="animate-pulse">|</span>
        </div>

        {isTypewriterDone && (
            <motion.ul 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3 mb-8"
            >
                {mission.objectives.map((obj, i) => (
                    <motion.li 
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.2 }}
                        className="text-white font-mono flex items-center gap-2"
                    >
                        <span className="text-blue-500">[{i + 1}]</span> {obj}
                    </motion.li>
                ))}
            </motion.ul>
        )}

        <div className="flex justify-end gap-6 pt-6 border-t border-blue-900">
            <button 
                onClick={onSkip}
                className="text-slate-500 hover:text-white font-mono transition"
            >
                Skip →
            </button>
            <button 
                onClick={onAccept}
                disabled={!isEnabled}
                className={`px-8 py-3 rounded-lg font-mono font-bold transition flex items-center gap-2 ${isEnabled ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
            >
                Accept Mission ✅
            </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
