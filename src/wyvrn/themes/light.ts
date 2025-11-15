import { Theme, ThemeMode } from './common';

export const lightTheme: Theme = {
  id: ThemeMode.LIGHT,
  name: 'Light',
  icon: '/themes/theme.svg',
  variables: {
    '--dark-color': '#222',
    '--dark-bg-color': '#f0f0f0',
    '--darker-bg-color': '#e0e0e0',
    '--server-list-bg-color': '#d8d8d8',
    '--user-list-bg-color': '#e8e8e8',
    '--chatlog-bg-color': '#ffffff',
    '--chatlog-color': '#333333',
    '--textarea-bg-color': '#f5f5f5',

    // New variables for onboarding
    '--text-color': '#2e3338',
    '--text-secondary': '#666',
    '--text-tertiary': '#999',
    '--border-color': '#ddd',
    '--highlight-color': '#5865f2',
    '--input-bg': '#f0f0f0',
  }
};

export default lightTheme;
