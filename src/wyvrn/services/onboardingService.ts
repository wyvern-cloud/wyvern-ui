import { GLOBAL_PREFIX } from '../utils/constants';
import { MessageServiceFactory, MessageServiceType } from './messageServiceFactory';

export interface OnboardingStageData {
  theme?: string;
  mediator?: string;
  displayName?: string;
  username?: string;
  profilePicture?: string;
  description?: string;
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
