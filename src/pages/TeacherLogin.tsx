import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured, isDemoMode } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, Mail, Lock, ArrowRight, Loader2, Sparkles } from 'lucide-react';

export default function TeacherLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured && !isDemoMode) {
      setError('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to environment variables in settings.');
      setLoading(false);
      return;
    }

    try {
      if (isDemoMode && email === 'teacher@demo.com' && password === 'quantum123') {
        // Bypass real auth for demo
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
        navigate('/teacher/dashboard');
        return;
      }

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              full_name: email.split('@')[0], // Placeholder name
            }
          }
        });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      }
      navigate('/teacher/dashboard');
    } catch (err: any) {
      if (err.message === 'Failed to fetch') {
        setError('Connection error: Could not reach Supabase. Check your URL configuration.');
      } else {
        setError(err.message || 'An error occurred during authentication');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-10 text-center">
          {isDemoMode && (
            <div className="mb-4 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
              Demo Mode Active
            </div>
          )}
          <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20">
            <GraduationCap className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter mb-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            {isLogin ? 'Teacher Portal' : 'Join the Faculty'}
          </h1>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">
            {isLogin ? 'Manage your classrooms & tracks' : 'Empower your students with Quantum'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-600/50 transition-all font-medium"
                placeholder="professor@quantum.edu"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Security Key</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-600/50 transition-all font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold py-3 px-4 rounded-xl text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/20 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {isLogin ? 'Sign In to Dashboard' : 'Initialize Account'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center flex flex-col gap-4">
          {!isDemoMode && (
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-slate-500 hover:text-white text-sm font-bold transition-colors"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already registered? Log In"}
            </button>
          )}

          <div className="pt-4 border-t border-slate-800/50">
            <button 
              onClick={() => {
                setEmail('teacher@demo.com');
                setPassword('quantum123');
                setIsLogin(true);
              }}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 hover:text-purple-300 transition-colors bg-purple-500/5 px-6 py-3 rounded-full border border-purple-500/20 shadow-lg shadow-purple-500/5 hover:bg-purple-500/10"
            >
              {isDemoMode ? 'Bypass with Demo Account' : 'Quick Access Demo'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Decorative floating icon */}
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 right-[15%] hidden lg:block text-purple-500 opacity-20"
      >
        <Sparkles size={80} />
      </motion.div>
    </div>
  );
}
