import * as math from 'mathjs';

export type GateName = 'I' | 'H' | 'X' | 'Y' | 'Z' | 'S' | 'T' | 'CNOT' | 'SWAP';

const I = math.matrix([[1, 0], [0, 1]]);
const H = math.multiply(1 / Math.sqrt(2), math.matrix([[1, 1], [1, -1]]));
const X = math.matrix([[0, 1], [1, 0]]);
const Y = math.matrix([[0, math.complex(0, -1)], [math.complex(0, 1), 0]]);
const Z = math.matrix([[1, 0], [0, -1]]);
const S = math.matrix([[1, 0], [0, math.complex(0, 1)]]);
const T = math.matrix([[1, 0], [0, math.exp(math.complex(0, Math.PI / 4) as any)]]);

const CNOT = math.matrix([
  [1, 0, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 0, 1],
  [0, 0, 1, 0]
]);

const SWAP = math.matrix([
  [1, 0, 0, 0],
  [0, 0, 1, 0],
  [0, 1, 0, 0],
  [0, 0, 0, 1]
]);

const GATES: Record<string, any> = { I, H, X, Y, Z, S, T, CNOT, SWAP };

export function getSingleQubitGate4x4(gateName: GateName, qubitIndex: 0 | 1): math.Matrix {
  const gate = GATES[gateName];
  if (qubitIndex === 0) {
    return math.kron(gate, I) as math.Matrix;
  } else {
    return math.kron(I, gate) as math.Matrix;
  }
}

export function applyGates(gateSequence: { name: GateName, qubit?: 0 | 1 }[]): math.Matrix {
  let state = math.matrix([1, 0, 0, 0]); // |00>

  for (const gateInfo of gateSequence) {
    let operator;
    if (gateInfo.name === 'CNOT' || gateInfo.name === 'SWAP') {
      operator = GATES[gateInfo.name];
    } else {
      operator = getSingleQubitGate4x4(gateInfo.name, gateInfo.qubit ?? 0);
    }
    state = math.multiply(operator, state) as math.Matrix;
  }

  return state;
}

export function getMeasurementProbs(stateVector: math.Matrix) {
  const data = stateVector.toArray() as any[];
  const probs = data.map(val => {
    const complex = math.complex(val);
    return Math.pow(math.abs(complex) as number, 2);
  });

  return {
    '|00⟩': probs[0],
    '|01⟩': probs[1],
    '|10⟩': probs[2],
    '|11⟩': probs[3]
  };
}

export function getStateLabel(stateVector: math.Matrix): string {
  const probs = getMeasurementProbs(stateVector);
  
  if (Math.abs(probs['|00⟩'] - 0.5) < 0.01 && Math.abs(probs['|11⟩'] - 0.5) < 0.01) {
    return "Bell State |Φ+⟩";
  }
  if (Math.abs(probs['|01⟩'] - 0.5) < 0.01 && Math.abs(probs['|10⟩'] - 0.5) < 0.01) {
    return "Bell State |Ψ+⟩";
  }
  
  const data = stateVector.toArray() as any[];
  if (Math.abs((math.abs(math.complex(data[0])) as number) - 1) < 0.01) return "|00⟩ Basis State";
  
  return "Superposition State";
}

export function generateQiskit(gateSequence: { name: GateName, qubit?: 0 | 1 }[]): string {
  let code = "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(2)\n";
  for (const g of gateSequence) {
    const gName = g.name.toLowerCase();
    if (gName === 'cnot') {
      code += `qc.cx(0, 1)\n`;
    } else if (gName === 'swap') {
      code += `qc.swap(0, 1)\n`;
    } else if (gName === 'i') {
      code += `qc.id(${g.qubit})\n`;
    } else {
      code += `qc.${gName}(${g.qubit})\n`;
    }
  }
  code += "\nqc.draw('mpl')";
  return code;
}
