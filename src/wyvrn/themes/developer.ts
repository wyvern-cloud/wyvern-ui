import { Theme, ThemeMode } from './common';

export const developerTheme: Theme = {
  id: ThemeMode.DEVELOPER,
  name: 'Developer',
  icon: '/themes/theme.svg',
  variables: {
    '--dark-color': '#ffffff',
    '--dark-bg-color': '#666666',
    '--darker-bg-color': '#444444',
    '--server-list-bg-color': '#444444',
    '--user-list-bg-color': '#444444',
    '--chatlog-bg-color': '#666666',
    '--chatlog-color': '#ffffff',
    '--textarea-bg-color': '#444444',
    
    // New variables for onboarding
    '--text-color': '#0f0',
    '--text-secondary': '#0a0',
    '--text-tertiary': '#070',
    '--border-color': '#0a0',
    '--highlight-color': '#0f0',
    '--input-bg': '#0a0a0a',
  }
};
