import m from "mithril";
import onboardingService from "../../services/onboardingService";
import styles from "../../onboarding.module.css";

const PrivacyStage = {
  oninit: (vnode) => {
    const data = onboardingService.getData();
    vnode.state.acceptAnalytics = data.acceptAnalytics ?? true;
    vnode.state.acceptCrashReports = data.acceptCrashReports ?? true;
    vnode.state.sharePresence = data.sharePresence ?? true;
    vnode.state.allowDirectMessages = data.allowDirectMessages ?? true;
  },

  view: (vnode) => {
    const handleAnalyticsToggle = (e) => {
      vnode.state.acceptAnalytics = e.target.checked;
      onboardingService.updateData({ acceptAnalytics: e.target.checked });
    };

    const handleCrashReportsToggle = (e) => {
      vnode.state.acceptCrashReports = e.target.checked;
      onboardingService.updateData({ acceptCrashReports: e.target.checked });
    };

    const handlePresenceToggle = (e) => {
      vnode.state.sharePresence = e.target.checked;
      onboardingService.updateData({ sharePresence: e.target.checked });
    };

    const handleDirectMessagesToggle = (e) => {
      vnode.state.allowDirectMessages = e.target.checked;
      onboardingService.updateData({ allowDirectMessages: e.target.checked });
    };

    return (
      <div class={styles.privacyContainer}>
        <div class={styles.privacyIntro}>
          <p>Configure your privacy and security preferences. You can change these settings later.</p>
        </div>

        {/* Analytics */}
        <div class={styles.settingItem}>
          <label class={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={vnode.state.acceptAnalytics}
              onchange={handleAnalyticsToggle}
            />
            <div class={styles.settingContent}>
              <span class={styles.settingTitle}>Analytics</span>
              <span class={styles.settingDescription}>
                Help improve Wyvrn by sharing anonymous usage data
              </span>
            </div>
          </label>
        </div>

        {/* Crash Reports */}
        <div class={styles.settingItem}>
          <label class={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={vnode.state.acceptCrashReports}
              onchange={handleCrashReportsToggle}
            />
            <div class={styles.settingContent}>
              <span class={styles.settingTitle}>Crash Reports</span>
              <span class={styles.settingDescription}>
                Automatically send crash reports to help us fix bugs
              </span>
            </div>
          </label>
        </div>

        {/* Presence Sharing */}
        <div class={styles.settingItem}>
          <label class={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={vnode.state.sharePresence}
              onchange={handlePresenceToggle}
            />
            <div class={styles.settingContent}>
              <span class={styles.settingTitle}>Share Presence</span>
              <span class={styles.settingDescription}>
                Let your contacts see when you're online
              </span>
            </div>
          </label>
        </div>

        {/* Direct Messages */}
        <div class={styles.settingItem}>
          <label class={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={vnode.state.allowDirectMessages}
              onchange={handleDirectMessagesToggle}
            />
            <div class={styles.settingContent}>
              <span class={styles.settingTitle}>Allow Direct Messages</span>
              <span class={styles.settingDescription}>
                Allow anyone to send you direct messages
              </span>
            </div>
          </label>
        </div>
      </div>
    );
  }
};

export default PrivacyStage;
