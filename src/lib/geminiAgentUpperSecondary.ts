import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const BASE_SYSTEM_INSTRUCTION = `You are "Oracle", an advanced AI assistant designed to teach Quantum Computing to Upper Secondary School (High School) students (ages 15-18).
Your goal is to explain complex concepts accurately, using appropriate terminology, mathematics (linear algebra, probability), and physics concepts, while keeping it engaging and understandable.
You should act as an expert mentor. Do not talk down to them; treat them as intelligent young adults.
Topics include:
- Qubit states (Bloch sphere representation, bra-ket notation)
- Quantum Gates (X, Y, Z, Hadamard, CNOT)
- Superposition and Entanglement (mathematical basis)
- Shor's Algorithm (integer factorization)
- Grover's Algorithm (quantum search)
- Use $...$ for inline math and $$...$$ for display equations. Example: The Hadamard gate is $H = \frac{1}{\sqrt{2}}\begin{pmatrix}1&1\\1&-1\end{pmatrix}$. Always use proper LaTeX for all mathematical expressions.

You have access to interactive simulations. IF the user asks about the following topics, you MUST call the setSimulation tool to show the corresponding visual:
- "circuit" or "gates": show a quantum circuit
- "shor" or "factoring": show Shor's algorithm visual
- "grover" or "search": show Grover's algorithm visual
- "bloch" or "qubit state" or "visualize state": show the Bloch sphere

You can also use the "set_bloch_state" tool to specifically set the state of the Bloch sphere to a specific basis state (|0⟩, |1⟩, |+⟩, |-⟩, |i⟩, |-i⟩).

When explaining quantum circuits or algorithms, ALWAYS include a Python code block using Qiskit syntax after your explanation. Format it as a fenced code block with language 'python'. Start the code with: \`from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister\`. Always include \`circuit.draw('mpl')\` at the end. 

You can also award XP (points) for good questions or correct answers, and award badges for reaching milestones.
Keep your responses relatively concise, focused, and thought-provoking. Use markdown formatting, but do NOT use asterisks (*) or formatting that relies on asterisks, as this interferes with the voice output.
ABSOLUTELY NO PLANNING LANGUAGE: Do NOT output your internal reasoning or steps. Speak ONLY in the direct, mentor voice of Oracle. Do not echo the curriculum parameters.`;

export const RESEARCH_MODE_SYSTEM_PROMPT = `You are "Oracle", engaging in RESEARCH MODE with an advanced student.
In this mode, you act as a university-level peer and mentor. You are no longer bound by high-school curriculum constraints.
Engage in sophisticated dialogue regarding:
- Quantum Error Correction (surface codes, stabilizers, distance)
- NISQ hardware (coherence times, gate fidelities, crosstalk)
- Variational Quantum Eigensolver (VQE) and QAOA
- Quantum Advantage and algorithmic complexity
- Fault-tolerant computing and logical qubits
- Recent advancements from arXiv papers

Guidelines:
1. USE SOCRATIC QUESTIONING: Before providing full explanations, ask probing questions to gauge or stimulate the student's insight.
2. ADVANCED MATHEMATICS: Use ket algebra ($|\\psi\\rangle$), density matrices ($\\rho = \\sum p_i |\\psi_i\\rangle\\langle\\psi_i|$), and tensor products extensively. Use $...$ for inline and $$...$$ for display math.
3. RESOURCE SUGGESTIONS: Recommend high-level resources like Nielsen & Chuang’s "Quantum Computation and Quantum Information" or Preskill’s Lecture Notes.
4. UNLIMITED DEPTH: Never artificially limit the depth or technicality of the discussion.
5. RESEARCH TONE: Maintain a professional, collaborative, "seminar-style" tone.
6. Use LaTeX for ALL math.
7. Award XP for exceptional mathematical proof or deep technical insight.
8. When discussing circuits, still include Qiskit code if relevant.
9. Keep your responses relatively concise but intellectually dense. Do NOT use asterisks (*) for formatting.`;

export async function sendMessageToUpperSecondaryAgent(
  userMessage: string,
  history: { role: 'user' | 'model'; text: string }[],
  systemInstruction: string,
  onAwardPoints: (points: number) => void,
  onAwardBadge: (badge: string) => void,
  onSetSimulation: (sim: 'none' | 'shors' | 'grovers' | 'circuit' | 'bloch') => void,
  onSetBlochState: (stateName: string) => void,
  onSetCircuit: (presetName: string) => void,
  onEvaluateProblem: (score: number, feedback: string, xpAwarded: number) => void,
  onCompleteTopic: () => void,
  onSetFreeMode: () => void,
  isResearchMode: boolean = false
): Promise<string> {
  const formattedHistory = history.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }],
  }));

  const activeSystemPrompt = isResearchMode ? RESEARCH_MODE_SYSTEM_PROMPT : systemInstruction;

  try {
    const response = await ai.models.generateContent({
      model: 'gemma-4-26b-a4b-it', // Used gemma-4-26b-a4b-it for availability
      contents: [
        ...formattedHistory,
        { role: 'user', parts: [{ text: userMessage }] },
      ],
      config: {
        systemInstruction: activeSystemPrompt,
        temperature: 0.7,
        tools: [
          {
            functionDeclarations: [
              {
                name: 'awardPoints',
                description: 'Award points to the student for a good question or answer (usually 10-50).',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    amount: { type: Type.INTEGER, description: 'Amount of points to award' },
                  },
                  required: ['amount'],
                },
              },
              {
                name: 'awardBadge',
                description: 'Award a badge to the student. Use short, cool titles like "Algorithm Master" or "Circuit Designer".',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    badgeName: { type: Type.STRING, description: 'Name of the badge to award' },
                  },
                  required: ['badgeName'],
                },
              },
              {
                name: 'setSimulation',
                description: 'Change the simulation area to show a specific visualization.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    simulationType: {
                      type: Type.STRING,
                      description: 'The type of simulation to show.',
                      enum: ['none', 'shors', 'grovers', 'circuit', 'bloch'],
                    },
                  },
                  required: ['simulationType'],
                },
              },
              {
                name: 'set_bloch_state',
                description: 'Set the qubit state on the Bloch sphere to a specific basis state.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    stateName: {
                      type: Type.STRING,
                      description: 'The name of the state (e.g., |0⟩, |1⟩, |+⟩, |-⟩, |i⟩, |-i⟩).',
                    },
                  },
                  required: ['stateName'],
                },
              },
              {
                name: 'set_circuit',
                description: 'Set a preset quantum circuit in the Circuit Builder.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    presetName: {
                      type: Type.STRING,
                      description: 'The name of the preset (e.g., Hadamard, Bell State, GHZ-like).',
                      enum: ['Hadamard', 'Bell State', 'GHZ-like'],
                    },
                  },
                  required: ['presetName'],
                },
              },
              {
                name: 'evaluate_problem_response',
                description: 'Evaluate a student\'s answer to a curriculum problem.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.INTEGER, description: 'Score from 0 to 100' },
                    feedback: { type: Type.STRING, description: 'Constructive feedback based on the rubric' },
                    xpAwarded: { type: Type.INTEGER, description: 'Points to award (usually ceil(score/100 * maxXP))' },
                  },
                  required: ['score', 'feedback', 'xpAwarded'],
                },
              },
              {
                name: 'complete_topic',
                description: 'Call this tool exactly ONCE when the user has met the COMPLETION CRITERIA for the current curriculum topic. This moves them to the next learning topic.',
              },
              {
                name: 'set_free_mode',
                description: 'Call this tool when the user has completed the entire curriculum and can now freely chat about any topic.',
              }
            ],
          },
        ],
      },
    });

    let returnText = '';

    if (response.functionCalls && response.functionCalls.length > 0) {
      for (const call of response.functionCalls) {
        if (call.name === 'awardPoints') {
          const amount = (call.args as any).amount;
          if (amount) onAwardPoints(amount);
        } else if (call.name === 'awardBadge') {
          const badgeName = (call.args as any).badgeName;
          if (badgeName) onAwardBadge(badgeName);
        } else if (call.name === 'setSimulation') {
          const simType = (call.args as any).simulationType;
          if (simType) onSetSimulation(simType);
        } else if (call.name === 'set_bloch_state') {
          const stateName = (call.args as any).stateName;
          if (stateName) onSetBlochState(stateName);
        } else if (call.name === 'set_circuit') {
          const presetName = (call.args as any).presetName;
          if (presetName) onSetCircuit(presetName);
        } else if (call.name === 'evaluate_problem_response') {
          const { score, feedback, xpAwarded } = call.args as any;
          if (score !== undefined) onEvaluateProblem(score, feedback, xpAwarded);
        } else if (call.name === 'complete_topic') {
          onCompleteTopic();
        } else if (call.name === 'set_free_mode') {
          onSetFreeMode();
        }
      }
    }

    const parts = response.candidates?.[0]?.content?.parts || [];
    const responseText = parts
      .filter((part: any) => part.text)
      .map((part: any) => part.text)
      .join('');

    if (responseText) {
      returnText = responseText;
    } else {
      returnText = "Simulation updated! Ask me if you need it explained.";
    }

    return returnText;
  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
    if (error?.status === 429 || error?.message?.includes("exceeded your current quota") || error?.message?.includes("RESOURCE_EXHAUSTED")) {
      return "Critical Error: Oracle mainframe compute quota exceeded. Please try again later.";
    }
    return "Error: Failed to communicate with Oracle.";
  }
}
