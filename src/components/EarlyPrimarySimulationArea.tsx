import { SimulationType } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';

export default function EarlyPrimarySimulationArea({ activeSimulation }: { activeSimulation: SimulationType }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#4f46e5_2px,transparent_2px)] [background-size:24px_24px]"></div>

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
            >🔬</motion.div>
            <h3 className="text-2xl font-black text-purple-600 mb-2">Simulation Screen</h3>
            <p className="text-purple-800 font-bold text-lg">Ask Q-Kitty for a magic trick to see it here!</p>
          </motion.div>
        )}

        {activeSimulation === 'qubit' && (
          <motion.div 
            key="qubit"
            initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: 20 }}
            className="flex flex-col items-center relative z-10 w-full px-4"
          >
            <h2 className="text-2xl md:text-4xl font-black mb-4 md:mb-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 drop-shadow-sm text-center px-4">Qubit Coin! 🪙</h2>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative w-16 h-16 md:w-28 md:h-28 perspective-1000 cursor-help">
                  <motion.div 
                    className="w-full h-full rounded-full border-4 md:border-8 border-yellow-300 bg-gradient-to-br from-yellow-400 to-orange-500 shadow-[0_0_60px_rgba(250,204,21,0.6)] flex items-center justify-center transform-style-3d text-3xl md:text-7xl font-black text-white relative overflow-hidden"
                    animate={{ rotateY: [0, 360], rotateX: [0, 180, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="absolute inset-0 bg-white/30 w-1/2 -skew-x-12"></div>
                    <span className="drop-shadow-lg">0/1</span>
                  </motion.div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-bold">A Qubit (Quantum Bit) can be both 0 and 1 at the same time!</p>
              </TooltipContent>
            </Tooltip>
            
            <div className="mt-8 md:mt-10 bg-white/80 backdrop-blur p-4 md:p-6 rounded-3xl border-4 border-white shadow-xl max-w-lg text-center">
              <p className="text-blue-900 font-bold text-base md:text-lg leading-relaxed">
                A regular coin is <span className="text-pink-500 font-black">Heads</span> OR <span className="text-pink-500 font-black">Tails</span>. <br/><br/>
                A Qubit is a magic spinning coin that is <span className="text-purple-600 font-black text-xl bg-purple-100 px-2 rounded-lg inline-block transform rotate-2">BOTH</span> at the exact same time until you catch it! ✨
              </p>
            </div>
          </motion.div>
        )}

        {activeSimulation === 'superposition' && (
          <motion.div 
            key="superposition"
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 50 }}
            className="flex flex-col items-center relative z-10 w-full px-4"
          >
            <h2 className="text-2xl md:text-4xl font-black mb-4 md:mb-10 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 drop-shadow-sm text-center px-4">Superposition 📦</h2>
            <div className="flex gap-4 md:gap-8 items-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div 
                    className="w-32 h-32 md:w-56 md:h-56 bg-gradient-to-b from-purple-500 to-indigo-600 border-4 md:border-8 border-purple-300 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center relative overflow-hidden shadow-2xl cursor-help"
                    animate={{ 
                      boxShadow: ["0 20px 25px -5px rgba(0,0,0,0.1), 0 0 0 rgba(168,85,247,0)", "0 20px 25px -5px rgba(0,0,0,0.1), 0 0 50px rgba(168,85,247,0.8)", "0 20px 25px -5px rgba(0,0,0,0.1), 0 0 0 rgba(168,85,247,0)"]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <div className="absolute top-0 left-0 w-full h-1/3 bg-white/20"></div>
                    <motion.div 
                      className="absolute inset-0 flex items-center justify-center text-5xl md:text-8xl drop-shadow-xl"
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    >
                      😸
                    </motion.div>
                    <motion.div 
                      className="absolute inset-0 flex items-center justify-center text-5xl md:text-8xl drop-shadow-xl"
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    >
                      💤
                    </motion.div>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-bold">Superposition means being in multiple states at once until measured!</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="mt-8 md:mt-10 bg-white/80 backdrop-blur p-4 md:p-6 rounded-3xl border-4 border-white shadow-xl max-w-lg text-center">
              <p className="text-purple-900 font-bold text-base md:text-lg leading-relaxed">
                The kitty is <span className="bg-pink-100 text-pink-600 px-2 rounded-lg font-black inline-block transform -rotate-2">AWAKE</span> and <span className="bg-indigo-100 text-indigo-600 px-2 rounded-lg font-black inline-block transform rotate-2">ASLEEP</span> inside the magic box! It's doing both things at once. We only know for sure when we peek! 👀
              </p>
            </div>
          </motion.div>
        )}

        {activeSimulation === 'entanglement' && (
          <motion.div 
            key="entanglement"
            initial={{ opacity: 0, scale: 0.5, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 50 }}
            className="flex flex-col items-center relative z-10 w-full px-4"
          >
            <h2 className="text-3xl md:text-4xl font-black mb-10 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-600 drop-shadow-sm text-center">Magically Connected! 💕</h2>
            <div className="flex gap-16 md:gap-24 items-center relative">
              <motion.div 
                className="absolute top-1/2 left-10 right-10 md:left-20 md:right-20 h-4 bg-gradient-to-r from-pink-400 to-rose-400 -translate-y-1/2 rounded-full"
                style={{ filter: 'blur(3px)' }}
                animate={{ opacity: [0.4, 1, 0.4], height: ["8px", "16px", "8px"] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div 
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 border-4 border-white flex items-center justify-center text-5xl md:text-7xl shadow-[0_0_40px_rgba(244,63,94,0.6)] z-10 relative overflow-hidden cursor-help"
                    animate={{ rotateY: [0, 180, 0], y: [-10, 10, -10] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <div className="absolute inset-0 bg-white/30 w-1/2"></div>
                    <span className="drop-shadow-lg">⭐</span>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-bold">Particle A instantly affects Particle B!</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div 
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 border-4 border-white flex items-center justify-center text-5xl md:text-7xl shadow-[0_0_40px_rgba(168,85,247,0.6)] z-10 relative overflow-hidden cursor-help"
                    animate={{ rotateY: [0, -180, 0], y: [10, -10, 10] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <div className="absolute inset-0 bg-white/30 w-1/2"></div>
                    <span className="drop-shadow-lg">⭐</span>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-bold">Particle B instantly mirrors Particle A!</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="mt-12 bg-white/80 backdrop-blur p-4 md:p-6 rounded-3xl border-4 border-white shadow-xl max-w-lg text-center">
              <p className="text-rose-900 font-bold text-base md:text-lg leading-relaxed">
                These two stars are <span className="bg-rose-100 text-rose-600 px-2 rounded-lg font-black inline-block transform -rotate-1">BEST FRIENDS</span>. Even if they are miles apart, whatever one star does, the other does instantly! 🎀
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
