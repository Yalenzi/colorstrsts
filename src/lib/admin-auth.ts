import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from './firebase';

// Admin role types
export type AdminRole = 'super_admin' | 'admin' | 'moderator';

// Admin user interface
export interface AdminUser {
  uid: string;
  email: string;
  displayName?: string;
  role: AdminRole;
  permissions: string[];
  isActive: boolean;
  lastLoginAt?: any;
  createdAt: any;
  updatedAt: any;
}

// Admin session interface
export interface AdminSession {
  user: AdminUser;
  token: string;
  expiresAt: number;
  createdAt: number;
}

// Admin permissions
export const ADMIN_PERMISSIONS = {
  MANAGE_USERS: 'manage_users',
  MANAGE_TESTS: 'manage_tests',
  MANAGE_CONTENT: 'manage_content',
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_ADMINS: 'manage_admins',
  SYSTEM_CONFIG: 'system_config'
} as const;

// Role-based permissions
export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  super_admin: Object.values(ADMIN_PERMISSIONS),
  admin: [
    ADMIN_PERMISSIONS.MANAGE_USERS,
    ADMIN_PERMISSIONS.MANAGE_TESTS,
    ADMIN_PERMISSIONS.MANAGE_CONTENT,
    ADMIN_PERMISSIONS.MANAGE_SETTINGS,
    ADMIN_PERMISSIONS.VIEW_ANALYTICS
  ],
  moderator: [
    ADMIN_PERMISSIONS.MANAGE_CONTENT,
    ADMIN_PERMISSIONS.VIEW_ANALYTICS
  ]
};

// Authorized admin emails (should be moved to environment variables in production)
const AUTHORIZED_ADMIN_EMAILS = [
  'aburakan4551@gmail.com',
  'admin@colorstest.com'
];

// Session storage key
const ADMIN_SESSION_KEY = 'admin_session';

// Session duration (1 hour)
const SESSION_DURATION = 60 * 60 * 1000;

/**
 * Sign in admin user with email and password
 */
export async function signInAdmin(email: string, password: string): Promise<AdminUser> {
  try {
    // Check if email is authorized
    if (!AUTHORIZED_ADMIN_EMAILS.includes(email)) {
      throw new Error('البريد الإلكتروني غير مصرح له بالوصول للإدارة');
    }

    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get or create admin profile
    const adminUser = await getOrCreateAdminProfile(user);

    // Check if admin is active
    if (!adminUser.isActive) {
      await signOut(auth);
      throw new Error('تم تعطيل هذا الحساب الإداري');
    }

    // Update last login
    await updateAdminLastLogin(adminUser.uid);

    // Create session
    await createAdminSession(adminUser);

    return adminUser;
  } catch (error: any) {
    console.error('Admin sign in error:', error);
    throw new Error(getAdminAuthErrorMessage(error.code || error.message));
  }
}

/**
 * Sign out admin user
 */
export async function signOutAdmin(): Promise<void> {
  try {
    await signOut(auth);
    clearAdminSession();
  } catch (error) {
    console.error('Admin sign out error:', error);
    throw error;
  }
}

/**
 * Get or create admin profile
 */
async function getOrCreateAdminProfile(user: User): Promise<AdminUser> {
  const adminRef = doc(db, 'admins', user.uid);
  const adminSnap = await getDoc(adminRef);

  if (adminSnap.exists()) {
    return adminSnap.data() as AdminUser;
  } else {
    // Create new admin profile
    const role: AdminRole = user.email === 'aburakan4551@gmail.com' ? 'super_admin' : 'admin';
    const adminUser: AdminUser = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || '',
      role,
      permissions: ROLE_PERMISSIONS[role],
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(adminRef, adminUser);
    return adminUser;
  }
}

/**
 * Update admin last login
 */
async function updateAdminLastLogin(uid: string): Promise<void> {
  const adminRef = doc(db, 'admins', uid);
  await updateDoc(adminRef, {
    lastLoginAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

/**
 * Create admin session
 */
async function createAdminSession(adminUser: AdminUser): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  const session: AdminSession = {
    user: adminUser,
    token: generateSessionToken(),
    expiresAt: Date.now() + SESSION_DURATION,
    createdAt: Date.now()
  };

  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
}

/**
 * Get current admin session
 */
export function getCurrentAdminSession(): AdminSession | null {
  try {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      return null;
    }

    const sessionData = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!sessionData) return null;

    const session: AdminSession = JSON.parse(sessionData);

    // Check if session is expired
    if (Date.now() > session.expiresAt) {
      clearAdminSession();
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error getting admin session:', error);
    clearAdminSession();
    return null;
  }
}

/**
 * Clear admin session
 */
export function clearAdminSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }
}

/**
 * Check if user has admin permission
 */
export function hasAdminPermission(permission: string): boolean {
  const session = getCurrentAdminSession();
  if (!session) return false;

  return session.user.permissions.includes(permission);
}

/**
 * Generate session token
 */
function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Get admin auth error message
 */
function getAdminAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'لا يوجد حساب إداري بهذا البريد الإلكتروني';
    case 'auth/wrong-password':
      return 'كلمة المرور غير صحيحة';
    case 'auth/invalid-email':
      return 'البريد الإلكتروني غير صالح';
    case 'auth/user-disabled':
      return 'تم تعطيل هذا الحساب';
    case 'auth/too-many-requests':
      return 'تم تجاوز عدد المحاولات المسموح. حاول مرة أخرى لاحقاً';
    case 'auth/network-request-failed':
      return 'خطأ في الاتصال بالشبكة';
    default:
      return errorCode.includes('البريد الإلكتروني غير مصرح') ? errorCode : 'خطأ في تسجيل الدخول';
  }
}

/**
 * Listen to admin auth state changes
 */
export function onAdminAuthStateChanged(callback: (adminUser: AdminUser | null) => void): () => void {
  return onAuthStateChanged(auth, async (user) => {
    if (user && AUTHORIZED_ADMIN_EMAILS.includes(user.email || '')) {
      try {
        const adminUser = await getOrCreateAdminProfile(user);
        if (adminUser.isActive) {
          callback(adminUser);
          return;
        }
      } catch (error) {
        console.error('Error getting admin profile:', error);
      }
    }
    
    clearAdminSession();
    callback(null);
  });
}
