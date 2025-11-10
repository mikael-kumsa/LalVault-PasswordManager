import * as SecureStore from 'expo-secure-store';

const THEME_MODE_KEY = 'theme_mode';

class ThemeService {
  // Default theme (light)
  lightTheme = {
    mode: 'light',
    colors: {
      primary: '#6200ee',
      background: '#f5f5f5',
      surface: '#ffffff',
      accent: '#03dac4',
      error: '#b00020',
      text: '#000000',
      onSurface: '#000000',
      disabled: '#9e9e9e',
      placeholder: '#9e9e9e',
      backdrop: 'rgba(0, 0, 0, 0.5)',
      notification: '#f50057',
      card: '#ffffff',
      border: '#e0e0e0',
    },
  };

  // Dark theme
  darkTheme = {
    mode: 'dark',
    colors: {
      primary: '#bb86fc',
      background: '#121212',
      surface: '#1e1e1e',
      accent: '#03dac4',
      error: '#cf6679',
      text: '#ffffff',
      onSurface: '#ffffff',
      disabled: '#9e9e9e',
      placeholder: '#9e9e9e',
      backdrop: 'rgba(0, 0, 0, 0.8)',
      notification: '#ff80ab',
      card: '#2d2d2d',
      border: '#333333',
    },
  };

  // Get current theme mode from storage
  async getThemeMode() {
    try {
      const themeMode = await SecureStore.getItemAsync(THEME_MODE_KEY);
      return themeMode || 'light'; // Default to light theme
    } catch (error) {
      console.error('Error getting theme mode:', error);
      return 'light';
    }
  }

  // Set theme mode in storage
  async setThemeMode(mode) {
    try {
      await SecureStore.setItemAsync(THEME_MODE_KEY, mode);
      return true;
    } catch (error) {
      console.error('Error setting theme mode:', error);
      return false;
    }
  }

  // Get the full theme object based on mode
  async getTheme() {
    const mode = await this.getThemeMode();
    return mode === 'dark' ? this.darkTheme : this.lightTheme;
  }

  // Toggle between light and dark mode
  async toggleTheme() {
    const currentMode = await this.getThemeMode();
    const newMode = currentMode === 'light' ? 'dark' : 'light';
    await this.setThemeMode(newMode);
    return newMode;
  }
}

export default new ThemeService();