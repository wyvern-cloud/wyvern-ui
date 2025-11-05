import { Theme, ThemeMode } from './common';

export const darkTheme: Theme = {
  id: ThemeMode.DARK,
  name: 'Dark',
  icon: '/themes/theme.svg',
  variables: {
    '--dark-color': '#fff',
    '--dark-bg-color': '#36393f',
    '--darker-bg-color': '#2f3136',
    '--server-list-bg-color': '#202225',
    '--user-list-bg-color': '#2f3136',
    '--chatlog-bg-color': '#36393f',
    '--chatlog-color': '#dcddde',
    '--textarea-bg-color': '#40444b',
    
    // New variables for onboarding
    '--text-color': '#dcddde',
    '--text-secondary': '#aaa',
    '--text-tertiary': '#888',
    '--border-color': '#444',
    '--highlight-color': '#7289da',
    '--input-bg': '#40444b',
  }
};
