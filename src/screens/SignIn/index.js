import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { AuthContext } from '../../context/SimpleAuthContext';
import { SVGEyeon, SVGEyeoff } from '../../assets/icons';
const GREEN = '#1ABC9C';

export default function SignInScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSignIn = async () => {
    // Clear previous errors
    setEmailError('');
    setPasswordError('');

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      Alert.alert('Success', `Welcome, ${result.user.name}!`);
    } else {
      // Parse error and set specific error messages
      const errorMessage = result.error.toLowerCase();
      
      if (errorMessage.includes('email') || errorMessage.includes('tidak terdaftar')) {
        setEmailError('Email tidak sesuai');
      } else if (errorMessage.includes('password') || errorMessage.includes('salah')) {
        setPasswordError('Password tidak sesuai');
      } else {
        // For other errors, show in alert
        Alert.alert('Login Gagal', result.error);
      }
    }
  };

  // Clear email error when user types
  const handleEmailChange = (text) => {
    setEmail(text);
    if (emailError) setEmailError('');
  };

  // Clear password error when user types
  const handlePasswordChange = (text) => {
    setPassword(text);
    if (passwordError) setPasswordError('');
  };

  return (
    <View style={styles.container}>
      {/* back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      {/* title */}
      <Text style={styles.title}>
        <Text style={styles.titleBlack}>Sign </Text>
        <Text style={styles.titleGreen}>In</Text>
      </Text>

      {/* subtitle */}
      <Text style={styles.subtitle}>Welcome back! let's sign in to your account.</Text>

      {/* email input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, emailError && styles.inputError]}
          placeholder="Enter your email here"
          placeholderTextColor="#999"
          value={email}
          onChangeText={handleEmailChange}
          keyboardType="email-address"
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
      </View>

      {/* password input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <View style={[styles.passwordInputWrapper, passwordError && styles.passwordInputError]}>
          <TextInput
            style={styles.passwordInput}
            placeholder="••••••••"
            placeholderTextColor="#999"
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIconContainer}>
            {showPassword ? 
              <SVGEyeon width={20} height={20} /> 
              : 
              <SVGEyeoff width={20} height={20} />
            }
          </TouchableOpacity>
        </View>
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
      </View>

      {/* sign in button */}
      <TouchableOpacity
        style={[styles.signInButton, loading && styles.buttonDisabled]}
        onPress={handleSignIn}
        disabled={loading}
      >
        <Text style={styles.signInButtonText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
      </TouchableOpacity>

      {/* sign up link */}
      <View style={styles.signUpContainer}>
        <Text style={styles.signUpText}>Doesn't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.signUpLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      {/* spacer */}
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 24,
    color: '#000',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  titleBlack: {
    color: '#000',
  },
  titleGreen: {
    color: GREEN,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    fontSize: 14,
    color: '#000',
    paddingHorizontal: 0,
  },
  inputError: {
    borderColor: '#E74C3C',
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    height: 48,
  },
  passwordInputError: {
    borderColor: '#E74C3C',
  },
  passwordInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    paddingHorizontal: 0,
  },
  eyeIconContainer: {
    padding: 8,
    marginLeft: 8,
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 6,
    marginLeft: 4,
  },
  eyeIcon: {
    width: 20,
    height: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    fontSize: 18,
    marginRight: 6,
  },
  rememberMeText: {
    fontSize: 13,
    color: '#333',
    marginLeft: 8,
  },
  forgotLink: {
    fontSize: 13,
    color: GREEN,
    fontWeight: '500',
  },
  signInButton: {
    height: 48,
    backgroundColor: GREEN,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 13,
    color: '#666',
  },
  signUpLink: {
    fontSize: 13,
    color: GREEN,
    fontWeight: '600',
  },
  spacer: {
    flex: 1,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 13,
    color: '#999',
  },
  contactUsLink: {
    fontSize: 13,
    color: GREEN,
    fontWeight: '600',
  },
});
