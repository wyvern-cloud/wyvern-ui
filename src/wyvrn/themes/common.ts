export enum ThemeMode {
    LIGHT = 'light',
    DARK = 'dark',
    DEVELOPER = 'developer',
    SYSTEM = 'system'
  }
  
  export interface Theme {
    id: ThemeMode;
    name: string;
    icon: string;
    variables: Record<string, string>;
  }