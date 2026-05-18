import { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, onDisconnect, update } from 'firebase/database';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export function useCollabSession(roomCode: string | null, studentId: string, studentName: string) {
  const [participants, setParticipants] = useState<{ [key: string]: { name: string, online: boolean } }>({});
  const [remoteSimulation, setRemoteSimulation] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!roomCode || !studentId) return;

    const presenceRef = ref(db, `classrooms/${roomCode}/collab/participants/${studentId}`);
    set(presenceRef, { name: studentName, online: true });
    onDisconnect(presenceRef).update({ online: false });

    const participantsRef = ref(db, `classrooms/${roomCode}/collab/participants`);
    onValue(participantsRef, (snapshot) => {
      setParticipants(snapshot.val() || {});
    });

    const simRef = ref(db, `classrooms/${roomCode}/collab/simulation`);
    onValue(simRef, (snapshot) => {
      setRemoteSimulation(snapshot.val());
    });

    const messagesRef = ref(db, `classrooms/${roomCode}/collab/messages`);
    onValue(messagesRef, (snapshot) => {
      setMessages(snapshot.val() || []);
    });

  }, [roomCode, studentId, studentName]);

  const setSharedSimulation = (sim: string) => {
    if (!roomCode) return;
    set(ref(db, `classrooms/${roomCode}/collab/simulation`), sim);
  };

  const addSharedMessage = (msg: any) => {
    if (!roomCode) return;
    set(ref(db, `classrooms/${roomCode}/collab/messages`), [...messages, msg]);
  };

  return { participants, remoteSimulation, setSharedSimulation, addSharedMessage, messages };
}
