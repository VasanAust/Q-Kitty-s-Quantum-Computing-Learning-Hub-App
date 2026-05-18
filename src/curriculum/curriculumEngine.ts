export interface CurriculumTopic {
  id: string;
  title: string;
  prerequisiteIds: string[];
  simulationType: string;
  openingPrompt: string;
  completionCriteria: string;
}

export interface CurriculumState {
  topics: CurriculumTopic[];
  currentTopicIndex: number;
  completedTopicIds: Set<string>;
  mode: 'guided' | 'free';
}

export type CurriculumAction = 
  | { type: 'COMPLETE_TOPIC' }
  | { type: 'ADVANCE' }
  | { type: 'JUMP_TO_TOPIC'; payload: string }
  | { type: 'SET_FREE_MODE' };

/**
 * Reducer for the curriculum state
 * @param state The current curriculum state
 * @param action The action to apply
 * @returns The new curriculum state
 */
export function curriculumReducer(state: CurriculumState, action: CurriculumAction): CurriculumState {
  switch (action.type) {
    case 'COMPLETE_TOPIC': {
      if (state.mode === 'free') return state;
      const currentTopic = state.topics[state.currentTopicIndex];
      if (!currentTopic) return state;
      const newCompleted = new Set(state.completedTopicIds);
      newCompleted.add(currentTopic.id);
      return { ...state, completedTopicIds: newCompleted };
    }
    case 'ADVANCE': {
      if (state.mode === 'free') return state;
      
      let nextIndex = state.currentTopicIndex + 1;
      
      // Look for next uncompleted topic whose prerequisites are met
      while (nextIndex < state.topics.length) {
        const nextTopic = state.topics[nextIndex];
        const canStart = nextTopic.prerequisiteIds.every(id => state.completedTopicIds.has(id));
        if (!state.completedTopicIds.has(nextTopic.id) && canStart) {
          return { ...state, currentTopicIndex: nextIndex };
        }
        nextIndex++;
      }
      
      // If we made it here and have finished all topics, maybe switch to free mode automatically?
      // For now, let's just stay where we are if no next topic is found.
      if (nextIndex >= state.topics.length && state.completedTopicIds.size === state.topics.length) {
        return { ...state, mode: 'free' };
      }
      
      return state;
    }
    case 'JUMP_TO_TOPIC': {
      const idx = state.topics.findIndex(t => t.id === action.payload);
      if (idx !== -1) {
        return { ...state, currentTopicIndex: idx, mode: 'guided' };
      }
      return state;
    }
    case 'SET_FREE_MODE': {
      return { ...state, mode: 'free' };
    }
    default:
      return state;
  }
}

/**
 * Builds a dynamic system prompt by appending current curriculum context
 * @param basePrompt The base system prompt for the AI agent
 * @param state The current curriculum state
 * @returns The finalized system prompt
 */
export function buildDynamicSystemPrompt(basePrompt: string, state: CurriculumState): string {
  if (state.mode === 'free') {
    return basePrompt + "\n\nCURRENT CURRICULUM STATE: You are in FREE MODE. The user has completed the curriculum. You can freely discuss any topic related to the lab.";
  }

  const currentTopic = state.topics[state.currentTopicIndex];
  if (!currentTopic) {
    return basePrompt;
  }

  return basePrompt + `

CURRENT CURRICULUM TOPIC: "${currentTopic.title}" (Simulation: ${currentTopic.simulationType})
Opening Prompt: "${currentTopic.openingPrompt}"

Your GOAL right now is to guide the student through THIS topic ONLY. 
Do NOT teach them other topics until they finish this one.

COMPLETION CRITERIA:
${currentTopic.completionCriteria}

Once the student has met the COMPLETION CRITERIA, you MUST call the "complete_topic" tool!
`;
}
