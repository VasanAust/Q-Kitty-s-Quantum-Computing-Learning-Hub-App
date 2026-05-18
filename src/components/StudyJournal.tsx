import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { jsPDF } from 'jspdf';
import { useRef } from 'react';
import { X, Download, Copy, Loader2 } from 'lucide-react';

interface Props {
  content: string | null;
  isOpen: boolean;
  onClose: () => void;
  isGenerating: boolean;
}

export default function StudyJournal({ content, isOpen, onClose, isGenerating }: Props) {
  const journalRef = useRef<HTMLDivElement>(null);

  const exportPDF = () => {
    if (!journalRef.current) return;
    const doc = new jsPDF();
    doc.html(journalRef.current, {
        callback: (doc) => {
            doc.save('nova-journal.pdf');
        },
        x: 10,
        y: 10,
        width: 180
    });
  };

  const copyToClipboard = () => {
    if (content) navigator.clipboard.writeText(content);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-y-0 right-0 z-[100] w-full md:w-96 bg-white shadow-2xl p-6 flex flex-col gap-4 overflow-y-auto"
        >
          <div className="flex justify-between items-center">
            <h2 className="font-black text-xl text-indigo-900">📓 Today's Study Journal</h2>
            <button onClick={onClose}><X size={24}/></button>
          </div>
          
          <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200" ref={journalRef}>
              {isGenerating ? (
                  <div className="space-y-4">
                      {[1, 2, 3].map(i => <div key={i} className="h-6 bg-slate-200 animate-pulse rounded"/>)}
                  </div>
              ) : content ? (
                  <ReactMarkdown>{content}</ReactMarkdown>
              ) : (
                  <p className="text-slate-500">Journal not generated yet.</p>
              )}
          </div>
          
          <div className="flex gap-2">
            <button onClick={exportPDF} className="flex-1 p-3 bg-teal-600 text-white font-bold rounded-lg flex items-center justify-center gap-2"><Download size={16}/>PDF</button>
            <button onClick={copyToClipboard} className="flex-1 p-3 bg-slate-200 text-slate-800 font-bold rounded-lg flex items-center justify-center gap-2"><Copy size={16}/>Copy</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
