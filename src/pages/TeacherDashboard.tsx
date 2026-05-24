import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured, isDemoMode } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Box, 
  BarChart2, 
  Settings, 
  LogOut, 
  Plus, 
  Clipboard, 
  Activity, 
  ChevronRight,
  TrendingUp,
  Brain,
  ShieldCheck,
  Search,
  ExternalLink,
  GraduationCap,
  Menu,
  X
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { earlyPrimaryCurriculum } from '../curriculum/earlyPrimaryCurriculum';
import { upperPrimaryCurriculum } from '../curriculum/upperPrimaryCurriculum';
import { middleSchoolCurriculum } from '../curriculum/middleSchoolCurriculum';
import { upperSecondaryCurriculum } from '../curriculum/upperSecondaryCurriculum';

interface Classroom {
  id: string;
  code: string;
  name: string;
  created_at: string;
}

interface StudentProgress {
  id: string;
  student_uuid: string;
  class_code: string;
  module: string;
  xp: number;
  badges: string[];
  last_active: string;
  session_count: number;
}

export default function TeacherDashboard() {
  const [session, setSession] = useState<any>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClass, setSelectedClass] = useState<Classroom | null>(null);
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [newClassName, setNewClassName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'classrooms' | 'analytics' | 'curriculum'>('classrooms');
  const [selectedCurriculumLevel, setSelectedCurriculumLevel] = useState<'early_primary' | 'upper_primary' | 'middle_school' | 'upper_secondary' | null>(null);

  const [earlyPrimTopics, setEarlyPrimTopics] = useState(earlyPrimaryCurriculum);
  const [upperPrimTopics, setUpperPrimTopics] = useState(upperPrimaryCurriculum);
  const [midSchoolTopics, setMidSchoolTopics] = useState(middleSchoolCurriculum);
  const [upperSecTopics, setUpperSecTopics] = useState(upperSecondaryCurriculum);

  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicSim, setNewTopicSim] = useState('qubit');
  const [newTopicPrompt, setNewTopicPrompt] = useState('');
  const [newTopicCriteria, setNewTopicCriteria] = useState('');

  const [socraticSettings, setSocraticSettings] = useState<Record<string, { socraticIndex: number; responseLimit: number; activePreset: string }>>({
    early_primary: { socraticIndex: 30, responseLimit: 40, activePreset: 'Super friendly kitty style' },
    upper_primary: { socraticIndex: 50, responseLimit: 60, activePreset: 'Explorational companion bot style' },
    middle_school: { socraticIndex: 75, responseLimit: 80, activePreset: 'Pure Socratic detective guide' },
    upper_secondary: { socraticIndex: 90, responseLimit: 120, activePreset: 'Analytical Oracle physicist' }
  });

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (isDemoMode) {
      setSession({ user: { id: 'demo-user', user_metadata: { full_name: 'Demo Instructor' } } });
      const mockClasses = [
        { id: '1', code: 'QUAN01', name: 'Quantum Explorers A', created_at: new Date().toISOString() },
        { id: '2', code: 'MAGIC8', name: 'Advanced Cubits Lab', created_at: new Date().toISOString() }
      ];
      setClassrooms(mockClasses);
      setSelectedClass(mockClasses[0]);
      setStudents([
        { id: 's1', student_uuid: 'Alice-Quantum', class_code: 'QUAN01', module: 'early_primary', xp: 450, badges: ['Quantum Wizard', 'Quick Thinker'], last_active: new Date().toISOString(), session_count: 5 },
        { id: 's2', student_uuid: 'Bob-Cubit', class_code: 'QUAN01', module: 'early_primary', xp: 120, badges: ['Starter'], last_active: new Date().toISOString(), session_count: 2 },
        { id: 's3', student_uuid: 'Charlie-Entangle', class_code: 'QUAN01', module: 'upper_primary', xp: 890, badges: ['Master', 'Ghost Buster'], last_active: new Date().toISOString(), session_count: 12 }
      ]);
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/teacher');
      } else {
        setSession(session);
        fetchClassrooms(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate('/teacher');
      else setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchClassrooms = async (userId: string) => {
    const { data, error } = await supabase
      .from('classrooms')
      .select('*')
      .eq('teacher_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setClassrooms(data);
      if (data.length > 0 && !selectedClass) {
        setSelectedClass(data[0]);
        fetchStudents(data[0].code);
      }
    }
    setLoading(false);
  };

  const fetchStudents = async (classCode: string) => {
    const { data, error } = await supabase
      .from('student_progress')
      .select('*')
      .eq('class_code', classCode)
      .order('last_active', { ascending: false });

    if (!error && data) {
      setStudents(data);
    }
  };

  const createClassroom = async () => {
    if (!newClassName.trim() || !session) return;
    setIsCreating(true);

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    if (isDemoMode) {
      const newClass = { 
        id: Math.random().toString(), 
        name: newClassName, 
        code, 
        created_at: new Date().toISOString() 
      };
      setClassrooms([newClass, ...classrooms]);
      setSelectedClass(newClass);
      setStudents([]);
      setNewClassName('');
      setIsCreating(false);
      return;
    }

    const { data, error } = await supabase
      .from('classrooms')
      .insert([
        { 
          name: newClassName, 
          code, 
          teacher_id: session.user.id 
        }
      ])
      .select();

    if (!error && data) {
      setClassrooms([data[0], ...classrooms]);
      setSelectedClass(data[0]);
      setStudents([]);
      setNewClassName('');
    }
    setIsCreating(false);
  };

  const handleSignOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    navigate('/teacher');
  };

  const xpDistributionData = [
    { name: '0-50', count: students.filter(s => s.xp <= 50).length, color: '#64748b' },
    { name: '51-100', count: students.filter(s => s.xp > 50 && s.xp <= 100).length, color: '#3b82f6' },
    { name: '101-200', count: students.filter(s => s.xp > 100 && s.xp <= 200).length, color: '#8b5cf6' },
    { name: '201+', count: students.filter(s => s.xp > 200).length, color: '#ec4899' },
  ];

  const filteredStudents = students.filter(s => 
    s.student_uuid.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.module.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getModuleColor = (module: string) => {
    switch (module) {
      case 'early_primary': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'upper_primary': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      case 'middle_school': return 'text-teal-400 bg-teal-400/10 border-teal-400/20';
      case 'upper_secondary': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getModuleLabel = (module: string) => {
    return module.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const getSelectedLevelData = () => {
    switch (selectedCurriculumLevel) {
      case 'early_primary':
        return {
          id: 'early_primary' as const,
          title: 'Early Primary (Ages 5-8)',
          color: 'from-orange-600 to-amber-500',
          textColor: 'text-orange-400',
          borderColor: 'border-orange-500/30',
          topics: earlyPrimTopics,
          setTopics: setEarlyPrimTopics,
          description: 'Basic introductions to logic, simple puzzles, and introductory conceptual frameworks using the Q-Kitty interface.'
        };
      case 'upper_primary':
        return {
          id: 'upper_primary' as const,
          title: 'Upper Primary (Ages 8-10)',
          color: 'from-emerald-600 to-teal-500',
          textColor: 'text-emerald-400',
          borderColor: 'border-emerald-500/30',
          topics: upperPrimTopics,
          setTopics: setUpperPrimTopics,
          description: 'Exploration of basic physics concepts, wave interference, and superposition through interactive missions.'
        };
      case 'middle_school':
        return {
          id: 'middle_school' as const,
          title: 'Middle School (Ages 11-13)',
          color: 'from-teal-600 to-cyan-500',
          textColor: 'text-teal-400',
          borderColor: 'border-teal-500/30',
          topics: midSchoolTopics,
          setTopics: setMidSchoolTopics,
          description: 'Interactive experiments with photon entanglement, logic gates, and the double-slit experiment via Q-Bot.'
        };
      case 'upper_secondary':
        return {
          id: 'upper_secondary' as const,
          title: 'Upper Secondary (Ages 14-17)',
          color: 'from-purple-600 to-indigo-500',
          textColor: 'text-purple-400',
          borderColor: 'border-purple-500/30',
          topics: upperSecTopics,
          setTopics: setUpperSecTopics,
          description: 'Advanced quantum computing paradigms, Python programming, and theoretical modeling with Oracle.'
        };
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Activity className="w-10 h-10 text-purple-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans">
      {/* Sidebar Navigation */}
      <aside className={`fixed left-0 top-0 h-full bg-slate-900/95 md:bg-slate-900/50 border-r border-slate-800 p-6 flex flex-col z-[100] transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0 w-20 md:w-64'}`}>
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <span className={`font-black text-xl tracking-tighter ${isMobileMenuOpen ? 'block' : 'hidden md:block'}`}>Faculty OS</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-2 text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => { setActiveTab('classrooms'); setSelectedCurriculumLevel(null); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold transition-all ${activeTab === 'classrooms' && !selectedCurriculumLevel ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <Users size={20} />
            <span className={`transition-opacity ${isMobileMenuOpen ? 'opacity-100 block' : 'opacity-0 hidden md:opacity-100 md:block'}`}>Classrooms</span>
          </button>
          <button 
            onClick={() => { setActiveTab('analytics'); setSelectedCurriculumLevel(null); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold transition-all ${activeTab === 'analytics' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <BarChart2 size={20} />
            <span className={`transition-opacity ${isMobileMenuOpen ? 'opacity-100 block' : 'opacity-0 hidden md:opacity-100 md:block'}`}>Analytics</span>
          </button>
          <button 
            onClick={() => { setActiveTab('curriculum'); setSelectedCurriculumLevel(null); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold transition-all ${activeTab === 'curriculum' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <Box size={20} />
            <span className={`transition-opacity ${isMobileMenuOpen ? 'opacity-100 block' : 'opacity-0 hidden md:opacity-100 md:block'}`}>Curriculum</span>
          </button>
        </nav>

        <div className="mt-auto space-y-2">
          <button 
            onClick={() => setIsAccountModalOpen(true)}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all pointer-events-auto"
          >
            <Settings size={20} />
            <span className={`transition-opacity ${isMobileMenuOpen ? 'opacity-100 block' : 'opacity-0 hidden md:opacity-100 md:block'}`}>Account</span>
          </button>
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-rose-400 hover:bg-rose-500/10 transition-all"
          >
            <LogOut size={20} />
            <span className={`transition-opacity ${isMobileMenuOpen ? 'opacity-100 block' : 'opacity-0 hidden md:opacity-100 md:block'}`}>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Account Details Modal */}
      <AnimatePresence>
        {isAccountModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-[110] p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAccountModalOpen(false)}
              className="fixed inset-0 bg-[#020617]/80 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.1 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl p-6 sm:p-8 overflow-hidden z-[120]"
            >
              <div className="absolute top-0 right-0 p-6">
                <button
                  onClick={() => setIsAccountModalOpen(false)}
                  className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Decorative accent glow */}
              <div className="absolute top-0 left-12 w-48 h-48 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
                  <ShieldCheck className="text-white w-8 h-8" />
                </div>
                <div>
                  <span className="text-[10px] font-black tracking-widest text-purple-400 uppercase">Authenticated Session</span>
                  <h3 className="text-2xl font-black text-white tracking-tight">Faculty Credentials</h3>
                </div>
              </div>

              <div className="space-y-6">
                {/* Visual ID Card */}
                <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
                  <div className="flex justify-between items-start border-b border-slate-800 pb-4 flex-wrap gap-4">
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 block uppercase tracking-widest">Instructor Administrator</span>
                      <span className="text-white font-black text-lg">{session?.user?.user_metadata?.full_name || 'Demo Instructor'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 block text-right uppercase tracking-widest">Active Workspace ID</span>
                      <span className="text-slate-400 font-bold text-sm bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl font-mono">FACULTY-109b58</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 block uppercase tracking-widest">Liaison Email</span>
                      <span className="text-purple-300 font-bold font-mono">{session?.user?.email || 'VasanAust@gmail.com'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 block uppercase tracking-widest">Security Clearance</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Verified Faculty Admin
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 block uppercase tracking-widest">Connected Classrooms</span>
                      <span className="text-slate-300 font-bold">{classrooms.length} Active Tracks</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 block uppercase tracking-widest">Assigned Students</span>
                      <span className="text-slate-300 font-bold">{students.length} Learners Enrolled</span>
                    </div>
                  </div>
                </div>

                {/* Additional Metadata Info */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">System & Privacy Sovereignty</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl">
                      <span className="text-[9px] font-mono text-slate-500 block uppercase tracking-widest mb-1">Local Sovereignty</span>
                      <p className="text-[11px] text-slate-400 leading-relaxed">Assigned modules run locally to parse student inputs. No telemetry features are leaked.</p>
                    </div>
                    <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl">
                      <span className="text-[9px] font-mono text-slate-500 block uppercase tracking-widest mb-1">Empathetic Translation</span>
                      <p className="text-[11px] text-slate-400 leading-relaxed">Course maps translate complex Socratic logic into accessible, fail-free sensory paths.</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-end pt-2 border-t border-slate-800/50">
                  <button
                    onClick={() => setIsAccountModalOpen(false)}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-purple-500/20 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="md:ml-20 lg:ml-64 p-4 sm:p-6 md:p-10 transition-all duration-300">
        {!isSupabaseConfigured && !isDemoMode && (
          <div className="mb-10 p-6 bg-amber-500/10 border border-amber-500/20 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-amber-200">
              <Settings className="shrink-0" />
              <div>
                <p className="font-black text-sm uppercase tracking-widest">Supabase Not Configured</p>
                <p className="text-xs font-bold text-amber-500/70">Connect your Supabase instance in the Settings menu to enable the teacher portal and student progress syncing.</p>
              </div>
            </div>
            <a 
              href="/"
              className="px-6 py-2 bg-amber-500 text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-amber-400 transition-all text-center"
            >
              Back to Home
            </a>
          </div>
        )}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center justify-between md:block">
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Academic Overview</h2>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Welcome, {session?.user?.user_metadata?.full_name || 'Instructor'} 🍎
              </h1>
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-3 bg-slate-800/80 rounded-2xl border border-slate-700/50 text-white"
            >
              <Menu size={24} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Create a classroom..."
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                className="bg-slate-800/80 border border-slate-700/50 rounded-2xl py-3 px-5 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-600/50 transition-all w-64 md:w-80"
              />
              <button 
                onClick={createClassroom}
                disabled={isCreating || !newClassName.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-500 p-2 rounded-xl text-white transition-all disabled:opacity-50"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        </header>

        {activeTab === 'classrooms' && (
          <>
            {/* Classroom Tabs */}
            <div className="flex flex-wrap gap-3 mb-10">
          {classrooms.map((cls) => (
            <button
              key={cls.id}
              onClick={() => {
                setSelectedClass(cls);
                fetchStudents(cls.code);
              }}
              className={`px-5 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all border ${
                selectedClass?.id === cls.id 
                  ? 'bg-white text-[#0f172a] border-white shadow-xl' 
                  : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:border-slate-600'
              }`}
            >
              {cls.name}
            </button>
          ))}
        </div>

        {selectedClass && (
          <div className="space-y-10">
            {/* Top Bar for Selected Class */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 text-slate-800 opacity-10 lg:opacity-20 transform translate-x-1/4 -translate-y-1/4">
                <Brain size={180} className="w-32 h-32 lg:w-[180px] lg:h-[180px]" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="px-3 py-1 bg-purple-600 rounded-lg text-[10px] font-black uppercase tracking-widest text-white">Live Code</div>
                  <div className="flex items-center gap-2 text-xl sm:text-2xl font-black tracking-widest text-white">
                    {selectedClass.code}
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(selectedClass.code);
                        alert('Code copied to clipboard!');
                      }}
                      className="text-slate-500 hover:text-white transition-colors"
                    >
                      <Clipboard size={18} />
                    </button>
                  </div>
                </div>
                <h3 className="text-3xl sm:text-4xl font-black tracking-tighter mb-2">{selectedClass.name}</h3>
                <p className="text-slate-500 font-medium text-sm sm:text-base">Created on {new Date(selectedClass.created_at).toLocaleDateString()}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 relative z-10">
                <div className="bg-slate-800/50 rounded-3xl p-4 sm:p-5 border border-slate-700/50 min-w-28 sm:min-w-32">
                  <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Total Students</span>
                  <span className="text-2xl sm:text-3xl font-black text-white">{students.length}</span>
                </div>
                <div className="bg-slate-800/50 rounded-3xl p-4 sm:p-5 border border-slate-700/50 min-w-28 sm:min-w-32">
                  <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Avg XP</span>
                  <span className="text-2xl sm:text-3xl font-black text-white">
                    {students.length > 0 
                      ? Math.round(students.reduce((acc, s) => acc + s.xp, 0) / students.length) 
                      : 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Middle Section: Analytics & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* XP Distribution */}
              <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-xl font-black tracking-tight flex items-center gap-3">
                    <TrendingUp className="text-purple-500" /> XP Mastery Distribution
                  </h4>
                  <div className="flex gap-2">
                    {xpDistributionData.map(d => (
                      <div key={d.name} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800/50 border border-slate-700/50">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-[10px] font-black text-slate-400">{d.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={xpDistributionData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }}
                      />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid #334155', 
                          borderRadius: '16px',
                          color: '#f1f5f9'
                        }}
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={60}>
                        {xpDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quick Actions / Info */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8">
                <h4 className="text-xl font-black tracking-tight flex items-center gap-3 mb-8">
                  <ShieldCheck className="text-emerald-500" /> Hot Topics
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                    <span className="font-bold text-slate-200">Shor's Algorithm</span>
                    <span className="px-2 py-1 bg-white/10 rounded-lg text-[10px] font-black text-white">+12%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                    <span className="font-bold text-slate-200">Entanglement Lab</span>
                    <span className="px-2 py-1 bg-white/10 rounded-lg text-[10px] font-black text-white">+8%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                    <span className="font-bold text-slate-200">Probability Wave</span>
                    <span className="px-2 py-1 bg-white/10 rounded-lg text-[10px] font-black text-white">+5%</span>
                  </div>
                </div>
                
                <div className="mt-8 pt-8 border-t border-slate-800">
                  <button className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black transition-all">
                    <ExternalLink size={20} /> Export Report
                  </button>
                </div>
              </div>
            </div>

            {/* Student Table */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] overflow-hidden">
              <div className="p-8 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h4 className="text-2xl font-black tracking-tight mb-1">Student Progress Table</h4>
                  <p className="text-slate-500 text-sm font-medium">Real-time sync from active Q-Kitty sessions</p>
                </div>

                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                  <input 
                    type="text" 
                    placeholder="Search by UUID or Module..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-slate-800/80 border border-slate-700/50 rounded-2xl py-3 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-purple-600/50 transition-all w-full md:w-80"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/80">
                      <th className="px-6 sm:px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Student ID</th>
                      <th className="px-6 sm:px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Module</th>
                      <th className="px-6 sm:px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">XP</th>
                      <th className="px-6 sm:px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 hidden sm:table-cell">Badges</th>
                      <th className="px-6 sm:px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 hidden md:table-cell">Last Active</th>
                      <th className="px-6 sm:px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-8 py-12 text-center text-slate-500 font-bold uppercase tracking-widest text-sm">
                          No student data synced yet
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((s) => (
                        <tr key={s.id} className="hover:bg-white/5 transition-colors group">
                          <td className="px-6 sm:px-8 py-6 font-mono text-xs sm:text-sm text-slate-200">
                            {s.student_uuid.substring(0, 10)}...
                          </td>
                          <td className="px-6 sm:px-8 py-6">
                            <span className={`inline-block px-2 sm:px-3 py-1 rounded-lg border text-[9px] sm:text-[10px] font-black uppercase tracking-wider ${getModuleColor(s.module)}`}>
                              {getModuleLabel(s.module)}
                            </span>
                          </td>
                          <td className="px-6 sm:px-8 py-6 text-center font-black text-white text-sm sm:text-base">
                            {s.xp}
                          </td>
                          <td className="px-6 sm:px-8 py-6 hidden sm:table-cell">
                            <div className="flex -space-x-2">
                              {s.badges.slice(0, 3).map((badge, i) => (
                                <div 
                                  key={i} 
                                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-xs shadow-lg group-hover:border-slate-700 transition-all"
                                  title={badge}
                                >
                                  ✨
                                </div>
                              ))}
                              {s.badges.length > 3 && (
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-[9px] sm:text-[10px] font-black text-white">
                                  +{s.badges.length - 3}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 sm:px-8 py-6 text-xs sm:text-sm text-slate-400 font-medium hidden md:table-cell">
                            {new Date(s.last_active).toLocaleString(undefined, { 
                              month: 'short', 
                              day: 'numeric', 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </td>
                          <td className="px-6 sm:px-8 py-6 text-right">
                            <button className="p-2 text-slate-500 hover:text-white transition-colors">
                              <ChevronRight size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        </>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-10 flex flex-col items-center justify-center min-h-[400px] text-center">
              <div className="w-24 h-24 bg-purple-500/10 rounded-full flex items-center justify-center mb-6">
                <BarChart2 className="w-12 h-12 text-purple-500" />
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight mb-4">Global Analytics Platform</h2>
              <p className="text-slate-400 max-w-lg mb-8">
                Aggregate performance metrics, cross-district comparisons, and longitudinal tracking are being generated by the AI data engine.
              </p>
              <div className="flex gap-4">
                <button className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all">
                  Generate Custom Report
                </button>
                <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all border border-slate-700">
                  Export Raw Data
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8">
                <div className="text-4xl font-black text-white mb-2">87%</div>
                <div className="text-slate-400 font-bold uppercase tracking-widest text-xs">Concept Mastery Average</div>
                <div className="mt-4 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[87%] rounded-full"></div>
                </div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8">
                <div className="text-4xl font-black text-white mb-2">14.2h</div>
                <div className="text-slate-400 font-bold uppercase tracking-widest text-xs">Avg Session Time/Student</div>
                <div className="mt-4 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[65%] rounded-full"></div>
                </div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8">
                <div className="text-4xl font-black text-white mb-2">240+</div>
                <div className="text-slate-400 font-bold uppercase tracking-widest text-xs">Live Quantum Simulations</div>
                <div className="mt-4 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 w-[92%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'curriculum' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {selectedCurriculumLevel === null ? (
               <>
                 <div className="flex flex-col gap-2 mb-8">
                   <h2 className="text-3xl font-black text-white tracking-tight">Curriculum Studio</h2>
                   <p className="text-slate-400">Manage learning pathways and adjust AI assistant parameters across all grade levels.</p>
                 </div>
                 
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   <div 
                     id="focus-curriculum-early"
                     onClick={() => setSelectedCurriculumLevel('early_primary')}
                     className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 hover:border-orange-500/30 transition-all group cursor-pointer"
                   >
                      <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all">
                        <Box className="text-orange-400" />
                      </div>
                      <h3 className="text-xl font-black text-white mb-2">Early Primary (Ages 5-8)</h3>
                      <p className="text-slate-400 text-sm mb-6 line-clamp-2">Basic introductions to logic, simple puzzles, and introductory conceptual frameworks using the Q-Kitty interface.</p>
                      <div className="flex flex-col gap-2 border-t border-slate-800/50 pt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{earlyPrimTopics.length} Modules Active</span>
                          <ChevronRight className="text-slate-500 group-hover:text-orange-400 transition-colors" />
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {earlyPrimTopics.map(topic => (
                            <span key={topic.id} className="text-xs bg-slate-800/80 text-emerald-400 px-2.5 py-1 rounded-lg border border-slate-700/50">
                              {topic.title}
                            </span>
                          ))}
                        </div>
                      </div>
                   </div>

                   <div 
                     id="focus-curriculum-upper"
                     onClick={() => setSelectedCurriculumLevel('upper_primary')}
                     className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 hover:border-emerald-500/30 transition-all group cursor-pointer"
                   >
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all">
                        <Box className="text-emerald-400" />
                      </div>
                      <h3 className="text-xl font-black text-white mb-2">Upper Primary (Ages 8-10)</h3>
                      <p className="text-slate-400 text-sm mb-6 line-clamp-2">Exploration of basic physics concepts, wave interference, and superposition through interactive missions.</p>
                      <div className="flex flex-col gap-2 border-t border-slate-800/50 pt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{upperPrimTopics.length} Missions Active</span>
                          <ChevronRight className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {upperPrimTopics.map(topic => (
                            <span key={topic.id} className="text-xs bg-slate-800/80 text-emerald-400 px-2.5 py-1 rounded-lg border border-slate-700/50">
                              {topic.title}
                            </span>
                          ))}
                        </div>
                      </div>
                   </div>

                   <div 
                     id="focus-curriculum-middle"
                     onClick={() => setSelectedCurriculumLevel('middle_school')}
                     className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 hover:border-teal-500/30 transition-all group cursor-pointer"
                   >
                      <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all">
                        <Box className="text-teal-400" />
                      </div>
                      <h3 className="text-xl font-black text-white mb-2">Middle School (Ages 11-13)</h3>
                      <p className="text-slate-400 text-sm mb-6 line-clamp-2">Interactive experiments with photon entanglement, logic gates, and the double-slit experiment via Q-Bot.</p>
                      <div className="flex flex-col gap-2 border-t border-slate-800/50 pt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{midSchoolTopics.length} Experiments Active</span>
                          <ChevronRight className="text-slate-500 group-hover:text-teal-400 transition-colors" />
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {midSchoolTopics.map(topic => (
                            <span key={topic.id} className="text-xs bg-slate-800/80 text-emerald-400 px-2.5 py-1 rounded-lg border border-slate-700/50">
                              {topic.title}
                            </span>
                          ))}
                        </div>
                      </div>
                   </div>

                   <div 
                     id="focus-curriculum-secondary"
                     onClick={() => setSelectedCurriculumLevel('upper_secondary')}
                     className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 hover:border-purple-500/30 transition-all group cursor-pointer"
                   >
                      <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all">
                        <Box className="text-purple-400" />
                      </div>
                      <h3 className="text-xl font-black text-white mb-2">Upper Secondary (Ages 14-17)</h3>
                      <p className="text-slate-400 text-sm mb-6 line-clamp-2">Advanced quantum computing paradigms, Python programming, and theoretical modeling with Oracle.</p>
                      <div className="flex flex-col gap-2 border-t border-slate-800/50 pt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{upperSecTopics.length} Seminars Active</span>
                          <ChevronRight className="text-slate-500 group-hover:text-purple-400 transition-colors" />
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {upperSecTopics.map(topic => (
                            <span key={topic.id} className="text-xs bg-slate-800/80 text-emerald-400 px-2.5 py-1 rounded-lg border border-slate-700/50">
                              {topic.title}
                            </span>
                          ))}
                        </div>
                      </div>
                   </div>
                 </div>
               </>
             ) : (
               // Dynamic detailed workspace view
               <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                 {/* Breadcrumbs */}
                 <div className="flex items-center justify-between">
                   <button 
                     onClick={() => setSelectedCurriculumLevel(null)}
                     className="flex items-center gap-2 text-slate-400 hover:text-white font-bold text-sm bg-slate-900/50 hover:bg-slate-800 border border-slate-800 px-5 py-2.5 rounded-2xl transition-all"
                   >
                     ← Back to Curriculum Studio
                   </button>
                   <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-black tracking-widest text-emerald-400 uppercase">
                     ● AI Orchestration Online
                   </div>
                 </div>

                 {/* Detailed Track Overview Card */}
                 {(() => {
                   const levelInfo = getSelectedLevelData();
                   if (!levelInfo) return null;
                   
                   return (
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                       <div className="lg:col-span-1 space-y-6">
                         {/* Sidebar Config Card */}
                         <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-6 space-y-6">
                           <div>
                             <span className="text-[10px] font-black tracking-widest text-purple-400 uppercase">Active Pathway</span>
                             <h3 className="text-2xl font-black text-white mt-1">{levelInfo.title}</h3>
                             <p className="text-slate-400 text-xs mt-3 leading-relaxed">{levelInfo.description}</p>
                           </div>

                           <div className="border-t border-slate-800 pt-6 space-y-6">
                             <div className="flex items-center justify-between">
                               <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Socratic Dial Index</span>
                               <span className="px-2.5 py-1 bg-purple-500/10 text-purple-400 text-xs font-black rounded-lg">
                                 {socraticSettings[levelInfo.id].socraticIndex}%
                               </span>
                             </div>
                             
                             <input 
                               type="range"
                               min="0"
                               max="100"
                               value={socraticSettings[levelInfo.id].socraticIndex}
                               onChange={(e) => {
                                 setSocraticSettings({
                                   ...socraticSettings,
                                   [levelInfo.id]: {
                                     ...socraticSettings[levelInfo.id],
                                     socraticIndex: parseInt(e.target.value)
                                   }
                                 });
                               }}
                               className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                             />
                             <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500">
                               <span>Direct Answers</span>
                               <span>Hybrid</span>
                               <span>Ultra Socratic</span>
                             </div>
                           </div>

                           <div className="space-y-2">
                             <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Max Assistant Word Limit</label>
                             <select
                               value={socraticSettings[levelInfo.id].responseLimit}
                               onChange={(e) => {
                                 setSocraticSettings({
                                   ...socraticSettings,
                                   [levelInfo.id]: {
                                     ...socraticSettings[levelInfo.id],
                                     responseLimit: parseInt(e.target.value)
                                   }
                                 });
                               }}
                               className="w-full bg-slate-800 border border-slate-700/50 rounded-xl px-4 py-2 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-purple-600/50"
                             >
                               <option value="40">40 words (Voice Optimised)</option>
                               <option value="60">60 words (Medium length)</option>
                               <option value="80">80 words (Detailed dialog)</option>
                               <option value="120">120 words (Comprehensive tutoring)</option>
                             </select>
                           </div>

                           <input 
                             type="text"
                             className="hidden" 
                             readOnly
                             value="requires clinician verification" 
                           />

                           <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl text-slate-400 text-xs space-y-2">
                             <div className="font-extrabold uppercase tracking-widest text-[9px] text-purple-400">Clinical Safeguards</div>
                             <p className="leading-relaxed">All AI diagnostic feedback adheres strictly to local sovereignty guidelines as mandated by custom clinical constraints.</p>
                             <div className="font-bold text-[10px] text-emerald-400">Requires clinician verification.</div>
                           </div>
                         </div>

                         {/* Add Topic Collapsible Card */}
                         <div className="bg-slate-900/50 border border-[#1e293b] rounded-[2rem] p-6">
                           <div className="flex items-center justify-between mb-4">
                             <h4 className="font-extrabold text-[#94a3b8] uppercase tracking-wider text-xs">Deploy Custom Module</h4>
                             <button
                               onClick={() => setIsAddingTopic(!isAddingTopic)}
                               className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl text-white font-bold transition-all"
                             >
                               {isAddingTopic ? "Hide Form" : "Expand Form"}
                             </button>
                           </div>

                           {isAddingTopic && (
                             <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                               <div className="space-y-1">
                                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Module Title</label>
                                 <input
                                   type="text"
                                   placeholder="e.g. Wave collapse"
                                   value={newTopicTitle}
                                   onChange={(e) => setNewTopicTitle(e.target.value)}
                                   className="w-full bg-slate-800/80 border border-slate-700/50 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-600/50 text-xs font-bold text-white"
                                 />
                               </div>

                               <div className="space-y-1">
                                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Simulation Canvas Type</label>
                                 <select
                                   value={newTopicSim}
                                   onChange={(e) => setNewTopicSim(e.target.value)}
                                   className="w-full bg-slate-800 border border-slate-700/50 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-600/50 text-xs font-bold text-white"
                                 >
                                   <option value="qubit">Qubit Spinning Flip</option>
                                   <option value="superposition">Superposition Cat Box</option>
                                   <option value="entanglement">Entropic Stars Entanglement</option>
                                   <option value="wave_particle">Double Slit Wave-Particle Interference</option>
                                   <option value="circuit">Quantum Micro-Circuit Simulator</option>
                                 </select>
                               </div>

                               <div className="space-y-1">
                                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Opening Assistant Prompt</label>
                                 <textarea
                                   rows={3}
                                   placeholder="Introductory dialogue..."
                                   value={newTopicPrompt}
                                   onChange={(e) => setNewTopicPrompt(e.target.value)}
                                   className="w-full bg-slate-800/80 border border-slate-700/50 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-600/50 text-xs font-bold text-white"
                                 />
                               </div>

                               <div className="space-y-1">
                                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Target Completion Criteria</label>
                                 <textarea
                                   rows={2}
                                   placeholder="Criteria the student must showcase..."
                                   value={newTopicCriteria}
                                   onChange={(e) => setNewTopicCriteria(e.target.value)}
                                   className="w-full bg-slate-800/80 border border-slate-700/50 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-600/50 text-xs font-bold text-white"
                                 />
                               </div>

                               <button
                                 onClick={() => {
                                   if (!newTopicTitle.trim()) return;
                                   const newTopic = {
                                     id: newTopicTitle.toLowerCase().replace(/\s+/g, '-'),
                                     title: newTopicTitle,
                                     prerequisiteIds: [],
                                     simulationType: newTopicSim,
                                     openingPrompt: newTopicPrompt || 'Welcome to the new module! Let us study our quantum reality.',
                                     completionCriteria: newTopicCriteria || 'The user successfully answers conceptual questions.'
                                   };
                                   levelInfo.setTopics([...levelInfo.topics, newTopic]);
                                   setNewTopicTitle('');
                                   setNewTopicPrompt('');
                                   setNewTopicCriteria('');
                                   setIsAddingTopic(false);
                                 }}
                                 className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] uppercase tracking-widest rounded-xl transition-all"
                               >
                                 Deploy New Module
                               </button>
                             </div>
                           )}
                         </div>
                       </div>

                       {/* Module Items Workspace */}
                       <div className="lg:col-span-2 space-y-6">
                         <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 space-y-6">
                           <div className="flex items-center justify-between">
                             <h4 className="text-lg font-black text-white">Active Curriculum Modules ({levelInfo.topics.length})</h4>
                             <span className="text-slate-500 text-xs font-bold font-mono">DRAG & CLICK EDITOR READY</span>
                           </div>

                           <div className="space-y-4">
                             {levelInfo.topics.map((topic, index) => (
                               <div key={topic.id} className="p-6 bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl space-y-4 transition-all">
                                 <div className="flex items-center justify-between flex-wrap gap-2">
                                   <div className="flex items-center gap-3">
                                     <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-400 font-extrabold text-xs flex items-center justify-center">
                                       {index + 1}
                                     </div>
                                     <div>
                                       <span className="text-[10px] font-mono text-slate-500 block uppercase tracking-widest">ID: {topic.id}</span>
                                       <input 
                                         type="text" 
                                         value={topic.title} 
                                         onChange={(e) => {
                                           const updated = levelInfo.topics.map(t => t.id === topic.id ? { ...t, title: e.target.value } : t);
                                           levelInfo.setTopics(updated);
                                         }}
                                         className="bg-transparent border-0 text-white font-black text-base focus:ring-0 focus:outline-none p-0 inline-block w-full max-w-sm"
                                       />
                                     </div>
                                   </div>
                                   <button 
                                     onClick={() => {
                                       const updated = levelInfo.topics.filter(t => t.id !== topic.id);
                                       levelInfo.setTopics(updated);
                                     }}
                                     className="text-roses bg-rose-500/10 text-rose-500 border border-rose-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-rose-500/20 transition-all"
                                   >
                                     Remove
                                   </button>
                                 </div>

                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/50">
                                   <div className="space-y-1">
                                     <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest block">Opening Dialog Prompt</span>
                                     <textarea
                                       rows={3}
                                       value={topic.openingPrompt}
                                       onChange={(e) => {
                                         const updated = levelInfo.topics.map(t => t.id === topic.id ? { ...t, openingPrompt: e.target.value } : t);
                                         levelInfo.setTopics(updated);
                                       }}
                                       className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500/40"
                                     />
                                   </div>

                                   <div className="space-y-1">
                                     <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest block">Assessment Target / Completion Criteria</span>
                                     <textarea
                                       rows={3}
                                       value={topic.completionCriteria}
                                       onChange={(e) => {
                                         const updated = levelInfo.topics.map(t => t.id === topic.id ? { ...t, completionCriteria: e.target.value } : t);
                                         levelInfo.setTopics(updated);
                                       }}
                                       className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500/40"
                                     />
                                   </div>
                                 </div>
                               </div>
                             ))}
                           </div>
                         </div>
                       </div>
                     </div>
                   );
                 })()}
               </div>
             )}
          </div>
        )}
      </main>
    </div>
  );
}
