import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, RefreshControl } from 'react-native';
import { Appbar, Card, Button, FAB, ActivityIndicator, IconButton } from 'react-native-paper';
import * as Clipboard from 'expo-clipboard';
import { useFocusEffect } from '@react-navigation/native';
import StorageService from '../services/StorageService';

const HomeScreen = ({ navigation, theme, toggleTheme, updateActivity, onLogout }) => {
  const [passwords, setPasswords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadPasswords();
      trackActivity();
    }, [])
  );

  const trackActivity = async () => {
    if (updateActivity) {
      await updateActivity();
    }
  };

  const loadPasswords = async () => {
    try {
      setLoading(true);
      const storedPasswords = await StorageService.getAllPasswords();
      setPasswords(storedPasswords);
    } catch (error) {
      console.error('Error loading passwords:', error);
      Alert.alert('Error', 'Failed to load passwords');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPasswords();
  }, []);

  const togglePasswordVisibility = (passwordId) => {
    trackActivity();
    setVisiblePasswords(prev => ({
      ...prev,
      [passwordId]: !prev[passwordId]
    }));
  };

  const handleCopyUsername = async (username) => {
    trackActivity();
    try {
      await Clipboard.setStringAsync(username);
      Alert.alert('Success', 'Username copied to clipboard!');
    } catch (error) {
      console.error('Error copying username:', error);
      Alert.alert('Error', 'Failed to copy username');
    }
  };

  const handleCopyPassword = async (password) => {
    trackActivity();
    try {
      await Clipboard.setStringAsync(password);
      Alert.alert('Success', 'Password copied to clipboard!');
    } catch (error) {
      console.error('Error copying password:', error);
      Alert.alert('Error', 'Failed to copy password');
    }
  };

  const handleViewPassword = (password) => {
    trackActivity();
    Alert.alert(
      password.title,
      `Username: ${password.username}\nPassword: ${password.password}\nWebsite: ${password.website || 'N/A'}\nCategory: ${password.category}`,
      [
        { 
          text: 'Copy Username', 
          onPress: () => handleCopyUsername(password.username) 
        },
        { 
          text: 'Copy Password', 
          onPress: () => handleCopyPassword(password.password) 
        },
        { 
          text: 'Close', 
          style: 'cancel' 
        },
      ]
    );
  };

  const handleEditPassword = (password) => {
    trackActivity();
    navigation.navigate('EditPassword', { password });
  };

  const handleDeletePassword = (password) => {
    trackActivity();
    Alert.alert(
      'Delete Password',
      `Are you sure you want to delete "${password.title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await StorageService.deletePassword(password.id);
              if (success) {
                Alert.alert('Success', 'Password deleted successfully');
                loadPasswords();
              } else {
                throw new Error('Failed to delete password');
              }
            } catch (error) {
              console.error('Error deleting password:', error);
              Alert.alert('Error', 'Failed to delete password');
            }
          },
        },
      ]
    );
  };

  const showPasswordOptions = (password) => {
    trackActivity();
    Alert.alert(
      password.title,
      'Choose an action:',
      [
        {
          text: 'View Details',
          onPress: () => handleViewPassword(password),
        },
        {
          text: 'Edit Password',
          onPress: () => handleEditPassword(password),
        },
        {
          text: 'Delete Password',
          style: 'destructive',
          onPress: () => handleDeletePassword(password),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleAddPassword = () => {
    trackActivity();
    navigation.navigate('AddPassword');
  };

  const handleSettings = () => {
    trackActivity();
    navigation.navigate('Settings');
  };

  const handleLogout = () => {
    trackActivity();
    if (onLogout) {
      onLogout();
    } else {
      // Fallback navigation
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  const renderPasswordItem = ({ item }) => {
    const isVisible = visiblePasswords[item.id];
    
    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="elevated">
        <Card.Content>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: theme.colors.text }]}>{item.title}</Text>
            <View style={styles.buttonsRow}>
              <IconButton
                icon={isVisible ? 'eye-off' : 'eye'}
                iconColor={isVisible ? theme.colors.primary : theme.colors.disabled}
                size={20}
                onPress={() => togglePasswordVisibility(item.id)}
                style={styles.iconButton}
              />
              
              <IconButton
                icon="dots-vertical"
                iconColor={theme.colors.disabled}
                size={20}
                onPress={() => showPasswordOptions(item)}
                style={styles.iconButton}
              />
            </View>
          </View>
          
          <Text style={[styles.username, { color: theme.colors.disabled }]}>{item.username}</Text>
          
          <View style={styles.passwordRow}>
            <Text style={[styles.password, { color: theme.colors.text }]}>
              {isVisible ? item.password : '••••••••'}
            </Text>
          </View>
          
          <View style={styles.footerRow}>
            <View style={[styles.categoryContainer, { backgroundColor: theme.mode === 'dark' ? '#333' : '#e3f2fd' }]}>
              <Text style={[styles.category, { color: theme.mode === 'dark' ? '#bb86fc' : '#1976d2' }]}>
                {item.category}
              </Text>
            </View>
            <Text style={[styles.date, { color: theme.colors.disabled }]}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </Card.Content>
        
        <Card.Actions>
          <Button 
            onPress={() => handleCopyUsername(item.username)}
            mode="outlined"
            compact
            style={[styles.actionButton, { borderColor: theme.colors.primary }]}
            icon="account"
            textColor={theme.colors.primary}
          >
            User
          </Button>
          <Button 
            onPress={() => handleCopyPassword(item.password)}
            mode="outlined"
            compact
            style={[styles.actionButton, { borderColor: theme.colors.primary }]}
            icon="key"
            textColor={theme.colors.primary}
          >
            Password
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
          <Appbar.Content title="LalVault" titleStyle={{ color: theme.colors.text }} />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading your passwords...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.Content title="LalVault" titleStyle={{ color: theme.colors.text }} />
        <Appbar.Action 
          icon="logout" 
          onPress={handleLogout}
          iconColor={theme.colors.text}
        />
        <Appbar.Action 
          icon="cog" 
          onPress={handleSettings}
          iconColor={theme.colors.text}
        />
        <Appbar.Action 
          icon="reload" 
          onPress={loadPasswords}
          iconColor={theme.colors.text}
        />
      </Appbar.Header>

      <View style={[styles.content, { backgroundColor: theme.colors.background }]}>
        {passwords.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No passwords yet</Text>
            <Text style={[styles.emptyText, { color: theme.colors.disabled }]}>
              Add your first password to get started
            </Text>
            <Button 
              mode="contained" 
              onPress={handleAddPassword}
              style={styles.emptyButton}
              buttonColor={theme.colors.primary}
              textColor={theme.colors.surface}
            >
              Add First Password
            </Button>
          </View>
        ) : (
          <FlatList
            data={passwords}
            renderItem={renderPasswordItem}
            keyExtractor={(item) => item.id}
            style={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.colors.primary]}
                tintColor={theme.colors.primary}
                progressBackgroundColor={theme.colors.surface}
              />
            }
          />
        )}
      </View>

      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={handleAddPassword}
        label="Add Password"
        color={theme.colors.surface}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
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
  list: {
    flex: 1,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    margin: 0,
    marginLeft: 4,
  },
  username: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  passwordRow: {
    marginBottom: 12,
  },
  password: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  category: {
    fontSize: 12,
    fontWeight: '600',
  },
  date: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  actionButton: {
    marginRight: 4,
    borderWidth: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyButton: {
    paddingHorizontal: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 50,
  },
});

export default HomeScreen;