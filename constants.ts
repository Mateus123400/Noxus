import { LevelKey, LevelData } from './types';

export const LEVEL_DEFINITIONS: LevelData[] = [
  { key: LevelKey.BRONZE, name: 'Bronze', color: '#8B5A2B', daysRequired: 0 },
  { key: LevelKey.SILVER, name: 'Prata', color: '#C0C0C0', daysRequired: 7 },
  { key: LevelKey.GOLD, name: 'Ouro', color: '#C9A24D', daysRequired: 30 },
  { key: LevelKey.DIAMOND, name: 'Diamante', color: '#7FD5FF', daysRequired: 90 },
  { key: LevelKey.EMERALD, name: 'Esmeralda', color: '#138A52', daysRequired: 180 },
  { key: LevelKey.GUARDIAN, name: 'Guardião', color: '#3B82F6', daysRequired: 365 }, // Changed to bright blue for visibility
  { key: LevelKey.CELESTIAL, name: 'Áurea Celestial', color: '#F9E7A1', daysRequired: 730 },
];

export const COLORS = {
  bg: '#05070C',
  surface: '#0A1E3F',
  primary: '#1E6CFF',
  text: '#E6EBF2',
  gold: '#C9A24D',
};

// Helper to get color for current level
export const getLevelColor = (key: LevelKey): string => {
  const level = LEVEL_DEFINITIONS.find(l => l.key === key);
  return level ? level.color : COLORS.primary;
};