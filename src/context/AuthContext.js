// @ts-check
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../firebase/index'
import React, { createContext, useEffect, useState, useCallback } from 'react'

/**
 * @typedef {{
 *  uid: string,
 *  email: string,
 *  displayName: string | null,
 *  photoURL: string | null,
 *  isLoggedIn: boolean,
 * }} UserProfile
 */

/** @type {ReturnType<typeof createContext<{user: UserProfile | null, logout: () => Promise<void>, loading: boolean}>>} */
export const AuthContext = createContext({
  user: /** @type {UserProfile | null} */ (null),
  logout: async () => {},
  loading: false,
})

/** @param {{children: React.ReactNode}} param */
export const AuthProvider = ({ children }) => {
  /** @type {[UserProfile | null, React.Dispatch<React.SetStateAction<UserProfile | null>>]} */
  const [user, setUser] = useState(/** @type {UserProfile | null} */(null))
  
  /** @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]} */
  const [loading, setLoading] = useState(true)

  // Monitor Firebase auth state
  useEffect(() => {
    console.log('[AuthContext] component mounted!')

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('[AuthContext] onAuthStateChanged:', firebaseUser?.uid)
      
      if (firebaseUser) {
        // User login
        const userProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || null,
          photoURL: firebaseUser.photoURL || null,
          isLoggedIn: true,
        }
        setUser(userProfile)
      } else {
        // User logout
        setUser(null)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Logout function
  const logout = useCallback(async () => {
    try {
      await signOut(auth)
      setUser(null)
      console.log('[AuthContext] logout success')
    } catch (error) {
      console.error('[AuthContext] logout error:', error)
      throw error
    }
  }, [])

  const value = {
    user,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>
    {children}
  </AuthContext.Provider>
}
