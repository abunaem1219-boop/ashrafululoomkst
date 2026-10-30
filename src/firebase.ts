import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

export const firebaseConfig = {
  apiKey: "AIzaSyBXBgFGqDyPiE6ZVER249FA0a91ukICO_U",
  authDomain: "ashraful-uloom-madrasa.firebaseapp.com",
  databaseURL: "https://ashraful-uloom-madrasa-default-rtdb.firebaseio.com",
  projectId: "ashraful-uloom-madrasa",
  storageBucket: "ashraful-uloom-madrasa.firebasestorage.app",
  messagingSenderId: "180777617285",
  appId: "1:180777617285:web:f4ab13a6a2aa0d6cda66ec"
};

// Singleton initialization
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Designated Admin UID by User
export const DESIGNATED_ADMIN_UID = "6m20RVo55GUWBL0gQrehsx8RsOF3";
