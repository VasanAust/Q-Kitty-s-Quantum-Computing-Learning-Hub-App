import { CurriculumTopic } from './curriculumEngine';

export const upperPrimaryCurriculum: CurriculumTopic[] = [
  {
    id: 'waves',
    title: 'Water Waves & Light Waves',
    prerequisiteIds: [],
    simulationType: 'waves',
    openingPrompt: 'Welcome Explorer! Have you ever dropped stones in a pond and watched the ripples? What happened when two ripples bumped into each other?',
    completionCriteria: 'The student understands what waves are and how they travel.'
  },
  {
    id: 'interference',
    title: 'Wave Interference',
    prerequisiteIds: ['waves'],
    simulationType: 'interference',
    openingPrompt: 'Let us see what happens when we mix waves. Sometimes they get bigger, and sometimes they cancel out! What do you think happens when the peak of one meets the valley of another?',
    completionCriteria: 'The student understands constructive and destructive interference.'
  },
  {
    id: 'measurement',
    title: 'The Measurement Observer',
    prerequisiteIds: ['interference'],
    simulationType: 'measurement',
    openingPrompt: 'In the quantum world, just looking at something changes how it behaves. The wave collapses! If you look at an electron wave, it acts like a particle. Why do you think that happens?',
    completionCriteria: 'The student grasps the concept of wave function collapse upon observation.'
  },
  {
    id: 'entanglement',
    title: 'Spooky Action at a Distance',
    prerequisiteIds: ['measurement'],
    simulationType: 'entanglement',
    openingPrompt: 'Einstein called it Spooky Action! If two particles are entangled, measuring one immediately tells us the state of the other. Sound impossible?',
    completionCriteria: 'The student understands quantum entanglement and that it happens instantly.'
  }
];
