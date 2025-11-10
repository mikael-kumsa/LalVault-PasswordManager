import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { 
  TextInput, 
  Button, 
  Appbar, 
  Text,
  HelperText 
} from 'react-native-paper';
import StorageService from '../services/StorageService';

const EditPasswordScreen = ({ navigation, route }) => {
  // Get the password data passed from HomeScreen
  const { password } = route.params;
  
  // State for the form fields - prefill with existing data
  const [title, setTitle] = useState(password.title || '');
  const [username, setUsername] = useState(password.username || '');
  const [passwordText, setPasswordText] = useState(password.password || '');
  const [website, setWebsite] = useState(password.website || '');
  const [category, setCategory] = useState(password.category || 'Personal');
  const [notes, setNotes] = useState(password.notes || '');
  const [loading, setLoading] = useState(false);

  // Predefined categories for organization
  const categories = [
    'Personal',
    'Work', 
    'Social',
    'Banking',
    'Email',
    'Shopping',
    'Entertainment',
    'Other'
  ];

  // Function to handle updating the password
  const handleUpdatePassword = async () => {
    // Basic validation
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for this password');
      return;
    }
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter a username/email');
      return;
    }
    if (!passwordText.trim()) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }

    setLoading(true);

    try {
      // Create updated password object
      const updatedPassword = {
        ...password, // Keep the original ID and timestamps
        title: title.trim(),
        username: username.trim(),
        password: passwordText.trim(),
        website: website.trim(),
        category,
        notes: notes.trim(),
        updatedAt: new Date().toISOString(), // Update the timestamp
      };

      // Update in storage
      const success = await StorageService.updatePassword(updatedPassword);
      
      if (success) {
        Alert.alert(
          'Success', 
          'Password updated successfully!',
          [
            { 
              text: 'OK', 
              onPress: () => navigation.goBack() 
            }
          ]
        );
      } else {
        throw new Error('Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      Alert.alert('Error', 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to generate a random password
  const generateRandomPassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let randomPassword = "";
    
    for (let i = 0; i < length; i++) {
      randomPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    setPasswordText(randomPassword);
  };

  return (
    <View style={styles.container}>
      {/* Header with back button and title */}
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Edit Password" />
      </Appbar.Header>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          
          {/* Title Input */}
          <TextInput
            label="Title *"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
            placeholder="e.g., Facebook, Gmail, Bank Account"
          />
          <HelperText type="info" style={styles.helperText}>
            A name to identify this password
          </HelperText>

          {/* Username/Email Input */}
          <TextInput
            label="Username or Email *"
            value={username}
            onChangeText={setUsername}
            mode="outlined"
            style={styles.input}
            placeholder="your@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          {/* Password Input with Generate Button */}
          <View style={styles.passwordSection}>
            <TextInput
              label="Password *"
              value={passwordText}
              onChangeText={setPasswordText}
              mode="outlined"
              style={[styles.input, styles.passwordInput]}
              secureTextEntry
              placeholder="Enter your password"
              autoCapitalize="none"
            />
            <Button 
              mode="outlined" 
              onPress={generateRandomPassword}
              style={styles.generateButton}
              compact
            >
              Generate
            </Button>
          </View>
          <HelperText type="info" style={styles.helperText}>
            Use the Generate button to create a strong password
          </HelperText>

          {/* Website Input */}
          <TextInput
            label="Website (optional)"
            value={website}
            onChangeText={setWebsite}
            mode="outlined"
            style={styles.input}
            placeholder="https://example.com"
            autoCapitalize="none"
            keyboardType="url"
          />

          {/* Category Selection */}
          <Text style={styles.sectionLabel}>Category</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            <View style={styles.categoriesContainer}>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  mode={category === cat ? "contained" : "outlined"}
                  onPress={() => setCategory(cat)}
                  style={styles.categoryButton}
                  compact
                >
                  {cat}
                </Button>
              ))}
            </View>
          </ScrollView>

          {/* Notes Input */}
          <TextInput
            label="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
            mode="outlined"
            style={[styles.input, styles.notesInput]}
            placeholder="Any additional notes..."
            multiline
            numberOfLines={3}
          />

          {/* Update Button */}
          <Button
            mode="contained"
            onPress={handleUpdatePassword}
            loading={loading}
            disabled={loading}
            style={styles.updateButton}
            icon="content-save-edit"
          >
            Update Password
          </Button>

          {/* Required fields note */}
          <Text style={styles.requiredNote}>
            * Required fields
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

// Styles for the Edit Password screen
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
  passwordSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    marginRight: 8,
  },
  generateButton: {
    height: 50,
    justifyContent: 'center',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
    color: '#333',
  },
  categoriesScroll: {
    marginBottom: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  categoryButton: {
    marginRight: 8,
    marginBottom: 8,
  },
  notesInput: {
    minHeight: 80,
  },
  updateButton: {
    marginTop: 24,
    marginBottom: 16,
    paddingVertical: 8,
    backgroundColor: '#ff9800', // Orange color to differentiate from Add
  },
  helperText: {
    marginTop: -4,
    marginBottom: 12,
  },
  requiredNote: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default EditPasswordScreen;