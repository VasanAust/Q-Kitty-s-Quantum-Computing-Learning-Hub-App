import { create, all } from 'mathjs';

const math = create(all);

// 2x2 matrices
export const H = math.matrix([[1/Math.sqrt(2), 1/Math.sqrt(2)], [1/Math.sqrt(2), -1/Math.sqrt(2)]]);
export const X = math.matrix([[0, 1], [1, 0]]);
export const Z = math.matrix([[1, 0], [0, -1]]);
export const I = math.matrix([[1, 0], [0, 1]]);

// CNOT 4x4
export const CNOT = math.matrix([
  [1, 0, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 0, 1],
  [0, 0, 1, 0]
]);

export function applyGateToQubit(gate: any, qubitIndex: number) {
    if (gate === 'CNOT') return CNOT;
    return qubitIndex === 0 ? math.kron(gate, I) : math.kron(I, gate);
}

export type GateName = 'H' | 'X' | 'Z' | 'CNOT' | 'I'; 
export type Circuit = { qubit0: GateName[], qubit1: GateName[] };

export function simulateCircuit(circuit: Circuit): number[] {
    // Initial state |00> = [1, 0, 0, 0]
    let state = math.matrix([1, 0, 0, 0]);
    
    // Simplification for preset handling: apply gates sequentially
    const ops: {matrix: any}[] = [];
    
    // Apply qubit 0 gates
    circuit.qubit0.forEach(g => {
        const mat = g === 'CNOT' ? CNOT : applyGateToQubit(g === 'H' ? H : g === 'X' ? X : g === 'Z' ? Z : I, 0);
        ops.push({matrix: mat});
    });
    // Apply qubit 1 gates
    circuit.qubit1.forEach(g => {
        const mat = g === 'CNOT' ? CNOT : applyGateToQubit(g === 'H' ? H : g === 'X' ? X : g === 'Z' ? Z : I, 1);
        ops.push({matrix: mat});
    });
    
    for (const op of ops) {
        state = math.multiply(op.matrix, state);
    }

    const amplitude = state.toArray() as number[];
    return amplitude.map((a: number) => Math.abs(a) ** 2);
}
