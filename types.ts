export enum AppView {
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  FOCUS = 'FOCUS', // New view for Timer/Meditation
  BLOCKER = 'BLOCKER',
  PROGRESSION = 'PROGRESSION',
  PROFILE = 'PROFILE',
  AUTH = 'AUTH',
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
}

export interface BlockItem {
  id: string;
  name: string;
  type: 'APP' | 'SITE';
  isActive: boolean;
}