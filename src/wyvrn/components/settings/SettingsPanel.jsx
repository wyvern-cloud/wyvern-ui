import m from "mithril";
import { MessageServiceFactory, MessageServiceType } from "../../services/messageServiceFactory";
import styles from "../../settings-panel.module.css";
import ThemeSelector from "./ThemeSelector";
import themeService, { ThemeMode } from "../../services/themeService";
import w from "../../agent";
import { GLOBAL_PREFIX } from "../../utils/constants";
import ImageCropper from "../ImageCropper";

const SettingsPanel = {
  oninit: (vnode) => {
    vnode.state.isUsingAgentService = MessageServiceFactory.getCurrentType() === MessageServiceType.AGENT;
    vnode.state.activeTab = 'appearance';
    
    // Load settings from localStorage
    vnode.state.profile = JSON.parse(localStorage.getItem(`${GLOBAL_PREFIX}profile`) || '{}');
    vnode.state.privacy = JSON.parse(localStorage.getItem(`${GLOBAL_PREFIX}privacy`) || '{}');
    vnode.state.notifications = JSON.parse(localStorage.getItem(`${GLOBAL_PREFIX}notifications`) || '{}');
    vnode.state.backup = JSON.parse(localStorage.getItem(`${GLOBAL_PREFIX}backup`) || '{}');
    
    // Profile editing states
    vnode.state.editingProfile = false;
    vnode.state.showImageCropper = false;
    vnode.state.uploadedImageData = null;
    vnode.state.cropperRef = null;
    
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
  
  saveProfile: (vnode) => {
    localStorage.setItem(`${GLOBAL_PREFIX}profile`, JSON.stringify(vnode.state.profile));
    vnode.state.editingProfile = false;
  },

  savePrivacy: (vnode) => {
    localStorage.setItem(`${GLOBAL_PREFIX}privacy`, JSON.stringify(vnode.state.privacy));
  },

  saveNotifications: (vnode) => {
    localStorage.setItem(`${GLOBAL_PREFIX}notifications`, JSON.stringify(vnode.state.notifications));
  },

  saveBackup: (vnode) => {
    localStorage.setItem(`${GLOBAL_PREFIX}backup`, JSON.stringify(vnode.state.backup));
  },

  createBackup: () => {
    try {
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        theme: localStorage.getItem(`${GLOBAL_PREFIX}theme`),
        profile: localStorage.getItem(`${GLOBAL_PREFIX}profile`),
        mediator: localStorage.getItem(`${GLOBAL_PREFIX}mediator`),
        privacy: localStorage.getItem(`${GLOBAL_PREFIX}privacy`),
        notifications: localStorage.getItem(`${GLOBAL_PREFIX}notifications`),
        backup: localStorage.getItem(`${GLOBAL_PREFIX}backup`),
        messageService: localStorage.getItem(`${GLOBAL_PREFIX}message-service`),
      };

      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `wyvrn-backup-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert('Backup created successfully!');
    } catch (error) {
      console.error('Failed to create backup:', error);
      alert('Failed to create backup. Please try again.');
    }
  },

  handleProfileImageUpload: (vnode, e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      vnode.state.uploadedImageData = event.target.result;
      vnode.state.showImageCropper = true;
      m.redraw();
    };
    reader.readAsDataURL(file);
  },

  applyImageCrop: (vnode) => {
    if (vnode.state.cropperRef) {
      const croppedImage = vnode.state.cropperRef.getCroppedImage(vnode.state.cropperRef);
      if (croppedImage) {
        vnode.state.profile.profilePicture = croppedImage;
        vnode.state.showImageCropper = false;
        SettingsPanel.saveProfile(vnode);
        m.redraw();
      }
    }
  },

  generateDicebearAvatar: async (vnode) => {
    const displayName = vnode.state.profile.displayName || 'default';
    const dicebearUrl = `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(displayName)}`;
    
    try {
      const response = await fetch(dicebearUrl);
      const svgText = await response.text();
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml' });
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        vnode.state.profile.profilePicture = dataUrl;
        SettingsPanel.saveProfile(vnode);
        m.redraw();
      };
      
      reader.readAsDataURL(svgBlob);
    } catch (error) {
      console.error('Failed to generate Dicebear avatar:', error);
      alert('Failed to generate avatar. Please try again.');
    }
  },

  view: (vnode) => {
    const tabs = [
      { id: 'appearance', label: 'Appearance', icon: '🎨' },
      { id: 'profile', label: 'Profile', icon: '👤' },
      { id: 'privacy', label: 'Privacy', icon: '🔒' },
      { id: 'notifications', label: 'Notifications', icon: '🔔' },
      { id: 'backup', label: 'Backup & Data', icon: '💾' },
      { id: 'advanced', label: 'Advanced', icon: '⚙️' }
    ];

    return (
      <div class={styles.settingsPanel}>
        <div class={styles.header}>
          <button class={styles.closeButton} onclick={() => window.history.back()}>
            <span>×</span>
          </button>
          <h2>Settings</h2>
        </div>

        <div class={styles.settingsBody}>
          {/* Sidebar Navigation */}
          <div class={styles.sidebar}>
            <nav class={styles.sidebarNav}>
              {tabs.map(tab => (
                <button
                  class={`${styles.sidebarItem} ${vnode.state.activeTab === tab.id ? styles.activeSidebarItem : ''}`}
                  onclick={() => { vnode.state.activeTab = tab.id; }}
                >
                  <span class={styles.sidebarIcon}>{tab.icon}</span>
                  <span class={styles.sidebarLabel}>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
          
          <div class={styles.content}>
          {/* Appearance Tab */}
          {vnode.state.activeTab === 'appearance' && (
            <div class={styles.tabContent}>
              <div class={styles.section}>
                <h3>Theme</h3>
                <div class={styles.themeSection}>
                  <label>Choose your theme</label>
                  <div class={styles.themeDescription}>
                    Select how Wyvrn appears to you
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
            </div>
          )}

          {/* Profile Tab */}
          {vnode.state.activeTab === 'profile' && (
            <div class={styles.tabContent}>
              <div class={styles.section}>
                <h3>Profile Information</h3>
                
                {/* Profile Picture */}
                <div class={styles.profilePictureSection}>
                  <label>Profile Picture</label>
                  {vnode.state.profile.profilePicture && !vnode.state.showImageCropper && (
                    <div class={styles.profilePicturePreview}>
                      <img src={vnode.state.profile.profilePicture} alt="Profile" />
                    </div>
                  )}
                  
                  {vnode.state.showImageCropper && vnode.state.uploadedImageData && (
                    <div>
                      <ImageCropper 
                        imageData={vnode.state.uploadedImageData}
                        oncreate={(cropperVnode) => { vnode.state.cropperRef = cropperVnode.state; }}
                      />
                      <div class={styles.cropperActions}>
                        <button 
                          class={styles.secondaryButton}
                          onclick={() => { vnode.state.showImageCropper = false; }}
                        >
                          Cancel
                        </button>
                        <button 
                          class={styles.primaryButton}
                          onclick={() => SettingsPanel.applyImageCrop(vnode)}
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {!vnode.state.showImageCropper && (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        onchange={(e) => SettingsPanel.handleProfileImageUpload(vnode, e)}
                        class={styles.fileInput}
                        id="profile-image-input"
                      />
                      <label for="profile-image-input" class={styles.fileInputLabel}>
                        {vnode.state.profile.profilePicture ? 'Change Image' : 'Upload Image'}
                      </label>
                      <button
                        class={styles.secondaryButton}
                        onclick={() => SettingsPanel.generateDicebearAvatar(vnode)}
                        style="margin-left: 8px;"
                      >
                        Generate Avatar
                      </button>
                      <div class={styles.formHint}>
                        Upload a custom image or generate an avatar based on your display name
                      </div>
                    </>
                  )}
                </div>

                {/* Display Name */}
                <div class={styles.formGroup}>
                  <label>Display Name</label>
                  <input
                    type="text"
                    value={vnode.state.profile.displayName || ''}
                    oninput={(e) => { 
                      vnode.state.profile.displayName = e.target.value; 
                    }}
                    onblur={() => SettingsPanel.saveProfile(vnode)}
                    class={styles.input}
                  />
                </div>

                {/* Description */}
                <div class={styles.formGroup}>
                  <label>Description</label>
                  <textarea
                    value={vnode.state.profile.description || ''}
                    oninput={(e) => { 
                      vnode.state.profile.description = e.target.value; 
                    }}
                    onblur={() => SettingsPanel.saveProfile(vnode)}
                    rows="3"
                    class={styles.textarea}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {vnode.state.activeTab === 'privacy' && (
            <div class={styles.tabContent}>
              <div class={styles.section}>
                <h3>Privacy & Security</h3>
                
                <div class={styles.settingItem}>
                  <label class={styles.settingLabel}>
                    <div>
                      <div class={styles.settingTitle}>Analytics</div>
                      <div class={styles.settingDescription}>Help improve Wyvrn with anonymous usage data</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={vnode.state.privacy.acceptAnalytics ?? true}
                      onchange={(e) => {
                        vnode.state.privacy.acceptAnalytics = e.target.checked;
                        SettingsPanel.savePrivacy(vnode);
                      }}
                    />
                  </label>
                </div>

                <div class={styles.settingItem}>
                  <label class={styles.settingLabel}>
                    <div>
                      <div class={styles.settingTitle}>Crash Reports</div>
                      <div class={styles.settingDescription}>Automatically send crash reports</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={vnode.state.privacy.acceptCrashReports ?? true}
                      onchange={(e) => {
                        vnode.state.privacy.acceptCrashReports = e.target.checked;
                        SettingsPanel.savePrivacy(vnode);
                      }}
                    />
                  </label>
                </div>

                <div class={styles.settingItem}>
                  <label class={styles.settingLabel}>
                    <div>
                      <div class={styles.settingTitle}>Share Presence</div>
                      <div class={styles.settingDescription}>Let contacts see when you're online</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={vnode.state.privacy.sharePresence ?? true}
                      onchange={(e) => {
                        vnode.state.privacy.sharePresence = e.target.checked;
                        SettingsPanel.savePrivacy(vnode);
                      }}
                    />
                  </label>
                </div>

                <div class={styles.settingItem}>
                  <label class={styles.settingLabel}>
                    <div>
                      <div class={styles.settingTitle}>Allow Direct Messages</div>
                      <div class={styles.settingDescription}>Allow anyone to send you DMs</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={vnode.state.privacy.allowDirectMessages ?? true}
                      onchange={(e) => {
                        vnode.state.privacy.allowDirectMessages = e.target.checked;
                        SettingsPanel.savePrivacy(vnode);
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {vnode.state.activeTab === 'notifications' && (
            <div class={styles.tabContent}>
              <div class={styles.section}>
                <h3>Notification Preferences</h3>
                
                <div class={styles.settingItem}>
                  <label class={styles.settingLabel}>
                    <div>
                      <div class={styles.settingTitle}>Enable Notifications</div>
                      <div class={styles.settingDescription}>Receive desktop notifications</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={vnode.state.notifications.enableNotifications ?? true}
                      onchange={(e) => {
                        vnode.state.notifications.enableNotifications = e.target.checked;
                        SettingsPanel.saveNotifications(vnode);
                      }}
                    />
                  </label>
                </div>

                {(vnode.state.notifications.enableNotifications ?? true) && (
                  <>
                    <div class={styles.settingItem}>
                      <label class={styles.settingLabel}>
                        <div>
                          <div class={styles.settingTitle}>New Messages</div>
                          <div class={styles.settingDescription}>Notify on new messages</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={vnode.state.notifications.notifyMessages ?? true}
                          onchange={(e) => {
                            vnode.state.notifications.notifyMessages = e.target.checked;
                            SettingsPanel.saveNotifications(vnode);
                          }}
                        />
                      </label>
                    </div>

                    <div class={styles.settingItem}>
                      <label class={styles.settingLabel}>
                        <div>
                          <div class={styles.settingTitle}>Friend Requests</div>
                          <div class={styles.settingDescription}>Notify on connection requests</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={vnode.state.notifications.notifyFriendRequests ?? true}
                          onchange={(e) => {
                            vnode.state.notifications.notifyFriendRequests = e.target.checked;
                            SettingsPanel.saveNotifications(vnode);
                          }}
                        />
                      </label>
                    </div>

                    <div class={styles.settingItem}>
                      <label class={styles.settingLabel}>
                        <div>
                          <div class={styles.settingTitle}>Mentions</div>
                          <div class={styles.settingDescription}>Notify when mentioned</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={vnode.state.notifications.notifyMentions ?? true}
                          onchange={(e) => {
                            vnode.state.notifications.notifyMentions = e.target.checked;
                            SettingsPanel.saveNotifications(vnode);
                          }}
                        />
                      </label>
                    </div>

                    <div class={styles.settingItem}>
                      <label class={styles.settingLabel}>
                        <div>
                          <div class={styles.settingTitle}>Notification Sounds</div>
                          <div class={styles.settingDescription}>Play sound with notifications</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={vnode.state.notifications.playSounds ?? true}
                          onchange={(e) => {
                            vnode.state.notifications.playSounds = e.target.checked;
                            SettingsPanel.saveNotifications(vnode);
                          }}
                        />
                      </label>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Backup & Data Tab */}
          {vnode.state.activeTab === 'backup' && (
            <div class={styles.tabContent}>
              <div class={styles.section}>
                <h3>Backup</h3>
                
                <div class={styles.backupActions}>
                  <button
                    class={styles.primaryButton}
                    onclick={() => SettingsPanel.createBackup()}
                  >
                    Download Backup
                  </button>
                  <p class={styles.description}>
                    Create a backup of your settings and profile data
                  </p>
                </div>

                <div class={styles.settingItem}>
                  <label class={styles.settingLabel}>
                    <div>
                      <div class={styles.settingTitle}>Automatic Backups</div>
                      <div class={styles.settingDescription}>Get reminded to backup your data</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={vnode.state.backup.autoBackup ?? false}
                      onchange={(e) => {
                        vnode.state.backup.autoBackup = e.target.checked;
                        SettingsPanel.saveBackup(vnode);
                      }}
                    />
                  </label>
                </div>

                {vnode.state.backup.autoBackup && (
                  <div class={styles.formGroup}>
                    <label>Backup Frequency</label>
                    <select
                      value={vnode.state.backup.backupFrequency || 'weekly'}
                      onchange={(e) => {
                        vnode.state.backup.backupFrequency = e.target.value;
                        SettingsPanel.saveBackup(vnode);
                      }}
                      class={styles.select}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {vnode.state.activeTab === 'advanced' && (
            <div class={styles.tabContent}>
              <div class={styles.section}>
                <h3>Advanced</h3>
                <div class={styles.advancedActions}>
                  <button 
                    class={styles.warningButton}
                    onclick={SettingsPanel.resetOnboarding}
                  >
                    Reset Onboarding
                  </button>
                  <p class={styles.description}>
                    Clear onboarding data and restart the setup process
                  </p>
                  
                  <button 
                    class={styles.dangerButton}
                    onclick={SettingsPanel.clearData}
                  >
                    Clear All Local Data
                  </button>
                  <p class={styles.description}>
                    Remove all data stored locally. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    );
  }
};

export default SettingsPanel;
