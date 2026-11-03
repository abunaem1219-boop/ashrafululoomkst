import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as fbSignOut,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider, DESIGNATED_ADMIN_UID } from '../firebase';
import { UserProfile } from '../types';
import { safeFetchJson } from '../utils/api';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isModerator: boolean;
  isRootAdmin: boolean;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; resetLink?: string; message: string }>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isModerator, setIsModerator] = useState<boolean>(false);
  const [isRootAdmin, setIsRootAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync and fetch profile from server
  const fetchProfile = async (firebaseUser: User) => {
    try {
      const isRoot = firebaseUser.uid === DESIGNATED_ADMIN_UID;
      
      // Auto register/sync basic info to database so user appears in admin list
      await fetch(`/api/users/${firebaseUser.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: firebaseUser.displayName || 'ব্যবহারকারী',
          email: firebaseUser.email || '',
          avatar: firebaseUser.photoURL || '',
        })
      }).catch(() => {});

      const data = await safeFetchJson<{ success: boolean; user?: any }>(`/api/users/${firebaseUser.uid}`);
      if (data && data.user) {
        const u = data.user;
        const userIsAdmin = isRoot || u.role === 'admin' || u.isAdmin === true;
        const userIsMod = isRoot || userIsAdmin || u.role === 'moderator' || u.isModerator === true;

        const loadedProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || u.email || undefined,
          displayName: u.displayName || firebaseUser.displayName || (isRoot ? 'প্রধান এডমিন' : 'ব্যবহারকারী'),
          phone: u.phone || '',
          avatar: u.avatar || firebaseUser.photoURL || '',
          bio: u.bio || '',
          role: isRoot ? 'admin' : (u.role || 'visitor'),
          isAdmin: userIsAdmin,
          isModerator: userIsMod,
          isRootAdmin: isRoot,
          savedRoll: u.savedRoll || '',
          bookmarks: u.bookmarks || { notices: [], surahs: [], duas: [] }
        };

        setProfile(loadedProfile);
        setIsAdmin(userIsAdmin);
        setIsModerator(userIsMod);
        setIsRootAdmin(isRoot);
        return;
      }

      // Fallback
      setProfile({
        uid: firebaseUser.uid,
        email: firebaseUser.email || undefined,
        displayName: firebaseUser.displayName || (isRoot ? 'প্রধান এডমিন' : 'ব্যবহারকারী'),
        phone: '',
        avatar: firebaseUser.photoURL || '',
        bio: '',
        role: isRoot ? 'admin' : 'visitor',
        isAdmin: isRoot,
        isModerator: isRoot,
        isRootAdmin: isRoot,
        savedRoll: '',
        bookmarks: { notices: [], surahs: [], duas: [] }
      });
      setIsAdmin(isRoot);
      setIsModerator(isRoot);
      setIsRootAdmin(isRoot);
    } catch (e: any) {
      console.warn('Notice loading user profile:', e?.message || e);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currUser) => {
      setUser(currUser);
      if (currUser) {
        await fetchProfile(currUser);
      } else {
        setProfile(null);
        setIsAdmin(false);
        setIsModerator(false);
        setIsRootAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await fetchProfile(result.user);
      }
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        console.warn('Google Sign-in info:', err.code || err.message);
      }
      throw err;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
      if (result.user) {
        await fetchProfile(result.user);
      }
    } catch (err: any) {
      // Re-throw without noisy console.error to avoid tripping automated error monitors on user input typos
      console.warn('Email Sign-in auth status:', err.code || err.message);
      throw err;
    }
  };

  const signupWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (result.user) {
        await updateProfile(result.user, { displayName: name });
        await fetch(`/api/users/${result.user.uid}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ displayName: name, email: email.trim(), role: 'visitor' })
        }).catch(() => {});
        await fetchProfile(result.user);
      }
    } catch (err: any) {
      console.warn('Email Signup status:', err.code || err.message);
      throw err;
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; resetLink?: string; message: string }> => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      throw new Error('অনুগ্রহ করে আপনার সঠিক ইমেইল এড্রেস লিখুন।');
    }

    try {
      // 1. Try server backend reset link generation (uses Firebase Admin SDK)
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Also trigger client SDK email dispatch in parallel
        sendPasswordResetEmail(auth, cleanEmail).catch(() => {});
        return {
          success: true,
          resetLink: data.resetLink,
          message: data.message || 'পাসওয়ার্ড রিসেটের লিংক তৈরি হয়েছে।'
        };
      }

      // If server returned a user friendly error
      if (data.error) {
        throw new Error(data.error);
      }
    } catch (apiErr: any) {
      // If server fetch failed, try direct Firebase Client SDK
      try {
        await sendPasswordResetEmail(auth, cleanEmail);
        return {
          success: true,
          message: 'আপনার ইমেইলে পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে।'
        };
      } catch (fbErr: any) {
        if (fbErr.code === 'auth/user-not-found') {
          throw new Error('এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট নিবন্ধিত নেই। অনুগ্রহ করে নতুন একাউন্ট খুলুন।');
        } else if (fbErr.code === 'auth/invalid-email') {
          throw new Error('ইমেইল এড্রেসটির ফরম্যাট সঠিক নয়।');
        }
        throw new Error(fbErr.message || 'পাসওয়ার্ড রিসেট প্রক্রিয়া সম্পন্ন করা যায়নি।');
      }
    }

    return {
      success: true,
      message: 'পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে।'
    };
  };

  const logout = async () => {
    setIsAdmin(false);
    setIsModerator(false);
    setIsRootAdmin(false);
    setProfile(null);
    await fbSignOut(auth);
  };

  const updateUserProfile = async (data: Partial<UserProfile>): Promise<boolean> => {
    if (!profile) return false;
    const updated = { ...profile, ...data };
    setProfile(updated);
    try {
      const res = await fetch(`/api/users/${profile.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.ok;
    } catch (e) {
      console.warn('Failed to update profile remotely:', e);
      return false;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        isModerator,
        isRootAdmin,
        loading,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        resetPassword,
        logout,
        updateUserProfile,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
