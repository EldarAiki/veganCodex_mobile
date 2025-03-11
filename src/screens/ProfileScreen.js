import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = () => {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <Text style={styles.username}>{user?.username || 'User'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>
      
      <Button
        mode="contained"
        onPress={logout}
        style={styles.logoutButton}
      >
        Logout
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  userInfo: {
    alignItems: 'center',
    marginVertical: 20,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  logoutButton: {
    marginTop: 20,
  },
});

export default ProfileScreen; 