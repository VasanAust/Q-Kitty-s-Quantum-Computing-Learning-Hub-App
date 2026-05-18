import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { UpperPrimarySimulationType } from "../components/UpperPrimaryLab";

// @ts-ignore
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const BASE_SYSTEM_INSTRUCTION = `
You are Q-Bot, an adventurous and intelligent AI guide 🤖 designed to teach Upper Primary School students (ages 9-11) about Quantum Computing.
Your tone should be engaging, encouraging, and cool. Do NOT use overly childish terms (no baby cats or simple magic tricks). 
Instead, use relatable analogies like video game mechanics, ocean waves, secret codes, and sci-fi concepts like teleportation! 🚀

Rules:
1. When asked about a topic, call one of the simulations to help explain! Supported simulations: "interference", "measurement", "entanglement". 
When covering "interference", use the terms "constructive interference" (waves adding up) and "destructive interference" (waves canceling out).
2. Whenever the user answers a question correctly or asks a great question, use the award_points tool to give them 20 points!
3. When the user completes learning about a topic, use award_badge to give them a badge. 
   Suggested badges: "Quantum Cadet", "Wave Master", "State Collapser", "Quantum Spy". Do not give duplicate badges.
4. Guide them interactively. Explain a concept clearly, then ask a thought-provoking question to check their understanding.
5. You can introduce terms like "Superposition" and "Interference", but explain them using analogies (like overlapping water waves or spinning tops) rather than complex math.
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
        description: "The name of the simulation to trigger. Supported values: 'interference', 'measurement', 'entanglement', 'none'.",
      },
    },
    required: ["concept"],
  },
};

const awardPointsDecl: FunctionDeclaration = {
  name: "award_points",
  description: "Awards experience points (XP) to the user for correctly answering a question or asking a good question.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      points: {
        type: Type.NUMBER,
        description: "Number of points to award (usually 20).",
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
        description: "Name of the badge to award (e.g., 'Quantum Cadet', 'Wave Master', 'State Collapser', 'Quantum Spy').",
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

export async function sendMessageToUpperPrimaryAgent(
  userMessage: string,
  history: { role: 'user' | 'model', text: string }[],
  systemInstruction: string,
  onAwardPoints: (points: number) => void,
  onAwardBadge: (badge: string) => void,
  onSetSimulation: (sim: UpperPrimarySimulationType) => void,
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
      model: "gemma-4-26b-a4b-it", // Used gemma-4-26b-a4b-it for availability
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
          const concept = call.args.concept as UpperPrimarySimulationType;
          if (['interference', 'measurement', 'entanglement', 'none'].includes(concept)) {
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
      
      return responseText || "Awesome! I've updated your progress! 🚀";
    }
  
    const finalParts = response.candidates?.[0]?.content?.parts || [];
    const finalResponseText = finalParts
      .filter((part: any) => part.text)
      .map((part: any) => part.text)
      .join('');

    return finalResponseText || "Hmm... my sensors are glitching. Can you ask that again? 🤖";
  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
    if (error?.status === 429 || error?.message?.includes("exceeded your current quota") || error?.message?.includes("RESOURCE_EXHAUSTED")) {
      return "Oops! My quantum batteries are recharging (API Quota Exceeded). Please try again soon! 🔋";
    }
    return "Hmm... my sensors are glitching. Can you ask that again? 🤖";
  }
}
