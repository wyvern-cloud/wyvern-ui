import { preloadedThemes, Theme, ThemeMode } from '../themes';

import { GLOBAL_PREFIX } from '../utils/constants';

class ThemeService {
  private static instance: ThemeService;
  private currentTheme: ThemeMode = ThemeMode.DARK;
  private systemThemeMedia: MediaQueryList;
  private themeChangedListeners: Array<(theme: ThemeMode) => void> = [];
  private loadedThemes: Record<ThemeMode, Theme> = preloadedThemes;

  private constructor() {
    // Initialize with stored theme or default to system
    const savedTheme = localStorage.getItem(`${GLOBAL_PREFIX}theme`) as ThemeMode;
    this.currentTheme = savedTheme || ThemeMode.SYSTEM;
    
    // Set up system theme detection
    this.systemThemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
    this.systemThemeMedia.addEventListener('change', () => {
      if (this.currentTheme === ThemeMode.SYSTEM) {
        this.applyTheme(ThemeMode.SYSTEM);
      }
    });

    // Apply the initial theme
    this.applyTheme(this.currentTheme);
  }

  public static getInstance(): ThemeService {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService();
    }
    return ThemeService.instance;
  }

  public getCurrentTheme(): ThemeMode {
    return this.currentTheme;
  }

  public getThemes(): Theme[] {
    return Object.values(this.loadedThemes);
  }

  public getTheme(themeId: ThemeMode): Theme | undefined {
    return this.loadedThemes[themeId];
  }

  public async setTheme(themeId: ThemeMode): Promise<void> {
    if (this.currentTheme !== themeId) {
      this.currentTheme = themeId;
      localStorage.setItem(`${GLOBAL_PREFIX}theme`, themeId);
      await this.applyTheme(themeId);
      
      // Notify listeners
      this.themeChangedListeners.forEach(listener => listener(themeId));
    }
  }

  public onThemeChanged(callback: (theme: ThemeMode) => void): () => void {
    this.themeChangedListeners.push(callback);
    return () => {
      this.themeChangedListeners = this.themeChangedListeners.filter(
        listener => listener !== callback
      );
    };
  }

  private async applyTheme(themeId: ThemeMode): Promise<void> {
    let themeToApply: Theme;
    
    if (themeId === ThemeMode.SYSTEM) {
      // If system theme, check system preference
      const isDarkMode = this.systemThemeMedia.matches;
      themeToApply = this.getTheme(isDarkMode ? ThemeMode.DARK : ThemeMode.LIGHT) ?? 
        this.getTheme(ThemeMode.DARK)!;
    } else {
      themeToApply = this.getTheme(themeId) ?? this.getTheme(ThemeMode.DARK)!;
    }
    
    // Apply CSS variables
    Object.entries(themeToApply.variables).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
    
    // Add theme class to body
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${themeId === ThemeMode.SYSTEM 
      ? (this.systemThemeMedia.matches ? 'dark' : 'light') 
      : themeId}`);
  }
}

export default ThemeService.getInstance();
