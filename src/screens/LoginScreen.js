import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { TextInput, Button, Title, ActivityIndicator } from 'react-native-paper';
import AuthService from '../services/AuthService';
import BiometricService from '../services/BiometricService';

const LoginScreen = ({ navigation, theme, toggleTheme, onLoginSuccess }) => {
    const [masterPassword, setMasterPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isFirstTime, setIsFirstTime] = useState(true);
    const [loading, setLoading] = useState(true);
    const [biometricAvailable, setBiometricAvailable] = useState(false);
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [biometricType, setBiometricType] = useState('Biometric');

    useEffect(() => {
        initializeAuth();
    }, []);

    const initializeAuth = async () => {
        try {
            const firstTime = await AuthService.isFirstTime();
            setIsFirstTime(firstTime);

            const available = await BiometricService.isBiometricAvailable();
            setBiometricAvailable(available);

            if (available) {
                const type = await BiometricService.getBiometricType();
                setBiometricType(type);

                const enabled = await BiometricService.isBiometricEnabled();
                setBiometricEnabled(enabled);

                if (enabled && !firstTime) {
                    handleBiometricAuth();
                }
            }
        } catch (error) {
            console.error('Initialization error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle login for existing users
    const handleLogin = async () => {
        if (!masterPassword.trim()) {
            Alert.alert('Error', 'Please enter your master password');
            return;
        }

        setLoading(true);
        try {
            const isValid = await AuthService.verifyMasterPassword(masterPassword);
            if (isValid) {
                // Use the success callback instead of navigating directly
                if (onLoginSuccess) {
                    onLoginSuccess();
                } else {
                    // Fallback to navigation
                    navigation.navigate('Home');
                }
            } else {
                Alert.alert('Error', 'Invalid master password');
            }
        } catch (error) {
            console.error('Login error:', error);
            Alert.alert('Error', 'Failed to verify password');
        } finally {
            setLoading(false);
        }
    };

    // Handle biometric authentication
    const handleBiometricAuth = async () => {
        setLoading(true);
        try {
            const result = await BiometricService.authenticate();

            if (result.success) {
                // Use the success callback
                if (onLoginSuccess) {
                    onLoginSuccess();
                } else {
                    navigation.navigate('Home');
                }
            } else if (result.error && result.error !== 'user_cancel' && result.error !== 'system_cancel') {
                Alert.alert('Authentication Failed', 'Please use your master password instead');
            }
        } catch (error) {
            console.error('Biometric auth error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle setup for first-time users
    const handleSetupMasterPassword = async () => {
        if (!masterPassword.trim() || !confirmPassword.trim()) {
            Alert.alert('Error', 'Please enter and confirm your master password');
            return;
        }

        if (masterPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (masterPassword.length < 4) {
            Alert.alert('Error', 'Master password must be at least 4 characters long');
            return;
        }

        setLoading(true);
        try {
            const success = await AuthService.setMasterPassword(masterPassword);
            if (success) {
                Alert.alert('Success', 'Master password set successfully!', [
                    {
                        text: 'OK',
                        onPress: () => {
                            if (onLoginSuccess) {
                                onLoginSuccess();
                            } else {
                                navigation.navigate('Home');
                            }
                        }
                    }
                ]);
            } else {
                Alert.alert('Error', 'Failed to set master password');
            }
        } catch (error) {
            console.error('Setup error:', error);
            Alert.alert('Error', 'Failed to set master password');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !isFirstTime) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading...</Text>
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                {/* App Title */}
                <Title style={[styles.title, { color: theme.colors.text }]}>LalVault</Title>
                <Text style={[styles.subtitle, { color: theme.colors.disabled }]}>
                    {isFirstTime ? 'Set up your master password' : 'Enter your master password'}
                </Text>

                {/* Password Input Field */}
                <TextInput
                    label="Master Password"
                    value={masterPassword}
                    onChangeText={setMasterPassword}
                    secureTextEntry
                    mode="outlined"
                    style={styles.input}
                    autoFocus={!biometricEnabled}
                    disabled={loading}
                    theme={{ colors: { primary: theme.colors.primary } }}
                />

                {/* Confirm Password Field (only for first time) */}
                {isFirstTime && (
                    <TextInput
                        label="Confirm Master Password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        mode="outlined"
                        style={styles.input}
                        disabled={loading}
                        theme={{ colors: { primary: theme.colors.primary } }}
                    />
                )}

                {/* Biometric Button (only for returning users with biometric enabled) */}
                {!isFirstTime && biometricAvailable && biometricEnabled && (
                    <Button
                        mode="outlined"
                        onPress={handleBiometricAuth}
                        style={styles.biometricButton}
                        disabled={loading}
                        loading={loading}
                        icon="fingerprint"
                        textColor={theme.colors.primary}
                    >
                        Use {biometricType}
                    </Button>
                )}

                {/* Action Button */}
                <Button
                    mode="contained"
                    onPress={isFirstTime ? handleSetupMasterPassword : handleLogin}
                    style={styles.button}
                    disabled={loading}
                    loading={loading}
                    buttonColor={theme.colors.primary}
                    textColor={theme.colors.surface}
                >
                    {isFirstTime ? 'Set Master Password' : 'Unlock Vault'}
                </Button>

                {/* Helper text */}
                <Text style={[styles.helperText, { color: theme.colors.disabled }]}>
                    {isFirstTime
                        ? 'This will be your master password to access all your stored passwords. Make sure to remember it!'
                        : 'Enter your master password to access your passwords'
                    }
                </Text>

                {/* Security note */}
                <Text style={[styles.securityNote, { color: theme.colors.disabled }]}>
                    🔒 Your master password is never stored online and remains only on your device.
                </Text>

                {/* Biometric availability notice */}
                {!isFirstTime && biometricAvailable && !biometricEnabled && (
                    <Text style={[styles.biometricNote, { color: theme.colors.primary }]}>
                        💡 {biometricType} is available in Settings for faster access
                    </Text>
                )}
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 40,
    },
    input: {
        marginBottom: 16,
    },
    biometricButton: {
        marginBottom: 16,
    },
    button: {
        paddingVertical: 8,
        marginBottom: 20,
    },
    helperText: {
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 8,
    },
    securityNote: {
        textAlign: 'center',
        fontSize: 12,
        fontStyle: 'italic',
    },
    biometricNote: {
        textAlign: 'center',
        fontSize: 12,
        marginTop: 8,
        fontStyle: 'italic',
    },
});

export default LoginScreen;