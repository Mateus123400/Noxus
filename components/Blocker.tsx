import React, { useState } from 'react';
import { Plus, Trash2, Smartphone, Globe, Lock, X } from 'lucide-react';
import { BlockItem } from '../types';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const INITIAL_BLOCKS: BlockItem[] = [
  { id: '1', name: 'Instagram', type: 'APP', isActive: true },
  { id: '2', name: 'TikTok', type: 'APP', isActive: true },
  { id: '3', name: 'Adult Sites', type: 'SITE', isActive: true },
];

const DATA = [
  { name: 'Seg', saved: 2.5 },
  { name: 'Ter', saved: 3.2 },
  { name: 'Qua', saved: 1.8 },
  { name: 'Qui', saved: 4.0 },
  { name: 'Sex', saved: 3.5 },
  { name: 'Sab', saved: 5.2 },
  { name: 'Dom', saved: 4.8 },
];

const Blocker: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'APPS' | 'SITES'>('APPS');
  const [blocks, setBlocks] = useState<BlockItem[]>(INITIAL_BLOCKS);
  
  // Adding State
  const [isAdding, setIsAdding] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  const toggleBlock = (id: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b));
  };

  const deleteBlock = (id: string) => {
    if(window.confirm("Remover este bloqueio?")) {
      setBlocks(blocks.filter(b => b.id !== id));
    }
  };

  const handleAddItem = () => {
    if (newItemName.trim() === '') return;
    const newItem: BlockItem = {
      id: Date.now().toString(),
      name: newItemName,
      type: activeTab === 'APPS' ? 'APP' : 'SITE',
      isActive: true
    };
    setBlocks([...blocks, newItem]);
    setNewItemName('');
    setIsAdding(false);
  };

  const filteredBlocks = blocks.filter(b => 
    activeTab === 'APPS' ? b.type === 'APP' : b.type === 'SITE'
  );

  return (
    <div className="w-full pb-24 pt-6 px-6 animate-fade-in">
      <header className="mb-8">
        <h1 className="text-2xl font-display font-bold text-white mb-1">Central de Bloqueio</h1>
        <p className="text-gray-500 text-sm">Gerencie o que te impede de evoluir.</p>
      </header>

      {/* Stats Chart */}
      <div className="bg-surface/30 rounded-2xl p-4 border border-white/5 mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-bold text-gray-300">Tempo Salvo (Horas)</span>
          <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">Esta semana</span>
        </div>
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DATA}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10}} />
              <Tooltip 
                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                contentStyle={{backgroundColor: '#0A1E3F', borderColor: '#1E6CFF', borderRadius: '8px'}}
                itemStyle={{color: '#fff'}}
              />
              <Bar dataKey="saved" radius={[4, 4, 0, 0]}>
                {DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 5 ? '#1E6CFF' : '#334155'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Management Tabs */}
      <div className="flex gap-4 mb-6 border-b border-white/10">
        <button
          onClick={() => setActiveTab('APPS')}
          className={`pb-2 px-2 text-sm font-bold transition-colors ${
            activeTab === 'APPS' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'
          }`}
        >
          Aplicativos
        </button>
        <button
          onClick={() => setActiveTab('SITES')}
          className={`pb-2 px-2 text-sm font-bold transition-colors ${
            activeTab === 'SITES' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'
          }`}
        >
          Websites
        </button>
      </div>

      <div className="space-y-3">
        {filteredBlocks.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 bg-surface rounded-xl border border-white/5 group">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${item.isActive ? 'bg-red-500/10 text-red-500' : 'bg-gray-800 text-gray-500'}`}>
                {item.type === 'APP' ? <Smartphone size={18} /> : <Globe size={18} />}
              </div>
              <div>
                <p className={`font-bold text-sm ${item.isActive ? 'text-white' : 'text-gray-500'}`}>{item.name}</p>
                <p className="text-[10px] text-gray-500">{item.isActive ? 'Bloqueio Ativo' : 'Pausado'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                 onClick={() => deleteBlock(item.id)}
                 className="p-2 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                 <Trash2 size={16} />
              </button>
              <button
                onClick={() => toggleBlock(item.id)}
                className={`w-10 h-6 rounded-full p-1 transition-colors ${item.isActive ? 'bg-primary' : 'bg-gray-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${item.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        ))}
        
        {/* Add New Logic */}
        {!isAdding ? (
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full py-4 border border-dashed border-gray-700 rounded-xl text-gray-500 flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
          >
            <Plus size={18} />
            Adicionar {activeTab === 'APPS' ? 'App' : 'Site'}
          </button>
        ) : (
          <div className="p-4 bg-surface rounded-xl border border-primary/30 animate-fade-in">
             <div className="flex gap-2 mb-3">
               <input 
                  autoFocus
                  type="text" 
                  placeholder={`Nome do ${activeTab === 'APPS' ? 'App' : 'Site'}...`}
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="flex-1 bg-background border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary focus:outline-none"
               />
             </div>
             <div className="flex gap-2">
                <button onClick={() => setIsAdding(false)} className="flex-1 py-2 bg-gray-800 rounded-lg text-xs font-bold text-gray-400">Cancelar</button>
                <button onClick={handleAddItem} className="flex-1 py-2 bg-primary rounded-lg text-xs font-bold text-white">Salvar Bloqueio</button>
             </div>
          </div>
        )}
      </div>

      <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-red-900/20 to-transparent border-l-2 border-red-500">
         <div className="flex gap-3">
           <Lock size={20} className="text-red-500 shrink-0 mt-1" />
           <div>
             <h3 className="text-sm font-bold text-red-100">Modo Estrito</h3>
             <p className="text-xs text-red-200/60 mt-1">Desbloqueio requer PIN e espera de 24h.</p>
           </div>
         </div>
      </div>
    </div>
  );
};

export default Blocker;