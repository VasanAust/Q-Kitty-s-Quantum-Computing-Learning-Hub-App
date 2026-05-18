import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2, VolumeX, Loader2, Bot, Copy, ExternalLink, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sendMessageToUpperSecondaryAgent } from '../lib/geminiAgentUpperSecondary';
import { UpperSecondarySimulationType } from './UpperSecondaryLab';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

interface ChatbotProps {
  onAwardPoints: (points: number) => void;
  onAwardBadge: (badge: string) => void;
  onSetSimulation: (sim: UpperSecondarySimulationType) => void;
  onSetBlochState: (stateName: string) => void;
  onSetCircuit: (presetName: string) => void;
  systemInstruction: string;
  onCompleteTopic: () => void;
  onSetFreeMode: () => void;
  onEvaluateProblem: (score: number, feedback: string, xpAwarded: number) => void;
  externalMessage?: { text: string, timestamp: number };
  isResearchMode: boolean;
  setIsResearchMode: (val: boolean) => void;
  canUnlockResearch: boolean;
}

export default function UpperSecondaryChatbot({ 
  onAwardPoints, 
  onAwardBadge, 
  onSetSimulation, 
  onSetBlochState, 
  onSetCircuit, 
  systemInstruction, 
  onCompleteTopic, 
  onSetFreeMode,
  onEvaluateProblem,
  externalMessage,
  isResearchMode,
  setIsResearchMode,
  canUnlockResearch
}: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: isResearchMode 
        ? "Research Mode activated. Systems recalibrated for advanced theoretical discussion. How shall we probe the limits of quantum information science today?" 
        : "Welcome. I am Oracle, your advanced Quantum Architecture assistant. Let's explore quantum algorithms, circuits, and the underlying mathematics. What topic shall we tackle first?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const [isJoiningCollab, setIsJoiningCollab] = useState(false); // Reuse if needed
  const [toast, setToast] = useState<string | null>(null);

  const toggleResearchMode = () => {
    if (isResearchMode) {
      if (confirm("Return to standard curriculum mode? Your current context might shift.")) {
        setIsResearchMode(false);
        showToast("Standard Curriculum Mode restored.");
      }
    } else {
      setIsResearchMode(true);
      showToast("Research Mode enabled. Oracle will engage at university level.");
    }
  };
  
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const openInColab = async (code: string) => {
    const nb = {
      nbformat: 4,
      nbformat_minor: 0,
      metadata: {
        colab: {
          name: "QuantumCircuit.ipynb",
          provenance: [],
          collapsed_sections: []
        },
        kernelspec: {
          display_name: "Python 3",
          name: "python3"
        }
      },
      cells: [
        {
          cell_type: "code",
          execution_count: null,
          metadata: { id: "setup" },
          outputs: [],
          source: ["!pip install qiskit qiskit-aer pylatexenc matplotlib -q"]
        },
        {
          cell_type: "code",
          execution_count: null,
          metadata: { id: "circuit" },
          outputs: [],
          source: [code]
        }
      ]
    };

    const nbJson = JSON.stringify(nb);
    
    // Try base64 URI approach first (simpler)
    try {
      const base64 = btoa(unescape(encodeURIComponent(nbJson)));
      const url = `https://colab.research.google.com/github/googlecolab/colabtools/blob/main/notebooks/empty.ipynb#scrollTo=setup&viewId=circuit&create=1&notebook_json=${base64}`;
      
      // If URL is too long, fall back to copy and open new
      if (url.length > 2000) {
        throw new Error('URL too long');
      }
      window.open(url, '_blank');
    } catch (e) {
      navigator.clipboard.writeText(code);
      showToast("Code copied! Paste it into the new Colab notebook.");
      window.open('https://colab.new', '_blank');
    }
  };

  const CodeBlock = ({ children, className, node, ...props }: { children: any, className?: string, node?: any }) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    const codeStr = String(children).replace(/\n$/, '');
    const isInline = !match;

    if (isInline) {
      return (
        <code {...props} className="bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded font-mono text-sm">
          {children}
        </code>
      );
    }

    const copyToClipboard = () => {
      navigator.clipboard.writeText(codeStr);
      showToast("Code copied to clipboard!");
    };

    return (
      <div className="relative group my-6">
        <div className="absolute right-2 top-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={copyToClipboard}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-600 shadow-lg"
            title="Copy Code"
          >
            <Copy size={14} />
          </button>
          {language === 'python' && (
            <button
              onClick={() => openInColab(codeStr)}
              className="px-2 py-1 bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-bold rounded flex items-center gap-1 shadow-lg border border-orange-400"
            >
              <ExternalLink size={12} /> Run in Colab
            </button>
          )}
        </div>
        <pre className="bg-slate-950 p-4 rounded-xl overflow-x-auto border border-slate-700 shadow-inner">
          <code className={`${className} text-emerald-300 font-mono text-sm leading-relaxed`}>{codeStr}</code>
        </pre>
      </div>
    );
  };
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
                          .replace(/[\u{2700}-\u{27BF}]/gu, '')
                          .replace(/\$/g, '')
                          .replace(/\*\*/g, '')
                          .replace(/\*/g, '')
                          .replace(/#/g, '');
                          
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    const voices = window.speechSynthesis.getVoices();
    const botVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Daniel') || v.lang === 'en-GB');
    if (botVoice) utterance.voice = botVoice;
    
    utterance.pitch = 0.9;
    utterance.rate = 1.0;
    
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (externalMessage) {
      handleSend(externalMessage.text);
    }
  }, [externalMessage]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const historyToPass = messages.map(m => ({ role: m.role, text: m.text }));
      const response = await sendMessageToUpperSecondaryAgent(
        text, 
        historyToPass, 
        systemInstruction,
        onAwardPoints, 
        onAwardBadge, 
        onSetSimulation,
        onSetBlochState,
        onSetCircuit,
        onEvaluateProblem,
        onCompleteTopic,
        onSetFreeMode,
        isResearchMode
      );
      
      const newModelMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', text: response };
      setMessages(prev => [...prev, newModelMsg]);
      speak(response);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'model', 
        text: "Error connecting to Oracle mainframe. Please check your connection and try again." 
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
      alert("Speech recognition isn't supported in this browser.");
    }
  };

  return (
    <div className={`flex flex-col h-full bg-[#0f172a] border-0 overflow-hidden relative transition-all duration-500 ${isResearchMode ? 'ring-2 ring-purple-600/50 shadow-[0_0_30px_rgba(147,51,234,0.15)]' : ''}`}>
      <div className="absolute top-3 right-3 md:top-4 md:right-4 z-10 flex gap-2 items-center">
        {canUnlockResearch && (
          <button
            onClick={toggleResearchMode}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              isResearchMode 
                ? 'bg-purple-600/20 text-purple-400 border border-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.4)]' 
                : 'bg-slate-800/80 text-slate-500 border border-slate-700 hover:text-slate-300'
            }`}
          >
            🔬 Research Mode {isResearchMode && 'Active'}
          </button>
        )}
        <button
          onClick={() => {
             setSoundEnabled(!soundEnabled);
             if (soundEnabled && window.speechSynthesis) window.speechSynthesis.cancel();
          }}
          className="p-2 md:p-3 rounded-full bg-slate-800/80 backdrop-blur shadow-lg border border-slate-700 text-slate-300 hover:text-white"
          title={soundEnabled ? "Mute Oracle" : "Unmute Oracle"}
          aria-label={soundEnabled ? "Mute sound" : "Unmute sound"}
        >
          {soundEnabled ? <Volume2 size={20} className="w-[18px] h-[18px] md:w-5 md:h-5" aria-hidden="true" /> : <VolumeX size={20} className="w-[18px] h-[18px] md:w-5 md:h-5 text-slate-500" aria-hidden="true" />}
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 md:p-8 space-y-4 md:space-y-6 pt-14 md:pt-16 scroll-smooth">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
                <div 
                  className={`max-w-[90%] md:max-w-[80%] p-4 md:p-5 text-sm md:text-[15px] leading-relaxed shadow-xl border border-slate-700
                    ${msg.role === 'user' 
                      ? 'bg-gradient-to-br from-slate-700 to-slate-800 text-slate-100 rounded-[1.5rem] md:rounded-[2rem] rounded-br-[0.3rem] md:rounded-br-[0.5rem]' 
                      : 'bg-gradient-to-br from-slate-800 to-[rgba(30,41,59,0.95)] text-slate-200 rounded-[1.5rem] md:rounded-[2rem] rounded-bl-[0.3rem] md:rounded-bl-[0.5rem] relative'
                    }
                  `}
                >
                {msg.role === 'model' && (
                  <div className="flex items-center gap-2 mb-3 text-emerald-400 font-black pb-2 border-b border-slate-700 uppercase tracking-widest text-xs">
                    <div className="bg-slate-900 p-1.5 rounded-full border border-slate-700"><Bot size={14} className="text-emerald-400"/></div> ORACLE
                  </div>
                )}
                <div className="markdown-body text-slate-200 prose prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[[rehypeKatex, { throwOnError: false }]]}
                    components={{
                      p: ({ node, ...props }) => <p {...props} className="dark:text-slate-200 leading-7 mb-4" />,
                      code: CodeBlock,
                      h2: ({ node, ...props }) => <h2 {...props} className="text-emerald-400 font-bold text-xl mt-6 mb-3" />,
                      h3: ({ node, ...props }) => <h3 {...props} className="text-emerald-400 font-bold text-lg mt-4 mb-2" />,
                      ul: ({ node, ...props }) => <ul {...props} className="list-disc pl-5 mb-4 space-y-2 text-emerald-600 marker:text-emerald-600" />,
                      ol: ({ node, ...props }) => <ol {...props} className="list-decimal pl-5 mb-4 space-y-2 text-emerald-600 marker:text-emerald-600" />,
                      strong: ({ node, ...props }) => <strong {...props} className="text-white font-bold" />,
                      blockquote: ({ node, ...props }) => <blockquote {...props} className="border-l-4 border-blue-500 pl-4 py-1 italic text-slate-300 my-4" />,
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
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
            <div className="bg-slate-800 text-emerald-400 rounded-[2rem] rounded-bl-[0.5rem] p-5 shadow-xl border border-slate-700 flex items-center gap-3">
              <div className="bg-slate-900 p-2 rounded-full border border-slate-700">
                <Loader2 className="animate-spin text-emerald-400" size={20} aria-hidden="true" />
              </div>
              <span className="font-bold text-sm tracking-widest uppercase">Processing Request...</span>
            </div>
          </motion.div>
        )}
        <div ref={endOfMessagesRef} className="h-4" />
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 right-6 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-3 border border-emerald-400 font-bold"
          >
            <CheckCircle size={20} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 md:p-6 bg-slate-900/50 backdrop-blur-md border-t border-slate-700">
        <form onSubmit={handleSubmit} className="flex gap-3 md:gap-4 items-center">
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2.5 md:p-4 rounded-[1.2rem] md:rounded-[1.5rem] transition-all flex items-center justify-center shrink-0 w-12 h-12 md:w-16 md:h-16 shadow-lg md:shadow-xl border border-slate-600 transform hover:scale-105 active:scale-95 focus:ring-4 focus:ring-slate-500 focus:outline-none
              ${isListening 
                ? "bg-gradient-to-r from-red-600 to-rose-700 text-white animate-pulse shadow-red-900/40" 
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }
            `}
            title={isListening ? "Stop input" : "Voice input"}
            aria-label={isListening ? "Stop voice input" : "Start voice input"}
          >
            {isListening ? <MicOff size={24} className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" /> : <Mic size={24} className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />}
          </button>
          
          <input
            id="chat-input-upper-secondary"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening..." : "Enter query..."}
            className="flex-1 bg-slate-800 border-2 border-slate-700 text-slate-200 rounded-[1.5rem] md:rounded-[2rem] px-4 md:px-6 py-2.5 md:py-4 focus:outline-none focus:border-emerald-500/50 focus:bg-slate-800 focus:ring-4 focus:ring-emerald-500/20 transition-all font-medium text-sm md:text-lg placeholder-slate-500 shadow-inner"
            aria-label="Chat message input"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isTyping}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white p-2.5 md:p-4 rounded-[1.2rem] md:rounded-[1.5rem] transition-all flex items-center justify-center shrink-0 w-12 h-12 md:w-16 md:h-16 shadow-lg md:shadow-xl border border-emerald-500/30 disabled:border-slate-700 transform hover:scale-105 active:scale-95 focus:ring-4 focus:ring-emerald-500/30 focus:outline-none"
            aria-label="Send message"
          >
            <Send size={24} className={`w-5 h-5 md:w-6 md:h-6 ${input.trim() && !isTyping ? "translate-x-0.5 md:translate-x-1" : ""}`} aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
}
