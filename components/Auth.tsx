import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Mail, Lock, User, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';

interface AuthProps {
    onLoginSuccess: () => void;
}

type AuthMode = 'login' | 'signup' | 'forgot';

const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
    const [authMode, setAuthMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: 'com.ascennoxus.app://google-auth',
                },
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message || 'Erro no login com Google');
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMsg(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'com.ascennoxus.app://reset-callback',
            });
            if (error) throw error;
            setSuccessMsg('E-mail de redefinição enviado! Verifique sua caixa de entrada.');
            setAuthMode('login');
        } catch (err: any) {
            setError(err.message || 'Erro ao enviar e-mail de redefinição');
        } finally {
            setLoading(false);
        }
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMsg(null);

        try {
            if (authMode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                onLoginSuccess();
            } else if (authMode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setSuccessMsg('Conta criada com sucesso! Verifique seu e-mail para confirmar o cadastro antes de entrar.');
                setAuthMode('login');
            }
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md bg-surface p-8 rounded-2xl border border-white/5 shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-display font-bold text-white mb-2">ASCEN NOXUS</h1>
                    <p className="text-gray-400">Domine seus impulsos. Assuma o controle.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                        {error}
                    </div>
                )}

                {successMsg && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-sm font-medium animate-fade-in">
                        {successMsg}
                    </div>
                )}

                {/* Main Auth Form */}
                <form onSubmit={authMode === 'forgot' ? handleResetPassword : handleAuth} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-background border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                                placeholder="seu@email.com"
                                required
                            />
                        </div>
                    </div>

                    {authMode !== 'forgot' && (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-gray-300 ml-1">Senha</label>
                                {authMode === 'login' && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAuthMode('forgot');
                                            setError(null);
                                            setSuccessMsg(null);
                                        }}
                                        className="text-xs text-primary hover:text-blue-400 transition-colors"
                                    >
                                        Esqueci minha senha
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-background border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 group mt-6"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                {authMode === 'login' && 'Entrar'}
                                {authMode === 'signup' && 'Criar Conta'}
                                {authMode === 'forgot' && 'Enviar Link'}
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                {/* Google Login (Only on Login/Signup modes) */}
                {authMode !== 'forgot' && (
                    <>
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-surface text-gray-500">Ou continue com</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full bg-white text-gray-900 hover:bg-gray-100 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-3"
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                            Google
                        </button>
                    </>
                )}

                <div className="mt-8 text-center">
                    {authMode === 'forgot' ? (
                        <button
                            onClick={() => {
                                setAuthMode('login');
                                setError(null);
                                setSuccessMsg(null);
                            }}
                            className="text-gray-400 hover:text-white flex items-center justify-center gap-2 mx-auto text-sm transition-colors"
                        >
                            <ArrowLeft size={16} /> Voltar para login
                        </button>
                    ) : (
                        <p className="text-gray-400 text-sm">
                            {authMode === 'login' ? 'Novo por aqui?' : 'Já tem uma conta?'}
                            <button
                                onClick={() => {
                                    setAuthMode(authMode === 'login' ? 'signup' : 'login');
                                    setError(null);
                                    setSuccessMsg(null);
                                }}
                                className="ml-2 text-primary hover:text-blue-400 font-medium transition-colors"
                            >
                                {authMode === 'login' ? 'Criar conta' : 'Fazer login'}
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Auth;
