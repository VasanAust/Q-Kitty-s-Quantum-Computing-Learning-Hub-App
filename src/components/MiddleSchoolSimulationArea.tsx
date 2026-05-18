import { MiddleSchoolSimulationType } from './MiddleSchoolLab';
import { motion, AnimatePresence, useMotionValue, useTransform, useMotionValueEvent, animate } from 'motion/react';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { useEffect, useState, useMemo, useRef } from 'react';
import DoubleSlit from './DoubleSlit';


// Custom hook to calculate probability density
function useProbabilityDensity(animatedScale: number) {
  return useMemo(() => {
    const bins = [];
    for (let i = 0; i < 8; i++) {
        const r = (i + 1) / 8;
        // P(r) ≈ r² * Math.exp(-2.5 * r)
        const density = Math.pow(r, 2) * Math.exp(-2.5 * r);
        bins.push(density * animatedScale * 50); // Scale for visual representation
    }
    return bins;
  }, [animatedScale]);
}

interface HistogramProps {
  bins: number[];
  isAnimating: boolean;
}

function ProbabilityHistogram({ bins, isAnimating }: HistogramProps) {
  const max = Math.max(...bins, 0.1);
  return (
    <div 
      className="bg-slate-900/60 rounded-2xl p-4 h-48 flex items-end gap-1 w-full relative"
      role="img" 
      aria-label="Probability density graph showing electron location likelihood at 8 radial distances from nucleus"
    >
        <span className="[writing-mode:vertical-lr] rotate-180 text-xs text-slate-400 absolute left-2 top-10">Probability</span>
        {bins.map((bin, i) => (
            <motion.div 
               key={i}
               className="flex-1 bg-gradient-to-t from-cyan-600 to-cyan-300 rounded-t-sm"
               initial={{ height: 0 }}
               animate={{ height: `${(bin/max)*90}%` }}
               transition={{ duration: 0.4 }}
            />
        ))}
        <div className="absolute bottom-1 left-4 right-4 flex justify-between text-xs text-slate-400">
            <span>near</span>
            <span>far</span>
        </div>
    </div>
  );
}

interface Props {
  activeSimulation: MiddleSchoolSimulationType;
  onQuizRequest?: () => void;
}

export default function MiddleSchoolSimulationArea({ activeSimulation, onQuizRequest }: Props) {
  const scale = useMotionValue(1);

  // Animate scale
  useEffect(() => {
    if (activeSimulation === 'probability') {
        animate(scale, [0.95, 1.05, 0.95], { duration: 4, repeat: Infinity, ease: 'easeInOut' });
    }
  }, [activeSimulation, scale]);

  const [currentScale, setCurrentScale] = useState(1);
  useMotionValueEvent(scale, "change", (latest) => setCurrentScale(latest));

// ... existing code ...
  const bins = useProbabilityDensity(currentScale);

  // DoubleSlit State
  const [nElectronsFired, setNElectronsFired] = useState(0);
  const [isObserving, setIsObserving] = useState(false);
  const [isFiring, setIsFiring] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fireElectrons = async (n: number) => {
      setIsFiring(true);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const BATCH_SIZE = 50;
      let firedCount = 0;

      while(firedCount < n) {
          const batchSize = Math.min(BATCH_SIZE, n - firedCount);
          for (let i = 0; i < batchSize; i++) {
            let y = 0;
            if (!isObserving) {
              // Interference Pattern: I(y) = cos²(6π * sin(atan2(y-150, 400)))
              // Rejection sampling
              let accepted = false;
              while (!accepted) {
                  const testY = Math.random() * 300;
                  const intensity = Math.pow(Math.cos(6 * Math.PI * Math.sin(Math.atan2(testY - 150, 400))), 2);
                  if (Math.random() < intensity) {
                      y = testY;
                      accepted = true;
                  }
              }
            } else {
                // Two bands
                const slit = Math.random() < 0.5 ? 100 : 200;
                y = slit + (Math.random() - 0.5) * 40;
            }
            
            ctx.fillStyle = 'rgba(96,165,250,0.8)';
            ctx.beginPath();
            ctx.arc(475 + (Math.random() - 0.5) * 4, y, 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
          }
          firedCount += batchSize;
          setNElectronsFired(prev => prev + batchSize);
          await new Promise(r => setTimeout(r, 10));
      }
      setIsFiring(false);
  };
  
  const resetScreen = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(460, 0, 40, 300);
      setNElectronsFired(0);
  };

  const renderQuizButton = () => {
//... existing code ...
    if (!onQuizRequest) return null;
    return (
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={onQuizRequest}
        aria-label="Take Quiz for this topic"
        className="absolute bottom-4 right-4 z-20 bg-white/90 backdrop-blur border-2 border-teal-200 text-teal-800 font-bold px-4 py-2 rounded-xl shadow-lg hover:bg-teal-50 hover:border-teal-300 transition-all active:scale-95 flex items-center gap-2 focus:ring-4 focus:ring-teal-300 focus:outline-none"
      >
        <span>📝 Take Quiz</span>
      </motion.button>
    );
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#0f766e_2px,transparent_2px)] [background-size:32px_32px]"></div>
      {renderQuizButton()}

      <AnimatePresence mode="wait">
        {activeSimulation === 'none' && (
          <motion.div 
            key="none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center relative z-10 bg-white/40 backdrop-blur-md p-8 rounded-[3rem] border-4 border-white/50 shadow-xl max-w-sm m-4"
          >
            <motion.div 
              animate={{ y: [0, -10, 0] }} 
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="text-8xl mb-6 drop-shadow-xl"
            >🔭</motion.div>
            <h3 className="text-2xl font-black text-teal-800 mb-2">Analysis Hub</h3>
            <p className="text-teal-900 font-bold text-lg">Input query to Nova to load a visualization model.</p>
          </motion.div>
        )}

        {activeSimulation === 'wave_particle' && (
          <motion.div 
            key="wave_particle"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center relative z-10 w-full px-4"
          >
            <h2 className="text-3xl md:text-5xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-500 drop-shadow-sm text-center">Double-Slit Experiment</h2>
            <div className="bg-slate-800 p-6 rounded-[2rem] border-4 border-slate-700 shadow-2xl">
              <DoubleSlit 
                nElectronsFired={nElectronsFired} 
                onFire={fireElectrons} 
                isObserving={isObserving} 
                onToggleObserve={() => setIsObserving(!isObserving)} 
                onReset={resetScreen}
                isFiring={isFiring}
              />
            </div>
          </motion.div>
        )}

        {activeSimulation === 'probability' && (
          <motion.div 
            key="probability"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center relative z-10 w-full px-4"
          >
            <h2 className="text-3xl md:text-5xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-500 drop-shadow-sm text-center">Probability Amplitudes</h2>
            
            <div className="flex flex-col md:flex-row gap-8 items-center w-full max-w-4xl justify-center relative">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full border-4 border-cyan-200 bg-cyan-900/10 backdrop-blur flex items-center justify-center overflow-hidden shadow-[inset_0_0_50px_rgba(6,182,212,0.2)] cursor-help">
                    {/* Nucleus */}
                    <div className="w-6 h-6 rounded-full bg-red-500 shadow-[0_0_15px_red] z-20" />
                    
                    {/* Electron Cloud (Probability Density) */}
                    <motion.div 
                      className="absolute inset-0"
                      style={{
                        background: 'radial-gradient(circle, rgba(6,182,212,0.8) 0%, rgba(6,182,212,0.2) 40%, transparent 70%)',
                        scale: scale
                      }}
                    />

                    {/* Electron measurement popups */}
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white]"
                        style={{
                          left: `${Math.random() * 80 + 10}%`,
                          top: `${Math.random() * 80 + 10}%`,
                        }}
                        animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                        transition={{ duration: 0.5, delay: Math.random() * 3, repeat: Infinity, repeatDelay: Math.random() * 2 + 1 }}
                      />
                    ))}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-bold">An electron exists as a probability cloud until measured.</p>
                </TooltipContent>
              </Tooltip>

              <div className="w-full md:w-64">
                <ProbabilityHistogram bins={bins} isAnimating={true} />
              </div>

              {/* Annotation */}
              <div className="absolute top-0 right-0 p-3 bg-white/60 backdrop-blur text-xs font-black rounded-lg shadow-sm border border-white/50 text-slate-800">
                Denser cloud = taller bar ↗
              </div>
            </div>

            <div className="mt-8 bg-white/80 backdrop-blur p-4 md:p-6 rounded-3xl border-4 border-white shadow-xl max-w-lg text-center">
              <p className="text-cyan-900 font-bold text-base md:text-lg leading-relaxed">
                Before measurement, the electron does not have a precise location. It exists as a <span className="text-blue-600 font-black">cloud of probabilities</span> defined by its amplitude.
              </p>
            </div>
          </motion.div>
        )}

        {activeSimulation === 'quantum_gates' && (
          <motion.div 
            key="quantum_gates"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center relative z-10 w-full px-4"
          >
            <h2 className="text-3xl md:text-5xl font-black mb-10 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 drop-shadow-sm text-center">Quantum Gates</h2>
            
            <div className="flex items-center gap-4 relative w-full max-w-md bg-white/50 backdrop-blur rounded-[2rem] p-8 border-4 border-white shadow-xl">
              {/* Qubit Line */}
              <div className="absolute top-1/2 left-0 right-0 h-2 bg-slate-300 -translate-y-1/2 z-0" />
              
              {/* State |0> */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="z-10 font-mono text-2xl font-bold bg-slate-800 text-white px-4 py-2 rounded-xl shadow-md border-2 border-slate-600 cursor-help">
                    |0⟩
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-bold">Initial basis state |0⟩</p>
                </TooltipContent>
              </Tooltip>
              
              <motion.div 
                 className="flex-1 h-2 relative z-10"
              >
                <motion.div 
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]"
                  animate={{ left: ['0%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              </motion.div>

              {/* Hadamard Gate */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div 
                    className="z-10 bg-teal-500 text-white font-black text-3xl w-16 h-16 flex items-center justify-center rounded-xl shadow-lg border-4 border-teal-300 cursor-help"
                    whileHover={{ scale: 1.1 }}
                  >
                    H
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-bold">Hadamard Gate (Creates Superposition)</p>
                </TooltipContent>
              </Tooltip>

              <motion.div 
                 className="flex-1 h-2 relative z-10"
              >
                {/* Resulting superposition particles */}
                <motion.div 
                  className="absolute top-1/2 -mt-4 w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]"
                  animate={{ left: ['0%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div 
                  className="absolute top-1/2 mt-1 w-3 h-3 bg-blue-400 rounded-full shadow-[0_0_10px_#60a5fa]"
                  animate={{ left: ['0%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              </motion.div>

              {/* State |+> */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="z-10 font-mono text-2xl font-bold bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-md border-2 border-emerald-400 cursor-help">
                    |+⟩
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-bold">Superposition state (|+⟩)</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="mt-12 bg-white/80 backdrop-blur p-4 md:p-6 rounded-3xl border-4 border-white shadow-xl max-w-lg text-center">
              <p className="text-emerald-900 font-bold text-base md:text-lg leading-relaxed">
                The <span className="bg-teal-100 text-teal-800 px-2 rounded-lg font-black inline-block border-2 border-teal-200">Hadamard (H) Gate</span> places a definite state like |0⟩ into a <span className="text-emerald-600 font-black">superposition</span> of states!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
