import React, { useState } from 'react';
import { Home, ShieldAlert, BarChart3, User, Brain, Menu, X, LogOut } from 'lucide-react';
import { AppView } from '../types';

interface NavigationProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  accentColor: string;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView, accentColor }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { view: AppView.DASHBOARD, icon: Home, label: 'Início (Home)' },
    { view: AppView.FOCUS, icon: Brain, label: 'Modo Foco' },
    { view: AppView.MENTOR, icon: Brain, label: 'Mentor IA' },
    { view: AppView.PROGRESSION, icon: BarChart3, label: 'Níveis & Conquistas' },
    { view: AppView.PROFILE, icon: User, label: 'Meu Perfil' },
  ];

  const handleNavClick = (view: AppView) => {
    setView(view);
    setIsOpen(false);
  };

  return (
    <>
      {/* Top Right Toggle Button - High Z-Index to float above everything */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-6 right-6 z-[60] p-3 bg-gray-900/80 backdrop-blur-md rounded-full border border-gray-700 shadow-xl text-white hover:scale-105 transition-transform"
      >
        <Menu size={24} />
      </button>

      {/* Full Screen Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-xl flex flex-col animate-fade-in">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-800">
            <h2 className="text-2xl font-bold text-white tracking-tight">Menu Noxus</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            >
              <X size={28} />
            </button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto py-8 px-6 space-y-4">
            {navItems.map((item) => {
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => handleNavClick(item.view)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${isActive
                    ? 'bg-blue-600/20 border border-blue-500/50'
                    : 'hover:bg-gray-800 border border-transparent'
                    }`}
                >
                  <div className={`p-3 rounded-lg ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                    <item.icon size={24} />
                  </div>
                  <div className="text-left">
                    <h3 className={`text-lg font-bold ${isActive ? 'text-white' : 'text-gray-300'}`}>
                      {item.label}
                    </h3>
                    {isActive && <span className="text-xs text-blue-400">Você está aqui</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer / Version */}
          <div className="p-8 border-t border-gray-800 text-center text-gray-600 text-sm">
            <p>Noxus v1.0.0 (Beta)</p>
            <p className="mt-2 text-xs opacity-50">Desperte sua melhor versão.</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;