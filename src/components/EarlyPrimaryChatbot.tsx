import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, Mic, Volume2, VolumeX, MicOff } from 'lucide-react';
import { SimulationType } from '../App';
import { sendMessageToAgent } from '../lib/geminiAgentEarlyPrimary';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface ChatbotProps {
  onAwardPoints: (points: number) => void;
  onAwardBadge: (badge: string) => void;
  onSetSimulation: (sim: SimulationType) => void;
  systemInstruction: string;
  onCompleteTopic: () => void;
  onSetFreeMode: () => void;
  onMessageSent?: () => void;
}

// Ensure SpeechRecognition types are known
const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export default function EarlyPrimaryChatbot({ onAwardPoints, onAwardBadge, onSetSimulation, systemInstruction, onCompleteTopic, onSetFreeMode, onMessageSent }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Meow! I'm Q-Kitty 🐾. What do you want to learn about magical quantum computers today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Sound Output State
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Sound Input State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const isManuallyStoppedRef = useRef(false);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    // Announce the first message
    if (soundEnabled && messages.length === 1 && messages[0].role === 'model') {
      speak(messages[0].text);
    }
  }, []);

  useEffect(() => {
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let finalTrans = '';
      let interimTrans = '';
      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTrans += event.results[i][0].transcript;
        } else {
          interimTrans += event.results[i][0].transcript;
        }
      }
      setInput(finalTrans + interimTrans);
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech') {
        console.error("Speech recognition error", event.error);
      }
      setIsListening(false);
      if (event.error === 'not-allowed') {
        // Since we can't use alert, we'll just log it or handle it in a way
        // that's appropriate. For now, let's just make sure the user knows
        // to check their browser settings if they want to use voice.
        console.warn("Permission denied for speech recognition.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (!isManuallyStoppedRef.current) {
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
          } catch (err) {
            console.error("Restart error", err);
          }
        }, 300);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      console.error("Auto-start error", err);
    }

    return () => {
      isManuallyStoppedRef.current = true;
      recognition.stop();
    };
  }, []);

  const speak = (text: string) => {
    if (!soundEnabled || !window.speechSynthesis) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create new utterance and clean up emojis and asterisks since they might sound weird
    const textToSpeak = text.replace(/\*/g, '')
                            .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
                            .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
                            .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
                            .replace(/[\u{1F700}-\u{1F77F}]/gu, '')
                            .replace(/[\u{1F780}-\u{1F7FF}]/gu, '')
                            .replace(/[\u{1F800}-\u{1F8FF}]/gu, '')
                            .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')
                            .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '')
                            .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '')
                            .replace(/[\u{2600}-\u{26FF}]/gu, '')
                            .replace(/[\u{2700}-\u{27BF}]/gu, '');
                            
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.1; // Slightly faster for kids!
    utterance.pitch = 1.2; // Slightly higher pitch for fun!
    
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      isManuallyStoppedRef.current = true;
      recognitionRef.current?.stop();
    } else {
      if (!SpeechRecognitionAPI) {
        alert("It looks like your browser doesn't support the magic microphone! Try typing instead.");
        return;
      }
      isManuallyStoppedRef.current = false;
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);
    onMessageSent?.();

    try {
      const responseText = await sendMessageToAgent(
        userMessage,
        messages,
        systemInstruction,
        (amount) => {
           onAwardPoints(amount);
        },
        (badge) => {
           onAwardBadge(badge);
        },
        (sim) => {
           onSetSimulation(sim);
        },
        () => onCompleteTopic(),
        () => onSetFreeMode()
      );
      const cleanedResponseText = (responseText || 'Meow... something went wrong!').replace(/\*/g, '');
      setMessages(prev => [...prev, { role: 'model', text: cleanedResponseText }]);
      speak(cleanedResponseText);
    } catch (error) {
      console.error(error);
      const errorMsg = 'Oops! My magical circuits got tangled. Can you ask again?';
      setMessages(prev => [...prev, { role: 'model', text: errorMsg }]);
      speak(errorMsg);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent border-0 overflow-hidden relative">
      
      {/* Settings bar - hidden on very small mobile if it overlaps, or repositioned */}
      <div className="absolute top-3 right-3 md:top-4 md:right-4 z-10 flex gap-2">
        <button 
          onClick={() => {
             setSoundEnabled(!soundEnabled);
             if (soundEnabled && window.speechSynthesis) window.speechSynthesis.cancel();
          }}
          className="p-2 md:p-3 rounded-full bg-white/80 backdrop-blur shadow-lg border-2 border-purple-100 text-indigo-500 hover:text-indigo-700 focus:ring-4 focus:ring-purple-200 focus:outline-none transition transform hover:scale-110 active:scale-95"
          title={soundEnabled ? "Mute Q-Kitty" : "Unmute Q-Kitty"}
          aria-label={soundEnabled ? "Mute sound" : "Unmute sound"}
        >
          {soundEnabled ? <Volume2 size={20} className="w-[18px] h-[18px] md:w-5 md:h-5" aria-hidden="true" /> : <VolumeX size={20} className="w-[18px] h-[18px] md:w-5 md:h-5 text-slate-400" aria-hidden="true" />}
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 md:p-8 space-y-4 md:space-y-6 pt-14 md:pt-16 scroll-smooth">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
                <div className={`max-w-[90%] md:max-w-[75%] p-4 md:p-5 text-[15px] md:text-lg leading-relaxed shadow-xl border-2 md:border-4 border-white
                  ${msg.role === 'user' 
                    ? 'bg-gradient-to-br from-blue-400 to-cyan-400 text-white rounded-[1.5rem] md:rounded-[2rem] rounded-br-[0.3rem] md:rounded-br-[0.5rem]' 
                    : 'bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-900 rounded-[1.5rem] md:rounded-[2rem] rounded-bl-[0.3rem] md:rounded-bl-[0.5rem]'
                  }
                `}>
                {msg.role === 'model' && (
                  <div className="flex items-center gap-2 mb-3 text-purple-600 font-black pb-2 border-b-2 border-purple-100/50 uppercase tracking-wide text-xs">
                    <div className="bg-purple-200 p-1.5 rounded-full"><Sparkles size={16} className="text-purple-600"/></div> Q-KITTY
                  </div>
                )}
                <span className="font-medium">{msg.text}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
            aria-live="polite"
          >
            <div className="bg-white text-purple-600 rounded-[2rem] rounded-bl-[0.5rem] p-5 shadow-xl border-4 border-white flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <Loader2 className="animate-spin text-purple-600" size={20} aria-hidden="true" />
              </div>
              <span className="font-bold text-lg">Q-Kitty is thinking... 💭</span>
            </div>
          </motion.div>
        )}
        <div ref={endOfMessagesRef} className="h-4" />
      </div>

      <div className="p-4 md:p-6 bg-transparent border-t-4 border-white/30">
        <form onSubmit={handleSubmit} className="flex gap-3 md:gap-4 items-center">
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2.5 md:p-4 rounded-[1.2rem] md:rounded-[1.5rem] transition-all flex items-center justify-center shrink-0 w-12 h-12 md:w-16 md:h-16 shadow-lg md:shadow-xl border-2 md:border-4 border-white transform hover:scale-105 active:scale-95 focus:ring-4 focus:ring-purple-300 focus:outline-none
              ${isListening 
                ? "bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse shadow-red-500/40" 
                : "bg-gradient-to-br from-indigo-100 to-purple-200 text-indigo-600 shadow-purple-200/50"
              }
            `}
            title={isListening ? "Stop listening!" : "Talk to Q-Kitty!"}
            aria-label={isListening ? "Stop voice input" : "Start voice input"}
          >
            {isListening ? <Mic size={24} className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" /> : <MicOff size={24} className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />}
          </button>
          
          <input
            id="chat-input-early"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Just talk to me! 🐾"
            className="flex-1 bg-purple-50 border-2 md:border-4 border-purple-100 text-indigo-900 rounded-[1.5rem] md:rounded-[2rem] px-4 md:px-6 py-2.5 md:py-4 focus:outline-none focus:border-purple-400 focus:bg-white focus:ring-4 focus:ring-purple-200 transition-all font-bold text-sm md:text-lg placeholder-indigo-400 shadow-inner opacity-50 focus:opacity-100"
            aria-label="Chat message input"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isTyping}
            className="bg-gradient-to-br from-pink-500 to-orange-400 disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-400 p-2.5 md:p-4 rounded-[1.2rem] md:rounded-[1.5rem] transition-all flex items-center justify-center shrink-0 w-12 h-12 md:w-16 md:h-16 shadow-lg md:shadow-xl shadow-pink-500/30 border-2 md:border-4 border-white disabled:border-slate-100 disabled:shadow-none transform hover:scale-105 active:scale-95 focus:ring-4 focus:ring-pink-300 focus:outline-none"
            aria-label="Send message"
          >
            <Send size={24} className={`w-5 h-5 md:w-6 md:h-6 ${input.trim() && !isTyping ? "translate-x-0.5 md:translate-x-1" : ""}`} aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
}
