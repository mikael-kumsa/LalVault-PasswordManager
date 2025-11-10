import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Appbar, List, Switch, Text, Button, Divider, ActivityIndicator } from 'react-native-paper';
import BiometricService from '../services/BiometricService';
import ThemeService from '../services/ThemeService';
import AutoLockService from '../services/AutoLockService';

const SettingsScreen = ({ navigation, theme, toggleTheme, updateActivity }) => {
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [darkModeEnabled, setDarkModeEnabled] = useState(false);
    const [autoLockEnabled, setAutoLockEnabled] = useState(true);
    const [biometricAvailable, setBiometricAvailable] = useState(false);
    const [biometricType, setBiometricType] = useState('Biometric');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const available = await BiometricService.isBiometricAvailable();
            setBiometricAvailable(available);

            if (available) {
                const type = await BiometricService.getBiometricType();
                setBiometricType(type);
                const enabled = await BiometricService.isBiometricEnabled();
                setBiometricEnabled(enabled);
            }

            // Load dark mode setting
            const themeMode = await ThemeService.getThemeMode();
            setDarkModeEnabled(themeMode === 'dark');

            // Load auto lock setting
            const autoLockEnabled = await AutoLockService.isAutoLockEnabled();
            setAutoLockEnabled(autoLockEnabled);
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBiometricToggle = async (enabled) => {
        if (enabled && !biometricAvailable) {
            Alert.alert('Not Available', 'Biometric authentication is not available on this device.');
            return;
        }

        setLoading(true);
        try {
            const result = await BiometricService.setBiometricEnabled(enabled);
            if (result.success) {
                setBiometricEnabled(enabled);
                if (enabled) {
                    Alert.alert('Success', `${biometricType} has been enabled!`);
                }
            } else {
                Alert.alert('Error', result.error || 'Failed to update setting');
                setBiometricEnabled(!enabled);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update biometric setting');
            setBiometricEnabled(!enabled);
        } finally {
            setLoading(false);
        }
    };

    const handleDarkModeToggle = async (enabled) => {
        setLoading(true);
        try {
            const newMode = await toggleTheme();
            setDarkModeEnabled(newMode === 'dark');
        } catch (error) {
            console.error('Error toggling dark mode:', error);
            Alert.alert('Error', 'Failed to update theme');
            setDarkModeEnabled(!enabled);
        } finally {
            setLoading(false);
        }
    };

    const handleAutoLockToggle = async (enabled) => {
        setLoading(true);
        try {
            const success = await AutoLockService.setAutoLockEnabled(enabled);
            if (success) {
                setAutoLockEnabled(enabled);
                if (enabled) {
                    await AutoLockService.resetTimer();
                    Alert.alert('Success', 'Auto lock has been enabled');
                } else {
                    // No alert when disabling to avoid annoyance
                }
            } else {
                throw new Error('Failed to update auto lock setting');
            }
        } catch (error) {
            console.error('Error updating auto lock:', error);
            Alert.alert('Error', 'Failed to update auto lock setting');
            setAutoLockEnabled(!enabled);
        } finally {
            setLoading(false);
        }
    };

    const handleChangeMasterPassword = () => {
        updateActivity && updateActivity();
        navigation.navigate('ChangeMasterPassword');
    };

    const handleBackupData = () => {
        updateActivity && updateActivity();
        Alert.alert('Coming Soon', 'Backup feature will be implemented soon!');
    };

    const handleAppInfo = () => {
        updateActivity && updateActivity();
        Alert.alert('App Info', 'Password Manager v1.0.0\n\nA secure password manager built with React Native.');
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
                    <Appbar.BackAction onPress={() => navigation.goBack()} />
                    <Appbar.Content title="Settings" titleStyle={{ color: theme.colors.text }} />
                </Appbar.Header>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading settings...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Settings" titleStyle={{ color: theme.colors.text }} />
            </Appbar.Header>

            <ScrollView style={styles.scrollView}>
                <List.Section>
                    <List.Subheader style={[styles.sectionHeader, { color: theme.colors.primary }]}>
                        Security
                    </List.Subheader>

                    <List.Item
                        title="Change Master Password"
                        description="Update your master password"
                        left={props => <List.Icon {...props} icon="key" color={theme.colors.primary} />}
                        onPress={handleChangeMasterPassword}
                        titleStyle={{ color: theme.colors.text }}
                        descriptionStyle={{ color: theme.colors.disabled }}
                    />

                    <List.Item
                        title={`Use ${biometricType}`}
                        description={`Enable ${biometricType} for faster access`}
                        left={props => <List.Icon {...props} icon="fingerprint" color={theme.colors.primary} />}
                        right={props => (
                            <Switch
                                value={biometricEnabled}
                                onValueChange={handleBiometricToggle}
                                disabled={!biometricAvailable}
                                color={theme.colors.primary}
                            />
                        )}
                        titleStyle={{ color: theme.colors.text }}
                        descriptionStyle={{ color: theme.colors.disabled }}
                    />
                    {!biometricAvailable && (
                        <Text style={[styles.unavailableText, { color: theme.colors.error }]}>
                            {biometricType} not available on this device
                        </Text>
                    )}

                    <List.Item
                        title="Auto Lock"
                        description="Lock app automatically after 3 minutes of inactivity"
                        left={props => <List.Icon {...props} icon="lock" color={theme.colors.primary} />}
                        right={props => (
                            <Switch
                                value={autoLockEnabled}
                                onValueChange={handleAutoLockToggle}
                                color={theme.colors.primary}
                            />
                        )}
                        titleStyle={{ color: theme.colors.text }}
                        descriptionStyle={{ color: theme.colors.disabled }}
                    />
                </List.Section>

                <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                <List.Section>
                    <List.Subheader style={[styles.sectionHeader, { color: theme.colors.primary }]}>
                        Appearance
                    </List.Subheader>

                    <List.Item
                        title="Dark Mode"
                        description="Switch between light and dark theme"
                        left={props => <List.Icon {...props} icon="theme-light-dark" color={theme.colors.primary} />}
                        right={props => (
                            <Switch
                                value={darkModeEnabled}
                                onValueChange={handleDarkModeToggle}
                                color={theme.colors.primary}
                            />
                        )}
                        titleStyle={{ color: theme.colors.text }}
                        descriptionStyle={{ color: theme.colors.disabled }}
                    />
                </List.Section>

                <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                <List.Section>
                    <List.Subheader style={[styles.sectionHeader, { color: theme.colors.primary }]}>
                        Data
                    </List.Subheader>

                    <List.Item
                        title="Backup & Export"
                        description="Backup your passwords securely"
                        left={props => <List.Icon {...props} icon="backup-restore" color={theme.colors.primary} />}
                        onPress={handleBackupData}
                        titleStyle={{ color: theme.colors.text }}
                        descriptionStyle={{ color: theme.colors.disabled }}
                    />

                    <List.Item
                        title="Clear All Data"
                        description="Remove all passwords and reset app"
                        left={props => <List.Icon {...props} icon="delete-sweep" color={theme.colors.primary} />}
                        onPress={() => {
                            updateActivity && updateActivity();
                            Alert.alert(
                                'Clear All Data',
                                'This will remove all your passwords and cannot be undone. Are you sure?',
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    { text: 'Clear', style: 'destructive' }
                                ]
                            );
                        }}
                        titleStyle={{ color: theme.colors.text }}
                        descriptionStyle={{ color: theme.colors.disabled }}
                    />
                </List.Section>

                <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                <List.Section>
                    <List.Subheader style={[styles.sectionHeader, { color: theme.colors.primary }]}>
                        About
                    </List.Subheader>

                    <List.Item
                        title="App Info"
                        description="Version and information"
                        left={props => <List.Icon {...props} icon="information" color={theme.colors.primary} />}
                        onPress={handleAppInfo}
                        titleStyle={{ color: theme.colors.text }}
                        descriptionStyle={{ color: theme.colors.disabled }}
                    />

                    <List.Item
                        title="Privacy Policy"
                        description="How we handle your data"
                        left={props => <List.Icon {...props} icon="shield-account" color={theme.colors.primary} />}
                        onPress={() => {
                            updateActivity && updateActivity();
                            Alert.alert('Privacy Policy', 'Your data is stored locally and never leaves your device.');
                        }}
                        titleStyle={{ color: theme.colors.text }}
                        descriptionStyle={{ color: theme.colors.disabled }}
                    />
                </List.Section>

                <View style={styles.versionContainer}>
                    <Text style={[styles.versionText, { color: theme.colors.disabled }]}>
                        Password Manager v1.0.0
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
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
    sectionHeader: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 8,
    },
    divider: {
        marginVertical: 8,
        marginHorizontal: 16,
    },
    unavailableText: {
        fontSize: 12,
        marginLeft: 16,
        marginTop: -8,
        marginBottom: 8,
        fontStyle: 'italic',
    },
    versionContainer: {
        padding: 20,
        alignItems: 'center',
    },
    versionText: {
        fontSize: 14,
    },
});

export default SettingsScreen;