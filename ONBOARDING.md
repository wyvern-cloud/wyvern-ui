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

### 1. Terms Stage
- **Purpose**: User accepts Terms of Service and Privacy Policy
- **Validation**: Must accept both terms and privacy policy
- **Data Saved**: `acceptedTerms`, `acceptedPrivacy` (boolean)
- **Features**:
  - Full terms and privacy policy text
  - Scrollable document viewer
  - Required checkboxes for both documents

### 2. Theme Stage
- **Purpose**: User selects visual theme
- **Validation**: Must select a theme
- **Data Saved**: `theme` (ThemeMode)

### 3. Mediator Stage
- **Purpose**: User selects message routing server
- **Validation**: Must select or enter valid DID
- **Data Saved**: `mediator` (DID string)
- **Options**:
  - Indicio Development (recommended)
  - Indicio US East
  - Custom mediator

### 4. Profile Stage
- **Purpose**: User creates their profile
- **Validation**: Display name required (min 2 chars)
- **Data Saved**: 
  - `displayName` (required)
  - `description` (optional)
  - `profilePicture` (optional, can upload and crop)
- **Features**:
  - Image upload with file picker
  - In-browser square image cropping
  - Interactive crop editor (drag to move, scroll to zoom)
  - Images stored as base64 in localStorage

### 5. Privacy Stage
- **Purpose**: Configure privacy and security preferences
- **Validation**: All settings optional
- **Data Saved**:
  - `acceptAnalytics` (default: true)
  - `acceptCrashReports` (default: true)
  - `sharePresence` (default: true)
  - `allowDirectMessages` (default: true)

### 6. Notifications Stage
- **Purpose**: Configure notification preferences
- **Validation**: All settings optional
- **Data Saved**:
  - `enableNotifications` (default: true)
  - `notifyMessages` (default: true)
  - `notifyFriendRequests` (default: true)
  - `notifyMentions` (default: true)
  - `playSounds` (default: true)
- **Features**:
  - Nested settings (sub-options disabled if main notification is off)

### 7. Backup Stage
- **Purpose**: Create initial backup and configure auto-backup
- **Validation**: Optional (can skip)
- **Data Saved**:
  - `autoBackup` (default: false)
  - `backupFrequency` (default: 'weekly')
- **Features**:
  - One-click backup download
  - JSON export of all settings
  - Auto-backup reminder configuration
  - Frequency options: daily, weekly, monthly

### 8. Import Stage
- **Purpose**: Restore from previous backup
- **Validation**: Optional (can skip)
- **Data Saved**:
  - `skipImport` (default: true)
  - `importedData` (backup file contents)
- **Features**:
  - File picker for JSON backup files
  - Validation of backup file format
  - Preview of backup timestamp
  - Skip option to start fresh
  - Applied automatically on completion if not skipped

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

## Settings Panel

The settings panel has been reorganized into a tabbed interface with the following sections:

### Appearance Tab
- Theme selection
- Message service toggle (Agent vs Example)

### Profile Tab
- Profile picture upload with cropping
- Display name editor
- Description editor
- All changes save automatically on blur

### Privacy Tab
- Analytics toggle
- Crash reports toggle
- Presence sharing toggle
- Direct messages toggle

### Notifications Tab
- Master notification toggle
- Message notifications
- Friend request notifications
- Mention notifications
- Notification sounds

### Backup & Data Tab
- One-click backup download
- Auto-backup configuration
- Backup frequency settings

### Advanced Tab
- Reset onboarding button
- Clear all local data button

All settings are editable post-onboarding and changes are saved immediately to localStorage.

## LocalStorage Keys

All keys prefixed with `dev_wyvrn-`:

- `onboarding-complete`: "true" when done
- `onboarding-stage`: Current stage index (0-7)
- `onboarding-data`: JSON of stage data
- `message-service`: "agent" (set on completion)
- `theme`: Selected theme ID
- `mediator`: Mediator DID
- `profile`: JSON of profile data (displayName, description, profilePicture)
- `privacy`: JSON of privacy settings
- `notifications`: JSON of notification preferences
- `backup`: JSON of backup configuration
- `terms-accepted`: "true" when terms accepted
- `terms-accepted-date`: ISO timestamp of acceptance

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

## Image Cropping Feature

The image cropper component provides a user-friendly way to crop profile pictures:

### Features
- **Canvas-based Editing**: Uses HTML5 canvas for smooth rendering
- **Interactive Controls**:
  - Drag to reposition image
  - Scroll wheel to zoom in/out
  - Visual corner guides for crop area
- **Square Output**: Always produces 300x300px square images
- **Format**: Saves as base64-encoded PNG in localStorage
- **Constraints**:
  - Minimum scale prevents over-zooming
  - Maximum scale prevents pixelation
  - Smooth transitions and zoom centering

### Usage
1. User clicks "Upload Image"
2. File picker opens for image selection
3. Image loads into cropper canvas
4. User adjusts position (drag) and size (scroll)
5. Click "Apply Crop" to save
6. Cropped image stored as base64 in profile data

Used in both onboarding (Profile Stage) and settings (Profile Tab).

## Future Enhancements

Potential improvements:
- Tutorial/walkthrough stage with interactive guides
- Multi-language support in Terms stage
- Cloud backup integration (optional)
- Profile picture filters/effects
- Keyboard shortcuts for cropper
- Advanced privacy options (per-contact settings)
- Custom notification sounds
- Import from other messaging platforms
