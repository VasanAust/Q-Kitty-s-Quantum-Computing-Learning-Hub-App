import { useState } from 'react';
import { motion } from 'motion/react';

interface Props {
  onJoin: (roomCode: string, studentName: string) => void;
}

export default function CollabJoinPanel({ onJoin }: Props) {
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [roomCode, setRoomCode] = useState('');
  const [name, setName] = useState('');

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl flex flex-col gap-4">
        <h2 className="text-2xl font-black text-indigo-900">Lab Partners Mode 🤝</h2>
        <div className="flex gap-2">
            <button onClick={() => setMode('create')} className={`flex-1 p-2 rounded-lg font-bold ${mode === 'create' ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>Create Room</button>
            <button onClick={() => setMode('join')} className={`flex-1 p-2 rounded-lg font-bold ${mode === 'join' ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>Join Room</button>
        </div>
        <input placeholder="Enter your name" value={name} onChange={e => setName(e.target.value)} className="p-3 border rounded-lg" />
        {mode === 'join' && <input placeholder="Enter 6-char room code" value={roomCode} onChange={e => setRoomCode(e.target.value)} className="p-3 border rounded-lg" />}
        <button onClick={() => onJoin(mode === 'create' ? Math.random().toString(36).substring(2, 8).toUpperCase() : roomCode, name)} className="p-4 bg-teal-600 text-white font-black rounded-lg">
            {mode === 'create' ? 'Create Room' : 'Join Room'}
        </button>
      </motion.div>
    </div>
  );
}
