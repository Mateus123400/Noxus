import React from 'react';
import { Home, ShieldAlert, BarChart3, User, Brain } from 'lucide-react';
import { AppView } from '../types';

interface NavigationProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  accentColor: string;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView, accentColor }) => {
  const navItems = [
    { view: AppView.DASHBOARD, icon: Home, label: 'Início' },
    { view: AppView.FOCUS, icon: Brain, label: 'Foco' }, // New Focus Tab
    { view: AppView.BLOCKER, icon: ShieldAlert, label: 'Bloqueio' },
    { view: AppView.PROGRESSION, icon: BarChart3, label: 'Níveis' },
    { view: AppView.PROFILE, icon: User, label: 'Perfil' },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#0A1E3F]/95 backdrop-blur-xl border-t border-[#1B1F2A] pb-safe pt-2 px-2 z-50">
      <div className="flex justify-between items-center max-w-lg mx-auto h-16 px-2">
        {navItems.map((item) => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className="flex flex-col items-center justify-center min-w-[60px] transition-all duration-300 group"
            >
              <div className={`p-1 rounded-full transition-all duration-300 ${isActive ? '-translate-y-1' : ''}`}>
                <item.icon
                  size={22}
                  color={isActive ? accentColor : '#64748B'}
                  className={`transition-all duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]' : 'group-hover:text-gray-400'}`}
                />
              </div>
              <span 
                className={`text-[10px] mt-0.5 font-medium transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-600'}`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Navigation;