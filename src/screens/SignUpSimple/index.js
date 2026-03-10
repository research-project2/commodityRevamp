import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { AuthContext } from '../../context/SimpleAuthContext';
import { SVGEyeon, SVGEyeoff } from '../../assets/icons';

const GREEN = '#1ABC9C';

export default function SignUp({ navigation }) {
  const { signup } = useContext(AuthContext);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setLoading(true);
    const result = await signup(displayName, email, password, confirmPassword);
    setLoading(false);

    if (result.success) {
      Alert.alert('Success', `Account created for ${result.user.name}!`, [
        {
          text: 'Go to Sign In',
            onPress: () => navigation.navigate('SignIn'),
          },
        
    ]);
    } else {
      Alert.alert('Signup Failed', result.error);
    }
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
        <Text style={styles.titleGreen}>Up</Text>
      </Text>

      {/* subtitle */}
      <Text style={styles.subtitle}>Create a new account to get started.</Text>

      {/* name input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          placeholderTextColor="#999"
          value={displayName}
          onChangeText={setDisplayName}
        />
      </View>

      {/* email input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email here"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
      </View>

      {/* password input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordInputWrapper}>
          <TextInput
            style={styles.passwordInput}
            placeholder="••••••••"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
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
      </View>

      {/* confirm password input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.passwordInputWrapper}>
          <TextInput
            style={styles.passwordInput}
            placeholder="••••••••"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIconContainer}>
            {showConfirmPassword ? 
              <SVGEyeon width={20} height={20} /> 
              : 
              <SVGEyeoff width={20} height={20} />
            }
          </TouchableOpacity>
        </View>
      </View>

      {/* sign up button */}
      <TouchableOpacity
        style={[styles.signUpButton, loading && styles.buttonDisabled]}
        onPress={handleSignUp}
        disabled={loading}
      >
        <Text style={styles.signUpButtonText}>{loading ? 'Signing up...' : 'Sign Up'}</Text>
      </TouchableOpacity>

      {/* sign in link */}
      <View style={styles.signInContainer}>
        <Text style={styles.signInText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
          <Text style={styles.signInLink}>Sign In</Text>
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
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    height: 48,
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
  signUpButton: {
    height: 48,
    backgroundColor: GREEN,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 24,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    fontSize: 13,
    color: '#666',
  },
  signInLink: {
    fontSize: 13,
    color: GREEN,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
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
