import React, { useState, useEffect } from 'react';
import { X, Play, RefreshCw, Wind } from 'lucide-react';

interface TimerProps {
  onExit?: () => void; // Optional now, as it might be a main tab
}

enum TimerState {
  SETUP,
  RUNNING,
  FINISHED
}

const Timer: React.FC<TimerProps> = ({ onExit }) => {
  const [timerState, setTimerState] = useState<TimerState>(TimerState.SETUP);
  const [duration, setDuration] = useState(5); // Minutes
  const [timeLeft, setTimeLeft] = useState(0);
  const [canExit, setCanExit] = useState(false);
  const [phaseText, setPhaseText] = useState("Prepare-se");
  
  useEffect(() => {
    let interval: number;
    if (timerState === TimerState.RUNNING && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        
        // Cycle text based on generic 14s breath cycle for demo visually
        const cycleTime = 14; 
        const currentSecondInCycle = Date.now() / 1000 % cycleTime;
        
        if(currentSecondInCycle < 4) setPhaseText("Inspire (4s)");
        else if (currentSecondInCycle < 8) setPhaseText("Segure (4s)");
        else setPhaseText("Expire (6s)");
        
      }, 1000);
    } else if (timeLeft === 0 && timerState === TimerState.RUNNING) {
      setTimerState(TimerState.FINISHED);
    }
    return () => clearInterval(interval);
  }, [timerState, timeLeft]);

  useEffect(() => {
    if (timerState === TimerState.RUNNING) {
      const timeout = setTimeout(() => setCanExit(true), 5000);
      return () => clearTimeout(timeout);
    }
  }, [timerState]);

  const startTimer = () => {
    setTimeLeft(duration * 60);
    setTimerState(TimerState.RUNNING);
    setCanExit(false);
  };

  const handleReset = () => {
    setTimerState(TimerState.SETUP);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleExitRequest = () => {
    if (window.confirm("Deseja encerrar a prática? A disciplina é construída na persistência.")) {
      if (onExit) onExit();
      else setTimerState(TimerState.SETUP);
    }
  };

  if (timerState === TimerState.SETUP) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 animate-fade-in bg-background pb-24">
        <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20">
          <Wind size={32} className="text-blue-400" />
        </div>
        
        <h2 className="text-3xl font-display font-bold text-white mb-2">Sessão de Foco</h2>
        <p className="text-gray-400 mb-12 text-center max-w-xs">
          Acalme a mente e vença o impulso através da respiração controlada.
        </p>

        <div className="grid grid-cols-3 gap-4 w-full max-w-sm mb-12">
          {[1, 3, 5, 10, 15, 30].map((min) => (
            <button
              key={min}
              onClick={() => setDuration(min)}
              className={`py-4 rounded-xl border font-bold text-lg transition-all ${
                duration === min 
                  ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                  : 'bg-surface/50 border-white/5 text-gray-400 hover:bg-surface'
              }`}
            >
              {min}m
            </button>
          ))}
        </div>

        <button
          onClick={startTimer}
          className="w-full max-w-sm bg-white text-black font-bold py-5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-all active:scale-95 shadow-lg"
        >
          <Play size={20} fill="black" />
          INICIAR AGORA
        </button>
      </div>
    );
  }

  if (timerState === TimerState.FINISHED) {
    return (
      <div className="fixed inset-0 z-[60] bg-[#05070C] flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="w-24 h-24 rounded-full border-2 border-green-500 flex items-center justify-center mb-8">
            <RefreshCw size={32} className="text-green-500" />
        </div>
        <h2 className="text-3xl font-display font-bold text-white mb-4">Consciência Recuperada</h2>
        <p className="text-gray-400 mb-12 text-center">Você venceu o impulso. Recomece se necessário.</p>
        <button
          onClick={handleReset}
          className="w-full max-w-sm bg-surface border border-white/10 text-white font-bold py-4 rounded-xl"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-[#05070C] flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Exit Button Logic */}
      <button 
        onClick={handleExitRequest}
        className={`absolute top-6 right-6 text-gray-500 p-2 transition-opacity duration-500 ${canExit ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <X size={24} />
      </button>

      {/* Breathing Ring Animation */}
      <div className="relative mb-16">
        <div className="absolute inset-0 bg-blue-500/20 blur-[60px] rounded-full animate-pulse-slow"></div>
        <div className="w-64 h-64 rounded-full border-2 border-blue-500/30 flex items-center justify-center relative">
          <div className="w-48 h-48 rounded-full bg-blue-600/10 border border-blue-500/50 flex items-center justify-center animate-breathe shadow-[0_0_30px_rgba(30,108,255,0.2)]">
            <span className="text-4xl font-display font-bold text-white tabular-nums">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      <div className="text-center space-y-2 animate-fade-in">
        <h3 className="text-2xl font-bold text-blue-400">{phaseText}</h3>
        <p className="text-gray-500">Foco no presente. Respire.</p>
      </div>
    </div>
  );
};

export default Timer;