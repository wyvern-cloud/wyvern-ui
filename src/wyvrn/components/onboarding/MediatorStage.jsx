import m from "mithril";
import onboardingService from "../../services/onboardingService";
import styles from "../../onboarding.module.css";

const MEDIATOR_OPTIONS = [
  {
    id: 'did:web:us-east2.public.mediator.indiciotech.io',
    name: 'Indicio Public Mediator (US East)',
    description: 'Production mediator server in US East region',
    recommended: true
  },
  {
    id: 'did:peer:2.Ez6LSghwSE437wnDE1pt3X6hVDUQzSjsHzinpX3XFvMjRAm7y.Vz6Mkhh1e5CEYYq6JBUcTZ6Cp2ranCWRrv7Yax3Le4N59R6dd.SeyJ0IjoiZG0iLCJzIjp7InVyaSI6Imh0dHBzOi8vbWVkaWF0b3IuYXRhbGFwcmlzbS5pbyIsImEiOlsiZGlkY29tbS92MiJdfX0',
    name: 'Hyperledger Identus Public Demo Mediator',
    description: 'Demo mediator hosted by the Linux Foundation',
    recommended: false
  },
  {
    id: 'did:web:dev.cloudmediator.indiciotech.io',
    name: 'Indicio (Development)',
    description: 'Development mediator server hosted by Indicio',
    recommended: false
  },
  {
    id: 'custom',
    name: 'Custom Mediator',
    description: 'Enter your own mediator DID',
    recommended: false
  }
];

const MediatorStage = {
  initializeData: () => {
    const data = onboardingService.getData();
    // let selectedMediatorId = data.mediator || 'did:web:us-east2.public.mediator.indiciotech.io';
    let selectedMediatorId = data.mediator || 'did:web:dev.cloudmediator.indiciotech.io';
    onboardingService.updateData({ mediator: selectedMediatorId });
  },

  oninit: (vnode) => {
    const data = onboardingService.getData();
    // vnode.state.selectedMediatorId = data.mediator || 'did:web:us-east2.public.mediator.indiciotech.io';
    vnode.state.selectedMediatorId = data.mediator || 'did:web:dev.cloudmediator.indiciotech.io';
    onboardingService.updateData({ mediator: vnode.state.selectedMediatorId });
    vnode.state.customMediatorDid = '';
    vnode.state.showCustomInput = vnode.state.selectedMediatorId === 'custom';
  },

  view: (vnode) => {
    const data = onboardingService.getData();

    const handleMediatorSelect = (mediatorId) => {
      vnode.state.selectedMediatorId = mediatorId;
      vnode.state.showCustomInput = mediatorId === 'custom';

      if (mediatorId !== 'custom') {
        onboardingService.updateData({ mediator: mediatorId });
      } else {
        // Clear mediator if custom is selected but not yet entered
        if (!vnode.state.customMediatorDid) {
          onboardingService.updateData({ mediator: undefined });
        }
      }
      m.redraw();
    };

    const handleCustomMediatorInput = (e) => {
      vnode.state.customMediatorDid = e.target.value;
      if (vnode.state.customMediatorDid.startsWith('did:')) {
        onboardingService.updateData({ mediator: vnode.state.customMediatorDid });
      } else {
        onboardingService.updateData({ mediator: undefined });
      }
    };

    return (
      <div>
        <div>
          {MEDIATOR_OPTIONS.map(mediator => (
            <div 
              key={mediator.id}
              class={`${styles.mediatorOption} ${vnode.state.selectedMediatorId === mediator.id ? styles.selected : ''}`}
              onclick={() => handleMediatorSelect(mediator.id)}
            >
              <div class={styles.mediatorContent}>
                <input 
                  type="radio" 
                  name="mediator"
                  checked={vnode.state.selectedMediatorId === mediator.id}
                  class={styles.mediatorRadio}
                />
                <div class={styles.mediatorDetails}>
                  <div class={styles.mediatorHeader}>
                    <strong class={styles.mediatorName}>{mediator.name}</strong>
                    {mediator.recommended && (
                      <span class={styles.recommendedBadge}>
                        RECOMMENDED
                      </span>
                    )}
                  </div>
                  <div class={styles.mediatorDescription}>
                    {mediator.description}
                  </div>
                  {mediator.id !== 'custom' && (
                    <div class={styles.mediatorDid}>
                      {mediator.id}
                    </div>
                  )}
                  {mediator.id === 'custom' && vnode.state.showCustomInput && (
                    <input
                      type="text"
                      placeholder="did:web:your.mediator.com"
                      value={vnode.state.customMediatorDid}
                      oninput={handleCustomMediatorInput}
                      onclick={(e) => e.stopPropagation()}
                      class={styles.customMediatorInput}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div class={styles.infoBox}>
          <div class={styles.infoTitle}>
            <strong>ℹ️ What is a mediator?</strong>
          </div>
          <div class={styles.infoText}>
            A mediator is a server that routes your encrypted messages from other users to you. 
            Your messages remain encrypted end-to-end, and the mediator cannot read their contents.
            The mediator is responsible for ensuring that messages are delivered securely and privately.
            <p>
                For more technical information on how mediators work, please refer to the documentation at <a href="https://didcomm.org">https://didcomm.org/</a>.
            </p>
          </div>
        </div>
      </div>
    );
  }
};

export default MediatorStage;
