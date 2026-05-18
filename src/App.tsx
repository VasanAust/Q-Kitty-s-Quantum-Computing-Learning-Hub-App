import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage, { CategoryType } from './components/LandingPage';
import EarlyPrimaryLab from './components/EarlyPrimaryLab';
import UpperPrimaryLab from './components/UpperPrimaryLab';
import MiddleSchoolLab from './components/MiddleSchoolLab';
import UpperSecondaryLab from './components/UpperSecondaryLab';
import { TooltipProvider } from './components/ui/tooltip';
import TeacherLogin from './pages/TeacherLogin';
import TeacherDashboard from './pages/TeacherDashboard';

export type SimulationType = 'none' | 'qubit' | 'superposition' | 'entanglement';

export interface UserProgress {
  points: number;
  badges: string[];
}

export default function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/teacher" element={<TeacherLogin />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
}

function HomeView() {
  const [currentView, setCurrentView] = useState<'landing' | CategoryType>('landing');

  if (currentView === 'early_primary') {
    return <EarlyPrimaryLab onBack={() => setCurrentView('landing')} />;
  }

  if (currentView === 'upper_primary') {
    return <UpperPrimaryLab onBack={() => setCurrentView('landing')} />;
  }

  if (currentView === 'middle_school') {
    return <MiddleSchoolLab onBack={() => setCurrentView('landing')} />;
  }

  if (currentView === 'upper_secondary') {
    return <UpperSecondaryLab onBack={() => setCurrentView('landing')} />;
  }

  return <LandingPage onSelectCategory={setCurrentView} />;
}
