import { UpperPrimarySimulationType } from './UpperPrimaryLab';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';

interface Props {
  activeSimulation: UpperPrimarySimulationType;
}

export default function UpperPrimarySimulationArea({ activeSimulation }: Props) {
  const [phaseOffset, setPhaseOffset] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (activeSimulation !== 'interference' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // Wave 1 (cyan)
    ctx.beginPath();
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.7;
    for (let x = 0; x < W; x++) {
      const y = H / 2 + 50 * Math.sin((x / W) * 2 * Math.PI * 3);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Wave 2 (pink)
    ctx.beginPath();
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.7;
    for (let x = 0; x < W; x++) {
      const y = H / 2 + 50 * Math.sin((x / W) * 2 * Math.PI * 3 + phaseOffset);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Result wave (white)
    ctx.beginPath();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.globalAlpha = 1;
    for (let x = 0; x < W; x++) {
      const y1 = 50 * Math.sin((x / W) * 2 * Math.PI * 3);
      const y2 = 50 * Math.sin((x / W) * 2 * Math.PI * 3 + phaseOffset);
      const y = H / 2 + (y1 + y2) / 2;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

  }, [activeSimulation, phaseOffset]);

  const getInterferenceLabel = () => {
    if (phaseOffset >= 0 && phaseOffset <= 0.3) return "Constructive ✨ (waves add up)";
    if (phaseOffset >= 2.8 && phaseOffset <= 3.5) return "Destructive 💥 (waves cancel)";
    return "Partial Interference 〰️";
  };

  const label = getInterferenceLabel();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(#4f46e5_2px,transparent_2px)] [background-size:24px_24px]"></div>

      <AnimatePresence mode="wait">
        {activeSimulation === 'none' && (
          <motion.div 
            key="none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center relative z-10 bg-white/50 backdrop-blur-sm p-8 rounded-[3rem] border-4 border-white shadow-xl max-w-sm m-4"
          >
            <motion.div 
              animate={{ y: [0, -10, 0] }} 
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="text-8xl mb-6 drop-shadow-xl"
            >🧬</motion.div>
            <h3 className="text-2xl font-black text-indigo-700 mb-2">Sim Dashboard</h3>
            <p className="text-indigo-900 font-bold text-lg">Ask Q-Bot to launch a quantum simulation! 🚀</p>
          </motion.div>
        )}

        {activeSimulation === 'interference' && (
          <motion.div 
            key="interference"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center relative z-10 w-full px-4"
          >
            <h2 className="text-3xl md:text-5xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 drop-shadow-sm text-center">Wave Interference 🌊</h2>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative w-64 h-40 md:w-80 md:h-48 overflow-hidden rounded-[2rem] border-4 border-blue-200 bg-blue-50/50 backdrop-blur cursor-help">
                  <canvas ref={canvasRef} width="640" height="400" className="w-full h-full" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-bold">Interference: Constructive (adding) or Destructive (canceling)!</p>
              </TooltipContent>
            </Tooltip>
            
            <div className="w-full max-w-lg mt-6 bg-white/60 p-4 rounded-3xl border border-white/50 shadow-sm">
                <label htmlFor="phaseSlider" className="block text-blue-900 font-bold mb-2">
                    Phase Offset: {phaseOffset.toFixed(2)} rad
                </label>
                <input 
                    id="phaseSlider"
                    type="range"
                    min="0"
                    max="6.283"
                    step="0.05"
                    value={phaseOffset}
                    onChange={(e) => setPhaseOffset(parseFloat(e.target.value))}
                    className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-400"
                    aria-label={`Phase offset control. Current mode: ${label}`}
                />
            </div>

            <div className="mt-4" aria-live="polite">
                <motion.p
                    key={label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-black text-indigo-900"
                >
                    {label}
                </motion.p>
            </div>

            <div className="mt-4 bg-white/80 backdrop-blur p-4 md:p-6 rounded-3xl border-4 border-white shadow-xl max-w-lg text-center">
              <p className="text-blue-900 font-bold text-sm md:text-base leading-relaxed">
                Drag the slider to push the waves in and out of phase. Watch the white result wave grow or shrink!
              </p>
            </div>
          </motion.div>
        )}

        {activeSimulation === 'measurement' && (
          <motion.div 
            key="measurement"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center relative z-10 w-full px-4"
          >
            <h2 className="text-3xl md:text-5xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 drop-shadow-sm text-center">Observation Collapse 👁️</h2>
            <div className="flex flex-col items-center gap-6">
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div 
                    className="w-32 h-32 md:w-40 md:h-40 relative flex items-center justify-center cursor-help"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* The blurry wave state */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl"
                      animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    />
                    
                    {/* The 'collapse' eye visual */}
                    <motion.div 
                      className="z-10 bg-white/90 w-24 h-24 rounded-full flex items-center justify-center shadow-xl border-4 border-purple-200"
                      animate={{ scale: [1, 0.9, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <span className="text-5xl">⚡</span>
                    </motion.div>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-bold">Measuring the system collapses it to an exact state.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="mt-8 bg-white/80 backdrop-blur p-4 md:p-6 rounded-3xl border-4 border-white shadow-xl max-w-lg text-center">
              <p className="text-purple-900 font-bold text-base md:text-lg leading-relaxed">
                When we aren't looking, it's a blurry <span className="text-pink-600 font-black">wave of possibilities</span>. The exact moment we look, it snaps into <span className="text-purple-600 font-black text-xl">ONE solid state</span>!
              </p>
            </div>
          </motion.div>
        )}

        {activeSimulation === 'entanglement' && (
          <motion.div 
            key="entanglement"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center relative z-10 w-full px-4"
          >
            <h2 className="text-3xl md:text-5xl font-black mb-10 text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-600 drop-shadow-sm text-center">Entangled Particles ⚛️</h2>
            <div className="flex gap-16 md:gap-32 items-center relative">
              <motion.div 
                className="absolute top-1/2 left-10 right-10 md:left-16 md:right-16 h-2 backdrop-blur-sm border-y border-teal-300 border-dashed"
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div 
                    className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-4xl shadow-[0_0_40px_rgba(20,184,166,0.6)] z-10 relative overflow-hidden border-4 border-white cursor-help"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  >
                    <div className="w-1/2 h-full bg-white/30 absolute left-0" />
                    <span className="drop-shadow-lg relative z-20">↑</span>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-bold">Affects the other instantly</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div 
                    className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-bl from-teal-400 to-emerald-500 flex items-center justify-center text-4xl shadow-[0_0_40px_rgba(20,184,166,0.6)] z-10 relative overflow-hidden border-4 border-white cursor-help"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  >
                    <div className="w-1/2 h-full bg-white/30 absolute right-0" />
                    <span className="drop-shadow-lg relative z-20">↓</span>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-bold">Always anti-aligned to the other</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="mt-12 bg-white/80 backdrop-blur p-4 md:p-6 rounded-3xl border-4 border-white shadow-xl max-w-lg text-center">
              <p className="text-teal-900 font-bold text-base md:text-lg leading-relaxed">
                They share a <span className="bg-teal-100 text-teal-700 px-2 rounded-lg font-black inline-block">secret connection</span>. No matter how far apart they are, if one spins UP, the other instantly spins DOWN!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
