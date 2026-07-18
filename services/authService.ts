import { 
  doc, 
  setDoc, 
  serverTimestamp as firestoreTimestamp 
} from 'firebase/firestore';
import {
  ref,
  set,
  serverTimestamp as rtdbTimestamp
} from 'firebase/database';
import { signInWithPopup, User as FirebaseUser } from 'firebase/auth';
import { db, rtdb, auth, googleProvider } from '../firebase';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface UserProfile {
  uid: string;
  id?: number;
  firstName: string;
  name: string;
  username?: string;
  photoUrl?: string;
  provider: 'telegram' | 'google' | 'guest';
  role?: 'user' | 'admin';
  isPremium?: boolean;
  email?: string;
}

class AuthService {
  private currentUser: UserProfile | null = null;

  /**
   * Pure function to create a local user profile from Telegram data.
   * This is synchronous and instant.
   */
  createLocalProfile(tgUser: TelegramUser): UserProfile {
    const userId = String(tgUser.id);
    const profile: UserProfile = {
      uid: `tg_${userId}`,
      id: tgUser.id,
      firstName: tgUser.first_name || 'Neural',
      name: `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim() || 'Neural User',
      username: tgUser.username,
      photoUrl: tgUser.photo_url,
      provider: 'telegram',
      role: 'user',
      isPremium: tgUser.is_premium || false
    };
    
    this.currentUser = profile;
    localStorage.setItem('betlify_user', JSON.stringify(profile));
    console.log("Local profile created and stored in localStorage:", userId);
    return profile;
  }

  /**
   * Non-blocking background sync to Firebase.
   * This should be called after the UI is already loaded.
   */
  async syncUserToFirebase(profile: UserProfile, tgUser: TelegramUser): Promise<void> {
    const userId = String(tgUser.id);
    console.log("Starting background Firebase sync for user:", userId);

    const baseDetails = {
      userId: userId,
      firstName: tgUser.first_name || 'Neural',
      lastName: tgUser.last_name || null,
      username: tgUser.username || null,
      languageCode: tgUser.language_code || null,
      isPremium: tgUser.is_premium || false,
      photoUrl: tgUser.photo_url || null,
      source: "telegram_mini_app",
      status: "active",
      platform: "telegram",
      lastSeen: firestoreTimestamp()
    };

    try {
      // 1. Sync to Firestore (telegramusers/{userId})
      const firestoreRef = doc(db, 'telegramusers', userId);
      await setDoc(firestoreRef, {
        ...baseDetails,
        updatedAt: firestoreTimestamp()
      }, { merge: true });
      console.log("Firestore sync successful for user:", userId);

      // 2. Sync to Realtime Database (telegramUsers/{userId})
      const rtdbRef = ref(rtdb, `telegramUsers/${userId}`);
      await set(rtdbRef, { 
        ...baseDetails,
        lastSeen: rtdbTimestamp(),
        updatedAt: rtdbTimestamp()
      });
      console.log("RTDB sync successful for user:", userId);
    } catch (error) {
      console.error("Firebase sync failed (non-blocking):", error);
    }
  }

  getCurrentUser(): UserProfile | null {
    if (!this.currentUser) {
      const stored = localStorage.getItem('betlify_user');
      if (stored) {
        try {
          this.currentUser = JSON.parse(stored);
        } catch (e) {
          console.warn("Failed to parse stored user in authService", e);
        }
      }
    }
    return this.currentUser;
  }

  async logout() {
    this.currentUser = null;
    localStorage.removeItem('betlify_user');
    await auth.signOut();
    console.log("User logged out locally and from Firebase.");
  }

  async signInWithGoogle(): Promise<UserProfile> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const profile: UserProfile = {
        uid: user.uid,
        firstName: user.displayName?.split(' ')[0] || 'User',
        name: user.displayName || 'Google User',
        photoUrl: user.photoURL || undefined,
        provider: 'google',
        role: 'user',
        email: user.email || undefined
      };
      
      this.currentUser = profile;
      localStorage.setItem('betlify_user', JSON.stringify(profile));
      
      // Background sync for Google users too
      this.syncGoogleUserToFirebase(user).catch(console.error);
      
      return profile;
    } catch (error) {
      console.error("Google login failed:", error);
      throw error;
    }
  }

  async syncGoogleUserToFirebase(user: FirebaseUser): Promise<void> {
    const userId = user.uid;
    const baseDetails = {
      userId: userId,
      firstName: user.displayName?.split(' ')[0] || 'User',
      name: user.displayName || 'Google User',
      email: user.email,
      photoUrl: user.photoURL,
      source: "web_app",
      status: "active",
      platform: "google",
      lastSeen: firestoreTimestamp()
    };

    try {
      const firestoreRef = doc(db, 'users', userId);
      await setDoc(firestoreRef, {
        ...baseDetails,
        updatedAt: firestoreTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error("Firebase sync failed for Google user:", error);
    }
  }

  isTelegramMiniApp(): boolean {
    const isTG = !!(window as any).Telegram?.WebApp?.initData;
    console.log("Telegram WebApp detection:", isTG ? "SUCCESS" : "FAILURE");
    return isTG;
  }

  getTelegramUser(): TelegramUser | null {
    const webApp = (window as any).Telegram?.WebApp;
    const user = webApp?.initDataUnsafe?.user || null;
    if (user) {
      console.log("Telegram user found in initDataUnsafe:", user.id);
    } else {
      console.warn("Telegram user missing in initDataUnsafe.");
    }
    return user;
  }
}

export const authService = new AuthService();
