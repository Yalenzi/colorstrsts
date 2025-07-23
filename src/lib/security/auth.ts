import { auth, db } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { userRegistrationSchema, userLoginSchema } from '../validation/schemas';
import { sanitizeEmail, sanitizeText } from './sanitization';

// User roles enum
export enum UserRole {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

// Permission levels
export const PERMISSIONS = {
  [UserRole.USER]: [
    'read:tests',
    'read:results',
    'create:test_results',
    'update:own_profile'
  ],
  [UserRole.MODERATOR]: [
    'read:tests',
    'read:results',
    'create:test_results',
    'update:own_profile',
    'moderate:content',
    'read:users'
  ],
  [UserRole.ADMIN]: [
    'read:tests',
    'read:results',
    'create:test_results',
    'update:own_profile',
    'moderate:content',
    'read:users',
    'create:tests',
    'update:tests',
    'delete:tests',
    'manage:users',
    'read:analytics'
  ],
  [UserRole.SUPER_ADMIN]: [
    '*' // All permissions
  ]
};

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: any;
  lastLoginAt: any;
  isActive: boolean;
  language: 'en' | 'ar';
  photoURL?: string;
  subscription?: {
    plan: string;
    status: string;
    expiresAt?: any;
  };
  securitySettings?: {
    mfaEnabled: boolean;
    lastPasswordChange: any;
    loginAttempts: number;
    lockedUntil?: any;
  };
}

/**
 * Register a new user with validation and security checks
 */
export async function registerUser(
  email: string, 
  password: string, 
  displayName: string,
  language: 'en' | 'ar' = 'en'
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    // Validate input
    const validationResult = userRegistrationSchema.safeParse({
      email: sanitizeEmail(email),
      password,
      displayName: sanitizeText(displayName),
      language
    });

    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.errors[0].message
      };
    }

    const { email: validEmail, displayName: validDisplayName } = validationResult.data;

    // Check if user already exists
    const existingUsers = await getDocs(
      query(collection(db, 'users'), where('email', '==', validEmail))
    );

    if (!existingUsers.empty) {
      return {
        success: false,
        error: 'User with this email already exists'
      };
    }

    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, validEmail, password);
    const user = userCredential.user;

    // Update user profile
    await updateProfile(user, {
      displayName: validDisplayName
    });

    // Send email verification
    await sendEmailVerification(user);

    // Create user profile in Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      email: validEmail,
      displayName: validDisplayName,
      role: UserRole.USER,
      emailVerified: false,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      isActive: true,
      language,
      securitySettings: {
        mfaEnabled: false,
        lastPasswordChange: serverTimestamp(),
        loginAttempts: 0
      }
    };

    await setDoc(doc(db, 'users', user.uid), userProfile);

    return {
      success: true,
      user: userProfile
    };
  } catch (error: any) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: getAuthErrorMessage(error.code)
    };
  }
}

/**
 * Login user with security checks
 */
export async function loginUser(
  email: string, 
  password: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    // Validate input
    const validationResult = userLoginSchema.safeParse({
      email: sanitizeEmail(email),
      password
    });

    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.errors[0].message
      };
    }

    const { email: validEmail } = validationResult.data;

    // Check for account lockout
    const userDoc = await getUserByEmail(validEmail);
    if (userDoc && userDoc.securitySettings?.lockedUntil) {
      const lockoutTime = userDoc.securitySettings.lockedUntil.toDate();
      if (lockoutTime > new Date()) {
        return {
          success: false,
          error: 'Account is temporarily locked due to multiple failed login attempts'
        };
      }
    }

    // Attempt login
    const userCredential = await signInWithEmailAndPassword(auth, validEmail, password);
    const user = userCredential.user;

    // Update user profile
    const userProfile = await getUserProfile(user.uid);
    if (userProfile) {
      // Reset login attempts on successful login
      await updateDoc(doc(db, 'users', user.uid), {
        lastLoginAt: serverTimestamp(),
        'securitySettings.loginAttempts': 0,
        'securitySettings.lockedUntil': null
      });

      return {
        success: true,
        user: userProfile
      };
    }

    return {
      success: false,
      error: 'User profile not found'
    };
  } catch (error: any) {
    console.error('Login error:', error);

    // Handle failed login attempts
    if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
      await handleFailedLoginAttempt(email);
    }

    return {
      success: false,
      error: getAuthErrorMessage(error.code)
    };
  }
}

/**
 * Handle failed login attempts and implement account lockout
 */
async function handleFailedLoginAttempt(email: string): Promise<void> {
  try {
    const userDoc = await getUserByEmail(email);
    if (userDoc) {
      const currentAttempts = (userDoc.securitySettings?.loginAttempts || 0) + 1;
      const updateData: any = {
        'securitySettings.loginAttempts': currentAttempts
      };

      // Lock account after 5 failed attempts
      if (currentAttempts >= 5) {
        const lockoutTime = new Date();
        lockoutTime.setMinutes(lockoutTime.getMinutes() + 30); // 30-minute lockout
        updateData['securitySettings.lockedUntil'] = lockoutTime;
      }

      await updateDoc(doc(db, 'users', userDoc.uid), updateData);
    }
  } catch (error) {
    console.error('Error handling failed login attempt:', error);
  }
}

/**
 * Get user by email
 */
async function getUserByEmail(email: string): Promise<UserProfile | null> {
  try {
    const usersQuery = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(usersQuery);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return { uid: userDoc.id, ...userDoc.data() } as UserProfile;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return { uid, ...userDoc.data() } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

/**
 * Check if user has specific permission
 */
export function hasPermission(userRole: UserRole, permission: string): boolean {
  const rolePermissions = PERMISSIONS[userRole] || [];
  return rolePermissions.includes('*') || rolePermissions.includes(permission);
}

/**
 * Check if user has admin privileges
 */
export function isAdmin(userRole: UserRole): boolean {
  return userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN;
}

/**
 * Logout user
 */
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

/**
 * Change user password with reauthentication
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      return { success: false, error: 'User not authenticated' };
    }

    // Reauthenticate user
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Update password
    await updatePassword(user, newPassword);

    // Update security settings
    await updateDoc(doc(db, 'users', user.uid), {
      'securitySettings.lastPasswordChange': serverTimestamp()
    });

    return { success: true };
  } catch (error: any) {
    console.error('Password change error:', error);
    return {
      success: false,
      error: getAuthErrorMessage(error.code)
    };
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const validEmail = sanitizeEmail(email);
    await sendPasswordResetEmail(auth, validEmail);
    return { success: true };
  } catch (error: any) {
    console.error('Password reset error:', error);
    return {
      success: false,
      error: getAuthErrorMessage(error.code)
    };
  }
}

/**
 * Get user-friendly error messages
 */
function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No user found with this email address';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists';
    case 'auth/weak-password':
      return 'Password is too weak';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection';
    default:
      return 'An error occurred. Please try again';
  }
}
