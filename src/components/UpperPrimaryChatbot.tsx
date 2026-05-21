import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2, VolumeX, Loader2, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sendMessageToUpperPrimaryAgent } from '../lib/geminiAgentUpperPrimary';
import { UpperPrimarySimulationType } from './UpperPrimaryLab';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

interface ChatbotProps {
  onAwardPoints: (points: number) => void;
  onAwardBadge: (badge: string) => void;
  onSetSimulation: (sim: UpperPrimarySimulationType) => void;
  systemInstruction: string;
  onCompleteTopic: () => void;
  onSetFreeMode: () => void;
}

export default function UpperPrimaryChatbot({ onAwardPoints, onAwardBadge, onSetSimulation, systemInstruction, onCompleteTopic, onSetFreeMode }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: "Initialization sequence complete. I am Q-Bot, your Quantum Learning Companion. Ready to explore the subatomic realm? Ask me anything about Quantum Computing! 🚀"
    } // Changed to upper primary appropriate message
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
    
    // Clean up emojis and asterisks for speech
    const cleanText = text.replace(/\*/g, '')
                          .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
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
    
    // Choose a more robotic or neutral voice for Q-Bot
    const voices = window.speechSynthesis.getVoices();
    const botVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Daniel') || v.name.includes('Samantha') || v.lang === 'en-US');
    if (botVoice) utterance.voice = botVoice;
    
    utterance.pitch = 1.1; // Slightly electronic sounding
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
      let response = await sendMessageToUpperPrimaryAgent(
        text, 
        historyToPass, 
        systemInstruction,
        onAwardPoints, 
        onAwardBadge, 
        onSetSimulation,
        onCompleteTopic,
        onSetFreeMode
      );
      
      response = response.replace(/\*/g, '');
      const newModelMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', text: response };
      setMessages(prev => [...prev, newModelMsg]);
      speak(response);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'model', 
        text: "Error 404: Knowledge not found. Could you try asking that again?" 
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
      
      {/* Settings bar */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={() => {
             setSoundEnabled(!soundEnabled);
             if (soundEnabled && window.speechSynthesis) window.speechSynthesis.cancel();
          }}
          className="p-3 rounded-full bg-white shadow-xl border-4 border-indigo-100 text-indigo-500 hover:text-indigo-700 hover:bg-slate-50 focus:ring-4 focus:ring-indigo-200 focus:outline-none transition transform hover:scale-110 active:scale-95"
          title={soundEnabled ? "Mute Q-Bot" : "Unmute Q-Bot"}
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
                    ? 'bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-[2rem] rounded-br-[0.5rem]' 
                    : 'bg-gradient-to-br from-slate-50 to-slate-200 text-slate-800 rounded-[2rem] rounded-bl-[0.5rem]'
                  }
                `}
              >
                {msg.role === 'model' && (
                  <div className="flex items-center gap-2 mb-3 text-indigo-700 font-black pb-2 border-b-2 border-indigo-200/50 uppercase tracking-wide text-xs">
                    <div className="bg-indigo-200 p-1.5 rounded-full"><Cpu size={16} className="text-indigo-700"/></div> Q-BOT
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
            <div className="bg-white text-indigo-700 rounded-[2rem] rounded-bl-[0.5rem] p-5 shadow-xl border-4 border-white flex items-center gap-3">
              <div className="bg-indigo-100 p-2 rounded-full">
                <Loader2 className="animate-spin text-indigo-600" size={20} aria-hidden="true" />
              </div>
              <span className="font-bold text-lg">Q-Bot is processing... ⚡</span>
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
            className={`p-4 rounded-[1.5rem] transition-all flex items-center justify-center shrink-0 w-14 h-14 md:w-16 md:h-16 shadow-xl border-4 border-white transform hover:scale-105 active:scale-95 focus:ring-4 focus:ring-indigo-300 focus:outline-none
              ${isListening 
                ? "bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse shadow-red-500/40" 
                : "bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700 shadow-indigo-200/50"
              }
            `}
            title={isListening ? "Stop input" : "Voice input"}
            aria-label={isListening ? "Stop voice input" : "Start voice input"}
          >
            {isListening ? <MicOff size={24} aria-hidden="true" /> : <Mic size={24} aria-hidden="true" />}
          </button>
          
          <input
            id="chat-input-upper"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Processing audio..." : "Command Q-Bot..."}
            className="flex-1 bg-white/90 backdrop-blur border-4 border-white text-slate-800 rounded-[2rem] px-4 md:px-6 py-3 md:py-4 focus:outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all font-bold text-base md:text-lg placeholder-slate-500 shadow-inner"
            aria-label="Chat message input"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isTyping}
            className="bg-gradient-to-br from-indigo-600 to-blue-600 disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-400 text-white p-4 rounded-[1.5rem] transition-all flex items-center justify-center shrink-0 w-14 h-14 md:w-16 md:h-16 shadow-xl shadow-indigo-500/30 border-4 border-white disabled:border-slate-100 disabled:shadow-none transform hover:scale-105 active:scale-95 focus:ring-4 focus:ring-indigo-300 focus:outline-none"
            aria-label="Send message"
          >
            <Send size={24} className={input.trim() && !isTyping ? "translate-x-1" : ""} aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
}
