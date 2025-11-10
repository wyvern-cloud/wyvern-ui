import { GLOBAL_PREFIX } from '../utils/constants';
import { MessageServiceFactory, MessageServiceType } from './messageServiceFactory';

export interface OnboardingStageData {
  // Theme stage
  theme?: string;
  
  // Mediator stage
  mediator?: string;
  
  // Profile stage
  displayName?: string;
  username?: string;
  profilePicture?: string;
  description?: string;
  
  // Privacy stage
  acceptAnalytics?: boolean;
  acceptCrashReports?: boolean;
  sharePresence?: boolean;
  allowDirectMessages?: boolean;
  
  // Notification stage
  enableNotifications?: boolean;
  notifyMessages?: boolean;
  notifyFriendRequests?: boolean;
  notifyMentions?: boolean;
  playSounds?: boolean;
  
  // Backup stage
  autoBackup?: boolean;
  backupFrequency?: string;
  
  // Import stage
  skipImport?: boolean;
  importedData?: any;
  
  // Terms stage
  acceptedTerms?: boolean;
  acceptedPrivacy?: boolean;
}

export interface OnboardingStage {
  id: string;
  title: string;
  description: string;
  validate: (data: OnboardingStageData) => boolean;
  getValidationMessage?: (data: OnboardingStageData) => string;
}

class OnboardingService {
  private static instance: OnboardingService;
  private stages: OnboardingStage[] = [];
  private currentStageIndex: number = 0;
  private data: OnboardingStageData = {};

  private constructor() {
    this.loadFromStorage();
    this.initializeStages();
  }

  public static getInstance(): OnboardingService {
    if (!OnboardingService.instance) {
      OnboardingService.instance = new OnboardingService();
    }
    return OnboardingService.instance;
  }

  private initializeStages() {
    this.stages = [
      {
        id: 'terms',
        title: 'Terms of Service',
        description: 'Review and accept our terms',
        validate: (data) => !!data.acceptedTerms && !!data.acceptedPrivacy,
        getValidationMessage: () => 'You must accept both the Terms of Service and Privacy Policy to continue'
      },
      {
        id: 'import',
        title: 'Import Data',
        description: 'Restore from a previous backup',
        validate: () => true, // Import is optional
        getValidationMessage: () => ''
      },
      {
        id: 'theme',
        title: 'Choose Your Theme',
        description: 'Select how you want Wyvrn to look',
        validate: (data) => !!data.theme,
        getValidationMessage: () => 'Please select a theme to continue'
      },
      {
        id: 'mediator',
        title: 'Select a Mediator',
        description: 'Choose a mediator server to route your messages',
        validate: (data) => !!data.mediator && data.mediator.startsWith('did:'),
        getValidationMessage: () => 'Please select a valid mediator'
      },
      {
        id: 'profile',
        title: 'Set Up Your Profile',
        description: 'Tell others a bit about yourself',
        validate: (data) => {
          return !!data.displayName && data.displayName.trim().length >= 2;
        },
        getValidationMessage: (data) => {
          if (!data.displayName) return 'Display name is required';
          if (data.displayName.trim().length < 2) return 'Display name must be at least 2 characters';
          return 'Please complete your profile';
        }
      },
      {
        id: 'privacy',
        title: 'Privacy & Security',
        description: 'Configure your privacy preferences',
        validate: () => true, // All privacy settings are optional
        getValidationMessage: () => ''
      },
      {
        id: 'notifications',
        title: 'Notifications',
        description: 'Choose how you want to be notified',
        validate: () => true, // All notification settings are optional
        getValidationMessage: () => ''
      },
      {
        id: 'backup',
        title: 'Backup Your Data',
        description: 'Keep your data safe with backups',
        validate: () => true, // Backup is optional
        getValidationMessage: () => ''
      }
      // To add more stages:
      // 1. Add the stage definition here with id, title, description, validate, and getValidationMessage
      // 2. Add any new data fields to the OnboardingStageData interface at the top of this file
      // 3. Create a new stage component in components/onboarding/YourStage.jsx
      // 4. Import and add your component to STAGE_COMPONENTS in onboarding.tsx
    ];
  }

  public getStages(): OnboardingStage[] {
    return this.stages;
  }

  public getCurrentStage(): OnboardingStage {
    return this.stages[this.currentStageIndex];
  }

  public getCurrentStageIndex(): number {
    return this.currentStageIndex;
  }

  public getTotalStages(): number {
    return this.stages.length;
  }

  public getData(): OnboardingStageData {
    return { ...this.data };
  }

  public updateData(updates: Partial<OnboardingStageData>) {
    this.data = { ...this.data, ...updates };
    this.saveToStorage();
  }

  public clearData(): void {
    this.data = {};
    this.currentStageIndex = 0;
    this.saveToStorage();
  }

  public canGoNext(): boolean {
    const currentStage = this.getCurrentStage();
    return currentStage.validate(this.data);
  }

  public canGoPrevious(): boolean {
    return this.currentStageIndex > 0;
  }

  public getValidationMessage(): string {
    const currentStage = this.getCurrentStage();
    if (currentStage.getValidationMessage) {
      return currentStage.getValidationMessage(this.data);
    }
    return 'Please complete this step to continue';
  }

  public goNext(): boolean {
    if (this.canGoNext() && this.currentStageIndex < this.stages.length - 1) {
      this.currentStageIndex++;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  public goPrevious(): boolean {
    if (this.canGoPrevious()) {
      this.currentStageIndex--;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  public goToStage(index: number): boolean {
    if (index >= 0 && index < this.stages.length) {
      this.currentStageIndex = index;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  public isComplete(): boolean {
    return this.stages.every(stage => stage.validate(this.data));
  }

  public async complete(): Promise<void> {
    if (!this.isComplete()) {
      throw new Error('Cannot complete onboarding: not all stages are valid');
    }

    // Apply imported data first if available
    if (this.data.importedData && !this.data.skipImport) {
      const imported = this.data.importedData;
      if (imported.theme) localStorage.setItem(`${GLOBAL_PREFIX}theme`, imported.theme);
      if (imported.profile) localStorage.setItem(`${GLOBAL_PREFIX}profile`, imported.profile);
      if (imported.mediator) localStorage.setItem(`${GLOBAL_PREFIX}mediator`, imported.mediator);
    }

    // Save onboarding data to localStorage
    localStorage.setItem(`${GLOBAL_PREFIX}onboarding-complete`, 'true');
    localStorage.setItem(`${GLOBAL_PREFIX}message-service`, 'agent');
    
    // Apply theme
    if (this.data.theme) {
      localStorage.setItem(`${GLOBAL_PREFIX}theme`, this.data.theme);
    }

    // Save mediator preference
    if (this.data.mediator) {
      localStorage.setItem(`${GLOBAL_PREFIX}mediator`, this.data.mediator);
    }

    // Save profile data
    if (this.data.displayName || this.data.description || this.data.profilePicture) {
      const profileData = {
        displayName: this.data.displayName,
        description: this.data.description,
        profilePicture: this.data.profilePicture
      };
      localStorage.setItem(`${GLOBAL_PREFIX}profile`, JSON.stringify(profileData));
    }

    // Save privacy settings
    const privacySettings = {
      acceptAnalytics: this.data.acceptAnalytics ?? true,
      acceptCrashReports: this.data.acceptCrashReports ?? true,
      sharePresence: this.data.sharePresence ?? true,
      allowDirectMessages: this.data.allowDirectMessages ?? true
    };
    localStorage.setItem(`${GLOBAL_PREFIX}privacy`, JSON.stringify(privacySettings));

    // Save notification settings
    const notificationSettings = {
      enableNotifications: this.data.enableNotifications ?? true,
      notifyMessages: this.data.notifyMessages ?? true,
      notifyFriendRequests: this.data.notifyFriendRequests ?? true,
      notifyMentions: this.data.notifyMentions ?? true,
      playSounds: this.data.playSounds ?? true
    };
    localStorage.setItem(`${GLOBAL_PREFIX}notifications`, JSON.stringify(notificationSettings));

    // Save backup settings
    const backupSettings = {
      autoBackup: this.data.autoBackup ?? false,
      backupFrequency: this.data.backupFrequency || 'weekly'
    };
    localStorage.setItem(`${GLOBAL_PREFIX}backup`, JSON.stringify(backupSettings));

    // Save terms acceptance
    localStorage.setItem(`${GLOBAL_PREFIX}terms-accepted`, 'true');
    localStorage.setItem(`${GLOBAL_PREFIX}terms-accepted-date`, new Date().toISOString());

    MessageServiceFactory.getService(MessageServiceType.AGENT);

    this.reset();
  }

  public reset() {
    this.currentStageIndex = 0;
    this.data = {};
    this.clearStorage();
  }

  public isOnboardingComplete(): boolean {
    return localStorage.getItem(`${GLOBAL_PREFIX}onboarding-complete`) === 'true';
  }

  private saveToStorage() {
    localStorage.setItem(`${GLOBAL_PREFIX}onboarding-stage`, this.currentStageIndex.toString());
    localStorage.setItem(`${GLOBAL_PREFIX}onboarding-data`, JSON.stringify(this.data));
  }

  private loadFromStorage() {
    const savedStage = localStorage.getItem(`${GLOBAL_PREFIX}onboarding-stage`);
    const savedData = localStorage.getItem(`${GLOBAL_PREFIX}onboarding-data`);

    if (savedStage) {
      this.currentStageIndex = parseInt(savedStage, 10);
    }

    if (savedData) {
      try {
        this.data = JSON.parse(savedData);
      } catch (e) {
        console.error('Failed to parse saved onboarding data', e);
      }
    }
  }

  private clearStorage() {
    localStorage.removeItem(`${GLOBAL_PREFIX}onboarding-stage`);
    localStorage.removeItem(`${GLOBAL_PREFIX}onboarding-data`);
  }
}

export default OnboardingService.getInstance();
