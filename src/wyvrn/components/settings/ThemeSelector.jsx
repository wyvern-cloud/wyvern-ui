import m from "mithril";
import themeService from "../../services/themeService";
import { Theme, ThemeMode } from '../../themes';
import styles from "../../theme-selector.module.css";

const ThemeSelector = {
  svgCache: {},

  fetchSVG: async (url) => {
    // Check cache first
    if (ThemeSelector.svgCache[url]) {
      return ThemeSelector.svgCache[url];
    }

    try {
      const response = await fetch(url);
      const svgText = await response.text();
      ThemeSelector.svgCache[url] = svgText;
      return svgText;
    } catch (error) {
      console.error(`Failed to fetch SVG: ${url}`, error);
      return null;
    }
  },

  view: () => {
    const themes = themeService.getThemes();
    const currentTheme = themeService.getCurrentTheme();
    
    return (
      <div class={styles.themeSelector}>
        {themes.map(theme => {
          // Check if it's a non-system theme
          const isNonSystemTheme = theme.id !== ThemeMode.SYSTEM;

          // Extract colors for SVG (only for non-system themes)
          const colors = isNonSystemTheme ? {
            bgColor: theme.variables['--server-list-bg-color'],
            sidebarColor: theme.variables['--darker-bg-color'],
            mainColor: theme.variables['--dark-bg-color'],
            highlightColor: '#7289da', // Accent color
            textColor: theme.variables['--chatlog-color']
          } : {};

          // For non-system themes, fetch and modify SVG
          if (isNonSystemTheme) {
            return (
              <div 
                key={theme.id}
                class={`${styles.themeOption} ${currentTheme === theme.id ? styles.selected : ''}`}
                onclick={() => {
                  themeService.setTheme(theme.id);
                  m.redraw();
                }}
              >
                <div class={styles.themePreview}>
                  {/* Use oncreate to fetch SVG */}
                  <svg 
                    width="192" 
                    height="108"
                    oncreate={async (vnode) => {
                      const svgContent = await ThemeSelector.fetchSVG(theme.icon);
                      if (svgContent) {
                        // Simplified SVG color replacement
                        const modifiedSVG = svgContent.replace(
                          /fill="([^"]*)"/g, 
                          (fullMatch, fillValue) => {
                            // Map based on fill value
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

          // Keep system theme as original
          return (
            <div 
              key={theme.id}
              class={`${styles.themeOption} ${currentTheme === theme.id ? styles.selected : ''}`}
              onclick={() => {
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

export default ThemeSelector;
