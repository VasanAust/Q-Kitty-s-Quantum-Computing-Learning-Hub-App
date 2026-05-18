import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PROBLEM_SETS, Problem, ProblemSet } from '../../curriculum/upperSecondaryProblemSets';
import { ChevronRight, Award, HelpCircle, CheckCircle, Lock, BookOpen, Star, ArrowRight } from 'lucide-react';

interface ProblemSetPanelProps {
  onSelectProblem: (problem: Problem) => void;
  onSelectSet: (set: ProblemSet) => void;
  onClose: () => void;
  problemStatus: Record<string, { score: number, feedback: string, xpAwarded: number }>;
  onRequestHint: () => void;
}

export default function ProblemSetPanel({ onSelectProblem, onSelectSet, onClose, problemStatus, onRequestHint }: ProblemSetPanelProps) {
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);

  const activeSet = PROBLEM_SETS.find(s => s.id === selectedSetId);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'beginner': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'intermediate': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'advanced': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed inset-y-0 right-0 w-full md:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col pt-16"
    >
      <div className="flex items-center justify-between p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/20 rounded-lg text-indigo-400">
            <BookOpen size={20} />
          </div>
          <h2 className="text-xl font-black text-white">Quantum Laboratory</h2>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white pb-1 font-mono text-xl">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {!selectedSetId ? (
          <div className="p-6 space-y-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Curriculum Challenges</p>
            {PROBLEM_SETS.map(set => {
              const solvedCount = set.problems.filter(p => !!problemStatus[p.id]).length;
              const totalXP = set.problems.reduce((sum, p) => sum + p.maxXP, 0);
              const earnedXP = set.problems.reduce((sum, p) => sum + (problemStatus[p.id]?.xpAwarded || 0), 0);

              return (
                <motion.button
                  key={set.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedSetId(set.id)}
                  className="w-full text-left bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-2xl p-5 group transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full border ${getDifficultyColor(set.difficulty)}`}>
                      {set.difficulty}
                    </span>
                    {solvedCount === set.problems.length && (
                      <CheckCircle size={16} className="text-emerald-500" />
                    )}
                  </div>
                  <h3 className="text-lg font-black text-white mb-1 group-hover:text-indigo-400 transition-colors">{set.title}</h3>
                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                    <span>{solvedCount} / {set.problems.length} Solved</span>
                    <span className="flex items-center gap-1"><Award size={12} className="text-amber-500" /> {earnedXP} / {totalXP} XP</span>
                  </div>
                  <div className="mt-4 h-1 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(solvedCount / set.problems.length) * 100}%` }}
                      className="h-full bg-indigo-500"
                    />
                  </div>
                </motion.button>
              );
            })}
          </div>
        ) : (
          <div className="p-6">
             <button 
               onClick={() => setSelectedSetId(null)}
               className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mb-6 transition-colors"
             >
               <ChevronRight size={14} className="rotate-180" /> Back to Sets
             </button>

             <h3 className="text-2xl font-black text-white mb-6 underline decoration-indigo-500 decoration-4 underline-offset-4">{activeSet?.title}</h3>
             
             {activeSet && activeSet.problems.every(p => !!problemStatus[p.id]) && (
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 className="mb-8 p-6 bg-emerald-500/20 border border-emerald-500/50 rounded-[2rem] text-center"
               >
                 <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                   <CheckCircle size={32} className="text-white" />
                 </div>
                 <h4 className="text-xl font-black text-white mb-2">Set Complete!</h4>
                 <p className="text-sm text-emerald-400 font-bold">
                   Total XP Earned: {activeSet.problems.reduce((sum, p) => sum + (problemStatus[p.id]?.xpAwarded || 0), 0)}
                 </p>
               </motion.div>
             )}

             <div className="space-y-4">
               {activeSet?.problems.map((problem, idx) => {
                 const status = problemStatus[problem.id];
                 return (
                   <div 
                     key={problem.id}
                     className={`rounded-2xl border transition-all ${
                       status ? 'bg-slate-950/50 border-emerald-500/30' : 'bg-slate-800/30 border-slate-700/50'
                     }`}
                   >
                     <div className="p-5">
                       <div className="flex justify-between items-start mb-4">
                         <span className="text-[10px] font-black text-slate-500 uppercase">Problem {idx + 1}</span>
                         <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
                           <Award size={12} /> {problem.maxXP} XP
                         </div>
                       </div>
                       
                       <p className="text-slate-200 text-sm font-medium leading-relaxed mb-6">
                         {problem.question}
                       </p>

                       {status ? (
                         <div className="space-y-4 pt-4 border-t border-slate-800">
                           <div className="flex items-center gap-4">
                             <div className="relative w-12 h-12 flex items-center justify-center">
                               <svg className="w-full h-full transform -rotate-90">
                                 <circle
                                   cx="24"
                                   cy="24"
                                   r="20"
                                   fill="none"
                                   stroke="currentColor"
                                   strokeWidth="4"
                                   className="text-slate-800"
                                 />
                                 <motion.circle
                                   cx="24"
                                   cy="24"
                                   r="20"
                                   fill="none"
                                   stroke="currentColor"
                                   strokeWidth="4"
                                   strokeDasharray={2 * Math.PI * 20}
                                   initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
                                   animate={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - status.score / 100) }}
                                   className="text-emerald-500"
                                 />
                               </svg>
                               <span className="absolute text-[10px] font-black">{status.score}%</span>
                             </div>
                             <div>
                               <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Mastery Achieved</div>
                               <div className="text-sm font-bold text-white">+{status.xpAwarded} XP Earned</div>
                             </div>
                           </div>
                           <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 italic text-xs text-slate-400 leading-relaxed">
                             "{status.feedback}"
                           </div>
                         </div>
                       ) : (
                         <div className="flex gap-2">
                           <button 
                             onClick={() => onSelectProblem(problem)}
                             className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 group"
                           >
                             Attempt Problem <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                           </button>
                           <button 
                             onClick={onRequestHint}
                             className="p-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition-all"
                             title="Request Hint"
                           >
                             <HelpCircle size={18} />
                           </button>
                         </div>
                       )}
                     </div>
                   </div>
                 );
               })}
             </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-950/80 border-t border-slate-800">
         <div className="flex items-center gap-3">
           <div className="p-2 bg-amber-500/20 rounded-lg text-amber-500">
             <Star size={16} />
           </div>
           <div>
             <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Rank</div>
             <div className="text-sm font-bold text-white">Quantum Novice</div>
           </div>
         </div>
      </div>
    </motion.div>
  );
}
