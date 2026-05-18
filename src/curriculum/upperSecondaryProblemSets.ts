export interface Problem {
  id: string;
  question: string;
  context?: string;
  rubric: string;
  maxXP: number;
  hints: string[];
}

export interface ProblemSet {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  problems: Problem[];
}

export const PROBLEM_SETS: ProblemSet[] = [
  {
    id: 'gates-fundamentals',
    title: 'Quantum Gates Fundamentals',
    difficulty: 'beginner',
    problems: [
      {
        id: 'hadamard-superposition',
        question: 'Explain what happens to a qubit in state |0⟩ when we apply two Hadamard gates in a row. Why is this significant?',
        rubric: 'Check for understanding that H|0⟩ = |+⟩ and H|+⟩ = |0⟩. The student should mention that the Hadamard gate is its own inverse (unitary property) and that the second gate reverses the superposition back to a definite state.',
        maxXP: 50,
        hints: [
          'What is the state after the first H gate?',
          'Think about the matrix: H = 1/√2 [[1, 1], [1, -1]]. What happens if you multiply it by itself?',
          'Recall the concept of Unitary gates: U * U† = I.'
        ]
      },
      {
        id: 'cnot-entanglement',
        question: 'How does a CNOT gate create entanglement when applied to a control qubit in superposition (|+⟩) and a target qubit in |0⟩?',
        rubric: 'Expect an explanation of the state transition: |+0⟩ = 1/√2(|00⟩ + |10⟩) -> CNOT -> 1/√2(|00⟩ + |11⟩). Mention that observing one qubit now reveals information about the other (perfect correlation).',
        maxXP: 100,
        hints: [
          'Write down the initial joint state |+0⟩ as a linear combination.',
          'Apply the CNOT rule: |00⟩ stays |00⟩, but |10⟩ becomes |11⟩.',
          'Look at the final result: can you factor it into two independent qubit states?'
        ]
      },
      {
        id: 'pauli-x-y-z',
        question: 'Describe the differences between Pauli-X, Pauli-Y, and Pauli-Z gates in terms of their effect on the Bloch Sphere.',
        rubric: 'X is a π rotation around the X-axis (bit-flip), Z is a π rotation around the Z-axis (phase-flip), and Y is a π rotation around the Y-axis (both bit and phase flip).',
        maxXP: 50,
        hints: [
          'Think about which basis states are swapped by each gate.',
          'Consider the poles of the Bloch Sphere (|0⟩ and |1⟩). Which gates change them?',
          'Remember the Z gate affects the phase (+/-) but not the probability of 0 or 1.'
        ]
      }
    ]
  },
  {
    id: 'shors-algorithm',
    title: "Shor's Algorithm",
    difficulty: 'advanced',
    problems: [
      {
        id: 'period-finding-core',
        question: "Why is 'Period Finding' the most computationally expensive part of Shor's algorithm, and how does the Quantum Fourier Transform help find it?",
        rubric: 'The student should explain that classical period finding takes exponential time (brute force), while QFT allows us to find the period in polynomial time by finding the peaks in the frequency domain of the modular exponentiation function.',
        maxXP: 150,
        hints: [
          'What function f(x) = a^x mod N are we trying to find the period of?',
          'Think about the relationship between periodicity in the time domain and peaks in the frequency domain.',
          'Explain how constructive interference works in the QFT.'
        ]
      },
      {
        id: 'shor-complexity',
        question: "Compare the complexity of Shor's algorithm to the best-known classical factoring algorithm (General Number Field Sieve). Why does this threaten current RSA encryption?",
        rubric: 'Student should state Shor is O(log^3 N) (polynomial) while GNFS is sub-exponential. RSA relies on the hardness of factoring large numbers; if factoring is fast, the private key can be derived quickly.',
        maxXP: 100,
        hints: [
          'What does "exponential time" mean for a classical computer as the number of bits increases?',
          'What is the specific bottleneck in RSA?',
          'How many qubits (roughly) would be needed to crack 2048-bit RSA?'
        ]
      }
    ]
  },
  {
    id: 'grovers-search',
    title: "Grover's Search",
    difficulty: 'intermediate',
    problems: [
      {
        id: 'amplitude-amplification',
        question: 'Explain the geometric interpretation of the Diffusion Operator (Grover Diffusion). How does it "flip" the amplitudes about the mean?',
        rubric: 'Check for the explanation of reflecting the state vector about the average amplitude. This increases the amplitude of the marked state (which was negative after the Oracle flip) and decreases others.',
        maxXP: 100,
        hints: [
          'Consider the amplitudes of all states before the diffusion.',
          'What happens to a negative amplitude when reflected over a positive average?',
          'Think of the "Inversion about the Average" formula: αi -> 2μ - αi.'
        ]
      },
      {
        id: 'oracle-construction',
        question: 'What is the role of the Oracle in Grover\'s algorithm, and why must it "mark" the desired state with a negative phase?',
        rubric: 'The Oracle identifies the correct solution without needing to examine it classically. It flips the sign (phase) of the target state so that the subsequent Diffusion Step can distinguish it from the rest.',
        maxXP: 100,
        hints: [
          'Does the Oracle change the probabilities immediately?',
          'Why is a phase flip (-1) necessary for the mathematics of interference?',
          'Think of the Oracle as a black box function f(x) such that f(w)=1.'
        ]
      }
    ]
  }
];
