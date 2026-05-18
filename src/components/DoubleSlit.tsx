import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'motion/react';

interface DoubleSlitProps {
  nElectronsFired: number;
  onFire: (n: number) => void;
  isObserving: boolean;
  onToggleObserve: () => void;
  onReset: () => void;
  isFiring: boolean;
}

export default function DoubleSlit({ nElectronsFired, onFire, isObserving, onToggleObserve, onReset, isFiring }: DoubleSlitProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawElectron = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.beginPath();
    ctx.arc(x, y, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(96,165,250,0.8)';
    ctx.fill();
    ctx.closePath();
  };

  const drawBase = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Barrier
    ctx.fillStyle = '#334155'; // slate-700
    ctx.fillRect(200, 0, 20, 300);
    
    // Slits
    ctx.clearRect(200, 100, 20, 20);
    ctx.clearRect(200, 180, 20, 20);

    // Gun
    ctx.fillStyle = '#475569'; // slate-600
    ctx.fillRect(40, 130, 40, 40);
    ctx.fillStyle = '#22c55e'; // green-500
    ctx.beginPath();
    ctx.arc(80, 150, 5, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  useEffect(() => {
    drawBase();
  }, [drawBase]);

  return (
    <div className="flex flex-col gap-4 items-center">
      <canvas ref={canvasRef} width={500} height={300} className="bg-black rounded-2xl" />
      
      <div className="flex gap-2 text-sm font-bold">
        {[1, 10, 100, 1000].map(n => (
          <button key={n} onClick={() => onFire(n)} disabled={isFiring} className="px-4 py-2 bg-teal-600 rounded-lg text-white">Fire {n}</button>
        ))}
      </div>
      
      <div className="flex gap-2">
        <button onClick={onToggleObserve} className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 ${isObserving ? 'bg-red-600 text-white' : 'bg-slate-200'}`}>
          {isObserving ? '👁 Observing' : 'Observing Off'}
        </button>
        <button onClick={onReset} className="px-4 py-2 bg-slate-700 text-white rounded-lg font-bold">Reset</button>
      </div>
      <p className="font-bold text-lg">
        {nElectronsFired} electrons fired
      </p>
      <p className="text-xl font-bold">
        {isObserving ? "Observation collapses the wave — electrons act as PARTICLES 🎯" : "Electrons travel as probability WAVES, interfering with themselves ✨"}
      </p>
    </div>
  );
}
