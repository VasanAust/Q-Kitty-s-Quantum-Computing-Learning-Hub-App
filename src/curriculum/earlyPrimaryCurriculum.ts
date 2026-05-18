import { CurriculumTopic } from './curriculumEngine';

export const earlyPrimaryCurriculum: CurriculumTopic[] = [
  {
    id: 'qubit',
    title: 'The Magic Qubit Coin',
    prerequisiteIds: [],
    simulationType: 'qubit',
    openingPrompt: 'Hi! Let me show you a magic coin that spins in the air. Have you ever flipped a coin?',
    completionCriteria: 'The student understands that a qubit is like a spinning coin that can be both heads and tails at the same time.'
  },
  {
    id: 'superposition',
    title: 'Superposition Box',
    prerequisiteIds: ['qubit'],
    simulationType: 'superposition',
    openingPrompt: 'Awesome! Now let us look at a glowing box. It can hold a sleepy cat and an awake cat AT THE SAME TIME. What do you think happens when we open it?',
    completionCriteria: 'The student understands that checking/opening the box forces it to pick one state.'
  },
  {
    id: 'entanglement',
    title: 'Magic Connected Stars',
    prerequisiteIds: ['superposition'],
    simulationType: 'entanglement',
    openingPrompt: "Now, let us play with connected stars! If I flip one, the other flips exactly the same way instantly. Isn't that magic?",
    completionCriteria: 'The student understands that entangled things are magically connected no matter how far apart they are.'
  }
];
