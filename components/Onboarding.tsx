import React, { useState } from 'react';
import { Shield, Smartphone, Brain, Calendar, ChevronRight, Check } from 'lucide-react';
import { COLORS } from '../constants';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else onComplete();
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center p-6 bg-background text-text relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] rounded-full bg-blue-900 blur-[120px]" />
      </div>

      <div className="z-10 w-full max-w-md flex-1 flex flex-col justify-center">
        {step === 1 && (
          <div className="animate-fade-in text-center space-y-8">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-surface to-black border border-blue-900 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(30,108,255,0.2)]">
               <Shield size={48} className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold tracking-tight mb-2 text-white">
                ASCEN NOXUS
              </h1>
              <p className="text-gray-400 text-lg">Domine seus impulsos.</p>
            </div>
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-blue-900 to-transparent my-8" />
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in w-full space-y-6">
            <h2 className="text-2xl font-display font-bold text-white mb-6">Seus Objetivos</h2>
            <div className="space-y-4">
              {[
                { icon: Shield, label: 'Bloquear Sites', desc: 'Proteção contra navegação' },
                { icon: Smartphone, label: 'Bloquear Apps', desc: 'Limite redes sociais' },
                { icon: Brain, label: 'Meditação Anti-urge', desc: 'Controle imediato' },
                { icon: Calendar, label: 'Contagem de Dias', desc: 'Rastreie seu progresso' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-surface/50 border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-black/40 rounded-lg text-primary">
                      <item.icon size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary flex items-center justify-center">
                    <Check size={14} className="text-primary" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in w-full text-center space-y-6">
             <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
               <Shield size={40} className="text-primary" />
             </div>
            <h2 className="text-2xl font-display font-bold text-white">Permissões para proteger sua jornada</h2>
            <p className="text-gray-400 leading-relaxed text-sm">
              Precisamos de acesso para monitorar e proteger. Seus dados ficam seguros no dispositivo — você controla o que é compartilhado.
            </p>
            <div className="p-4 bg-surface/30 rounded-lg border border-white/5 text-left mt-4">
              <div className="flex items-start gap-3 mb-2">
                <Check size={16} className="text-green-500 mt-1" />
                <span className="text-sm text-gray-300">Acesso de uso para bloqueio</span>
              </div>
              <div className="flex items-start gap-3">
                <Check size={16} className="text-green-500 mt-1" />
                <span className="text-sm text-gray-300">Notificações para lembretes</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="w-full max-w-md pb-8 z-10">
        <button
          onClick={handleNext}
          className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(30,108,255,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          {step === 1 ? 'Começar' : step === 3 ? 'Conceder permissões' : 'Continuar'}
          <ChevronRight size={20} />
        </button>
        <div className="flex justify-center gap-2 mt-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                s === step ? 'w-8 bg-primary' : 'w-2 bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;