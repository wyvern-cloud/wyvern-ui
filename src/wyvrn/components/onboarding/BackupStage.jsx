import m from "mithril";
import onboardingService from "../../services/onboardingService";
import styles from "../../onboarding.module.css";
import { GLOBAL_PREFIX } from "../../utils/constants";

const BackupStage = {
  oninit: (vnode) => {
    const data = onboardingService.getData();
    vnode.state.autoBackup = data.autoBackup ?? false;
    vnode.state.backupFrequency = data.backupFrequency || 'weekly';
    vnode.state.backupCompleted = false;
  },

  createBackup: (vnode) => {
    try {
      // Gather all relevant localStorage data
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        theme: localStorage.getItem(`${GLOBAL_PREFIX}theme`),
        profile: localStorage.getItem(`${GLOBAL_PREFIX}profile`),
        mediator: localStorage.getItem(`${GLOBAL_PREFIX}mediator`),
        onboardingData: localStorage.getItem(`${GLOBAL_PREFIX}onboarding-data`),
        messageService: localStorage.getItem(`${GLOBAL_PREFIX}message-service`),
        // Add other relevant data here
      };

      // Convert to JSON and create download
      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `wyvrn-backup-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      vnode.state.backupCompleted = true;
      m.redraw();
    } catch (error) {
      console.error('Failed to create backup:', error);
      alert('Failed to create backup. Please try again.');
    }
  },

  view: (vnode) => {
    const handleAutoBackupToggle = (e) => {
      vnode.state.autoBackup = e.target.checked;
      onboardingService.updateData({ autoBackup: e.target.checked });
    };

    const handleFrequencyChange = (e) => {
      vnode.state.backupFrequency = e.target.value;
      onboardingService.updateData({ backupFrequency: e.target.value });
    };

    return (
      <div class={styles.backupContainer}>
        <div class={styles.backupIntro}>
          <p>
            Keep your data safe by creating backups. You can download a backup of your
            settings and profile at any time.
          </p>
        </div>

        {/* Manual Backup */}
        <div class={styles.backupSection}>
          <h4>Create Backup Now</h4>
          <p class={styles.formHint}>
            Download your current settings and profile data as a JSON file
          </p>
          <button
            class={styles.backupButton}
            onclick={() => BackupStage.createBackup(vnode)}
          >
            {vnode.state.backupCompleted ? '✓ Backup Created' : 'Download Backup'}
          </button>
        </div>

        {/* Auto Backup Settings */}
        <div class={styles.settingItem}>
          <label class={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={vnode.state.autoBackup}
              onchange={handleAutoBackupToggle}
            />
            <div class={styles.settingContent}>
              <span class={styles.settingTitle}>Automatic Backups</span>
              <span class={styles.settingDescription}>
                Automatically remind me to backup my data
              </span>
            </div>
          </label>
        </div>

        {vnode.state.autoBackup && (
          <div class={styles.formGroup}>
            <label class={styles.formLabel}>Backup Frequency</label>
            <select
              class={styles.formInput}
              value={vnode.state.backupFrequency}
              onchange={handleFrequencyChange}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        )}

        <div class={styles.infoBox}>
          <strong>Note:</strong> Backups are stored locally on your device. Make sure to save
          them in a secure location. You can restore from a backup later in the settings.
        </div>
      </div>
    );
  }
};

export default BackupStage;
