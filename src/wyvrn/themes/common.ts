export enum ThemeMode {
    LIGHT = 'light',
    DARK = 'dark',
    TOKYO_NIGHT = 'tokyo_night',
    DEVELOPER = 'developer',
    SYSTEM = 'system'
  }
  
  export interface Theme {
    id: ThemeMode;
    name: string;
    icon: string;
    variables: Record<string, string>;
  }