import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Modal } from 'react-native';
import Toast from 'react-native-toast-message';
import { AuthContext } from '../../context/SimpleAuthContext';
import { SVGEyeon, SVGEyeoff } from '../../assets/icons';
const GREEN = '#1ABC9C';

export default function SignInScreen({ navigation, route }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showEmailNotFoundModal, setShowEmailNotFoundModal] = useState(false);
  const [showPasswordWrongModal, setShowPasswordWrongModal] = useState(false);
  const [showPasswordEmptyModal, setShowPasswordEmptyModal] = useState(false);
  const [showEmailEmptyModal, setShowEmailEmptyModal] = useState(false);
  const [showBothEmptyModal, setShowBothEmptyModal] = useState(false);
  const [showCredentialsWrongModal, setShowCredentialsWrongModal] = useState(false);

  // Tampilkan modal ketika berhasil membuat akun
  useEffect(() => {
    if (route?.params?.signupSuccess === true) {
      setShowSuccessModal(true);
      // Clear params
      navigation.setParams({ signupSuccess: false });
      
      // Auto-close modal setelah 3 detik
      const timer = setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [route?.params?.signupSuccess, navigation]);

  // Auto-close email not found modal setelah 3 detik
  useEffect(() => {
    if (showEmailNotFoundModal) {
      const timer = setTimeout(() => {
        setShowEmailNotFoundModal(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showEmailNotFoundModal]);

  // Auto-close password wrong modal setelah 3 detik
  useEffect(() => {
    if (showPasswordWrongModal) {
      const timer = setTimeout(() => {
        setShowPasswordWrongModal(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showPasswordWrongModal]);

  // Auto-close password empty modal setelah 3 detik
  useEffect(() => {
    if (showPasswordEmptyModal) {
      const timer = setTimeout(() => {
        setShowPasswordEmptyModal(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showPasswordEmptyModal]);

  // Auto-close email empty modal setelah 3 detik
  useEffect(() => {
    if (showEmailEmptyModal) {
      const timer = setTimeout(() => {
        setShowEmailEmptyModal(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showEmailEmptyModal]);

  // Auto-close both empty modal setelah 3 detik
  useEffect(() => {
    if (showBothEmptyModal) {
      const timer = setTimeout(() => {
        setShowBothEmptyModal(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showBothEmptyModal]);

  // Auto-close credentials wrong modal setelah 3 detik
  useEffect(() => {
    if (showCredentialsWrongModal) {
      const timer = setTimeout(() => {
        setShowCredentialsWrongModal(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showCredentialsWrongModal]);

  const handleSignIn = async () => {
    // Clear previous errors
    setEmailError('');
    setPasswordError('');

    // Validation: Check if email or password is empty
    const emailTrimmed = email.trim();
    const passwordTrimmed = password.trim();

    if (!emailTrimmed && !passwordTrimmed) {
      setShowBothEmptyModal(true);
      return;
    }

    if (!emailTrimmed) {
      setEmailError('Email harus diisi');
      setShowEmailEmptyModal(true);
      return;
    }

    if (!passwordTrimmed) {
      setPasswordError('Password harus diisi');
      setShowPasswordEmptyModal(true);
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      Toast.show({
        type: 'success',
        text1: 'Login Berhasil',
        text2: `Selamat datang kembali, ${result.user.name}!`,
        duration: 3000,
      });
      // Navigation akan otomatis ke Home karena isLoggedIn berubah menjadi true
    } else {
      // Parse error and set specific error messages
      const errorMessage = result.error ? result.error.toLowerCase() : '';
      
      console.log('Login Error:', result.error); // Debug log
      
      // Check for email not found/not registered errors
      if (
        errorMessage.includes('email') || 
        errorMessage.includes('tidak terdaftar') ||
        errorMessage.includes('user-not-found') ||
        errorMessage.includes('user not found')
      ) {
        setEmailError('Email tidak sesuai');
        setShowEmailNotFoundModal(true);
      } 
      // Check for password wrong/incorrect errors
      else if (
        errorMessage.includes('password') || 
        errorMessage.includes('salah') ||
        errorMessage.includes('wrong-password') ||
        errorMessage.includes('wrong password') ||
        errorMessage.includes('incorrect')
      ) {
        setPasswordError('Password tidak sesuai');
        setShowPasswordWrongModal(true);
      } 
      // Fallback for other credential-related errors
      else if (result.error) {
        // Show credentials wrong modal for generic login failures
        setShowCredentialsWrongModal(true);
      } else {
        // Fallback: Show error toast if no error message
        Toast.show({
          type: 'error',
          text1: 'Login Gagal',
          text2: 'Terjadi kesalahan. Silakan coba lagi.',
          duration: 3000,
        });
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

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalEmoji}>🎉</Text>
            <Text style={styles.modalTitle}>Akun Berhasil Dibuat!</Text>
            <Text style={styles.modalSubtitle}>
              Silakan login dengan akun Anda untuk melanjutkan.
            </Text>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.modalButtonText}>Mengerti</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Email Not Found Modal */}
      <Modal
        visible={showEmailNotFoundModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEmailNotFoundModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalEmoji}>❌</Text>
            <Text style={styles.modalTitle}>Email Tidak Ditemukan</Text>
            <Text style={styles.modalSubtitle}>
              Email belum terdaftar. Silakan buat akun terlebih dahulu.
            </Text>
            <TouchableOpacity 
              style={[styles.modalButton, { marginBottom: 8 }]}
              onPress={() => setShowEmailNotFoundModal(false)}
            >
              <Text style={styles.modalButtonText}>Coba Lagi</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalButtonSecondary]}
              onPress={() => {
                setShowEmailNotFoundModal(false);
                navigation.navigate('SignUp');
              }}
            >
              <Text style={styles.modalButtonSecondaryText}>Buat Akun Baru</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Password Wrong Modal */}
      <Modal
        visible={showPasswordWrongModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPasswordWrongModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalEmoji}>🔒</Text>
            <Text style={styles.modalTitle}>Password Salah</Text>
            <Text style={styles.modalSubtitle}>
              Password yang Anda masukkan tidak sesuai. Silakan coba lagi.
            </Text>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setShowPasswordWrongModal(false)}
            >
              <Text style={styles.modalButtonText}>Mengerti</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Password Empty Modal */}
      <Modal
        visible={showPasswordEmptyModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPasswordEmptyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalEmoji}>⚠️</Text>
            <Text style={styles.modalTitle}>Password Harus Diisi</Text>
            <Text style={styles.modalSubtitle}>
              Email Anda terdaftar tetapi password masih kosong. Silakan masukkan password Anda.
            </Text>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setShowPasswordEmptyModal(false)}
            >
              <Text style={styles.modalButtonText}>Mengerti</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Email Empty Modal */}
      <Modal
        visible={showEmailEmptyModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEmailEmptyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalEmoji}>⚠️</Text>
            <Text style={styles.modalTitle}>Email Harus Diisi</Text>
            <Text style={styles.modalSubtitle}>
              Silakan masukkan email Anda untuk melanjutkan login.
            </Text>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setShowEmailEmptyModal(false)}
            >
              <Text style={styles.modalButtonText}>Mengerti</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Both Empty Modal */}
      <Modal
        visible={showBothEmptyModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBothEmptyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalEmoji}>⚠️</Text>
            <Text style={styles.modalTitle}>Email dan Password Harus Diisi</Text>
            <Text style={styles.modalSubtitle}>
              Silakan masukkan email dan password Anda untuk melanjutkan login.
            </Text>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setShowBothEmptyModal(false)}
            >
              <Text style={styles.modalButtonText}>Mengerti</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Credentials Wrong Modal */}
      <Modal
        visible={showCredentialsWrongModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCredentialsWrongModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalEmoji}>❌</Text>
            <Text style={styles.modalTitle}>Email atau Password Salah</Text>
            <Text style={styles.modalSubtitle}>
              Kombinasi email dan password yang Anda masukkan tidak sesuai. Silakan periksa kembali dan coba lagi.
            </Text>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setShowCredentialsWrongModal(false)}
            >
              <Text style={styles.modalButtonText}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: GREEN,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    width: '100%',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalButtonSecondary: {
    backgroundColor: '#f0f0f0',
  },
  modalButtonSecondaryText: {
    color: GREEN,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
