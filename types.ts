export enum AppView {
  AUTH = 'AUTH',
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  FOCUS = 'FOCUS', // New view for Timer/Meditation
  MENTOR = 'MENTOR',
  PROGRESSION = 'PROGRESSION',
  PROFILE = 'PROFILE',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
}

export enum LevelKey {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  DIAMOND = 'DIAMOND',
  EMERALD = 'EMERALD',
  GUARDIAN = 'GUARDIAN',
  CELESTIAL = 'CELESTIAL',
}

export interface LevelData {
  key: LevelKey;
  name: string;
  color: string;
  daysRequired: number;
}

export interface UserState {
  hasOnboarded: boolean;
  streakDays: number;
  currentLevel: LevelKey;
  startDate: string; // ISO String
  email?: string;
  avatarUrl?: string;
}

export interface BlockItem {
  id: string;
  name: string;
  type: 'APP' | 'SITE';
  is_active: boolean;
}