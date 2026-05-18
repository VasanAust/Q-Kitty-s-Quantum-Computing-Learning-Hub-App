import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GateName, applyGates, getMeasurementProbs, getStateLabel, generateQiskit, getSingleQubitGate4x4 } from '../../lib/quantumSimulator';
import * as math from 'mathjs';
import { Copy, Trash2, Zap, Play, Info } from 'lucide-react';

const GATES: GateName[] = ['H', 'X', 'Y', 'Z', 'S', 'T', 'CNOT'];

interface DraggableGateProps {
  name: GateName;
}

function DraggableGate({ name }: DraggableGateProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `palette-${name}`,
  });
  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="w-12 h-12 flex items-center justify-center bg-indigo-600 text-white font-black rounded-lg cursor-grab active:cursor-grabbing hover:bg-indigo-500 transition-colors shadow-lg border border-indigo-400/30"
    >
      {name}
    </div>
  );
}

interface DroppableSlotProps {
  qubit: 0 | 1;
  slot: number;
  gate: GateName | null;
  onRemove: () => void;
}

function DroppableSlot({ qubit, slot, gate, onRemove }: DroppableSlotProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `slot-${qubit}-${slot}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`w-14 h-14 relative flex items-center justify-center rounded-xl border-2 border-dashed transition-all ${
        isOver ? 'border-emerald-400 bg-emerald-400/20 scale-110 z-10' : 'border-slate-700 bg-slate-900/50 hover:border-slate-500'
      }`}
    >
      {gate && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-12 h-12 bg-indigo-600 text-white font-black rounded-lg flex items-center justify-center shadow-lg group relative"
        >
          {gate}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 size={12} />
          </button>
          
          {gate === 'CNOT' && qubit === 0 && (
            <div className="absolute top-12 left-1/2 -translate-x-1/2 w-0.5 h-10 bg-indigo-400 z-0 pointer-events-none" />
          )}
        </motion.div>
      )}
    </div>
  );
}

export type CircuitConfig = (GateName | null)[][];

interface Props {
  initialConfig?: CircuitConfig;
}

export default function CircuitBuilder({ initialConfig }: Props) {
  const [circuit, setCircuit] = useState<CircuitConfig>(
    initialConfig || [
      [null, null, null, null, null],
      [null, null, null, null, null]
    ]
  );
  const [results, setResults] = useState<any>(null);
  const [stateLabel, setStateLabel] = useState<string>('');
  const [amplitudes, setAmplitudes] = useState<any[]>([]);

  const runSimulation = () => {
    let currentState = math.matrix([1, 0, 0, 0]); // |00>
    
    // Iterate slots first (column order)
    for (let s = 0; s < 5; s++) {
      if (circuit[0][s] === 'CNOT' || circuit[1][s] === 'CNOT') {
        const CNOT_MAT = math.matrix([[1,0,0,0],[0,1,0,0],[0,0,0,1],[0,0,1,0]]);
        currentState = math.multiply(CNOT_MAT, currentState) as math.Matrix;
      } else {
        if (circuit[0][s]) currentState = math.multiply(getSingleQubitGate4x4(circuit[0][s] as GateName, 0), currentState) as math.Matrix;
        if (circuit[1][s]) currentState = math.multiply(getSingleQubitGate4x4(circuit[1][s] as GateName, 1), currentState) as math.Matrix;
      }
    }

    const ampArray = (currentState.toArray() as any[]).map(val => {
      const c = math.complex(val);
      return {
        r: (math.abs(c) as number).toFixed(2),
        phi: ((math.arg(c) as number) * 180 / Math.PI).toFixed(1)
      };
    });

    setAmplitudes(ampArray);
    setResults(getMeasurementProbs(currentState));
    setStateLabel(getStateLabel(currentState));
  };

  useEffect(() => {
    const timer = setTimeout(runSimulation, 200);
    return () => clearTimeout(timer);
  }, [circuit]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id.toString().startsWith('palette-')) {
      const gateName = active.id.toString().replace('palette-', '') as GateName;
      const [_, qStr, sStr] = over.id.toString().split('-');
      const q = parseInt(qStr) as 0 | 1;
      const s = parseInt(sStr);

      const newCircuit = [...circuit.map(row => [...row])];
      newCircuit[q][s] = gateName;
      setCircuit(newCircuit);
    }
  };

  const removeGate = (q: number, s: number) => {
    const newCircuit = [...circuit.map(row => [...row])];
    newCircuit[q][s] = null;
    setCircuit(newCircuit);
  };

  const loadPreset = (name: string) => {
    if (name === 'Hadamard') {
      setCircuit([
        ['H', null, null, null, null],
        [null, null, null, null, null]
      ]);
    } else if (name === 'Bell State') {
      setCircuit([
        ['H', 'CNOT', null, null, null],
        [null, null, null, null, null]
      ]);
    } else if (name === 'GHZ-like') {
      setCircuit([
        ['H', 'CNOT', 'H', null, null],
        [null, null, 'H', 'CNOT', null]
      ]);
    }
  };

  const copyQiskit = () => {
    const sequence: { name: GateName; qubit?: 0 | 1 }[] = [];
    for (let s = 0; s < 5; s++) {
      if (circuit[0][s] === 'CNOT' || circuit[1][s] === 'CNOT') {
        sequence.push({ name: 'CNOT' });
      } else {
        if (circuit[0][s]) sequence.push({ name: circuit[0][s] as GateName, qubit: 0 });
        if (circuit[1][s]) sequence.push({ name: circuit[1][s] as GateName, qubit: 1 });
      }
    }
    const code = generateQiskit(sequence);
    navigator.clipboard.writeText(code);
    alert('Qiskit code copied to clipboard!');
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-5xl">
        {/* Palette */}
        <div className="w-full md:w-32 flex md:flex-col gap-3 p-4 bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-700 overflow-x-auto md:overflow-visible">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 hidden md:block">Gate Lab</p>
          {GATES.map(g => <DraggableGate key={g} name={g} />)}
        </div>

        {/* Builder */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-700 relative overflow-hidden shadow-2xl">
            <div className="absolute left-0 top-0 w-12 h-full bg-slate-800/20 flex flex-col justify-center items-center gap-14 border-r border-slate-800">
               <span className="font-mono text-xs text-slate-500 font-bold tracking-tighter">q₀</span>
               <span className="font-mono text-xs text-slate-500 font-bold tracking-tighter">q₁</span>
            </div>

            <div className="ml-8 space-y-12 relative">
               {/* Grid Wires */}
               <div className="absolute left-0 top-1/4 w-full h-[2px] bg-slate-800 -translate-y-1/2 z-0" />
               <div className="absolute left-0 top-3/4 w-full h-[2px] bg-slate-800 -translate-y-1/2 z-0" />

               {/* Wire 0 */}
               <div className="flex gap-4 relative z-10">
                 {[0, 1, 2, 3, 4].map(s => (
                   <DroppableSlot key={`0-${s}`} qubit={0} slot={s} gate={circuit[0][s]} onRemove={() => removeGate(0, s)} />
                 ))}
               </div>

               {/* Wire 1 */}
               <div className="flex gap-4 relative z-10">
                 {[0, 1, 2, 3, 4].map(s => (
                   <DroppableSlot key={`1-${s}`} qubit={1} slot={s} gate={circuit[1][s]} onRemove={() => removeGate(1, s)} />
                 ))}
               </div>
            </div>
          </div>

          {/* Results */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="text-emerald-400 font-black text-xs uppercase tracking-widest">State Analyzer</h3>
                 <span className="text-[10px] text-slate-500 font-mono bg-slate-950 px-2 py-1 rounded">{stateLabel}</span>
               </div>
               <div className="space-y-3">
                 {results && Object.entries(results).map(([state, prob]: any) => (
                   <div key={state} className="space-y-1">
                     <div className="flex justify-between text-[10px] font-mono text-slate-400">
                       <span>{state}</span>
                       <span>{(prob * 100).toFixed(1)}%</span>
                     </div>
                     <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${prob * 100}%` }}
                         className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                       />
                     </div>
                   </div>
                 ))}
               </div>
             </div>

             <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700">
                <h3 className="text-purple-400 font-black text-xs uppercase tracking-widest mb-4">Complex Amplitudes</h3>
                <div className="space-y-2">
                  {['|00⟩', '|01⟩', '|10⟩', '|11⟩'].map((label, i) => (
                    <div key={label} className="flex justify-between items-center bg-slate-800/50 p-2 rounded-lg border border-slate-800">
                      <span className="font-mono text-xs text-slate-500">{label}</span>
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-white">{amplitudes[i]?.r || '0.00'}</div>
                        <div className="text-[8px] text-purple-400 font-mono">∠{amplitudes[i]?.phi || '0.0'}°</div>
                      </div>
                    </div>
                  ))}
                </div>
             </div>

             <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 flex flex-col justify-between">
                <div>
                   <h3 className="text-blue-400 font-black text-xs uppercase tracking-widest mb-4">Presets & Tools</h3>
                   <div className="flex flex-wrap gap-2">
                     {['Hadamard', 'Bell State', 'GHZ-like'].map(p => (
                       <button 
                         key={p} 
                         onClick={() => loadPreset(p)}
                         className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg text-[10px] font-bold transition-all border border-slate-700"
                        >
                          {p}
                       </button>
                     ))}
                   </div>
                </div>
                
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-800">
                  <button 
                    onClick={copyQiskit}
                    className="flex-1 flex justify-center items-center gap-2 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-all shadow-lg"
                  >
                    <Copy size={14} /> Qiskit
                  </button>
                  <button 
                    className="flex-1 flex justify-center items-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-black transition-all"
                  >
                    <Play size={14} /> Step-by-Step
                  </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </DndContext>
  );
}
