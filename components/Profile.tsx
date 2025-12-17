import React, { useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { User, Settings, Shield, Edit2, Loader2, Camera, LogOut } from 'lucide-react';
import { UserState, AppView } from '../types';
import { LEVEL_DEFINITIONS } from '../constants';

interface ProfileProps {
    userState: UserState;
    setUserState: React.Dispatch<React.SetStateAction<UserState>>;
}

const Profile: React.FC<ProfileProps> = ({ userState, setUserState }) => {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { data: sessionData } = await supabase.auth.getSession();
            if (!sessionData.session) throw new Error('No active session');

            const userId = sessionData.session.user.id;
            const fullPath = `${userId}/${filePath}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fullPath, file);

            if (uploadError) {
                throw uploadError;
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fullPath);

            // Update Profile in DB
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', userId);

            if (updateError) {
                throw updateError;
            }

            // Update Local State
            setUserState(prev => ({ ...prev, avatarUrl: publicUrl }));

        } catch (error: any) {
            console.error('Error uploading avatar:', error.message);
            alert('Error uploading avatar: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handlePasswordReset = async () => {
        const confirm = window.confirm("Deseja receber um e-mail para redefinir sua senha?");
        if (confirm && userState.email) {
            const { error } = await supabase.auth.resetPasswordForEmail(userState.email, {
                redirectTo: 'com.ascennoxus.app://reset-callback',
            });
            if (error) alert('Erro ao enviar e-mail: ' + error.message);
            else alert('E-mail enviado! Verifique sua caixa de entrada.');
        }
    };

    return (
        <div className="p-6 pt-12 animate-fade-in text-center pb-24 h-full overflow-y-auto no-scrollbar relative">

            {/* Avatar Section */}
            <div className="relative w-32 h-32 mx-auto mb-6 group cursor-pointer" onClick={handleAvatarClick}>
                <div className="w-full h-full rounded-full border-4 border-surface overflow-hidden shadow-2xl bg-surface flex items-center justify-center relative">
                    {userState.avatarUrl ? (
                        <img
                            src={userState.avatarUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <User size={48} className="text-gray-400" />
                    )}

                    {/* Loading Overlay */}
                    {uploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Loader2 className="animate-spin text-white" size={32} />
                        </div>
                    )}
                </div>

                {/* Edit Badge */}
                <div className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full shadow-lg border-2 border-background group-hover:scale-110 transition-transform">
                    <Camera size={18} />
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={uploadAvatar}
                    accept="image/*"
                    className="hidden"
                />
            </div>

            <h2 className="text-2xl font-bold text-white mb-1">Usuário Determinado</h2>
            <p className="text-gray-500 mb-8">Nível atual: {LEVEL_DEFINITIONS.find(l => l.key === userState.currentLevel)?.name}</p>

            {/* Account Info Section */}
            <div className="space-y-4 text-left max-w-md mx-auto mb-8">
                <div className="p-4 bg-surface rounded-xl border border-white/5 space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Minha Conta</h3>

                    {/* Email Field */}
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500">E-mail</label>
                        <div className="text-white font-medium break-all">
                            {userState.email || 'Carregando...'}
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-1 pt-2 border-t border-white/5">
                        <label className="text-xs text-gray-500">Senha</label>
                        <div className="flex justify-between items-center">
                            <div className="text-white font-mono tracking-widest text-lg">••••••</div>
                            <button
                                onClick={handlePasswordReset}
                                className="text-xs text-primary hover:text-blue-400 underline"
                            >
                                Alterar
                            </button>
                        </div>
                    </div>
                </div>

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
                onClick={async () => {
                    await supabase.auth.signOut();
                    // window.location.reload(); // Handled by App listener
                }}
                className="inline-flex items-center gap-2 text-sm text-red-500/70 hover:text-red-500 transition-colors py-2 px-4 rounded-lg hover:bg-red-500/10"
            >
                <LogOut size={16} />
                Sair da Conta
            </button>
        </div>
    );
};

export default Profile;
