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
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

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
          <button className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl bg-purple-600 text-white font-bold transition-all shadow-lg shadow-purple-500/20">
            <Users size={20} />
            <span className={`transition-opacity ${isMobileMenuOpen ? 'opacity-100 block' : 'opacity-0 hidden md:opacity-100 md:block'}`}>Classrooms</span>
          </button>
          <button className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
            <BarChart2 size={20} />
            <span className={`transition-opacity ${isMobileMenuOpen ? 'opacity-100 block' : 'opacity-0 hidden md:opacity-100 md:block'}`}>Analytics</span>
          </button>
          <button className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
            <Box size={20} />
            <span className={`transition-opacity ${isMobileMenuOpen ? 'opacity-100 block' : 'opacity-0 hidden md:opacity-100 md:block'}`}>Curriculum</span>
          </button>
        </nav>

        <div className="mt-auto space-y-2">
          <button className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
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
      </main>
    </div>
  );
}
