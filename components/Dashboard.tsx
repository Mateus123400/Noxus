import React from 'react';
import { UserState } from '../types';
import { LEVEL_DEFINITIONS, getLevelColor } from '../constants';
import { Shield, Clock, BrainCircuit, Activity, TrendingUp, Zap, Sparkles, Lock, Dna } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  userState: UserState;
  setUserState: React.Dispatch<React.SetStateAction<UserState>>;
}

const BENEFIT_STAGES = [
  {
    minDays: 0,
    title: "Regeneração Física",
    desc: "Seu corpo começa a reabsorver minerais essenciais (Zinco, Magnésio).",
    buffs: [
      { icon: Zap, label: "Recuperação Energética", val: "Iniciada" },
      { icon: Dna, label: "Nutrientes Vitais", val: "Estabilizando" },
    ]
  },
  {
    minDays: 7,
    title: "Pico Androgênico",
    desc: "Aumento significativo nos receptores de andrógenos e testosterona circulante.",
    buffs: [
      { icon: TrendingUp, label: "Testosterona", val: "+45% (Pico)" },
      { icon: Activity, label: "Vigor Físico", val: "Aumentado" },
    ]
  },
  {
    minDays: 30,
    title: "Magnetismo & Foco",
    desc: "A 'névoa mental' desaparece. Sua presença se torna mais imponente.",
    buffs: [
      { icon: BrainCircuit, label: "Clareza Mental", val: "Cristalina" },
      { icon: Sparkles, label: "Magnetismo", val: "Ativo" },
    ]
  },
  {
    minDays: 90,
    title: "Transmutação Total",
    desc: "Domínio total dos impulsos. A energia sexual é convertida em poder criativo.",
    buffs: [
      { icon: Sparkles, label: "Conexão Criador", val: "Profunda" },
      { icon: Shield, label: "Estabilidade Emocional", val: "Blindada" },
    ]
  }
];

const Dashboard: React.FC<DashboardProps> = ({ userState }) => {
  const currentLevelColor = getLevelColor(userState.currentLevel);
  const currentLevelData = LEVEL_DEFINITIONS.find(l => l.key === userState.currentLevel);
  
  // Stats Calculations
  const hoursSavedPerDay = 2.5; 
  const totalHoursSaved = (userState.streakDays * hoursSavedPerDay).toFixed(1);
  const dopamineRecovery = Math.min(100, Math.floor((userState.streakDays / 90) * 100));

  // Determine current Benefit Stage
  const currentBenefitStage = [...BENEFIT_STAGES].reverse().find(s => userState.streakDays >= s.minDays) || BENEFIT_STAGES[0];
  const nextBenefitStage = BENEFIT_STAGES.find(s => s.minDays > userState.streakDays);

  // Progress Ring Data
  const currentLevelIdx = LEVEL_DEFINITIONS.findIndex(l => l.key === userState.currentLevel);
  const nextLevel = LEVEL_DEFINITIONS[currentLevelIdx + 1];
  const prevLevelReq = LEVEL_DEFINITIONS[currentLevelIdx].daysRequired;
  
  let progress = 100;
  if (nextLevel) {
    const totalRange = nextLevel.daysRequired - prevLevelReq;
    const currentProgress = userState.streakDays - prevLevelReq;
    progress = Math.min(100, Math.max(0, (currentProgress / totalRange) * 100));
  }

  const ringData = [
    { name: 'Progress', value: progress, color: currentLevelColor },
    { name: 'Remaining', value: 100 - progress, color: '#1B1F2A' },
  ];

  return (
    <div className="flex flex-col h-full w-full relative overflow-y-auto no-scrollbar animate-fade-in bg-background">
      
      {/* Header Info */}
      <div className="pt-6 px-6 flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
           <div className="p-1.5 rounded-lg bg-surface border border-white/10 shadow-lg shadow-black/20">
             <Shield size={16} color={currentLevelColor} />
           </div>
           <span className="text-sm font-bold text-gray-300 uppercase tracking-wider">{currentLevelData?.name}</span>
        </div>
      </div>

      {/* Hero Section: Streak Ring */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center relative py-4 md:py-8">
        {/* Container size optimized for mobile (w-64) and desktop */}
        <div className="w-64 h-64 md:w-72 md:h-72 relative flex items-center justify-center">
           {/* Progress Ring */}
           <div className="absolute inset-0">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={ringData}
                   innerRadius="78%"  // Using % prevents cropping
                   outerRadius="92%"  // Keeping it inside the box
                   startAngle={90}
                   endAngle={-270}
                   dataKey="value"
                   stroke="none"
                   cornerRadius={10}
                   paddingAngle={3}
                 >
                   {ringData.map((entry, index) => (
                     <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        style={{ filter: index === 0 ? `drop-shadow(0 0 10px ${currentLevelColor}60)` : 'none' }}
                     />
                   ))}
                 </Pie>
               </PieChart>
             </ResponsiveContainer>
           </div>
           
           {/* Inner Content */}
           <div className="flex flex-col items-center z-10">
             <span className="text-gray-500 text-[10px] uppercase tracking-widest mb-1 font-bold">Você está limpo há</span>
             {/* Responsive text size */}
             <span className="text-6xl md:text-7xl font-display font-bold text-white tracking-tighter drop-shadow-2xl">
               {userState.streakDays}
             </span>
             <span className="text-sm font-medium text-gray-500 mt-1">DIAS</span>
           </div>
        </div>
        
        {/* Next Goal Pill */}
        {nextLevel && (
           <div className="mt-4 py-2 px-5 rounded-full bg-surface/50 border border-white/5 flex items-center gap-2 backdrop-blur-sm">
             <Activity size={14} className="text-gray-400" />
             <span className="text-xs text-gray-400 font-medium">
               Meta: <span className="text-white font-bold">{nextLevel.daysRequired} dias</span>
             </span>
           </div>
        )}
      </div>

      {/* Information Sections */}
      {/* Increased bottom padding (pb-32) to ensure content clears navigation on all devices */}
      <div className="px-5 pb-32 w-full flex-1 space-y-6 md:space-y-8">
        
        {/* SEMINAL RETENTION BENEFITS CARD */}
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-white font-display font-bold text-lg mb-3 flex items-center gap-2">
              <Zap size={18} className="text-gold" />
              Retenção Seminal
          </h3>
          
          <div className="bg-gradient-to-br from-[#1a1600] to-surface border border-gold/20 rounded-2xl p-5 relative overflow-hidden shadow-lg shadow-black/40">
             {/* Decorative shine */}
             <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-gold/5 to-transparent pointer-events-none" />

             <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-gold text-[10px] font-bold uppercase tracking-widest border border-gold/30 px-2 py-0.5 rounded mb-2 inline-block">
                      Fase Atual
                    </span>
                    <h4 className="text-xl font-bold text-white">{currentBenefitStage.title}</h4>
                  </div>
                  {nextBenefitStage && (
                    <div className="text-[10px] text-gray-500 flex flex-col items-end">
                      <span className="flex items-center gap-1"><Lock size={10} /> Próxima Fase</span>
                      <span>{nextBenefitStage.minDays} dias</span>
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-gray-400 mb-5 leading-relaxed">
                  {currentBenefitStage.desc}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {currentBenefitStage.buffs.map((buff, idx) => (
                    <div key={idx} className="bg-black/40 rounded-xl p-3 border border-white/5 flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-gold mb-1">
                        <buff.icon size={16} />
                        <span className="text-[10px] font-bold uppercase">{buff.label}</span>
                      </div>
                      <span className="text-sm font-medium text-white">{buff.val}</span>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>

        {/* GENERAL STATS */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-white font-display font-bold text-lg mb-3 flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" />
              Impacto Real
          </h3>
          
          <div className="space-y-4">
              {/* Time Saved Card */}
              <div className="bg-surface/40 p-5 rounded-2xl border border-white/5 relative overflow-hidden group shadow-md">
                  <div className="relative z-10 flex items-start justify-between">
                      <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wide font-bold mb-1">Tempo de Vida Recuperado</p>
                          <div className="flex items-baseline gap-1">
                              <span className="text-4xl font-display font-bold text-white">{totalHoursSaved}</span>
                              <span className="text-sm font-bold text-gray-500">Horas</span>
                          </div>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-xl text-primary">
                          <Clock size={24} />
                      </div>
                  </div>
              </div>

              {/* Dopamine/Clarity Card */}
              <div className="bg-surface/40 p-5 rounded-2xl border border-white/5 relative overflow-hidden shadow-md">
                  <div className="flex items-start justify-between mb-4">
                       <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wide font-bold mb-1">Clareza Mental</p>
                          <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-bold text-white">{dopamineRecovery}%</span>
                              <span className="text-xs text-green-500 ml-2">Recuperando</span>
                          </div>
                       </div>
                       <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                          <BrainCircuit size={24} />
                       </div>
                  </div>
                  {/* Visual Bar */}
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                          className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-1000" 
                          style={{ width: `${dopamineRecovery}%` }}
                      />
                  </div>
              </div>
          </div>
        </div>

        {/* Motivational Footer */}
        <div className="mt-6 text-center p-6 border-t border-white/5">
            <p className="italic text-gray-500 text-xs md:text-sm font-serif max-w-xs mx-auto">"A energia que você preserva é a energia que cria o seu império."</p>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;