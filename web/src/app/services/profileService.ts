import { api } from './apiService';

// ─── Types ────────────────────────────────────────────────────────────────
export interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  middleInitial?: string;
  role: 'STUDENT' | 'TUTOR' | 'ADMIN';
  profilePhotoUrl?: string;
  verificationStatus?: 'NOT_APPLICABLE' | 'PENDING' | 'APPROVED' | 'REJECTED';
  // tutor-only
  bio?: string;
  expertise?: string;
  subjects?: string;
  location?: string;
  rating?: number;
  reviewCount?: number;
  isVerified?: boolean;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  middleInitial?: string;
  profilePhotoUrl?: string;
  // tutor
  bio?: string;
  expertise?: string;
  subjects?: string;
  location?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// ─── API calls ────────────────────────────────────────────────────────────

/** Fetch the current user's full profile. */
export async function getMyProfile(): Promise<UserProfile> {
  return api.get<UserProfile>('/api/users/me');
}

/** Update basic info + optional tutor fields. */
export async function updateMyProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
  return api.put<UserProfile>('/api/users/me', payload);
}

/** Change password. */
export async function changePassword(payload: ChangePasswordPayload): Promise<string> {
  return api.put<string>('/api/users/me/password', payload);
}

// ─── Backend proxy upload ──────────────────────────────────────────────

/**
 * Upload a file via the Java backend, which securely forwards it to Supabase
 * Storage and updates the user's profilePhotoUrl in the database.
 */
export async function uploadProfilePhoto(
  file: File,
  userId: number
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  
  const profile = await api.upload<UserProfile>('/api/users/me/photo', formData);
  
  if (!profile.profilePhotoUrl) {
    throw new Error('Upload succeeded but no photo URL was returned.');
  }
  
  return profile.profilePhotoUrl;
}