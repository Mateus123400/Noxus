import React, { useState, useEffect } from 'react';
import { AppView, UserState, LevelKey } from './types';
import { LEVEL_DEFINITIONS, getLevelColor } from './constants';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Navigation from './components/Navigation';
import Timer from './components/Timer';
import Blocker from './components/Blocker';
import Progression from './components/Progression';
import { User, Settings, Shield } from 'lucide-react';

const INITIAL_STATE: UserState = {
  hasOnboarded: false,
  streakDays: 3, // Initial demo value
  currentLevel: LevelKey.BRONZE,
  startDate: new Date().toISOString(),
};

const App: React.FC = () => {
  const [userState, setUserState] = useState<UserState>(INITIAL_STATE);
  const [currentView, setCurrentView] = useState<AppView>(AppView.ONBOARDING);

  // Effect to update level based on streak
  useEffect(() => {
    const newLevel = [...LEVEL_DEFINITIONS]
      .reverse()
      .find(l => userState.streakDays >= l.daysRequired);
      
    if (newLevel && newLevel.key !== userState.currentLevel) {
      setUserState(prev => ({ ...prev, currentLevel: newLevel.key }));
    }
  }, [userState.streakDays]);

  const handleOnboardingComplete = () => {
    setUserState(prev => ({ ...prev, hasOnboarded: true }));
    setCurrentView(AppView.DASHBOARD);
  };

  const accentColor = getLevelColor(userState.currentLevel);

  // Render content based on view
  const renderContent = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard 
          userState={userState} 
          setUserState={setUserState}
        />;
      case AppView.FOCUS: // New Focus Tab View
        return <Timer />;
      case AppView.BLOCKER:
        return <Blocker />;
      case AppView.PROGRESSION:
        return <Progression userState={userState} setUserState={setUserState} />;
      case AppView.PROFILE:
        return (
          <div className="p-6 pt-12 animate-fade-in text-center pb-24 h-full overflow-y-auto no-scrollbar">
             <div className="w-24 h-24 mx-auto rounded-full bg-surface border-2 border-white/10 flex items-center justify-center mb-4 shadow-xl">
                <User size={40} className="text-gray-400" />
             </div>
             <h2 className="text-2xl font-bold text-white mb-2">Usuário Determinado</h2>
             <p className="text-gray-500 mb-8">Nível atual: {LEVEL_DEFINITIONS.find(l=>l.key === userState.currentLevel)?.name}</p>
             
             <div className="space-y-4 text-left max-w-md mx-auto">
                <div className="p-4 bg-surface rounded-xl flex items-center gap-4 border border-white/5 active:bg-surface/80 transition-colors">
                   <Settings size={20} className="text-gray-400" />
                   <div>
                     <p className="text-white font-bold text-sm">Configurações</p>
                     <p className="text-xs text-gray-500">Notificações, Privacidade</p>
                   </div>
                </div>
                <div className="p-4 bg-surface rounded-xl flex items-center gap-4 border border-white/5 active:bg-surface/80 transition-colors">
                   <Shield size={20} className="text-gray-400" />
                   <div>
                     <p className="text-white font-bold text-sm">Segurança</p>
                     <p className="text-xs text-gray-500">PIN, Biometria</p>
                   </div>
                </div>
             </div>
             
             <button 
               onClick={() => setCurrentView(AppView.ONBOARDING)} 
               className="mt-12 text-xs text-red-500 underline opacity-50 hover:opacity-100"
             >
               Reset App Demo
             </button>
          </div>
        );
      default:
        return <Dashboard 
          userState={userState} 
          setUserState={setUserState}
        />;
    }
  };

  if (currentView === AppView.ONBOARDING) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    // Use h-[100dvh] for reliable mobile viewport height
    <div className="h-[100dvh] w-full bg-background text-text flex flex-col relative overflow-hidden">
      <main className="flex-1 overflow-hidden relative">
         {/* Render Active View */}
         {renderContent()}
      </main>
      
      <Navigation 
        currentView={currentView} 
        setView={setCurrentView} 
        accentColor={accentColor}
      />
    </div>
  );
};

export default App;