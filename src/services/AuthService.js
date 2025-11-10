import * as SecureStore from 'expo-secure-store';

// Keys for secure storage
const MASTER_PASSWORD_KEY = 'master_password';
const IS_FIRST_TIME_KEY = 'is_first_time';

class AuthService {
  // Check if it's user's first time (no master password set)
  async isFirstTime() {
    try {
      const isFirstTime = await SecureStore.getItemAsync(IS_FIRST_TIME_KEY);
      return isFirstTime === null;
    } catch (error) {
      console.error('Error checking first time:', error);
      return true;
    }
  }

  // Set master password for first time
  async setMasterPassword(password) {
    try {
      await SecureStore.setItemAsync(MASTER_PASSWORD_KEY, password);
      await SecureStore.setItemAsync(IS_FIRST_TIME_KEY, 'false');
      return true;
    } catch (error) {
      console.error('Error setting master password:', error);
      return false;
    }
  }

  // Verify master password
  async verifyMasterPassword(password) {
    try {
      const storedPassword = await SecureStore.getItemAsync(MASTER_PASSWORD_KEY);
      return password === storedPassword;
    } catch (error) {
      console.error('Error verifying master password:', error);
      return false;
    }
  }

  // Change master password
  async changeMasterPassword(oldPassword, newPassword) {
    try {
      const isValid = await this.verifyMasterPassword(oldPassword);
      if (!isValid) {
        return { success: false, error: 'Current password is incorrect' };
      }
      
      await SecureStore.setItemAsync(MASTER_PASSWORD_KEY, newPassword);
      return { success: true };
    } catch (error) {
      console.error('Error changing master password:', error);
      return { success: false, error: 'Failed to change password' };
    }
  }

  // Check if master password is set
  async isMasterPasswordSet() {
    try {
      const password = await SecureStore.getItemAsync(MASTER_PASSWORD_KEY);
      return password !== null;
    } catch (error) {
      console.error('Error checking master password:', error);
      return false;
    }
  }

  // Clear all auth data (for logout/reset)
  async clearAuthData() {
    try {
      await SecureStore.deleteItemAsync(MASTER_PASSWORD_KEY);
      await SecureStore.deleteItemAsync(IS_FIRST_TIME_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing auth data:', error);
      return false;
    }
  }
}

export default new AuthService();