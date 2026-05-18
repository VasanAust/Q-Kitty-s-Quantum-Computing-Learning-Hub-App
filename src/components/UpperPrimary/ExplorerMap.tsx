import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const MAP_STOPS = [
  { id: 'wave', label: 'Wave Station', emoji: '🌊', x: 100, y: 140 },
  { id: 'superposition', label: 'Superposition Island', emoji: '🏝️', x: 250, y: 80 },
  { id: 'measurement', label: 'Measurement Mountain', emoji: '⛰️', x: 400, y: 200 },
  { id: 'entanglement', label: 'Entanglement Canyon', emoji: '🌌', x: 550, y: 100 },
  { id: 'quantum_hq', label: 'Quantum HQ', emoji: '🏛️', x: 700, y: 140 },
];

const PATH_D = "M 100 140 C 150 140 180 80 250 80 C 320 80 350 200 400 200 C 450 200 480 100 550 100 C 620 100 650 140 700 140";

interface ExplorerMapProps {
  completedIds: string[];
  currentId: string;
}

export default function ExplorerMap({ completedIds, currentId }: ExplorerMapProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const isCompleted = (id: string) => completedIds.includes(id);
  const isCurrent = (id: string) => currentId === id;
  const isLocked = (id: string) => !isCompleted(id) && !isCurrent(id);

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox="0 0 760 280" className="w-[760px] h-[280px]">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Path */}
        <path d={PATH_D} fill="none" stroke="#64748b" strokeWidth="8" strokeDasharray="10 10" />
        <motion.path
          d={PATH_D}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="8"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: completedIds.length / MAP_STOPS.length }}
          transition={{ duration: 1 }}
        />

        {/* Stops */}
        {MAP_STOPS.map((stop) => (
          <g key={stop.id} onClick={() => isCompleted(stop.id) && setActiveTooltip(stop.id)}>
            <circle
              cx={stop.x}
              cy={stop.y}
              r="30"
              fill={isCompleted(stop.id) ? '#2563eb' : isCurrent(stop.id) ? '#60a3f5' : '#334155'}
              className="cursor-pointer"
            />
            {isCurrent(stop.id) && (
              <motion.circle
                cx={stop.x}
                cy={stop.y}
                r="40"
                fill="none"
                stroke="#60a3f5"
                strokeWidth="4"
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
            <text x={stop.x} y={stop.y + 10} textAnchor="middle" fontSize="30">{stop.emoji}</text>
            <text x={stop.x} y={stop.y + 55} textAnchor="middle" fontSize="14" fill="white" fontWeight="bold">
              {stop.label}
            </text>
            {isCompleted(stop.id) && <text x={stop.x + 20} y={stop.y - 20} fontSize="20">★</text>}
            
            {activeTooltip === stop.id && (
              <foreignObject x={stop.x - 50} y={stop.y - 80} width="100" height="40">
                <div className="bg-white text-blue-900 text-xs p-2 rounded shadow-lg text-center" onMouseLeave={() => setActiveTooltip(null)}>
                  {stop.label}<br/>✓ Completed!
                </div>
              </foreignObject>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
