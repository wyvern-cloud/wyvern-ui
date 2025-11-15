/**
 * Onboarding Wizard
 * 
 * Multi-stage onboarding flow for new users. Features:
 * - Extensible stage-based architecture
 * - Validation support per stage
 * - Persistent state (localStorage)
 * - Forward/backward navigation
 * - Progress indicator
 * 
 * To add a new stage:
 * 1. Update OnboardingStageData interface in services/onboardingService.ts
 * 2. Add stage definition in onboardingService.initializeStages()
 * 3. Create stage component in components/onboarding/YourStage.jsx
 * 4. Import and add to STAGE_COMPONENTS below
 */

import m from "mithril";
import styles from "./onboarding.module.css";
import onboardingService from "./services/onboardingService";
import TermsStage from "./components/onboarding/TermsStage";
import ThemeStage from "./components/onboarding/ThemeStage";
import MediatorStage from "./components/onboarding/MediatorStage";
import ProfileStage from "./components/onboarding/ProfileStage";
import PrivacyStage from "./components/onboarding/PrivacyStage";
import NotificationStage from "./components/onboarding/NotificationStage";
import BackupStage from "./components/onboarding/BackupStage";
import ImportStage from "./components/onboarding/ImportStage";

// Map stage IDs to their respective components
const STAGE_COMPONENTS = {
  terms: TermsStage,
  theme: ThemeStage,
  mediator: MediatorStage,
  profile: ProfileStage,
  privacy: PrivacyStage,
  notifications: NotificationStage,
  backup: BackupStage,
  import: ImportStage
};

const OnboardingWizard = {
  oninit: (vnode) => {
    vnode.state.isCompleting = false;
    vnode.state.error = null;
  },

  view: (vnode) => {
    const currentStage = onboardingService.getCurrentStage();
    const currentStageIndex = onboardingService.getCurrentStageIndex();
    const totalStages = onboardingService.getTotalStages();
    const isLastStage = currentStageIndex === totalStages - 1;

    const StageComponent = STAGE_COMPONENTS[currentStage.id];
      StageComponent.initializeData?.();
    const canGoNext = onboardingService.canGoNext();
    const canGoPrevious = onboardingService.canGoPrevious();

    const handleNext = async () => {
      if (isLastStage && canGoNext) {
        // Complete onboarding
        vnode.state.isCompleting = true;
        try {
          await onboardingService.complete();
          m.route.set("/w", null, { replace: true });
        } catch (error) {
          vnode.state.error = error.message;
          vnode.state.isCompleting = false;
          m.redraw();
        }
      } else if (canGoNext) {
        onboardingService.goNext();
        vnode.state.error = null;
        m.redraw();
      } else {
        vnode.state.error = onboardingService.getValidationMessage();
        m.redraw();
      }
    };

    const handlePrevious = () => {
      onboardingService.goPrevious();
      vnode.state.error = null;
      m.redraw();
    };

    const handleStageClick = (index) => {
      onboardingService.goToStage(index);
      vnode.state.error = null;
      m.redraw();
    };

    return (
      <div class={styles.wizardContainer}>
        {/* Header */}
        <div class={styles.header}>
          <div class={styles.headerContent}>
            <h1 class={styles.headerTitle}>Welcome to Wyvrn</h1>
            <p class={styles.headerSubtitle}>
              Let's get you set up in just a few steps
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div class={styles.progressContainer}>
          <div class={styles.progressContent}>
            <div class={styles.progressSteps}>
              {(() => {
                // Calculate which stages to show (max 3)
                let visibleStages = [];
                const allStages = onboardingService.getStages();
                
                if (totalStages <= 3) {
                  // Show all stages if 3 or fewer
                  visibleStages = allStages.map((stage, index) => ({ stage, index }));
                } else if (currentStageIndex === 0) {
                  // First stage: show current, next, next+1
                  visibleStages = [
                    { stage: allStages[0], index: 0 },
                    { stage: allStages[1], index: 1 },
                    { stage: allStages[2], index: 2 }
                  ];
                } else if (currentStageIndex === totalStages - 1) {
                  // Last stage: show previous+1, previous, current
                  visibleStages = [
                    { stage: allStages[currentStageIndex - 2], index: currentStageIndex - 2 },
                    { stage: allStages[currentStageIndex - 1], index: currentStageIndex - 1 },
                    { stage: allStages[currentStageIndex], index: currentStageIndex }
                  ];
                } else {
                  // Middle stages: show previous, current, next
                  visibleStages = [
                    { stage: allStages[currentStageIndex - 1], index: currentStageIndex - 1 },
                    { stage: allStages[currentStageIndex], index: currentStageIndex },
                    { stage: allStages[currentStageIndex + 1], index: currentStageIndex + 1 }
                  ];
                }

                return visibleStages.map(({ stage, index }, arrayIndex) => {
                  const isActive = index === currentStageIndex;
                  const isCompleted = index < currentStageIndex;
                  const isClickable = index < currentStageIndex;

                  return (
                    <div 
                      key={stage.id}
                      class={styles.progressStep}
                    >
                      <div 
                        class={`${styles.stepButton} ${isClickable ? styles.clickable : ''}`}
                        onclick={isClickable ? () => handleStageClick(index) : null}
                      >
                        <div class={`${styles.stepCircle} ${isActive ? styles.active : isCompleted ? styles.completed : styles.inactive}`}>
                          {isCompleted ? '✓' : index + 1}
                        </div>
                        <div class={styles.stepLabel}>
                          <div class={`${styles.stepLabelText} ${isActive ? styles.active : styles.inactive}`}>
                            {stage.title}
                          </div>
                        </div>
                      </div>
                      {arrayIndex < visibleStages.length - 1 && (
                        <div class={`${styles.progressConnector} ${isCompleted ? styles.completed : styles.incomplete}`} />
                      )}
                    </div>
                  );
                });
              })()}
            </div>
            <div class={styles.progressInfo}>
              Step {currentStageIndex + 1} of {totalStages}
            </div>
          </div>
        </div>

        {/* Stage Content */}
        <div class={styles.stageContent}>
          <div class={styles.stageContentInner}>
            <div class={styles.stageHeader}>
              <h2 class={styles.stageTitle}>{currentStage.title}</h2>
              <p class={styles.stageDescription}>
                {currentStage.description}
              </p>
            </div>

            {StageComponent && <StageComponent />}

            {vnode.state.error && (
              <div class={styles.errorMessage}>
                <div class={styles.errorText}>
                  {vnode.state.error}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div class={styles.footer}>
          <div class={styles.footerContent}>
            <button
              class={`${styles.navButton} ${styles.previousButton}`}
              onclick={handlePrevious}
              disabled={!canGoPrevious}
            >
              Previous
            </button>
            <button
              class={`${styles.navButton} ${styles.clearButton}`}
              onclick={() => {
                onboardingService.clearData();
                window.location.reload();
              }}
            >
              Clear Data
            </button>

            <div class={styles.stepCounter}>
              Step {currentStageIndex + 1} of {totalStages}
            </div>

            <button
              class={`${styles.navButton} ${styles.nextButton} ${canGoNext ? styles.enabled : styles.disabled}`}
              onclick={handleNext}
              disabled={!canGoNext || vnode.state.isCompleting}
            >
              {vnode.state.isCompleting ? 'Completing...' : isLastStage ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default OnboardingWizard;
