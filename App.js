import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { AppState } from 'react-native';
import ThemeService from './src/services/ThemeService';
import AutoLockService from './src/services/AutoLockService';
import AuthService from './src/services/AuthService';

// Import all our screens
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import AddPasswordScreen from './src/screens/AddPasswordScreen';
import EditPasswordScreen from './src/screens/EditPasswordScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ChangeMasterPasswordScreen from './src/screens/ChangeMasterPasswordScreen';

const Stack = createStackNavigator();

export default function App() {
  const [theme, setTheme] = useState(ThemeService.lightTheme);
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const appState = useRef(AppState.currentState);
  const navigationRef = useRef();

  // Load app data and check authentication
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Load theme
      const currentTheme = await ThemeService.getTheme();
      setTheme(currentTheme);

      // Check if user is already authenticated (has master password set)
      const hasMasterPassword = await AuthService.isMasterPasswordSet();
      setIsAuthenticated(hasMasterPassword);

      // Setup app state listener
      setupAppStateListener();
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      // Hide splash screen after a minimum time (for better UX)
      setTimeout(() => {
        setIsLoading(false);
      }, 2000); // Minimum 2 seconds splash screen
    }
  };

  const setupAppStateListener = () => {
    AppState.addEventListener('change', handleAppStateChange);
  };

  const handleAppStateChange = async (nextAppState) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      // App coming to foreground - check if should lock
      const shouldLock = await AutoLockService.shouldLock();
      if (shouldLock && navigationRef.current) {
        // Reset to login screen if auto-lock time has passed
        setIsAuthenticated(false);
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
      await AutoLockService.resetTimer();
    } else if (
      appState.current === 'active' &&
      nextAppState.match(/inactive|background/)
    ) {
      // App going to background - record last active time
      await AutoLockService.updateLastActiveTime();
    }

    appState.current = nextAppState;
  };

  // Handle splash screen completion
  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Handle successful login
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // Function to toggle theme
  const toggleTheme = async () => {
    const newMode = await ThemeService.toggleTheme();
    const newTheme = newMode === 'dark' ? ThemeService.darkTheme : ThemeService.lightTheme;
    setTheme(newTheme);
    return newMode;
  };

  // Function to update last active time
  const updateActivity = async () => {
    await AutoLockService.updateLastActiveTime();
  };

  // Show splash screen first
  if (showSplash) {
    return <SplashScreen onAnimationComplete={handleSplashComplete} />;
  }

  if (isLoading) {
    return null;
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer 
        theme={theme}
        ref={navigationRef}
      >
        <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
        <Stack.Navigator 
          initialRouteName={isAuthenticated ? "Home" : "Login"}
          screenOptions={{ 
            headerShown: false,
            cardStyle: { backgroundColor: theme.colors.background }
          }}
        >
          <Stack.Screen name="Login">
            {(props) => (
              <LoginScreen 
                {...props} 
                theme={theme} 
                toggleTheme={toggleTheme} 
                onLoginSuccess={handleLoginSuccess}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Home">
            {(props) => (
              <HomeScreen 
                {...props} 
                theme={theme} 
                toggleTheme={toggleTheme} 
                updateActivity={updateActivity}
                onLogout={handleLogout}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="AddPassword">
            {(props) => <AddPasswordScreen {...props} theme={theme} toggleTheme={toggleTheme} updateActivity={updateActivity} />}
          </Stack.Screen>
          <Stack.Screen name="EditPassword">
            {(props) => <EditPasswordScreen {...props} theme={theme} toggleTheme={toggleTheme} updateActivity={updateActivity} />}
          </Stack.Screen>
          <Stack.Screen name="Settings">
            {(props) => <SettingsScreen {...props} theme={theme} toggleTheme={toggleTheme} updateActivity={updateActivity} />}
          </Stack.Screen>
          <Stack.Screen name="ChangeMasterPassword">
            {(props) => <ChangeMasterPasswordScreen {...props} theme={theme} toggleTheme={toggleTheme} updateActivity={updateActivity} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}