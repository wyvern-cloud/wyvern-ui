import m from "mithril";
import onboardingService from "../../services/onboardingService";
import styles from "../../onboarding.module.css";

const TermsStage = {
  oninit: (vnode) => {
    const data = onboardingService.getData();
    vnode.state.acceptedTerms = data.acceptedTerms ?? false;
    vnode.state.acceptedPrivacy = data.acceptedPrivacy ?? false;
  },

  view: (vnode) => {
    const handleTermsToggle = (e) => {
      vnode.state.acceptedTerms = e.target.checked;
      onboardingService.updateData({ acceptedTerms: e.target.checked });
    };

    const handlePrivacyToggle = (e) => {
      vnode.state.acceptedPrivacy = e.target.checked;
      onboardingService.updateData({ acceptedPrivacy: e.target.checked });
    };

    return (
      <div class={styles.termsContainer}>
        <div class={styles.termsIntro}>
          <p>
            Before you can use Wyvrn, please review and accept our terms of service
            and privacy policy.
          </p>
        </div>

        {/* Terms of Service Document */}
        <div class={styles.termsDocument}>
          <h3>Terms of Service</h3>
          <div class={styles.termsScroll}>
            <h4>1. Acceptance of Terms</h4>
            <p>
              By accessing and using Wyvrn ("the Service"), you accept and agree to be bound
              by the terms and provisions of this agreement.
            </p>

            <h4>2. Use License</h4>
            <p>
              Wyvrn is provided as open-source software. Permission is granted to use, copy,
              modify, and distribute the software subject to the conditions of its license.
            </p>

            <h4>3. Privacy and Data</h4>
            <p>
              Wyvrn uses decentralized identity and messaging protocols. Your data is stored
              locally on your device and you maintain full control over it.
            </p>

            <h4>4. User Responsibilities</h4>
            <p>
              You are responsible for maintaining the security of your identity and keys.
              Loss of your private keys may result in permanent loss of access to your data.
            </p>

            <h4>5. Disclaimer</h4>
            <p>
              The Service is provided "as is" without warranty of any kind. We do not guarantee
              that the Service will be error-free or uninterrupted.
            </p>

            <h4>6. Changes to Terms</h4>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the
              Service constitutes acceptance of modified terms.
            </p>
          </div>
        </div>

        {/* Privacy Policy Document */}
        <div class={styles.termsDocument}>
          <h3>Privacy Policy</h3>
          <div class={styles.termsScroll}>
            <h4>Data Collection</h4>
            <p>
              Wyvrn is designed with privacy in mind. We do not collect or store your personal
              data on centralized servers. All data is stored locally on your device.
            </p>

            <h4>Analytics</h4>
            <p>
              If enabled, we collect anonymous usage statistics to improve the Service. This
              data does not identify individual users and can be disabled at any time.
            </p>

            <h4>Third-Party Services</h4>
            <p>
              Wyvrn may connect to mediator servers for message routing. These connections are
              made using encrypted DIDComm protocols.
            </p>

            <h4>Your Rights</h4>
            <p>
              You have complete control over your data. You can export, backup, or delete your
              data at any time through the settings panel.
            </p>
          </div>
        </div>

        {/* Acceptance Checkboxes */}
        <div class={styles.acceptanceSection}>
          <div class={styles.settingItem}>
            <label class={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={vnode.state.acceptedTerms}
                onchange={handleTermsToggle}
              />
              <div class={styles.settingContent}>
                <span class={styles.settingTitle}>
                  I accept the Terms of Service <span class={styles.required}>*</span>
                </span>
              </div>
            </label>
          </div>

          <div class={styles.settingItem}>
            <label class={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={vnode.state.acceptedPrivacy}
                onchange={handlePrivacyToggle}
              />
              <div class={styles.settingContent}>
                <span class={styles.settingTitle}>
                  I accept the Privacy Policy <span class={styles.required}>*</span>
                </span>
              </div>
            </label>
          </div>
        </div>

        {!onboardingService.canGoNext() && (vnode.state.acceptedTerms || vnode.state.acceptedPrivacy) && (
          <div class={styles.validationError}>
            <div class={styles.validationErrorText}>
              {onboardingService.getValidationMessage()}
            </div>
          </div>
        )}
      </div>
    );
  }
};

export default TermsStage;
