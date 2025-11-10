import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { 
  TextInput, 
  Button, 
  Appbar, 
  Text,
  HelperText 
} from 'react-native-paper';
import StorageService from '../services/StorageService';

const AddPasswordScreen = ({ navigation, theme, toggleTheme, updateActivity }) => {
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [website, setWebsite] = useState('');
  const [category, setCategory] = useState('Personal');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleSavePassword = async () => {
    updateActivity && updateActivity();
    
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for this password');
      return;
    }
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter a username/email');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }

    setLoading(true);

    try {
      const newPassword = {
        title: title.trim(),
        username: username.trim(),
        password: password.trim(),
        website: website.trim(),
        category,
        notes: notes.trim(),
      };

      const savedPassword = await StorageService.addPassword(newPassword);
      
      if (savedPassword) {
        Alert.alert(
          'Success', 
          'Password saved successfully!',
          [
            { 
              text: 'OK', 
              onPress: () => navigation.goBack() 
            }
          ]
        );
      } else {
        throw new Error('Failed to save password');
      }
    } catch (error) {
      console.error('Error saving password:', error);
      Alert.alert('Error', 'Failed to save password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateRandomPassword = () => {
    updateActivity && updateActivity();
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let randomPassword = "";
    
    for (let i = 0; i < length; i++) {
      randomPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    setPassword(randomPassword);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Add New Password" titleStyle={{ color: theme.colors.text }} />
      </Appbar.Header>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          
          <TextInput
            label="Title *"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
            placeholder="e.g., Facebook, Gmail, Bank Account"
            theme={{ colors: { primary: theme.colors.primary } }}
          />
          <HelperText type="info" style={styles.helperText}>
            A name to identify this password
          </HelperText>

          <TextInput
            label="Username or Email *"
            value={username}
            onChangeText={setUsername}
            mode="outlined"
            style={styles.input}
            placeholder="your@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
            theme={{ colors: { primary: theme.colors.primary } }}
          />

          <View style={styles.passwordSection}>
            <TextInput
              label="Password *"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              style={[styles.input, styles.passwordInput]}
              secureTextEntry
              placeholder="Enter your password"
              autoCapitalize="none"
              theme={{ colors: { primary: theme.colors.primary } }}
            />
            <Button 
              mode="outlined" 
              onPress={generateRandomPassword}
              style={styles.generateButton}
              compact
              textColor={theme.colors.primary}
            >
              Generate
            </Button>
          </View>
          <HelperText type="info" style={styles.helperText}>
            Use the Generate button to create a strong password
          </HelperText>

          <TextInput
            label="Website (optional)"
            value={website}
            onChangeText={setWebsite}
            mode="outlined"
            style={styles.input}
            placeholder="https://example.com"
            autoCapitalize="none"
            keyboardType="url"
            theme={{ colors: { primary: theme.colors.primary } }}
          />

          <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Category</Text>
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
                  onPress={() => {
                    updateActivity && updateActivity();
                    setCategory(cat);
                  }}
                  style={styles.categoryButton}
                  compact
                  buttonColor={category === cat ? theme.colors.primary : undefined}
                  textColor={category === cat ? theme.colors.surface : theme.colors.primary}
                >
                  {cat}
                </Button>
              ))}
            </View>
          </ScrollView>

          <TextInput
            label="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
            mode="outlined"
            style={[styles.input, styles.notesInput]}
            placeholder="Any additional notes..."
            multiline
            numberOfLines={3}
            theme={{ colors: { primary: theme.colors.primary } }}
          />

          <Button
            mode="contained"
            onPress={handleSavePassword}
            loading={loading}
            disabled={loading}
            style={styles.saveButton}
            icon="content-save"
            buttonColor={theme.colors.primary}
            textColor={theme.colors.surface}
          >
            Save Password
          </Button>

          <Text style={[styles.requiredNote, { color: theme.colors.disabled }]}>
            * Required fields
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
  form: {
    padding: 20,
  },
  input: {
    marginBottom: 8,
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
  saveButton: {
    marginTop: 24,
    marginBottom: 16,
    paddingVertical: 8,
  },
  helperText: {
    marginTop: -4,
    marginBottom: 12,
  },
  requiredNote: {
    textAlign: 'center',
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default AddPasswordScreen;