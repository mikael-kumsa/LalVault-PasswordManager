import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { 
  TextInput, 
  Button, 
  Appbar, 
  Text,
  HelperText 
} from 'react-native-paper';
import AuthService from '../services/AuthService';

const ChangeMasterPasswordScreen = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 4) {
      Alert.alert('Error', 'New password must be at least 4 characters long');
      return;
    }

    setLoading(true);

    try {
      const result = await AuthService.changeMasterPassword(currentPassword, newPassword);
      
      if (result.success) {
        Alert.alert(
          'Success', 
          'Master password changed successfully!',
          [
            { 
              text: 'OK', 
              onPress: () => navigation.goBack() 
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Change Master Password" />
      </Appbar.Header>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          
          {/* Current Password */}
          <TextInput
            label="Current Master Password *"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            mode="outlined"
            style={styles.input}
            disabled={loading}
          />

          {/* New Password */}
          <TextInput
            label="New Master Password *"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            mode="outlined"
            style={styles.input}
            disabled={loading}
          />
          <HelperText type="info" style={styles.helperText}>
            Must be at least 4 characters long
          </HelperText>

          {/* Confirm New Password */}
          <TextInput
            label="Confirm New Master Password *"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            mode="outlined"
            style={styles.input}
            disabled={loading}
          />

          {/* Change Button */}
          <Button
            mode="contained"
            onPress={handleChangePassword}
            loading={loading}
            disabled={loading}
            style={styles.changeButton}
            icon="key-change"
          >
            Change Master Password
          </Button>

          {/* Security note */}
          <Text style={styles.securityNote}>
            🔒 Changing your master password will not affect your stored passwords.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  input: {
    marginBottom: 8,
    backgroundColor: 'white',
  },
  helperText: {
    marginTop: -4,
    marginBottom: 16,
  },
  changeButton: {
    marginTop: 16,
    marginBottom: 20,
    paddingVertical: 8,
    backgroundColor: '#ff9800',
  },
  securityNote: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 16,
  },
});

export default ChangeMasterPasswordScreen;