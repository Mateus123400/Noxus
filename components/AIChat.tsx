import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User as UserIcon, Loader2 } from 'lucide-react';
import { UserState, LevelKey } from '../types';
import { LEVEL_DEFINITIONS } from '../constants';
import { OpenRouter } from "@openrouter/sdk";

// @ts-ignore
const OPENROUTER_API_KEY = "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";

const client = new OpenRouter({
  apiKey: OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://ascennoxus.app",
    "X-Title": "Ascen Noxus",
  }
});

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatProps {
  userState: UserState;
}

const AIChat: React.FC<AIChatProps> = ({ userState }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Olá. Sou seu mentor no Noxus. Estou aqui para garantir que você mantenha o foco e a disciplina. O que está tirando sua paz hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const currentLevelName = LEVEL_DEFINITIONS.find(l => l.key === userState.currentLevel)?.name || 'Iniciado';

      const systemPrompt = `Você é um mentor estoico, sábio e disciplinado dentro do aplicativo "Ascen Noxus". 
      O usuário está no Nível "${currentLevelName}" e tem um sequência de ${userState.streakDays} dias de foco.
      Contexto: O usuário está lutando contra vícios e busca autodisciplina.
      
      Seu objetivo é:
      1. Ajudar o usuário a vencer vícios (pornografia, redes sociais, procrastinação).
      2. Usar linguagem direta, masculina e inspiradora (estilo estoicismo moderno).
      3. Ser curto e grosso. Não faça palestras longas. Vá direto ao ponto.
      4. Se o usuário estiver recaindo, seja firme mas não destructivo.
      
      Responda sempre em Português do Brasil.`;

      console.log("Sending request via OpenRouter SDK...");

      const completion = await client.chat.send({
        model: "tngtech/deepseek-r1t2-chimera:free",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: "user", content: userMessage.content }
        ]
      });

      const aiContent = completion.choices?.[0]?.message?.content || "O silêncio é uma resposta. Tente novamente.";
      setMessages(prev => [...prev, { role: 'assistant', content: aiContent }]);

    } catch (error: any) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: `[ERRO] ${error.message || JSON.stringify(error)}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background relative overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-surface/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
            <Bot size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="font-display font-bold text-white text-lg leading-none">Mentor Noxus</h1>
            <p className="text-xs text-gray-400">IA Estoica • DeepSeek</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar pb-24">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 ${msg.role === 'user'
              ? 'bg-primary text-white rounded-br-none'
              : 'bg-surface border border-white/5 text-gray-200 rounded-bl-none'
              }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-surface border border-white/5 rounded-2xl p-4 rounded-bl-none flex gap-2 items-center">
              <Loader2 size={16} className="text-primary animate-spin" />
              <span className="text-xs text-gray-500">Formulando sabedoria...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-[80px] left-0 w-full p-4 bg-gradient-to-t from-background via-background to-transparent">
        <div className="flex gap-2 items-center bg-surface border border-white/10 rounded-full p-2 pl-4 shadow-2xl">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Peça um conselho..."
            className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm outline-none"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
