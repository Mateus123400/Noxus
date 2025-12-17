import React, { useState, useEffect } from 'react';
import { LEVEL_DEFINITIONS } from '../constants';
import { LevelKey, UserState } from '../types';
import { Check, Lock, Medal, Gem, Shield, Sun, Layers, RotateCcw, Edit3, Play, AlertTriangle, Calendar } from 'lucide-react';

interface ProgressionProps {
  userState: UserState;
  setUserState: React.Dispatch<React.SetStateAction<UserState>>;
}

const getLevelIcon = (key: LevelKey, color: string, isActive: boolean) => {
  const size = isActive ? 24 : 18;
  const className = isActive ? "drop-shadow-[0_0_10px_currentColor]" : "";

  switch (key) {
    case LevelKey.BRONZE:
      return <Medal size={size} color={color} className={className} />;
    case LevelKey.SILVER:
      return <Medal size={size} color={color} className={className} />;
    case LevelKey.GOLD:
      return <Layers size={size} color={color} className={className} />; // Represents Gold Bar
    case LevelKey.DIAMOND:
      return <Gem size={size} color={color} className={className} />;
    case LevelKey.EMERALD:
      return <Gem size={size} color={color} className={className} />; // Same icon, diff color
    case LevelKey.GUARDIAN:
      return <Shield size={size} color={color} className={className} />;
    case LevelKey.CELESTIAL:
      return <Sun size={size} color={color} className={`${className} ${isActive ? 'animate-spin-slow' : ''}`} />;
    default:
      return <Medal size={size} color={color} />;
  }
};

// Helper to format YYYY-MM-DD
const formatDateForInput = (isoString: string) => {
  if (!isoString) return new Date().toISOString().split('T')[0];
  try {
    return new Date(isoString).toISOString().split('T')[0];
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
};

const Progression: React.FC<ProgressionProps> = ({ userState, setUserState }) => {
  const currentLevelIndex = LEVEL_DEFINITIONS.findIndex(l => l.key === userState.currentLevel);
  const [isEditing, setIsEditing] = useState(false);
  
  // Local state for inputs
  const [manualDays, setManualDays] = useState(userState.streakDays.toString());
  const [manualDate, setManualDate] = useState(formatDateForInput(userState.startDate));

  // Sync local state when userState changes (fix for Reset button not updating UI immediately if editing was open, or just general sync)
  useEffect(() => {
    setManualDays(userState.streakDays.toString());
    setManualDate(formatDateForInput(userState.startDate));
  }, [userState.streakDays, userState.startDate]);

  const handleManualUpdate = () => {
    const days = parseInt(manualDays);
    if (!isNaN(days) && days >= 0) {
      // Create date object from manualDate input (YYYY-MM-DD)
      const [year, month, day] = manualDate.split('-').map(Number);
      const newStartDate = new Date(year, month - 1, day);
      
      setUserState(prev => ({
        ...prev,
        streakDays: days,
        startDate: newStartDate.toISOString()
      }));
      setIsEditing(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Confirmar recaída? Seu progresso retornará ao dia 0. A honestidade é a base da disciplina.")) {
      const now = new Date();
      setUserState(prev => ({
        ...prev,
        streakDays: 0,
        startDate: now.toISOString()
      }));
      // Local state will update via useEffect
    }
  };

  const onDaysChange = (val: string) => {
    setManualDays(val);
    const d = parseInt(val);
    if (!isNaN(d) && d >= 0) {
       const date = new Date();
       date.setDate(date.getDate() - d);
       setManualDate(formatDateForInput(date.toISOString()));
    }
  };

  const onDateChange = (val: string) => {
    setManualDate(val);
    if (val) {
        const [year, month, day] = val.split('-').map(Number);
        const startDate = new Date(year, month - 1, day);
        const today = new Date();
        // Reset hours for diff calculation
        startDate.setHours(0,0,0,0);
        today.setHours(0,0,0,0);
        
        const diffTime = today.getTime() - startDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 0) {
            setManualDays(diffDays.toString());
        }
    }
  };

  // Formatted display date
  const displayDate = new Date(userState.startDate).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

  return (
    <div className="w-full pb-24 pt-6 px-6 animate-fade-in bg-background h-full overflow-y-auto no-scrollbar">
      <header className="mb-6">
        <h1 className="text-2xl font-display font-bold text-white mb-1">Sua Ascensão</h1>
        <p className="text-gray-500 text-sm">Gerencie seu progresso e conquiste autoridade.</p>
      </header>

      {/* Control Panel */}
      <div className="bg-surface rounded-2xl p-5 border border-white/10 mb-8 shadow-lg transition-all duration-300">
        
        {/* Status Header */}
        <div className="flex justify-between items-start mb-6">
            <div>
                <h3 className="text-white font-bold text-sm flex items-center gap-2 mb-1">
                <Play size={14} className="text-green-500 fill-green-500 animate-pulse" />
                Contador Automático Ativo
                </h3>
                <p className="text-xs text-gray-500">O sistema soma +1 dia a cada 24h.</p>
            </div>
            
            {!isEditing && (
                <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Data de Início</p>
                    <p className="text-sm font-bold text-white flex items-center justify-end gap-1.5">
                        <Calendar size={14} className="text-primary" />
                        {displayDate}
                    </p>
                </div>
            )}
        </div>

        {!isEditing ? (
          <div className="flex gap-3">
            <button 
              onClick={() => setIsEditing(true)}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 px-4 flex items-center justify-center gap-2 transition-all"
            >
              <Edit3 size={16} className="text-primary" />
              <span className="text-sm font-bold text-white">Editar Data/Dias</span>
            </button>
            <button 
              onClick={handleReset}
              className="flex-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl py-3 px-4 flex items-center justify-center gap-2 transition-all group"
            >
              <RotateCcw size={16} className="text-red-500 group-hover:-rotate-180 transition-transform duration-500" />
              <span className="text-sm font-bold text-red-500">Reiniciar</span>
            </button>
          </div>
        ) : (
          <div className="animate-fade-in space-y-4">
             {/* Edit Form */}
             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-[10px] text-gray-400 mb-1.5 block uppercase font-bold">Dias Limpos</label>
                    <input 
                        type="number"
                        min="0"
                        value={manualDays}
                        onChange={(e) => onDaysChange(e.target.value)}
                        className="w-full bg-background border border-primary rounded-lg px-3 py-3 text-white font-bold text-lg outline-none focus:ring-1 focus:ring-primary"
                    />
                 </div>
                 <div>
                    <label className="text-[10px] text-gray-400 mb-1.5 block uppercase font-bold">Data de Início</label>
                    <input 
                        type="date"
                        value={manualDate}
                        onChange={(e) => onDateChange(e.target.value)}
                        className="w-full bg-background border border-white/20 rounded-lg px-3 py-3 text-white font-bold text-sm outline-none focus:border-primary [color-scheme:dark]"
                    />
                 </div>
             </div>

             <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => setIsEditing(false)} 
                  className="flex-1 py-3 rounded-xl bg-gray-800 text-xs font-bold text-gray-400 hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleManualUpdate} 
                  className="flex-1 py-3 rounded-xl bg-primary text-xs font-bold text-white hover:bg-blue-600 transition-colors shadow-lg shadow-blue-900/20"
                >
                  Confirmar Alterações
                </button>
             </div>
          </div>
        )}
        
        {isEditing && (
            <div className="mt-4 pt-4 border-t border-white/5 flex items-start gap-2">
                <AlertTriangle size={14} className="text-gold mt-0.5" />
                <p className="text-[10px] text-gray-500 leading-tight">
                    Alterar a data ou os dias atualizará automaticamente o outro campo.
                </p>
            </div>
        )}
      </div>

      <div className="relative pl-6 space-y-6">
        {/* Timeline Line */}
        <div className="absolute left-[31px] top-4 bottom-10 w-0.5 bg-gradient-to-b from-primary/50 to-transparent opacity-30" />
        
        {LEVEL_DEFINITIONS.map((level, idx) => {
          const isUnlocked = idx <= currentLevelIndex;
          const isCurrent = idx === currentLevelIndex;

          return (
            <div key={level.key} className={`relative flex items-center gap-5 ${isUnlocked ? 'opacity-100' : 'opacity-40 grayscale'}`}>
              
              {/* Node / Icon Container */}
              <div 
                className={`relative z-10 w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center border transition-all duration-500 bg-[#05070C]
                ${isCurrent ? 'scale-110 border-2 shadow-[0_0_20px_rgba(0,0,0,0.5)]' : 'border-white/10'}
                `}
                style={{ borderColor: isUnlocked ? level.color : undefined }}
              >
                {/* Glow for current */}
                {isCurrent && (
                   <div className="absolute inset-0 rounded-2xl opacity-20 blur-md" style={{ backgroundColor: level.color }} />
                )}
                {getLevelIcon(level.key, isUnlocked ? level.color : '#475569', isCurrent)}
              </div>

              {/* Card */}
              <div 
                className={`flex-1 p-4 rounded-xl border relative overflow-hidden transition-all duration-300 group
                ${isCurrent ? 'bg-surface border-white/20' : 'bg-surface/20 border-white/5'}
                `}
              >
                {isCurrent && <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none" />}
                
                <div className="flex justify-between items-start mb-1">
                  <div>
                    {/* UPDATED: Text is white if unlocked, gray if locked. No longer colored by level. */}
                    <h3 className={`font-bold text-base uppercase tracking-wide ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                      {level.name}
                    </h3>
                    <span className="text-xs text-gray-500 font-mono">
                      {level.daysRequired === 0 ? 'Início' : `${level.daysRequired}+ Dias`}
                    </span>
                  </div>
                  
                  {isCurrent ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-black uppercase">
                      Atual
                    </span>
                  ) : isUnlocked ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <Lock size={14} className="text-gray-600 mt-1" />
                  )}
                </div>
                
                {/* Visual "Bar" for fun */}
                {isUnlocked && (
                  <div className="mt-2 w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full w-full opacity-50" style={{ backgroundColor: level.color }} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Progression;