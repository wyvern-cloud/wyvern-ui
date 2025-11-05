import m from "mithril";
import themeService from "../../services/themeService";
import { ThemeMode } from '../../themes';
import styles from "../../theme-selector.module.css";
import onboardingService from "../../services/onboardingService";

const ThemeStage = {
  svgCache: {},

  fetchSVG: async (url) => {
    if (ThemeStage.svgCache[url]) {
      return ThemeStage.svgCache[url];
    }

    try {
      const response = await fetch(url);
      const svgText = await response.text();
      ThemeStage.svgCache[url] = svgText;
      return svgText;
    } catch (error) {
      console.error(`Failed to fetch SVG: ${url}`, error);
      return null;
    }
  },

  view: () => {
    const themes = themeService.getThemes();
    const data = onboardingService.getData();
    const selectedTheme = data.theme || ThemeMode.SYSTEM;
    onboardingService.updateData({ theme: selectedTheme });
    
    return (
      <div class={styles.themeSelector}>
        {themes.map(theme => {
          const isNonSystemTheme = theme.id !== ThemeMode.SYSTEM;

          const colors = isNonSystemTheme ? {
            bgColor: theme.variables['--server-list-bg-color'],
            sidebarColor: theme.variables['--darker-bg-color'],
            mainColor: theme.variables['--dark-bg-color'],
            highlightColor: '#7289da',
            textColor: theme.variables['--chatlog-color']
          } : {};

          if (isNonSystemTheme) {
            return (
              <div 
                key={theme.id}
                class={`${styles.themeOption} ${selectedTheme === theme.id ? styles.selected : ''}`}
                onclick={() => {
                  onboardingService.updateData({ theme: theme.id });
                  themeService.setTheme(theme.id);
                  m.redraw();
                }}
              >
                <div class={styles.themePreview}>
                  <svg 
                    width="192" 
                    height="108"
                    oncreate={async (vnode) => {
                      const svgContent = await ThemeStage.fetchSVG(theme.icon);
                      if (svgContent) {
                        const modifiedSVG = svgContent.replace(
                          /fill="([^"]*)"/g, 
                          (fullMatch, fillValue) => {
                            switch (fillValue) {
                              case 'bgColor':
                                return `fill="${colors.bgColor}"`;
                              case 'sidebarColor':
                                return `fill="${colors.sidebarColor}"`;
                              case 'mainColor':
                                return `fill="${colors.mainColor}"`;
                              case 'highlightColor':
                                return `fill="${colors.highlightColor}"`;
                              case 'textColor':
                                return `fill="${colors.textColor}"`;
                              default:
                                return fullMatch;
                            }
                          }
                        );
                        
                        vnode.dom.outerHTML = modifiedSVG;
                      }
                    }}
                  />
                </div>
                <div class={styles.themeName}>{theme.name}</div>
              </div>
            );
          }

          return (
            <div 
              key={theme.id}
              class={`${styles.themeOption} ${selectedTheme === theme.id ? styles.selected : ''}`}
              onclick={() => {
                onboardingService.updateData({ theme: theme.id });
                themeService.setTheme(theme.id);
                m.redraw();
              }}
            >
              <div class={styles.themePreview}>
                <img src={theme.icon} alt={`${theme.name} theme`} />
              </div>
              <div class={styles.themeName}>{theme.name}</div>
            </div>
          );
        })}
      </div>
    );
  }
};

export default ThemeStage;
