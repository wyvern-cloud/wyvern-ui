import m from "mithril";
import onboardingService from "../../services/onboardingService";
import styles from "../../onboarding.module.css";
import ImageCropper from "../ImageCropper";

const ProfileStage = {

  oninit: (vnode) => {
    const data = onboardingService.getData();
    vnode.state.displayName = data.displayName || '';
    vnode.state.description = data.description || '';
    vnode.state.profilePicture = data.profilePicture || '';
    vnode.state.useDefaultPfp = !data.profilePicture;
    vnode.state.useUploadedImage = false;
    vnode.state.uploadedImageData = null;
    vnode.state.showCropper = false;
    vnode.state.cropperRef = null;
  },

  view: (vnode) => {
    const data = onboardingService.getData();
    
    const handleDisplayNameInput = (e) => {
      vnode.state.displayName = e.target.value;
      onboardingService.updateData({ displayName: e.target.value });
    };

    const handleDescriptionInput = (e) => {
      vnode.state.description = e.target.value;
      onboardingService.updateData({ description: e.target.value });
    };

    const handleProfilePictureInput = (e) => {
      vnode.state.profilePicture = e.target.value;
      vnode.state.useDefaultPfp = false;
      onboardingService.updateData({ profilePicture: e.target.value });
    };

    const handleUseDefaultPfp = (e) => {
      vnode.state.useDefaultPfp = e.target.checked;
      vnode.state.useUploadedImage = false;
      vnode.state.showCropper = false;
      if (e.target.checked) {
        const defaultPfp = vnode.state.displayName 
          ? `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(vnode.state.displayName)}`
          : '';
        vnode.state.profilePicture = defaultPfp;
        onboardingService.updateData({ profilePicture: defaultPfp });
      }
      m.redraw();
    };

    const handleFileSelect = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        vnode.state.uploadedImageData = event.target.result;
        vnode.state.useUploadedImage = true;
        vnode.state.useDefaultPfp = false;
        vnode.state.showCropper = true;
        m.redraw();
      };
      reader.readAsDataURL(file);
    };

    const handleCropComplete = () => {
      if (vnode.state.cropperRef) {
        const croppedImage = vnode.state.cropperRef.getCroppedImage(vnode.state.cropperRef);
        if (croppedImage) {
          vnode.state.profilePicture = croppedImage;
          onboardingService.updateData({ profilePicture: croppedImage });
          vnode.state.showCropper = false;
          m.redraw();
        }
      }
    };

    const handleCancelCrop = () => {
      vnode.state.showCropper = false;
      vnode.state.useUploadedImage = false;
      vnode.state.uploadedImageData = null;
      m.redraw();
    };

    const getProfilePictureUrl = () => {
      if (vnode.state.useDefaultPfp && vnode.state.displayName) {
        return `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(vnode.state.displayName)}`;
      }
      return vnode.state.profilePicture || 'https://api.dicebear.com/7.x/personas/svg?seed=default';
    };

    return (
      <div class={styles.profileContainer}>
        {/* Profile Picture Preview */}
        <div class={styles.profilePictureSection}>
          <div class={styles.profilePicturePreview}>
            <img 
              src={getProfilePictureUrl()}
              alt="Profile"
              class={styles.profilePictureImg}
            />
          </div>
        </div>

        {/* Display Name */}
        <div class={styles.formGroup}>
          <label class={styles.formLabel}>
            Display Name <span class={styles.required}>*</span>
          </label>
          <input
            type="text"
            placeholder="Enter your display name"
            value={vnode.state.displayName}
            oninput={handleDisplayNameInput}
            class={styles.formInput}
          />
          <div class={styles.formHint}>
            This is the name others will see when chatting with you
          </div>
        </div>

        {/* Description */}
        <div class={styles.formGroup}>
          <label class={styles.formLabel}>
            Description
          </label>
          <textarea
            placeholder="Tell others a bit about yourself (optional)"
            value={vnode.state.description}
            oninput={handleDescriptionInput}
            rows="3"
            class={styles.formTextarea}
          />
        </div>

        {/* Profile Picture Options */}
        <div class={styles.formGroup}>
          <label class={styles.formLabel}>
            Profile Picture
          </label>
          
          <label class={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={vnode.state.useDefaultPfp}
              onchange={handleUseDefaultPfp}
            />
            <span class={styles.checkboxText}>Use auto-generated avatar</span>
          </label>

          {!vnode.state.useDefaultPfp && !vnode.state.showCropper && (
            <div class={styles.uploadSection}>
              <input
                type="file"
                accept="image/*"
                onchange={handleFileSelect}
                class={styles.fileInput}
                id="profile-pic-input"
              />
              <label for="profile-pic-input" class={styles.fileInputLabel}>
                {vnode.state.useUploadedImage ? 'Change Image' : 'Upload Image'}
              </label>
              <div class={styles.formHint}>
                Upload an image from your device to use as your profile picture
              </div>
            </div>
          )}

          {vnode.state.showCropper && vnode.state.uploadedImageData && (
            <div class={styles.cropperSection}>
              <ImageCropper 
                imageData={vnode.state.uploadedImageData}
                oncreate={(cropperVnode) => { vnode.state.cropperRef = cropperVnode.state; }}
              />
              <div class={styles.cropperActions}>
                <button 
                  class={styles.secondaryButton}
                  onclick={handleCancelCrop}
                >
                  Cancel
                </button>
                <button 
                  class={styles.primaryButton}
                  onclick={handleCropComplete}
                >
                  Apply Crop
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Validation Message */}
        {!onboardingService.canGoNext() && vnode.state.displayName && (
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

export default ProfileStage;
