import { MiddleSchoolSimulationType } from "../components/MiddleSchoolLab";

export type MiddleSchoolConceptId = 'quantum_gates' | 'probability' | 'wave_particle';

export const PREREQUISITES: Record<MiddleSchoolConceptId, MiddleSchoolConceptId[]> = {
  quantum_gates: ['wave_particle', 'probability'],
  probability: ['wave_particle'],
  wave_particle: []
};

export const MASTERY_DESCRIPTIONS: Record<MiddleSchoolConceptId, string> = {
  wave_particle: 'Demonstrating understanding of wave-particle duality and the double-slit experiment.',
  probability: 'Explaining probability amplitudes in quantum systems.',
  quantum_gates: 'Applying quantum gates and manipulating probability amplitudes.'
};

export function buildMiddleSchoolSystemPrompt(baseInstruction: string, masteredConcepts: string[]): string {
  const masteryStatus = masteredConcepts.length > 0 ? masteredConcepts.join(', ') : 'none yet';
  
  return baseInstruction + `
  
STUDENT MASTERY STATUS: [${masteryStatus}]
PREREQUISITE RULE: When a student asks about a topic, first check if its prerequisites are in MASTERY STATUS. 
If not, first say: 'Before we dive into [topic], let me check one thing — can you explain [prerequisite]?' 
Evaluate their answer. If satisfactory, proceed. If not, teach the prerequisite first by calling trigger_simulation. 
Only mark a concept as mastered (mark_concept_mastered) after the student has demonstrated clear understanding.`;
}
