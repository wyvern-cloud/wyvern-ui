import m from "mithril";
import { MessageServiceFactory, MessageServiceType } from "../../services/messageServiceFactory";
import styles from "../../settings-panel.module.css";
import ThemeSelector from "./ThemeSelector";
import themeService, { ThemeMode } from "../../services/themeService";
import w from "../../agent";
import { GLOBAL_PREFIX } from "../../utils/constants";

const SettingsPanel = {
  oninit: (vnode) => {
    vnode.state.isUsingAgentService = MessageServiceFactory.getCurrentType() === MessageServiceType.AGENT;
    
    // Setup listener for service changes
    vnode.state.listener = (e) => {
      vnode.state.isUsingAgentService = e.detail.type === MessageServiceType.AGENT;
      m.redraw();
    };
    
    window.addEventListener('message-service-changed', vnode.state.listener);

    // Store initial theme for comparison
    vnode.state.initialTheme = themeService.getCurrentTheme();
  },
  
  onremove: (vnode) => {
    window.removeEventListener('message-service-changed', vnode.state.listener);
  },
  
  toggleMessageService: (vnode) => {
    const newType = !vnode.state.isUsingAgentService ? 
      MessageServiceType.AGENT : 
      MessageServiceType.EXAMPLE;
    
    MessageServiceFactory.getService(newType);
    
    // Dispatch custom event to notify of service change
    window.dispatchEvent(new CustomEvent('message-service-changed', { 
      detail: { type: newType } 
    }));
  },

  clearData: () => {
    if (confirm("Are you sure you want to clear all local data? This will log you out and reset all settings.")) {
      SettingsPanel._clearData();
      window.location.reload();
    }
  },

  _clearData: () => {
    w.DEVELOPER_clearDataBase();
    localStorage.removeItem(`${GLOBAL_PREFIX}theme`);
  },

  resetOnboarding: () => {
    if (confirm("Are you sure you want to reset the onboarding process? This will clear your profile and preferences.")) {
      localStorage.removeItem(`${GLOBAL_PREFIX}onboarding-complete`);
      localStorage.removeItem(`${GLOBAL_PREFIX}onboarding-stage`);
      localStorage.removeItem(`${GLOBAL_PREFIX}onboarding-data`);
      SettingsPanel._clearData();
      m.route.set("/w/onboard", null, { replace: true });
      window.location.reload();
    }
  },
  
  view: (vnode) => {
    return (
      <div class={styles.settingsPanel}>
        <div class={styles.header}>
          <button class={styles.closeButton} onclick={() => {
            // Go back to previous route
            window.history.back();
          }}>
            <span>×</span>
          </button>
          <h2>Settings</h2>
        </div>
        
        <div class={styles.content}>
          <div class={styles.section}>
            <h3>Appearance</h3>
            <div class={styles.themeSection}>
              <label>Theme</label>
              <div class={styles.themeDescription}>
                Choose how Wyvrn appears to you
              </div>
              <ThemeSelector />
            </div>
          </div>

          <div class={styles.section}>
            <h3>Message Service</h3>
            <div class={styles.setting}>
              <label>Use Agent Service</label>
              <div class={styles.toggle}>
                <input 
                  type="checkbox" 
                  checked={vnode.state.isUsingAgentService}
                  onchange={() => SettingsPanel.toggleMessageService(vnode)}
                />
                <span class={styles.slider}></span>
              </div>
            </div>
            <div class={styles.description}>
              {vnode.state.isUsingAgentService ? 
                "Using real DIDComm agent for messages." : 
                "Using example data for messages."}
            </div>
          </div>
          
          <div class={styles.section}>
            <h3>Advanced</h3>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <button 
                class={styles.dangerButton}
                onclick={SettingsPanel.resetOnboarding}
                style="background: #ffc107; color: #000;"
              >
                Reset Onboarding
              </button>
              <button 
                class={styles.dangerButton}
                onclick={SettingsPanel.clearData}
              >
                Clear Local Data
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default SettingsPanel;
