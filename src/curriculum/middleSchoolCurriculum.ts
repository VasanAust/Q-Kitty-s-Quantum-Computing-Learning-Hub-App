import { CurriculumTopic } from './curriculumEngine';

export const middleSchoolCurriculum: CurriculumTopic[] = [
  {
    id: 'wave_particle',
    title: 'Wave-Particle Duality',
    prerequisiteIds: [],
    simulationType: 'duality',
    openingPrompt: 'Welcome to the Mechanics Studio. Is light a wave or a particle? What if I told you it was both? Let us explore the Double-Slit experiment.',
    completionCriteria: 'The student understands the dual nature of light and matter (Wave-Particle Duality) and the outcome of the double-slit experiment.'
  },
  {
    id: 'probability',
    title: 'Probability Amplitudes',
    prerequisiteIds: ['wave_particle'],
    simulationType: 'probability',
    openingPrompt: 'Instead of definite answers, quantum mechanics gives us probabilities. We do not know where a particle is, only the mathematical chance of finding it somewhere. How does this change our view of the universe?',
    completionCriteria: 'The student understands that quantum states are defined by probability amplitudes and what this implies for predictability.'
  },
  {
    id: 'quantum_gates',
    title: 'Introductory Quantum Gates',
    prerequisiteIds: ['probability'],
    simulationType: 'gates',
    openingPrompt: 'Now let us build things. Unlike classical bits that use AND/OR gates, Qubits use quantum gates like the Hadamard gate to enter superposition. What happens if we apply a Hadamard gate twice?',
    completionCriteria: 'The student understands what a quantum gate does and how it manipulates probability amplitudes.'
  }
];
