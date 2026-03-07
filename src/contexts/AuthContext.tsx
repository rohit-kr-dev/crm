// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, onAuthStateChanged, sendPasswordResetEmail,
  updatePassword, reauthenticateWithCredential, EmailAuthProvider,
  User, setPersistence, browserSessionPersistence, browserLocalPersistence,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Role = "Admin" | "Manager" | "Agent" | "Viewer";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
  createdAt: unknown;
  lastLogin: unknown;
  isActive: boolean;
  loginAttempts: number;
  lockedUntil: unknown | null;
}

// ─── RBAC Permission Map ──────────────────────────────────────────────────────

export const PERMISSIONS: Record<Role, string[]> = {
  Admin: [
    "view_dashboard", "view_financial", "view_agents", "view_analytics",
    "view_leads", "view_properties", "view_marketing", "view_workspace",
    "add_property", "edit_property", "delete_property",
    "add_agent", "edit_agent", "delete_agent",
    "add_transaction", "delete_transaction",
    "add_lead", "edit_lead", "delete_lead",
    "add_campaign", "edit_campaign", "delete_campaign",
    "manage_users", "view_audit_log",
  ],
  Manager: [
    "view_dashboard", "view_financial", "view_agents", "view_analytics",
    "view_leads", "view_properties", "view_marketing", "view_workspace",
    "add_property", "edit_property",
    "add_agent",
    "add_transaction",
    "add_lead", "edit_lead",
    "add_campaign", "edit_campaign",
  ],
  Agent: [
    "view_dashboard", "view_leads", "view_properties", "view_workspace",
    "add_lead", "edit_lead",
    "view_analytics",
  ],
  Viewer: [
    "view_dashboard", "view_financial", "view_agents", "view_analytics",
    "view_leads", "view_properties", "view_marketing",
  ],
};

export const can = (role: Role, permission: string): boolean =>
  PERMISSIONS[role]?.includes(permission) ?? false;

// ─── Context ──────────────────────────────────────────────────────────────────

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, displayName: string, role: Role) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  can: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const p = await fetchProfile(firebaseUser.uid);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const fetchProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
      const snap = await getDoc(doc(db, "users", uid));
      return snap.exists() ? (snap.data() as UserProfile) : null;
    } catch {
      return null;
    }
  };

  const login = async (email: string, password: string, rememberMe: boolean) => {
    // Set session persistence
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

    // Check for lockout in Firestore before attempting
    const usersRef = doc(db, "users_auth_meta", email.toLowerCase().replace(/[.@]/g, "_"));
    try {
      const metaSnap = await getDoc(usersRef);
      if (metaSnap.exists()) {
        const meta = metaSnap.data();
        if (meta.lockedUntil && meta.lockedUntil.toMillis() > Date.now()) {
          const mins = Math.ceil((meta.lockedUntil.toMillis() - Date.now()) / 60000);
          throw new Error(`Account locked. Try again in ${mins} minute(s).`);
        }
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes("locked")) throw e;
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);

      // Reset failed attempts on success + log last login
      await updateDoc(doc(db, "users", cred.user.uid), {
        lastLogin: serverTimestamp(),
        loginAttempts: 0,
        lockedUntil: null,
      }).catch(() => {});

      // Reset meta
      await setDoc(usersRef, { attempts: 0, lockedUntil: null }, { merge: true }).catch(() => {});

      const p = await fetchProfile(cred.user.uid);
      if (p && !p.isActive) {
        await signOut(auth);
        throw new Error("Your account has been deactivated. Contact your administrator.");
      }
      setProfile(p);
    } catch (err: unknown) {
      // Track failed attempts
      if (err instanceof Error && !err.message.includes("locked") && !err.message.includes("deactivated")) {
        try {
          const metaSnap = await getDoc(usersRef);
          const attempts = (metaSnap.exists() ? metaSnap.data().attempts || 0 : 0) + 1;
          const lockData =
            attempts >= MAX_LOGIN_ATTEMPTS
              ? { attempts, lockedUntil: new Date(Date.now() + LOCKOUT_DURATION_MS) }
              : { attempts, lockedUntil: null };
          await setDoc(usersRef, lockData, { merge: true });
          if (attempts >= MAX_LOGIN_ATTEMPTS) {
            throw new Error(`Too many failed attempts. Account locked for 15 minutes.`);
          }
          throw new Error(`Invalid email or password. ${MAX_LOGIN_ATTEMPTS - attempts} attempt(s) remaining.`);
        } catch (inner: unknown) {
          if (inner instanceof Error) throw inner;
        }
      }
      throw err;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
  };

  const register = async (email: string, password: string, displayName: string, role: Role) => {
    validatePassword(password);
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const newProfile: UserProfile = {
      uid: cred.user.uid, email, displayName, role,
      createdAt: serverTimestamp(), lastLogin: serverTimestamp(),
      isActive: true, loginAttempts: 0, lockedUntil: null,
    };
    await setDoc(doc(db, "users", cred.user.uid), newProfile);
    setProfile(newProfile);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user?.email) throw new Error("No user logged in");
    validatePassword(newPassword);
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
  };

  const hasPermission = (permission: string): boolean => {
    if (!profile) return false;
    return can(profile.role, permission);
  };

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      login, logout, register, resetPassword, changePassword,
      can: hasPermission,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Password validator ───────────────────────────────────────────────────────

export const validatePassword = (password: string) => {
  if (password.length < 8) throw new Error("Password must be at least 8 characters.");
  if (!/[A-Z]/.test(password)) throw new Error("Password must contain an uppercase letter.");
  if (!/[0-9]/.test(password)) throw new Error("Password must contain a number.");
  if (!/[^A-Za-z0-9]/.test(password)) throw new Error("Password must contain a special character.");
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};