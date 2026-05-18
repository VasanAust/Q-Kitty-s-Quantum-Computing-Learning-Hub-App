import { CurriculumTopic } from './curriculumEngine';

export const upperSecondaryCurriculum: CurriculumTopic[] = [
  {
    id: 'qubit_math',
    title: 'Qubit Mathematics (Bloch Sphere)',
    prerequisiteIds: [],
    simulationType: 'none',
    openingPrompt: 'Welcome to Advanced Architecture. We need to define a qubit mathematically. A qubit state can be represented as a vector on the Bloch sphere. Are you familiar with linear algebra and complex numbers?',
    completionCriteria: 'The student understands the vector representation of a qubit and the Bloch sphere.'
  },
  {
    id: 'gates_circuits',
    title: 'Advanced Gates & Circuits',
    prerequisiteIds: ['qubit_math'],
    simulationType: 'circuit',
    openingPrompt: 'Let us build circuits. We will use Pauli matrices (X, Y, Z), Hadamard (H), and CNOT gates. How does a CNOT gate create entanglement between two qubits?',
    completionCriteria: 'The student can explain the function of common quantum gates and how circuits process quantum information.'
  },
  {
    id: 'shors',
    title: "Shor's Algorithm",
    prerequisiteIds: ['gates_circuits'],
    simulationType: 'shors',
    openingPrompt: "Shor's Algorithm can factor large numbers exponentially faster than classical computers, breaking RSA encryption. How does period finding on a quantum computer make this possible?",
    completionCriteria: "The student understands the high-level mechanism of Shor's algorithm and finding periods using the Quantum Fourier Transform."
  },
  {
    id: 'grovers',
    title: "Grover's Search Algorithm",
    prerequisiteIds: ['gates_circuits'],
    simulationType: 'grovers',
    openingPrompt: "Grover's algorithm searches an unsorted database with quadratic speedup. It uses amplitude amplification. Can you explain how inverting about the mean amplifies the correct answer?",
    completionCriteria: "The student understands amplitude amplification and the performance benefits of Grover's search."
  }
];
