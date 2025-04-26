import m from "mithril";
import { MessageServiceFactory, MessageServiceType } from "../../services/messageServiceFactory";
import styles from "../../settings-panel.module.css";
import ThemeSelector from "./ThemeSelector";
import themeService, { ThemeMode } from "../../services/themeService";
import w from "../../agent";

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
      w.DEVELOPER_clearDataBase();
      localStorage.removeItem('wyvrn-theme');
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
            <button 
              class={styles.dangerButton}
              onclick={SettingsPanel.clearData}
            >
              Clear Local Data
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default SettingsPanel;
