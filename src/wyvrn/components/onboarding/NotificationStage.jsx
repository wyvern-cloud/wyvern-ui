import m from "mithril";
import onboardingService from "../../services/onboardingService";
import styles from "../../onboarding.module.css";

const NotificationStage = {
  oninit: (vnode) => {
    const data = onboardingService.getData();
    vnode.state.enableNotifications = data.enableNotifications ?? true;
    vnode.state.notifyMessages = data.notifyMessages ?? true;
    vnode.state.notifyFriendRequests = data.notifyFriendRequests ?? true;
    vnode.state.notifyMentions = data.notifyMentions ?? true;
    vnode.state.playSounds = data.playSounds ?? true;
  },

  view: (vnode) => {
    const handleEnableNotifications = (e) => {
      vnode.state.enableNotifications = e.target.checked;
      onboardingService.updateData({ enableNotifications: e.target.checked });
    };

    const handleNotifyMessages = (e) => {
      vnode.state.notifyMessages = e.target.checked;
      onboardingService.updateData({ notifyMessages: e.target.checked });
    };

    const handleNotifyFriendRequests = (e) => {
      vnode.state.notifyFriendRequests = e.target.checked;
      onboardingService.updateData({ notifyFriendRequests: e.target.checked });
    };

    const handleNotifyMentions = (e) => {
      vnode.state.notifyMentions = e.target.checked;
      onboardingService.updateData({ notifyMentions: e.target.checked });
    };

    const handlePlaySounds = (e) => {
      vnode.state.playSounds = e.target.checked;
      onboardingService.updateData({ playSounds: e.target.checked });
    };

    return (
      <div class={styles.notificationContainer}>
        <div class={styles.notificationIntro}>
          <p>Choose what notifications you'd like to receive. You can customize these later in settings.</p>
        </div>

        {/* Enable Notifications */}
        <div class={styles.settingItem}>
          <label class={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={vnode.state.enableNotifications}
              onchange={handleEnableNotifications}
            />
            <div class={styles.settingContent}>
              <span class={styles.settingTitle}>Enable Notifications</span>
              <span class={styles.settingDescription}>
                Receive desktop notifications from Wyvrn
              </span>
            </div>
          </label>
        </div>

        {vnode.state.enableNotifications && (
          <>
            {/* Message Notifications */}
            <div class={styles.settingItem}>
              <label class={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={vnode.state.notifyMessages}
                  onchange={handleNotifyMessages}
                />
                <div class={styles.settingContent}>
                  <span class={styles.settingTitle}>New Messages</span>
                  <span class={styles.settingDescription}>
                    Notify me when I receive new messages
                  </span>
                </div>
              </label>
            </div>

            {/* Friend Request Notifications */}
            <div class={styles.settingItem}>
              <label class={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={vnode.state.notifyFriendRequests}
                  onchange={handleNotifyFriendRequests}
                />
                <div class={styles.settingContent}>
                  <span class={styles.settingTitle}>Friend Requests</span>
                  <span class={styles.settingDescription}>
                    Notify me when I receive connection requests
                  </span>
                </div>
              </label>
            </div>

            {/* Mention Notifications */}
            <div class={styles.settingItem}>
              <label class={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={vnode.state.notifyMentions}
                  onchange={handleNotifyMentions}
                />
                <div class={styles.settingContent}>
                  <span class={styles.settingTitle}>Mentions</span>
                  <span class={styles.settingDescription}>
                    Notify me when someone mentions me
                  </span>
                </div>
              </label>
            </div>

            {/* Sound Notifications */}
            <div class={styles.settingItem}>
              <label class={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={vnode.state.playSounds}
                  onchange={handlePlaySounds}
                />
                <div class={styles.settingContent}>
                  <span class={styles.settingTitle}>Notification Sounds</span>
                  <span class={styles.settingDescription}>
                    Play a sound when receiving notifications
                  </span>
                </div>
              </label>
            </div>
          </>
        )}
      </div>
    );
  }
};

export default NotificationStage;
