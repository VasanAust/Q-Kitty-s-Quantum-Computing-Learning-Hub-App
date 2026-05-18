import React from 'react';
import { X, Printer, Trash2, Calendar, Clock, BookOpen, Star, MessageSquare, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

export interface SessionLog {
  date: string;
  durationMinutes: number;
  topicsVisited: string[];
  stickersEarned: string[];
  questionsAsked: number;
  correctAnswers: number;
}

interface TeacherViewProps {
  onClose: () => void;
}

export default function TeacherView({ onClose }: TeacherViewProps) {
  const [logs, setLogs] = React.useState<SessionLog[]>([]);

  React.useEffect(() => {
    const storedLogs = localStorage.getItem('qkitty_ep_session_logs');
    if (storedLogs) {
      try {
        setLogs(JSON.parse(storedLogs));
      } catch (e) {
        console.error('Failed to parse session logs', e);
      }
    }
  }, []);

  const clearData = () => {
    if (confirm('Are you sure you want to delete all learning history? This cannot be undone.')) {
      localStorage.removeItem('qkitty_ep_session_logs');
      setLogs([]);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const totalSessions = logs.length;
  const totalMinutes = logs.reduce((acc, log) => acc + log.durationMinutes, 0);
  const avgMinutes = totalSessions > 0 ? (totalMinutes / totalSessions).toFixed(1) : 0;
  
  const allStickers = Array.from(new Set(logs.flatMap(l => l.stickersEarned)));
  const allTopics = Array.from(new Set(logs.flatMap(l => l.topicsVisited)));
  const totalQuestions = logs.reduce((acc, log) => acc + log.questionsAsked, 0);
  const avgQuestions = totalSessions > 0 ? (totalQuestions / totalSessions).toFixed(1) : 0;

  return (
    <div className="fixed inset-0 z-[100] bg-white text-slate-800 overflow-y-auto flex flex-col">
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex justify-between items-center z-10 no-print shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
            <Calendar size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Teacher Summary</h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
          >
            <Printer size={18} /> Print
          </button>
          <button 
            onClick={onClose}
            className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full p-6 md:p-10 space-y-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={<Calendar className="text-blue-500" />} label="Total Sessions" value={totalSessions} />
          <StatCard icon={<Clock className="text-emerald-500" />} label="Learning Time" value={`${totalMinutes}m`} subValue={`Avg: ${avgMinutes}m`} />
          <StatCard icon={<MessageSquare className="text-purple-500" />} label="Questions Asked" value={totalQuestions} subValue={`Avg: ${avgQuestions}`} />
          <StatCard icon={<Star className="text-amber-500" />} label="Stickers Earned" value={allStickers.length} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Topics Covered */}
          <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100">
            <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-slate-900">
              <BookOpen size={20} className="text-indigo-600" /> Topics Covered
            </h2>
            <div className="flex flex-wrap gap-3">
              {allTopics.length > 0 ? allTopics.map(topic => (
                <div key={topic} className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm font-bold text-sm text-slate-700">
                  <CheckCircle size={14} className="text-emerald-500" /> {topic}
                </div>
              )) : (
                <p className="text-slate-400 font-medium italic">No topics explored yet</p>
              )}
            </div>
          </div>

          {/* Stickers Earned */}
          <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100">
            <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-slate-900">
              <Star size={20} className="text-amber-500" /> Stickers Earned
            </h2>
            <div className="flex flex-wrap gap-4">
              {allStickers.length > 0 ? allStickers.map(sticker => (
                <div key={sticker} className="group relative">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-slate-200 hover:scale-110 transition-transform">
                    ✨
                  </div>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-slate-500">{sticker}</span>
                </div>
              )) : (
                <p className="text-slate-400 font-medium italic">No stickers earned yet</p>
              )}
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-xl font-black text-slate-900">Learning History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Date</th>
                  <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Duration</th>
                  <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Topics</th>
                  <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Stickers</th>
                  <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Questions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.length > 0 ? logs.map((log, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-4 font-bold text-slate-700">{new Date(log.date).toLocaleDateString()}</td>
                    <td className="px-8 py-4 text-slate-600 font-medium">{log.durationMinutes} min</td>
                    <td className="px-8 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {log.topicsVisited.map(t => (
                          <span key={t} className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex gap-1">
                        {log.stickersEarned.map((s, idx) => (
                          <span key={idx} title={s}>✨</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-4 font-black text-slate-700">{log.questionsAsked}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-10 text-center text-slate-400 font-medium italic">No sessions recorded yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-center pt-10 no-print">
          <button 
            onClick={clearData}
            className="flex items-center gap-2 px-6 py-3 text-rose-500 hover:text-rose-600 font-black uppercase tracking-widest text-sm transition-all border border-rose-100 rounded-2xl hover:bg-rose-50"
          >
            <Trash2 size={18} /> Clear All Learning Data
          </button>
        </div>
      </div>
      
      {/* Footer / Copyright */}
      <footer className="mt-auto p-10 text-center border-t border-slate-100 no-print">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Q-Kitty Teacher OS v1.0 • Classroom Learning Mirror</p>
      </footer>
    </div>
  );
}

function StatCard({ icon, label, value, subValue }: { icon: React.ReactNode, label: string, value: string | number, subValue?: string }) {
  return (
    <div className="bg-slate-50 rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
          {icon}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-black text-slate-900">{value}</span>
        {subValue && <span className="text-xs font-bold text-slate-400 uppercase">{subValue}</span>}
      </div>
    </div>
  );
}
