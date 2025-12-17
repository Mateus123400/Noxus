import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { AppView, UserState, LevelKey } from './types';
import { LEVEL_DEFINITIONS, getLevelColor } from './constants';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Navigation from './components/Navigation';
import Timer from './components/Timer';
import Blocker from './components/Blocker';
import Progression from './components/Progression';
import Auth from './components/Auth';
import { User, Settings, Shield } from 'lucide-react';

const INITIAL_STATE: UserState = {
  hasOnboarded: false,
  streakDays: 0, // Reset to 0 for real usage
  currentLevel: LevelKey.BRONZE,
  startDate: new Date().toISOString(),
};

const App: React.FC = () => {
  const [userState, setUserState] = useState<UserState>(INITIAL_STATE);
  // Default to AUTH view instead of Onboarding
  const [currentView, setCurrentView] = useState<AppView>(AppView.AUTH);
  const [loading, setLoading] = useState(true);

  // Initialize Supabase Auth and Data
  const initSupabase = async () => {
    try {
      // 1. Check active session
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Fetch Profile if session exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile:', profileError);
        }

        if (profile) {
          // Calculate streak dynamically from start_date
          const startDate = new Date(profile.start_date);
          const now = new Date();
          const diffTime = Math.abs(now.getTime() - startDate.getTime());
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

          setUserState({
            hasOnboarded: profile.has_onboarded,
            streakDays: diffDays,
            currentLevel: profile.current_level as LevelKey,
            startDate: profile.start_date,
          });
          // Go to dashboard if logged in
          setCurrentView(AppView.DASHBOARD);
        } else {
          // Create profile if missing (rare case for new auth users)
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([{
              id: session.user.id,
              streak_days: INITIAL_STATE.streakDays,
              current_level: INITIAL_STATE.currentLevel,
              start_date: INITIAL_STATE.startDate,
              has_onboarded: true, // Auto-onboard for now
            }]);
          if (insertError) console.error('Error creating profile:', insertError);
          setCurrentView(AppView.DASHBOARD);
        }
      } else {
        // Stay on AUTH view if no session
        setCurrentView(AppView.AUTH);
      }
    } catch (error) {
      console.error('Supabase initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initSupabase();

    // Listen for auth changes (Login, Logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        initSupabase(); // Refetch data on sign in
      } else if (event === 'SIGNED_OUT') {
        setCurrentView(AppView.AUTH);
        setUserState(INITIAL_STATE);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Effect to update level based on streak and sync to DB
  useEffect(() => {
    const updateState = async () => {
      // Logic to calculate level
      const newLevel = [...LEVEL_DEFINITIONS]
        .reverse()
        .find(l => userState.streakDays >= l.daysRequired) || LEVEL_DEFINITIONS[0];

      let updatedState = { ...userState };
      let stateChanged = false;

      if (newLevel && newLevel.key !== userState.currentLevel) {
        updatedState.currentLevel = newLevel.key;
        stateChanged = true;
      }

      if (stateChanged) {
        setUserState(prev => ({ ...prev, currentLevel: updatedState.currentLevel }));
      }
    };

    updateState();
  }, [userState.streakDays]);

  // Sync state changes to Supabase
  useEffect(() => {
    const syncToSupabase = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.from('profiles').upsert({
          id: session.user.id,
          streak_days: userState.streakDays,
          current_level: userState.currentLevel,
          start_date: userState.startDate,
          has_onboarded: userState.hasOnboarded,
          updated_at: new Date().toISOString(),
        });
      }
    };

    // Only sync if not loading (to avoid overwriting with initial state before load)
    if (!loading) {
      syncToSupabase();
    }
  }, [userState, loading]);

  const handleOnboardingComplete = () => {
    setUserState(prev => ({ ...prev, hasOnboarded: true }));
    setCurrentView(AppView.DASHBOARD);
  };

  const accentColor = getLevelColor(userState.currentLevel);

  // Render content based on view
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      );
    }

    switch (currentView) {
      case AppView.AUTH:
        return <Auth onLoginSuccess={() => initSupabase()} />;
      case AppView.DASHBOARD:
        return <Dashboard
          userState={userState}
          setUserState={setUserState}
        />;
      case AppView.FOCUS: // New Focus Tab View
        return <Timer />;
      case AppView.BLOCKER:
        return <Blocker />;
      case AppView.PROGRESSION:
        return <Progression userState={userState} setUserState={setUserState} />;
      case AppView.PROFILE:
        return (
          <div className="p-6 pt-12 animate-fade-in text-center pb-24 h-full overflow-y-auto no-scrollbar">
            <div className="w-24 h-24 mx-auto rounded-full bg-surface border-2 border-white/10 flex items-center justify-center mb-4 shadow-xl">
              <User size={40} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Usuário Determinado</h2>
            <p className="text-gray-500 mb-8">Nível atual: {LEVEL_DEFINITIONS.find(l => l.key === userState.currentLevel)?.name}</p>

            <div className="space-y-4 text-left max-w-md mx-auto">
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
                // window.location.reload(); // Handled by onAuthStateChange
              }}
              className="mt-12 text-xs text-red-500 underline opacity-50 hover:opacity-100"
            >
              Sign Out / Reset
            </button>
          </div>
        );
      default:
        return <Dashboard
          userState={userState}
          setUserState={setUserState}
        />;
    }
  };

  if (currentView === AppView.ONBOARDING && !loading) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    // Use h-[100dvh] for reliable mobile viewport height
    <div className="h-[100dvh] w-full bg-background text-text flex flex-col relative overflow-hidden">
      <main className="flex-1 overflow-hidden relative">
        {/* Render Active View */}
        {renderContent()}
      </main>

      {!loading && currentView !== AppView.ONBOARDING && currentView !== AppView.AUTH && (
        <Navigation
          currentView={currentView}
          setView={setCurrentView}
          accentColor={accentColor}
        />
      )}
    </div>
  );
};

export default App;