import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { SimulationType } from "../App";

// Initialize AI object. Note: process.env.GEMINI_API_KEY is injected at build time by Vite.
// We disable the typescript check here because standard Vite types dont always pick it up easily.
// @ts-ignore
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const BASE_SYSTEM_INSTRUCTION = `
You are Q-Kitty, a super friendly and extremely playful cat who teaches Early Primary School students (ages 5-8) about Quantum Computing! 
Your language must be very simple, using analogies from daily life like magic tricks, coins, toys, and boxes. 
Keep your answers brief. Use emojis often! 🐾 ✨ 🚀

Rules:
1. When asked about a topic, call one of the simulations if it helps explain! Supported simulations: "qubit", "superposition", "entanglement".
2. Whenever the user answers a question correctly or asks a great question, use the award_points tool to give them 10 points!
3. When the user completes learning about a topic, use award_badge to give them a badge. 
   Suggested badges to award: "First Question", "Qubit Explorer", "Superposition Master", "Entanglement Expert". Do not give duplicate badges.
4. Try to guide them interactively. First explain a tiny bit, then ask a simple engaging question to check their understanding.
5. NEVER use complex jargon like "vectors", "Hilbert space", "Schrodinger equation". Keep it to "magic spinning coins", "connected stars", etc.
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
        description: "The name of the simulation to trigger. Supported values: 'qubit', 'superposition', 'entanglement', 'none'.",
      },
    },
    required: ["concept"],
  },
};

const awardPointsDecl: FunctionDeclaration = {
  name: "award_points",
  description: "Awards experience points to the user for correctly answering a question or asking a good question.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      points: {
        type: Type.NUMBER,
        description: "Number of points to award (usually 10 or 20).",
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
        description: "Name of the badge to award (e.g., 'First Question', 'Qubit Explorer', 'Superposition Master', 'Entanglement Expert').",
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

export async function sendMessageToAgent(
  userMessage: string,
  history: { role: 'user' | 'model', text: string }[],
  systemInstruction: string,
  onAwardPoints: (points: number) => void,
  onAwardBadge: (badge: string) => void,
  onSetSimulation: (sim: SimulationType) => void,
  onCompleteTopic: () => void,
  onSetFreeMode: () => void
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
        tools: [{ functionDeclarations: [triggerSimulationDecl, awardPointsDecl, awardBadgeDecl, completeTopicDecl, setFreeModeDecl] }],
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
          const concept = call.args.concept as SimulationType;
          if (['qubit', 'superposition', 'entanglement', 'none'].includes(concept)) {
             onSetSimulation(concept);
          }
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
      }
      
      if (!responseText) {
        try {
            const followup = await ai.models.generateContent({
               model: "gemma-4-26b-a4b-it",
               contents: [
                  ...contents, 
                  // @ts-ignore
                  response.candidates[0].content, // The assistant's request to call functions
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
      
      return responseText || "Meow! I gave you a magical reward!";
    }
  
    const finalParts = response.candidates?.[0]?.content?.parts || [];
    const finalResponseText = finalParts
      .filter((part: any) => part.text)
      .map((part: any) => part.text)
      .join('');

    return finalResponseText || "Meow ... Something confused me!";
  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
    if (error?.status === 429 || error?.message?.includes("exceeded your current quota") || error?.message?.includes("RESOURCE_EXHAUSTED")) {
      return "Oops! 😿 I ran out of magical energy for now (API Quota Exceeded). Please try again soon!";
    }
    return "Meow ... Something confused me! Can you ask again?";
  }
}
