import { UpperSecondarySimulationType } from './UpperSecondaryLab';
import { motion, AnimatePresence } from 'motion/react';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import BlochSphere from './UpperSecondary/BlochSphere';
import CircuitBuilder, { CircuitConfig } from './UpperSecondary/CircuitBuilder';

interface Props {
  activeSimulation: UpperSecondarySimulationType;
  blochState?: { theta: number, phi: number };
  circuitConfig?: CircuitConfig;
}

export default function UpperSecondarySimulationArea({ activeSimulation, blochState, circuitConfig }: Props) {

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-slate-950 rounded-[2rem]">
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-[0.1] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <AnimatePresence mode="wait">
        {activeSimulation === 'none' && (
          <motion.div 
            key="none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center relative z-10 p-8 rounded-3xl max-w-sm m-4 border border-slate-800 bg-slate-900/50 backdrop-blur-md"
          >
            <motion.div 
              animate={{ y: [0, -10, 0] }} 
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="text-6xl mb-6 drop-shadow-xl opacity-80"
            >🖥️</motion.div>
            <h3 className="text-xl font-bold tracking-widest text-slate-300 uppercase mb-2">Terminal Ready</h3>
            <p className="text-slate-500 text-sm">Awaiting simulation parameters. Ask Oracle about algorithms or circuits.</p>
          </motion.div>
        )}

        {activeSimulation === 'shors' && (
          <motion.div 
            key="shors"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center relative z-10 w-full px-4"
          >
            <h2 className="text-2xl md:text-3xl font-black mb-4 md:mb-8 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 tracking-widest uppercase items-center drop-shadow-sm text-center">Shor's Algorithm</h2>
            
            <div className="relative w-full max-w-3xl bg-slate-900 rounded-xl border border-slate-700 shadow-2xl p-4 md:p-6 font-mono text-xs md:text-base text-slate-300">
              <div className="flex mb-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 opacity-50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500 opacity-50"></div>
              </div>
              <div className="space-y-4 md:space-y-6">
                {/* Intro */}
                <motion.div 
                  className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-lg border border-slate-700"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                >
                  <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center font-bold text-xl border border-emerald-500/30">🎯</div>
                  <div>
                    <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Goal</div>
                    <div className="text-base md:text-lg">Factor integer <span className="text-emerald-400 font-bold text-lg md:text-xl">N = 15</span></div>
                  </div>
                </motion.div>

                {/* Step 1 */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div 
                      className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-lg border border-slate-700 cursor-help hover:bg-slate-800 transition-colors"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
                    >
                      <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center font-bold text-xl border border-blue-500/30">1</div>
                      <div className="flex-1">
                        <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Classical Step</div>
                        <div>Choose random <span className="text-yellow-400 font-bold">a</span>. Let's pick <span className="text-yellow-400 font-bold text-lg">a = 7</span>.</div>
                      </div>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent><p className="font-bold">We need 'a' to be coprime to N. Since GCD(7,15)=1, we proceed.</p></TooltipContent>
                </Tooltip>

                {/* Step 2 */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div 
                      className="flex flex-col gap-4 bg-blue-900/20 p-4 rounded-lg border border-blue-500/30 cursor-help hover:bg-blue-900/30 transition-colors relative overflow-hidden"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.5 }}
                    >
                      <div className="absolute top-0 right-0 px-2 py-1 text-[10px] md:text-xs font-bold bg-blue-500/30 text-blue-300 rounded-bl-lg">QUANTUM CORE</div>
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center font-bold text-xl border border-purple-500/30">2</div>
                        <div className="flex-1">
                          <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Quantum Period Finding</div>
                          <div className="text-sm md:text-base">Find period <span className="text-purple-400 font-bold">r</span> of: <span className="font-mono text-blue-300 bg-blue-900/50 px-2 py-1 rounded">f(x) = 7^x mod 15</span></div>
                        </div>
                      </div>

                      {/* Visual sequence of period finding */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2 relative z-10">
                        {['7¹=7', '7²=4', '7³=13', '7⁴=1', '7⁵=7'].map((calc, i) => (
                           <motion.div 
                             key={i}
                             className={`text-center py-2 rounded text-xs md:text-sm ${i === 3 ? 'bg-purple-500/30 border border-purple-400 font-bold text-purple-300 relative' : 'bg-slate-800/80 text-slate-400'}`}
                             initial={{ opacity: 0, scale: 0.8 }}
                             animate={{ opacity: 1, scale: 1 }}
                             transition={{ delay: 3 + (i * 0.5) }}
                           >
                             {i === 3 && (
                                <motion.div className="absolute -inset-1 border-2 border-purple-400 rounded" animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} />
                             )}
                             {calc}
                           </motion.div>
                        ))}
                      </div>

                      <motion.div 
                        className="text-center mt-2 p-3 bg-purple-500/20 border border-purple-500/50 rounded-lg text-purple-300 font-bold text-base md:text-lg flex items-center justify-center gap-3 relative z-10 shadow-[inset_0_0_20px_rgba(168,85,247,0.2)]"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 5.5 }}
                      >
                         <span className="animate-pulse">✨</span> Period repeats every 4 steps: <span className="text-white text-2xl md:text-3xl drop-shadow-[0_0_15px_rgba(168,85,247,1)]">r = 4</span> <span className="animate-pulse">✨</span>
                      </motion.div>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent><p className="font-bold">A classical PC does this sequentially. Quantum does it exponentially faster using QFT!</p></TooltipContent>
                </Tooltip>

                {/* Step 3 */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div 
                      className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-lg border border-slate-700 cursor-help hover:bg-slate-800 transition-colors"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 6.5 }}
                    >
                      <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center font-bold text-xl border border-emerald-500/30">3</div>
                      <div className="flex-1">
                        <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Classical Factorization</div>
                        <div className="mb-2 text-sm md:text-base">Calculate: <span className="font-mono bg-slate-900 px-2 py-1 rounded">GCD(a^(r/2) ± 1, N)</span></div>
                        <motion.div className="text-sm md:text-base space-y-1 text-slate-300 mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 7.5 }}>
                          <div>• p = GCD(7² + 1, 15) = GCD(50, 15) = <span className="text-emerald-400 font-bold text-xl md:text-2xl drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">5</span></div>
                          <div>• q = GCD(7² - 1, 15) = GCD(48, 15) = <span className="text-emerald-400 font-bold text-xl md:text-2xl drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">3</span></div>
                        </motion.div>
                      </div>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent><p className="font-bold">Using the GCD formula, we effortlessly extract the prime factors.</p></TooltipContent>
                </Tooltip>

              </div>
            </div>
            
            <div className="mt-8 bg-slate-900 border border-slate-700 p-4 md:p-6 rounded-2xl shadow-xl max-w-xl text-center backdrop-blur-md">
              <p className="text-slate-300 font-medium text-sm md:text-base leading-relaxed">
                By finding the <span className="text-purple-400 font-bold">period</span> of a function incredibly fast, Shor's algorithm exponentially speeds up prime factorization.
              </p>
            </div>
          </motion.div>
        )}

        {activeSimulation === 'grovers' && (
          <motion.div 
            key="grovers"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center relative z-10 w-full px-4"
          >
            <h2 className="text-2xl md:text-3xl font-black mb-4 md:mb-8 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500 tracking-widest uppercase text-center">Grover's Search</h2>
            
            <div className="relative w-full max-w-3xl h-[20rem] md:h-[28rem] bg-slate-900 rounded-xl border border-slate-700 shadow-2xl p-3 md:p-6 flex flex-col justify-center overflow-hidden cursor-help">
               <Tooltip>
                 <TooltipTrigger asChild>
                   <div className="absolute inset-0 flex items-center px-4 md:px-8 gap-2 md:gap-3 w-full justify-between z-10">
                     {[...Array(16)].map((_, i) => {
                        const isTarget = i === 11;
                        return (
                          <div key={i} className="h-full flex flex-col justify-center relative w-full pt-16 pb-12">
                            {/* Positive Amplitude */}
                            <div className="flex-1 flex items-end justify-center w-full">
                              <motion.div 
                                className={`w-full rounded-t-sm ${isTarget ? 'bg-gradient-to-t from-rose-600 to-rose-400 shadow-[0_0_15px_#e11d48]' : 'bg-slate-500'}`}
                                initial={{ height: '20%' }}
                                animate={{ 
                                  height: isTarget ? ['20%', '0%', '80%', '95%'] : ['20%', '20%', '5%', '2%'],
                                  opacity: isTarget ? 1 : 0.5
                                }}
                                transition={{ duration: 8, times: [0, 0.3, 0.6, 1], repeat: Infinity, repeatDelay: 2 }}
                              />
                            </div>
                            
                            {/* Zero line spacer */}
                            <div className="h-0.5 w-full bg-slate-700 my-0.5 relative overflow-visible shrink-0"></div>

                            {/* Negative Amplitude */}
                            <div className="flex-1 flex items-start justify-center w-full">
                              {isTarget && (
                                <motion.div 
                                  className="w-full rounded-b-sm bg-gradient-to-b from-rose-600 to-rose-900 opacity-60"
                                  initial={{ height: '0%' }}
                                  animate={{ height: ['0%', '20%', '0%', '0%'] }}
                                  transition={{ duration: 8, times: [0, 0.3, 0.6, 1], repeat: Infinity, repeatDelay: 2 }}
                                />
                              )}
                            </div>

                            {/* Labels for target */}
                            {isTarget && (
                              <motion.div 
                                className="absolute bottom-4 left-1/2 -translate-x-1/2 text-rose-400 font-mono text-[10px] md:text-sm font-bold whitespace-nowrap"
                                animate={{ opacity: [0, 0, 1, 1] }}
                                transition={{ duration: 8, times: [0, 0.3, 0.6, 1], repeat: Infinity, repeatDelay: 2 }}
                              >
                                |1011⟩
                              </motion.div>
                            )}
                          </div>
                        );
                     })}
                   </div>
                 </TooltipTrigger>
                 <TooltipContent>
                    <p className="font-bold">Amplitude Amplification: The target's probability grows while others shrink.</p>
                 </TooltipContent>
               </Tooltip>

               {/* Mean Line */}
               <motion.div 
                 className="absolute left-8 right-8 border-t-2 border-dashed border-emerald-400/50 z-20 pointer-events-none"
                 style={{ top: 'calc(50% - 2rem)' }}
                 animate={{ top: ['calc(50% - 2rem)', 'calc(50% - 1.5rem)', 'calc(50% + 1rem)', 'calc(50% + 1rem)'], opacity: [1, 1, 1, 0] }}
                 transition={{ duration: 8, times: [0, 0.3, 0.6, 1], repeat: Infinity, repeatDelay: 2 }}
               >
                 <span className="absolute right-0 -top-6 text-emerald-400 text-xs font-bold bg-slate-900/80 px-2 py-0.5 rounded">Mean Amplitude</span>
               </motion.div>

               {/* Zero Line overall */}
               <div className="absolute left-0 right-0 top-1/2 h-px bg-slate-600 z-0 pointer-events-none"></div>

               {/* Stage Labels / Visual Cues */}
               <div className="absolute top-4 md:top-6 left-1/2 -translate-x-1/2 text-center w-full z-30 pointer-events-none">
                 <motion.div animate={{ opacity: [1, 0, 0, 0] }} transition={{ duration: 8, times: [0, 0.25, 0.6, 1], repeat: Infinity, repeatDelay: 2 }} className="absolute inset-0">
                   <div className="inline-block bg-slate-800 border border-slate-600 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-slate-300 font-bold shadow-xl text-xs md:text-base">
                     Step 1: Superposition (Equal Probability)
                   </div>
                 </motion.div>
                 
                 <motion.div animate={{ opacity: [0, 1, 0, 0] }} transition={{ duration: 8, times: [0, 0.25, 0.6, 1], repeat: Infinity, repeatDelay: 2 }} className="absolute inset-0">
                   <div className="inline-block bg-rose-900/80 border border-rose-500 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-rose-300 font-bold shadow-xl shadow-rose-900/50 text-xs md:text-base">
                     Step 2: Oracle (Flips Target Phase)
                   </div>
                 </motion.div>

                 <motion.div animate={{ opacity: [0, 0, 1, 0] }} transition={{ duration: 8, times: [0, 0.25, 0.6, 1], repeat: Infinity, repeatDelay: 2 }} className="absolute inset-0">
                   <div className="inline-block bg-emerald-900/80 border border-emerald-500 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-emerald-300 font-bold shadow-xl shadow-emerald-900/50 text-xs md:text-base">
                     Step 3: Diffusion (Inversion about Mean)
                   </div>
                 </motion.div>

                 <motion.div animate={{ opacity: [0, 0, 0, 1] }} transition={{ duration: 8, times: [0, 0.25, 0.6, 1], repeat: Infinity, repeatDelay: 2 }} className="absolute inset-0">
                   <div className="inline-block bg-blue-900/80 border border-blue-500 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-blue-300 font-bold shadow-xl shadow-blue-900/50 text-xs md:text-base">
                     Step 4: Target Amplified! (Measure)
                   </div>
                 </motion.div>
               </div>
            </div>
            
            <div className="mt-8 bg-slate-900 border border-slate-700 p-4 md:p-6 rounded-2xl shadow-xl max-w-xl text-center backdrop-blur-md">
               <p className="text-slate-300 font-medium text-sm md:text-base leading-relaxed">
                 <span className="text-rose-400 font-bold">Amplitude Amplification:</span> The <span className="text-rose-400">Oracle</span> identifies the target by flipping its phase negative. 
                 Then, the <span className="text-emerald-400">Diffusion Operator</span> reflects all amplitudes around the average, drastically shrinking wrong answers and boosting the correct one over <span className="font-mono text-blue-300">O(√N)</span> iterations.
               </p>
            </div>
          </motion.div>
        )}

        {activeSimulation === 'circuit' && (
          <motion.div 
            key="circuit"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center relative z-10 w-full px-4"
          >
            <h2 className="text-2xl md:text-3xl font-black mb-4 md:mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 tracking-widest uppercase">Circuit Builder</h2>
            
            <CircuitBuilder initialConfig={circuitConfig} />

            <div className="mt-8 bg-slate-900 border border-slate-700 p-4 md:p-6 rounded-2xl shadow-xl max-w-xl text-center backdrop-blur-md">
              <p className="text-slate-300 font-medium text-sm md:text-base leading-relaxed">
                Build your own 2-qubit circuit by dragging gates onto the wires. Observe how <span className="text-emerald-400 font-bold">superposition</span> and <span className="text-blue-400 font-bold">entanglement</span> change the probability distribution!
              </p>
            </div>
          </motion.div>
        )}

        {activeSimulation === 'bloch' && (
          <motion.div 
            key="bloch"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center relative z-10 w-full max-w-2xl px-4"
          >
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 tracking-widest uppercase text-center">Bloch Sphere Visualizer</h2>
            
            <BlochSphere qubitState={blochState || { theta: 0, phi: 0 }} />

            <div className="mt-6 bg-slate-900 border border-slate-700 p-4 md:p-6 rounded-2xl shadow-xl w-full text-center backdrop-blur-md">
               <p className="text-slate-300 font-medium text-sm md:text-base leading-relaxed">
                 The <span className="text-indigo-400 font-bold">Bloch Sphere</span> is a geometric representation of a single qubit state. The vector <span className="text-emerald-400 font-bold">|ψ⟩</span> points to a surface location defined by the angles <span className="italic font-serif">θ</span> (theta) and <span className="italic font-serif">φ</span> (phi).
               </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
