import { Theme, ThemeMode } from './common';
import {lightTheme} from './light';
import {darkTheme} from './dark';
import {developerTheme} from './developer';

export { Theme, ThemeMode };

// Preloaded themes
export const preloadedThemes: Record<ThemeMode, Theme> = {
  [ThemeMode.LIGHT]: lightTheme,
  [ThemeMode.DARK]: darkTheme,
  [ThemeMode.DEVELOPER]: developerTheme,
  [ThemeMode.SYSTEM]: { 
    id: ThemeMode.SYSTEM, 
    name: 'System', 
    icon: '/themes/system-theme.svg', 
    variables: {} 
  }
};
