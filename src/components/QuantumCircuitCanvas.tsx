import { useState } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'motion/react';
import { simulateCircuit, Circuit, GateName } from '../lib/quantumMath';

function GateTile({ id }: { id: string }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
    const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;
    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="p-4 bg-emerald-500 text-white font-black rounded-lg cursor-grab border-2 border-emerald-300">
            {id}
        </div>
    );
}

function WireRow({ qubitIndex, gates }: { qubitIndex: number, gates: GateName[] }) {
    const { setNodeRef } = useDroppable({ id: `wire-${qubitIndex}` });
    return (
        <div ref={setNodeRef} className="relative h-20 bg-slate-200 rounded-lg flex items-center gap-2 p-2 w-full">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-400 -z-10" />
            {gates.map((g, i) => <div key={i} className="bg-emerald-600 px-3 py-2 text-white font-bold rounded-md">{g}</div>)}
        </div>
    );
}

export default function QuantumCircuitCanvas() {
    const [circuit, setCircuit] = useState<Circuit>({ qubit0: [], qubit1: [] });
    const probabilities = simulateCircuit(circuit);

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (over && over.id.startsWith('wire-')) {
            const gate = active.id as GateName;
            const qubitIndex = parseInt(over.id.split('-')[1]);
            setCircuit(prev => ({
                ...prev,
                [qubitIndex === 0 ? 'qubit0' : 'qubit1']: [...prev[qubitIndex === 0 ? 'qubit0' : 'qubit1'], gate]
            }));
        }
    };

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4">
                <div className="flex flex-col gap-2 p-4 bg-slate-100 rounded-xl">
                    {['H', 'X', 'Z', 'CNOT'].map(g => <GateTile key={g} id={g} />)}
                </div>
                <div className="flex flex-col gap-4 w-96">
                    <WireRow qubitIndex={0} gates={circuit.qubit0} />
                    <WireRow qubitIndex={1} gates={circuit.qubit1} />
                </div>
            </div>
            <div className="flex justify-between mt-8">
                {['|00>', '|01>', '|10>', '|11>'].map((s, i) => (
                    <div key={s} className="flex flex-col items-center gap-2">
                        <motion.div className="w-12 bg-indigo-500 rounded-t-lg" animate={{ height: `${probabilities[i] * 200}px` }}/>
                        <span className="font-bold">{s}: {(probabilities[i] * 100).toFixed(0)}%</span>
                    </div>
                ))}
            </div>
            <button onClick={() => setCircuit({ qubit0: [], qubit1: [] })} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg">Reset</button>
        </DndContext>
    );
}
