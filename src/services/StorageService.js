import * as SecureStore from 'expo-secure-store';

// Key for storing passwords in secure storage
const PASSWORDS_KEY = 'user_passwords';

// Mock initial passwords data - using simple, memorable passwords for testing
const mockPasswords = [
  {
    id: '1',
    title: 'Facebook',
    username: 'john@example.com',
    password: 'facebook123',
    website: 'https://facebook.com',
    category: 'Social',
    notes: 'Personal account',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Gmail',
    username: 'john@gmail.com',
    password: 'gmail456',
    website: 'https://gmail.com',
    category: 'Email',
    notes: 'Primary email account',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Bank of America',
    username: 'john_doe',
    password: 'bank789',
    website: 'https://bankofamerica.com',
    category: 'Banking',
    notes: 'Checking account',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Service class to handle all password storage operations
class StorageService {
  
  // Get all passwords from secure storage
  async getAllPasswords() {
    try {
      // Try to get passwords from secure storage
      const passwordsJson = await SecureStore.getItemAsync(PASSWORDS_KEY);
      
      if (passwordsJson) {
        // If we have stored passwords, parse and return them
        return JSON.parse(passwordsJson);
      } else {
        // If no passwords exist, initialize with mock data
        await this.saveAllPasswords(mockPasswords);
        return mockPasswords;
      }
    } catch (error) {
      console.error('Error getting passwords:', error);
      return [];
    }
  }

  // Save all passwords to secure storage
  async saveAllPasswords(passwords) {
    try {
      const passwordsJson = JSON.stringify(passwords);
      await SecureStore.setItemAsync(PASSWORDS_KEY, passwordsJson);
      return true;
    } catch (error) {
      console.error('Error saving passwords:', error);
      return false;
    }
  }

  // Add a new password
  async addPassword(newPassword) {
    try {
      const passwords = await this.getAllPasswords();
      
      // Create new password object with ID and timestamps
      const passwordToAdd = {
        ...newPassword,
        id: Date.now().toString(), // Simple ID generation
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Add to beginning of array (newest first)
      passwords.unshift(passwordToAdd);
      
      // Save updated list
      await this.saveAllPasswords(passwords);
      return passwordToAdd;
    } catch (error) {
      console.error('Error adding password:', error);
      return null;
    }
  }

  // Update an existing password
  async updatePassword(updatedPassword) {
    try {
      const passwords = await this.getAllPasswords();
      
      // Find and update the password
      const updatedPasswords = passwords.map(password => 
        password.id === updatedPassword.id 
          ? { ...updatedPassword, updatedAt: new Date().toISOString() }
          : password
      );
      
      // Save updated list
      await this.saveAllPasswords(updatedPasswords);
      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      return false;
    }
  }

  // Delete a password by ID
  async deletePassword(passwordId) {
    try {
      const passwords = await this.getAllPasswords();
      
      // Filter out the password to delete
      const updatedPasswords = passwords.filter(
        password => password.id !== passwordId
      );
      
      // Save updated list
      await this.saveAllPasswords(updatedPasswords);
      return true;
    } catch (error) {
      console.error('Error deleting password:', error);
      return false;
    }
  }
}

// Create and export a single instance of the service
export default new StorageService();