import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2, VolumeX, Loader2, Atom } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sendMessageToMiddleSchoolAgent } from '../lib/geminiAgentMiddleSchool';
import { MiddleSchoolSimulationType } from './MiddleSchoolLab';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

interface ChatbotProps {
  onAwardPoints: (points: number) => void;
  onAwardBadge: (badge: string) => void;
  onSetSimulation: (sim: MiddleSchoolSimulationType) => void;
  onTriggerQuiz: () => void;
  systemInstruction: string;
  onCompleteTopic: () => void;
  onSetFreeMode: () => void;
  onMarkMastered: (concept: string) => void;
  onSetCircuitPreset: (preset: string) => void;
  onGenerateJournal: (journal: string) => void;
  isCollabMode: boolean;
  participants: { [key: string]: { name: string, online: boolean } };
  messagesCount: number;
}

export default function MiddleSchoolChatbot({ 
  onAwardPoints, 
  onAwardBadge, 
  onSetSimulation, 
  onTriggerQuiz, 
  systemInstruction, 
  onCompleteTopic, 
  onSetFreeMode, 
  onMarkMastered, 
  onSetCircuitPreset,
  onGenerateJournal, 
  isCollabMode, 
  participants, 
  messagesCount 
}: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: "Systems online. I am Nova, your Quantum Mechanics guide. Let's delve into probability amplitudes and wave-particle duality. What would you like to explore today? ⚛️"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const speak = (text: string) => {
    if (!soundEnabled || !window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    
    const cleanText = text.replace(/[\u{1F600}-\u{1F64F}]/gu, '')
                          .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
                          .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
                          .replace(/[\u{1F700}-\u{1F77F}]/gu, '')
                          .replace(/[\u{1F780}-\u{1F7FF}]/gu, '')
                          .replace(/[\u{1F800}-\u{1F8FF}]/gu, '')
                          .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')
                          .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '')
                          .replace(/[\u{2600}-\u{26FF}]/gu, '')
                          .replace(/[\u{2700}-\u{27BF}]/gu, '');
                          
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    const voices = window.speechSynthesis.getVoices();
    const botVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Daniel') || v.name.includes('Samantha') || v.lang === 'en-US');
    if (botVoice) utterance.voice = botVoice;
    
    utterance.pitch = 1.0; 
    utterance.rate = 1.0;
    
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const historyToPass = messages.map(m => ({ role: m.role, text: m.text }));
      
      const collabPrefix = isCollabMode ? 
          `COLLABORATION MODE: You are teaching ${Object.values(participants).map(p => p.name).join(' and ')} simultaneously. Address them both. Occasionally ask them to discuss with each other: '[Name A], what do you think? [Name B], do you agree?' before you give the answer. Encourage peer explanation. ` :
          "";

      const response = await sendMessageToMiddleSchoolAgent(
        text, 
        historyToPass, 
        collabPrefix + systemInstruction,
        onAwardPoints, 
        onAwardBadge, 
        onSetSimulation,
        onTriggerQuiz,
        onCompleteTopic,
        onSetFreeMode,
        onMarkMastered,
        onSetCircuitPreset,
        onGenerateJournal
      );
      
      const newModelMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', text: response };
      setMessages(prev => [...prev, newModelMsg]);
      speak(response);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'model', 
        text: "Error: Connection lost. Please restate your query." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
    } else if (recognition) {
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSend(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } else {
      alert("Speech recognition isn't supported in this browser! 🤖");
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent border-0 overflow-hidden relative">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={() => {
             setSoundEnabled(!soundEnabled);
             if (soundEnabled && window.speechSynthesis) window.speechSynthesis.cancel();
          }}
          className="p-3 rounded-full bg-white shadow-xl border-4 border-teal-100 text-teal-600 hover:text-teal-800 hover:bg-slate-50 focus:ring-4 focus:ring-teal-200 focus:outline-none transition transform hover:scale-110 active:scale-95"
          title={soundEnabled ? "Mute Nova" : "Unmute Nova"}
          aria-label={soundEnabled ? "Mute sound" : "Unmute sound"}
        >
          {soundEnabled ? <Volume2 size={20} aria-hidden="true" /> : <VolumeX size={20} className="text-slate-400" aria-hidden="true" />}
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 pt-16 md:pt-16 scroll-smooth">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] md:max-w-[75%] p-5 text-base md:text-lg leading-relaxed shadow-xl border-4 border-white
                  ${msg.role === 'user' 
                    ? 'bg-gradient-to-br from-teal-500 to-teal-700 text-white rounded-[2rem] rounded-br-[0.5rem]' 
                    : 'bg-gradient-to-br from-slate-50 to-slate-200 text-slate-800 rounded-[2rem] rounded-bl-[0.5rem]'
                  }
                `}
              >
                {msg.role === 'model' && (
                  <div className="flex items-center gap-2 mb-3 text-teal-700 font-black pb-2 border-b-2 border-teal-200/50 uppercase tracking-wide text-xs">
                    <div className="bg-teal-200 p-1.5 rounded-full"><Atom size={16} className="text-teal-700"/></div> NOVA
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
            <div className="bg-white text-teal-700 rounded-[2rem] rounded-bl-[0.5rem] p-5 shadow-xl border-4 border-white flex items-center gap-3">
              <div className="bg-teal-100 p-2 rounded-full">
                <Loader2 className="animate-spin text-teal-600" size={20} aria-hidden="true" />
              </div>
              <span className="font-bold text-lg">Nova is computing... ⏳</span>
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
            className={`p-4 rounded-[1.5rem] transition-all flex items-center justify-center shrink-0 w-14 h-14 md:w-16 md:h-16 shadow-xl border-4 border-white transform hover:scale-105 active:scale-95 focus:ring-4 focus:ring-teal-300 focus:outline-none
              ${isListening 
                ? "bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse shadow-red-500/40" 
                : "bg-gradient-to-br from-teal-100 to-teal-200 text-teal-700 shadow-teal-200/50"
              }
            `}
            title={isListening ? "Stop input" : "Voice input"}
            aria-label={isListening ? "Stop voice input" : "Start voice input"}
          >
            {isListening ? <MicOff size={24} aria-hidden="true" /> : <Mic size={24} aria-hidden="true" />}
          </button>
          
          <input
            id="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening to query..." : "Input command for Nova..."}
            className="flex-1 bg-white/90 backdrop-blur border-4 border-white text-slate-800 rounded-[2rem] px-4 md:px-6 py-3 md:py-4 focus:outline-none focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-100 transition-all font-bold text-base md:text-lg placeholder-slate-500 shadow-inner"
            aria-label="Chat message input"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isTyping}
            className="bg-gradient-to-br from-teal-500 to-cyan-500 disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-400 text-white p-4 rounded-[1.5rem] transition-all flex items-center justify-center shrink-0 w-14 h-14 md:w-16 md:h-16 shadow-xl shadow-teal-500/30 border-4 border-white disabled:border-slate-100 disabled:shadow-none transform hover:scale-105 active:scale-95 focus:ring-4 focus:ring-teal-300 focus:outline-none"
            aria-label="Send message"
          >
            <Send size={24} className={input.trim() && !isTyping ? "translate-x-1" : ""} aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
}
