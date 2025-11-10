import * as SecureStore from 'expo-secure-store';

const AUTO_LOCK_ENABLED_KEY = 'auto_lock_enabled';
const AUTO_LOCK_TIMEOUT_KEY = 'auto_lock_timeout';
const LAST_ACTIVE_TIME_KEY = 'last_active_time';

class AutoLockService {
  // Default timeout in milliseconds (3 minutes)
  defaultTimeout = 3 * 60 * 1000;

  // Check if auto lock is enabled
  async isAutoLockEnabled() {
    try {
      const enabled = await SecureStore.getItemAsync(AUTO_LOCK_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
      console.error('Error checking auto lock:', error);
      return true; // Default to enabled
    }
  }

  // Set auto lock enabled/disabled
  async setAutoLockEnabled(enabled) {
    try {
      await SecureStore.setItemAsync(AUTO_LOCK_ENABLED_KEY, enabled.toString());
      return true;
    } catch (error) {
      console.error('Error setting auto lock:', error);
      return false;
    }
  }

  // Get auto lock timeout
  async getAutoLockTimeout() {
    try {
      const timeout = await SecureStore.getItemAsync(AUTO_LOCK_TIMEOUT_KEY);
      return timeout ? parseInt(timeout) : this.defaultTimeout;
    } catch (error) {
      console.error('Error getting auto lock timeout:', error);
      return this.defaultTimeout;
    }
  }

  // Set auto lock timeout
  async setAutoLockTimeout(timeout) {
    try {
      await SecureStore.setItemAsync(AUTO_LOCK_TIMEOUT_KEY, timeout.toString());
      return true;
    } catch (error) {
      console.error('Error setting auto lock timeout:', error);
      return false;
    }
  }

  // Update last active time (call this when user interacts with app)
  async updateLastActiveTime() {
    try {
      const currentTime = Date.now().toString();
      await SecureStore.setItemAsync(LAST_ACTIVE_TIME_KEY, currentTime);
      return true;
    } catch (error) {
      console.error('Error updating last active time:', error);
      return false;
    }
  }

  // Check if app should lock based on inactivity
  async shouldLock() {
    try {
      const enabled = await this.isAutoLockEnabled();
      if (!enabled) {
        return false;
      }

      const lastActiveTime = await SecureStore.getItemAsync(LAST_ACTIVE_TIME_KEY);
      if (!lastActiveTime) {
        return false; // No previous activity recorded
      }

      const timeout = await this.getAutoLockTimeout();
      const currentTime = Date.now();
      const timeSinceLastActive = currentTime - parseInt(lastActiveTime);

      return timeSinceLastActive > timeout;
    } catch (error) {
      console.error('Error checking if should lock:', error);
      return false;
    }
  }

  // Reset the timer (call this when app comes to foreground)
  async resetTimer() {
    await this.updateLastActiveTime();
  }

  // Force lock (for manual lock)
  async forceLock() {
    await SecureStore.deleteItemAsync(LAST_ACTIVE_TIME_KEY);
  }
}

export default new AutoLockService();