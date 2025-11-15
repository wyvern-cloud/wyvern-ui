import m from "mithril";
import onboardingService from "../../services/onboardingService";
import styles from "../../onboarding.module.css";
import { GLOBAL_PREFIX } from "../../utils/constants";

const ImportStage = {
  oninit: (vnode) => {
    const data = onboardingService.getData();
    vnode.state.skipImport = data.skipImport ?? true;
    vnode.state.importCompleted = false;
    vnode.state.importError = null;
  },

  handleFileSelect: (vnode, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const backupData = JSON.parse(event.target.result);
        
        // Validate backup data structure
        if (!backupData.timestamp || !backupData.version) {
          throw new Error('Invalid backup file format');
        }

        // Store the imported data for later application
        vnode.state.importedData = backupData;
        vnode.state.importCompleted = true;
        vnode.state.importError = null;
        onboardingService.updateData({ 
          skipImport: false,
          importedData: backupData 
        });
        m.redraw();
      } catch (error) {
        vnode.state.importError = 'Failed to read backup file. Please ensure it\'s a valid Wyvrn backup.';
        vnode.state.importCompleted = false;
        m.redraw();
      }
    };

    reader.onerror = () => {
      vnode.state.importError = 'Failed to read file. Please try again.';
      m.redraw();
    };

    reader.readAsText(file);
  },

  handleSkipImport: (vnode, e) => {
    vnode.state.skipImport = e.target.checked;
    onboardingService.updateData({ skipImport: e.target.checked });
  },

  view: (vnode) => {
    return (
      <div class={styles.importContainer}>
        <div class={styles.importIntro}>
          <p>
            If you have a previous backup of your Wyvrn data, you can restore it here.
            Otherwise, you can skip this step and start fresh.
          </p>
        </div>

        {/* Skip Import Option */}
        <div class={styles.settingItem}>
          <label class={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={vnode.state.skipImport}
              onchange={(e) => ImportStage.handleSkipImport(vnode, e)}
            />
            <div class={styles.settingContent}>
              <span class={styles.settingTitle}>Start Fresh</span>
              <span class={styles.settingDescription}>
                Skip importing and start with a clean slate
              </span>
            </div>
          </label>
        </div>

        {!vnode.state.skipImport && (
          <div class={styles.importSection}>
            <h4>Import Backup</h4>
            <p class={styles.formHint}>
              Select a Wyvrn backup file (JSON format) to restore your data
            </p>
            
            <div class={styles.fileUploadContainer}>
              <input
                type="file"
                accept=".json,application/json"
                onchange={(e) => ImportStage.handleFileSelect(vnode, e)}
                class={styles.fileInput}
                id="backup-file-input"
              />
              <label for="backup-file-input" class={styles.fileInputLabel}>
                {vnode.state.importCompleted ? '✓ Backup Loaded' : 'Choose File'}
              </label>
            </div>

            {vnode.state.importCompleted && (
              <div class={styles.successBox}>
                <strong>Success!</strong> Your backup has been loaded and will be applied
                when you complete onboarding.
                {vnode.state.importedData && (
                  <div class={styles.importDetails}>
                    <small>
                      Backup from: {new Date(vnode.state.importedData.timestamp).toLocaleString()}
                    </small>
                  </div>
                )}
              </div>
            )}

            {vnode.state.importError && (
              <div class={styles.validationError}>
                <div class={styles.validationErrorText}>
                  {vnode.state.importError}
                </div>
              </div>
            )}

            <div class={styles.infoBox}>
              <strong>Note:</strong> Importing a backup will overwrite your current onboarding
              selections with the backed up data.
            </div>
          </div>
        )}
      </div>
    );
  }
};

export default ImportStage;
