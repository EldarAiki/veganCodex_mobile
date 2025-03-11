import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, Button, Title, Snackbar, Portal, Modal, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

const WelcomeScreen = ({ navigation }) => {
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [showRegister, setShowRegister] = useState(false);
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [registerUsername, setRegisterUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { login, register, error } = useAuth();
  const [showError, setShowError] = useState(false);

  const handleLogin = async () => {
    const success = await login({ email, password });
    if (success) {
      navigation.replace('Explorer');
    } else {
      setShowError(true);
    }
  };

  const handleRegister = async () => {
    if (registerPassword !== confirmPassword) {
      setShowError(true);
      return;
    }

    const success = await register({
      email: registerEmail,
      password: registerPassword,
      username: registerUsername,
    });

    if (success) {
      setShowRegister(false);
      navigation.replace('Explorer');
    } else {
      setShowError(true);
    }
  };

  const handleGuestMode = () => {
    navigation.replace('Explorer', { isGuest: true });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Title style={styles.title}>VeganCodex</Title>

      {!showRegister ? (
        // Login Form
        <View style={styles.form}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            style={styles.input}
            secureTextEntry={!showPassword}
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off" : "eye"}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />
          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.button}
            disabled={!email || !password}
          >
            Login
          </Button>
          <Button
            mode="outlined"
            onPress={() => setShowRegister(true)}
            style={styles.button}
          >
            Create Account
          </Button>
          <Button
            mode="text"
            onPress={handleGuestMode}
            style={styles.button}
          >
            Continue as Guest
          </Button>
        </View>
      ) : (
        // Register Form
        <View style={styles.form}>
          <TextInput
            label="Username"
            value={registerUsername}
            onChangeText={setRegisterUsername}
            mode="outlined"
            style={styles.input}
            autoCapitalize="none"
          />
          <TextInput
            label="Email"
            value={registerEmail}
            onChangeText={setRegisterEmail}
            mode="outlined"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            label="Password"
            value={registerPassword}
            onChangeText={setRegisterPassword}
            mode="outlined"
            style={styles.input}
            secureTextEntry={!showRegisterPassword}
            right={
              <TextInput.Icon
                icon={showRegisterPassword ? "eye-off" : "eye"}
                onPress={() => setShowRegisterPassword(!showRegisterPassword)}
              />
            }
          />
          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            style={styles.input}
            secureTextEntry={!showConfirmPassword}
            right={
              <TextInput.Icon
                icon={showConfirmPassword ? "eye-off" : "eye"}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            }
          />
          <Button
            mode="contained"
            onPress={handleRegister}
            style={styles.button}
            disabled={!registerEmail || !registerPassword || !registerUsername || !confirmPassword}
          >
            Register
          </Button>
          <Button
            mode="outlined"
            onPress={() => setShowRegister(false)}
            style={styles.button}
          >
            Back to Login
          </Button>
        </View>
      )}

      <Snackbar
        visible={showError}
        onDismiss={() => setShowError(false)}
        duration={3000}
      >
        {error || 'An error occurred'}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
    color: '#4CAF50',
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: 'white',
  },
  button: {
    marginTop: 8,
    backgroundColor: '#4CAF50',
  },
});

export default WelcomeScreen; 