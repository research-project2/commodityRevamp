import React, { createContext, useState, useCallback } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, database } from '../firebase/index';

export const AuthContext = createContext({
  isLoggedIn: false,
  user: null,
  loading: false,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Helper function untuk validasi email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Login dengan Firebase
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      // Validasi input
      if (!email || !password) {
        throw new Error('Email dan password harus diisi');
      }

      if (!validateEmail(email)) {
        throw new Error('Format email tidak valid');
      }

      if (password.length < 6) {
        throw new Error('Password minimal 6 karakter');
      }

      // Login ke Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || email.split('@')[0],
        displayName: firebaseUser.displayName || email.split('@')[0],
        photoURL: firebaseUser.photoURL,
        loginTime: new Date(),
      };

      setUser(userData);
      setIsLoggedIn(true);
      setLoading(false);

      return { success: true, user: userData };
    } catch (error) {
      setLoading(false);
      let errorMessage = 'Login gagal';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Email tidak terdaftar';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Password salah';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Format email tidak valid';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'Akun ini telah dinonaktifkan';
      } else {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    }
  }, []);

  // Signup dengan Firebase
  const signup = useCallback(async (displayName, email, password, confirmPassword) => {
    try {
      setLoading(true);
      // Validasi input
      if (!displayName || !email || !password || !confirmPassword) {
        throw new Error('Semua field harus diisi');
      }

      if (!validateEmail(email)) {
        throw new Error('Format email tidak valid');
      }

      if (password !== confirmPassword) {
        throw new Error('Password tidak cocok');
      }

      if (password.length < 6) {
        throw new Error('Password minimal 6 karakter');
      }

      // Buat akun di Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update profile dengan display name
      await updateProfile(firebaseUser, {
        displayName: displayName,
      });

      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: displayName,
        displayName: displayName,
        photoURL: firebaseUser.photoURL,
        signupTime: new Date().toISOString(),
      };

      // Simpan data user ke Firebase Realtime Database di node "users"
      await set(ref(database, `users/${firebaseUser.uid}`), userData);
      console.log('User data saved to database:', firebaseUser.uid);

      // Logout segera setelah signup agar user harus sign in manual
      await signOut(auth);

      setLoading(false);

      return { success: true, user: userData };
    } catch (error) {
      setLoading(false);
      let errorMessage = 'Registrasi gagal';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email sudah terdaftar';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Format email tidak valid';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password tidak cukup kuat';
      } else {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setUser(null);
      setIsLoggedIn(false);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  }, []);

  const value = {
    isLoggedIn,
    user,
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
