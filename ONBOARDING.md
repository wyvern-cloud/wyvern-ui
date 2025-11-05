# Onboarding System Documentation

## Overview
A multi-stage, extensible onboarding wizard that guides new users through initial setup.

## Architecture

### Core Components

1. **OnboardingService** (`services/onboardingService.ts`)
   - Manages onboarding state and progression
   - Handles validation per stage
   - Persists data to localStorage
   - Singleton service pattern

2. **OnboardingWizard** (`onboarding.tsx`)
   - Main UI component
   - Renders progress indicator
   - Handles navigation between stages
   - Manages completion flow

3. **Stage Components** (`components/onboarding/`)
   - ThemeStage: Theme selection
   - MediatorStage: Mediator server selection
   - ProfileStage: User profile setup

## Current Stages

### 1. Theme Stage
- **Purpose**: User selects visual theme
- **Validation**: Must select a theme
- **Data Saved**: `theme` (ThemeMode)

### 2. Mediator Stage
- **Purpose**: User selects message routing server
- **Validation**: Must select or enter valid DID
- **Data Saved**: `mediator` (DID string)
- **Options**:
  - Indicio Development (recommended)
  - Indicio US East
  - Custom mediator

### 3. Profile Stage
- **Purpose**: User creates their profile
- **Validation**: Display name required (min 2 chars)
- **Data Saved**: 
  - `displayName` (required)
  - `description` (optional)
  - `profilePicture` (optional, auto-generated if not provided)

## Adding New Stages

### Step 1: Update Data Interface
Edit `services/onboardingService.ts`:

```typescript
export interface OnboardingStageData {
  theme?: string;
  mediator?: string;
  displayName?: string;
  // Add your new field here
  yourNewField?: string;
}
```

### Step 2: Define Stage
In `onboardingService.ts`, add to `initializeStages()`:

```typescript
{
  id: 'your-stage-id',
  title: 'Your Stage Title',
  description: 'Description shown to user',
  validate: (data) => {
    // Return true if stage is valid
    return !!data.yourNewField && data.yourNewField.length > 0;
  },
  getValidationMessage: (data) => {
    // Return error message if invalid
    if (!data.yourNewField) return 'This field is required';
    return 'Please complete this step';
  }
}
```

### Step 3: Create Stage Component
Create `components/onboarding/YourStage.jsx`:

```jsx
import m from "mithril";
import onboardingService from "../../services/onboardingService";

const YourStage = {
  view: () => {
    const data = onboardingService.getData();
    
    return (
      <div>
        <input
          type="text"
          value={data.yourNewField || ''}
          oninput={(e) => {
            onboardingService.updateData({ 
              yourNewField: e.target.value 
            });
          }}
        />
      </div>
    );
  }
};

export default YourStage;
```

### Step 4: Register Component
In `onboarding.tsx`, add to imports and STAGE_COMPONENTS:

```typescript
import YourStage from "./components/onboarding/YourStage";

const STAGE_COMPONENTS = {
  theme: ThemeStage,
  mediator: MediatorStage,
  profile: ProfileStage,
  'your-stage-id': YourStage  // Add here
};
```

## Features

### Navigation
- **Next**: Validates current stage before advancing
- **Previous**: Always available (except first stage)
- **Progress Indicator**: Click completed stages to jump back

### Validation
- Per-stage validation rules
- Custom error messages
- Blocks progression until valid

### Persistence
- Auto-saves to localStorage on every change
- Survives page refreshes
- Stage progress tracked

### Completion
- All stages must be valid
- Sets completion flag in localStorage
- Redirects to main app (`/w` route)
- Applies saved preferences (theme, mediator, profile)

## Data Flow

1. User interacts with stage component
2. Component calls `onboardingService.updateData()`
3. Service validates and saves to localStorage
4. User clicks "Next"
5. Service checks `stage.validate(data)`
6. If valid, advances to next stage
7. On final stage, "Get Started" button appears
8. Clicking completes onboarding:
   - Saves to localStorage with keys:
     - `dev_wyvrn-onboarding-complete`
     - `dev_wyvrn-message-service`
     - `dev_wyvrn-theme`
     - `dev_wyvrn-mediator`
     - `dev_wyvrn-profile`
   - Redirects to `/w`

## Integration Points

### Agent Service
- Reads mediator from `localStorage.getItem('dev_wyvrn-mediator')`
- Loads profile on init via `loadProfileFromStorage()`

### Theme Service
- Applied immediately when selected
- Persisted for future sessions

### Main App
- Checks `onboardingService.isOnboardingComplete()`
- Redirects to `/w/onboard` if incomplete

### Settings Panel
- "Reset Onboarding" button
- Clears onboarding data and redirects

## LocalStorage Keys

All keys prefixed with `dev_wyvrn-`:

- `onboarding-complete`: "true" when done
- `onboarding-stage`: Current stage index (0-2)
- `onboarding-data`: JSON of stage data
- `message-service`: "agent" (set on completion)
- `theme`: Selected theme ID
- `mediator`: Mediator DID
- `profile`: JSON of profile data

## Testing

To test onboarding flow:

1. Open DevTools Console
2. Clear onboarding:
   ```javascript
   localStorage.removeItem('dev_wyvrn-onboarding-complete');
   localStorage.removeItem('dev_wyvrn-onboarding-stage');
   localStorage.removeItem('dev_wyvrn-onboarding-data');
   ```
3. Refresh page
4. Or use "Reset Onboarding" in Settings

## Future Enhancements

Potential stages to add:
- Privacy/Security preferences
- Notification settings
- Backup recovery phrase
- Import existing identity
- Tutorial/walkthrough
- Terms of service acceptance
