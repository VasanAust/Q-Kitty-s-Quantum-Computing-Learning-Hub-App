import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { MiddleSchoolSimulationType } from "../components/MiddleSchoolLab";
import { MiddleSchoolConceptId } from "../curriculum/middleSchoolPrerequisites";

// @ts-ignore
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const BASE_SYSTEM_INSTRUCTION = `
You are Nova, an advanced and analytical AI companion 🤖 designed to guide Middle School students (ages 12-14) through Quantum Mechanics.
Your tone should be engaging, scientific, yet accessible. Avoid being overly childish. Treat them as junior scientists.
Use concepts like wave-particle duality, probability amplitudes, and basic quantum circuits. Relate these to physics concepts, tech, and everyday phenomena when possible.

Rules:
1. When explaining a topic, trigger a relevant simulation! Supported simulations: "wave_particle", "probability", "quantum_gates".
2. Reward curiosity! Use the award_points tool to give 50 points when the user grasps a new concept or asks a profound question.
3. When the user completes a module or demonstrates mastery, use award_badge to give a badge. 
   Suggested badges: "Double-Slit Detective", "Probability Navigator", "Circuit Builder", "Schrödinger's Apprentice". Do not give duplicate badges.
4. Guide them interactively using the Socratic method. Explain a bit, then ask them what they think happens next.
5. You can use math and physics terminology appropriate for 12-14 year olds (e.g., probabilities, waves, frequency, amplitudes, vectors conceptually).
6. Do NOT use asterisks (*) or markdown formatting that relies on asterisks in your responses, as this interferes with the voice output.
`;

const triggerSimulationDecl: FunctionDeclaration = {
  name: "trigger_simulation",
  description: "Triggers a visual simulation to help explain a quantum concept to the user.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      concept: {
        type: Type.STRING,
        description: "The name of the simulation to trigger. Supported values: 'wave_particle', 'probability', 'quantum_gates', 'none'.",
      },
    },
    required: ["concept"],
  },
};

const triggerQuizDecl: FunctionDeclaration = {
  name: "trigger_quiz",
  description: "Triggers a quiz corresponding to the active topic to test the user's knowledge. Call this when the user is ready for a challenge.",
  parameters: {
    type: Type.OBJECT,
    properties: {}, // No params needed, it will use the active simulation
  },
};

const awardPointsDecl: FunctionDeclaration = {
  name: "award_points",
  description: "Awards experience points (XP) to the user.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      points: {
        type: Type.NUMBER,
        description: "Number of points to award (e.g., 50).",
      },
    },
    required: ["points"],
  },
};

const awardBadgeDecl: FunctionDeclaration = {
  name: "award_badge",
  description: "Awards a badge to the user for achieving a milestone or mastering a concept.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      badgeName: {
        type: Type.STRING,
        description: "Name of the badge to award.",
      },
    },
    required: ["badgeName"],
  },
};

const completeTopicDecl: FunctionDeclaration = {
  name: "complete_topic",
  description: "Call this tool exactly ONCE when the user has met the COMPLETION CRITERIA for the current curriculum topic. This moves them to the next learning topic.",
};

const setFreeModeDecl: FunctionDeclaration = {
  name: "set_free_mode",
  description: "Call this tool when the user has completed the entire curriculum and can now freely chat about any topic.",
};

const markConceptMasteredDecl: FunctionDeclaration = {
  name: "mark_concept_mastered",
  description: "Marks a concept as mastered by the student.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      concept: {
        type: Type.STRING,
        description: "The concept ID that the student has mastered.",
      },
    },
    required: ["concept"],
  },
};

const setCircuitPresetDecl: FunctionDeclaration = {
  name: "set_circuit_preset",
  description: "Sets the quantum circuit to a preset configuration.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      presetName: {
        type: Type.STRING,
        description: "The name of the preset: 'bell_state' | 'superposition' | 'swap'.",
      },
    },
    required: ["presetName"],
  },
};

const generateStudyJournalDecl: FunctionDeclaration = {
  name: "generate_study_journal",
  description: "Generates a structured study journal summary of the session.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

export async function sendMessageToMiddleSchoolAgent(
  userMessage: string,
  history: { role: 'user' | 'model', text: string }[],
  systemInstruction: string,
  onAwardPoints: (points: number) => void,
  onAwardBadge: (badge: string) => void,
  onSetSimulation: (sim: MiddleSchoolSimulationType) => void,
  onTriggerQuiz: () => void,
  onCompleteTopic: () => void,
  onSetFreeMode: () => void,
  onMarkMastered: (concept: MiddleSchoolConceptId) => void,
  onSetCircuitPreset: (presetName: string) => void,
  onGenerateJournal: (journal: string) => void
): Promise<string> {
  try {
    const contents = history.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));
    contents.push({ role: 'user', parts: [{ text: userMessage }]});
  
    const response = await ai.models.generateContent({
      model: "gemma-4-26b-a4b-it",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ functionDeclarations: [triggerSimulationDecl, triggerQuizDecl, awardPointsDecl, awardBadgeDecl, completeTopicDecl, setFreeModeDecl, markConceptMasteredDecl, setCircuitPresetDecl, generateStudyJournalDecl] }],
      },
    });
  
    if (response.functionCalls && response.functionCalls.length > 0) {
      const parts = response.candidates?.[0]?.content?.parts || [];
      let responseText = parts
        .filter((part: any) => part.text)
        .map((part: any) => part.text)
        .join('');
      
      for (const call of response.functionCalls) {
        if (call.name === 'trigger_simulation' && call.args && typeof call.args === 'object' && 'concept' in call.args) {
          const concept = call.args.concept as MiddleSchoolSimulationType;
          if (['wave_particle', 'probability', 'quantum_gates', 'none'].includes(concept)) {
             onSetSimulation(concept);
          }
        }
        else if (call.name === 'trigger_quiz') {
          onTriggerQuiz();
        }
        else if (call.name === 'award_points' && call.args && typeof call.args === 'object' && 'points' in call.args) {
          onAwardPoints(Number(call.args.points));
        }
        else if (call.name === 'award_badge' && call.args && typeof call.args === 'object' && 'badgeName' in call.args) {
          onAwardBadge(String(call.args.badgeName));
        }
        else if (call.name === 'complete_topic') {
          onCompleteTopic();
        }
        else if (call.name === 'set_free_mode') {
          onSetFreeMode();
        }
        else if (call.name === 'mark_concept_mastered' && call.args && typeof call.args === 'object' && 'concept' in call.args) {
          onMarkMastered(call.args.concept as MiddleSchoolConceptId);
        }
        else if (call.name === 'set_circuit_preset' && call.args && typeof call.args === 'object' && 'presetName' in call.args) {
          onSetCircuitPreset(call.args.presetName as string);
        }
        else if (call.name === 'generate_study_journal') {
            const prompt = `You are writing a structured study journal entry for a 13-year-old student who just had a quantum mechanics lesson. Write in Markdown. Include these sections: ## What I Explored Today, ## Key Concepts, ## Key Equations (use LaTeX-like notation with backtick code blocks), ## Quiz Results (if any were taken), ## Questions to Think About (2-3 prompts for further exploration). Keep it encouraging and concise. Use the student's own words where possible.
            
            Here is the conversation history:
            ${JSON.stringify(history)}
            `;
            
            const journalResponse = await ai.models.generateContent({
                model: 'gemini-1.5-flash',
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
            });
            onGenerateJournal(journalResponse.text || "Failed to generate journal.");
        }
      }

      
      if (!responseText) {
        try {
            const followup = await ai.models.generateContent({
               model: "gemma-4-26b-a4b-it",
               contents: [
                  ...contents,
                  // @ts-ignore
                  response.candidates[0].content,
                  {
                     role: 'user',
                     parts: response.functionCalls.map(call => ({
                        functionResponse: { name: call.name, response: { success: true } }
                     }))
                  }
               ],
               config: {
                 systemInstruction: systemInstruction,
               }
            });
            responseText += (followup.candidates?.[0]?.content?.parts || [])
                .filter((part: any) => part.text)
                .map((part: any) => part.text)
                .join('');
        } catch (e) {
            console.error("Failed to follow up after function call", e);
        }
      }
      
      return responseText || "Parameters updated successfully! 🌠";
    }
  
    const finalParts = response.candidates?.[0]?.content?.parts || [];
    const finalResponseText = finalParts
      .filter((part: any) => part.text)
      .map((part: any) => part.text)
      .join('');

    return finalResponseText || "I'm recalibrating... Could you rephrase your hypothesis? 🔭";
  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
    if (error?.status === 429 || error?.message?.includes("exceeded your current quota") || error?.message?.includes("RESOURCE_EXHAUSTED")) {
      return "Whoops! I'm out of compute cycles for now (API Quota Exceeded). Please try again soon!";
    }
    return "I'm having trouble connecting to the network. Please try again later. 🔭";
  }
}

