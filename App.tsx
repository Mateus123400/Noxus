import React, { useState, useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { supabase } from './supabaseClient';
import { AppView, UserState, LevelKey } from './types';
import { LEVEL_DEFINITIONS, getLevelColor } from './constants';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Navigation from './components/Navigation';
import Timer from './components/Timer';
import AIChat from './components/AIChat';
import Progression from './components/Progression';
import Auth from './components/Auth';
import Profile from './components/Profile';
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

  // Track recovery mode reliably across async states
  const isRecoveryMode = React.useRef(false);

  // Initialize Supabase Auth and Data
  const initSupabase = async (forceRedirect = true) => {
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
            email: session.user.email,
            avatarUrl: profile.avatar_url,
          });

          // Only redirect if explicitly requested AND not in recovery mode
          if (forceRedirect && !isRecoveryMode.current) {
            setCurrentView(AppView.DASHBOARD);
          }
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

          // Update local state immediately for new user
          setUserState(prev => ({
            ...prev,
            email: session.user.email,
          }));

          if (forceRedirect && !isRecoveryMode.current) {
            setCurrentView(AppView.DASHBOARD);
          }
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
    // Initial load - yes, redirect to dashboard if logged in
    initSupabase(true);

    // Listen for auth changes (Login, Logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth Event:', event);

      if (event === 'PASSWORD_RECOVERY') {
        isRecoveryMode.current = true;
        setCurrentView(AppView.UPDATE_PASSWORD);
      } else if (event === 'SIGNED_IN' && session) {
        // If we are currently in update password mode (checked via Ref), DO NOT redirect.
        if (!isRecoveryMode.current) {
          // Pass false to avoid overriding current view if just refreshing session
          initSupabase(false);
        } else {
          // We are in recovery mode, but we still need the data!
          // Fetch data but forceRedirect = false
          initSupabase(false);
        }
      } else if (event === 'SIGNED_OUT') {
        isRecoveryMode.current = false;
        setCurrentView(AppView.AUTH);
        setUserState(INITIAL_STATE);
      }
    });

    // LISTEN FOR DEEP LINKS (OAuth Callback & Password Reset)
    const appListener = CapacitorApp.addListener('appUrlOpen', async (data) => {
      console.log('App opened with URL:', data.url);

      // Handle Password Reset Callback PRIORITY
      if (data.url.includes('reset-callback') || data.url.includes('type=recovery')) {
        isRecoveryMode.current = true;
        setCurrentView(AppView.UPDATE_PASSWORD);
        // We allow the token parsing below to happen so session gets set
      }

      if (data.url.includes('access_token') || data.url.includes('refresh_token')) {
        try {
          const url = new URL(data.url);
          const hash = url.hash.substring(1);
          const params = new URLSearchParams(hash);

          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (error) console.error('Set session error:', error);

            // RE-ENFORCE recovery view if needed after session set
            if (data.url.includes('reset-callback') || data.url.includes('type=recovery')) {
              isRecoveryMode.current = true;
              setCurrentView(AppView.UPDATE_PASSWORD);
            } else if (data.url.includes('google-auth')) {
              // For Google Auth, explicitly Go to Dashboard
              isRecoveryMode.current = false; // Ensure we are NOT in recovery
              setCurrentView(AppView.DASHBOARD);
            }
          }
        } catch (e) {
          console.error('Error handling deep link:', e);
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
      appListener.then(handler => handler.remove());
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
      // Don't sync if we are just updating password (might not have profile loaded yet)
      if (currentView === AppView.UPDATE_PASSWORD) return;

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

    // Only sync if not loading 
    if (!loading) {
      syncToSupabase();
    }
  }, [userState, loading]); // REMOVED currentView to fix navigation loop bug

  const handleOnboardingComplete = () => {
    setUserState(prev => ({ ...prev, hasOnboarded: true }));
    setCurrentView(AppView.DASHBOARD);
  };

  const accentColor = getLevelColor(userState.currentLevel);

  // Render content based on view
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full text-white" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#05070C' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4 mx-auto" style={{ borderBottom: '2px solid white', width: '32px', height: '32px', borderRadius: '50%' }}></div>
            <p style={{ color: 'white' }}>Iniciando Noxus...</p>
          </div>
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
      case AppView.MENTOR:
        return <AIChat userState={userState} />;
      case AppView.PROGRESSION:
        return <Progression userState={userState} setUserState={setUserState} />;
      case AppView.PROFILE:
        return <Profile userState={userState} setUserState={setUserState} />;
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