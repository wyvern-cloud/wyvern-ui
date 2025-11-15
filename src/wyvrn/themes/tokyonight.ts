import { Theme, ThemeMode } from './common';

export const tokyoNightTheme: Theme = {
  id: ThemeMode.TOKYO_NIGHT,
  name: 'Tokyo Night - Night',
  icon: '/themes/theme.svg',
  variables: {
    '--dark-color': '#a0caf5',
    '--dark-bg-color': '#1a1b26',
    '--darker-bg-color': '#16161e',
    '--server-list-bg-color': '#1a1b26',
    '--user-list-bg-color': '#1a1b26',
    '--chatlog-bg-color': '#1a1b26',
    '--chatlog-color': '#a0caf5',
    '--textarea-bg-color': '#16161e',
    
    // New variables for onboarding
    '--text-color': '#a0caf5',
    '--text-secondary': '#4d95f7',
    '--text-tertiary': '#979af7',
    '--border-color': '#16161e',
    '--highlight-color': '#7289da',
    '--input-bg': '#16161e',
  }
};
