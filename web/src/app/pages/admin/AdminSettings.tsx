import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { api } from '../../services/apiService';
import { User, Lock, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

interface UpdateProfileData {
  firstName: string;
  lastName: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function AdminSettings() {
  const { currentUser, setCurrentUser } = useApp();

  // Profile editing
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState<UpdateProfileData>({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password change
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // ── Profile Section ──────────────────────────────────────────────────
  const handleProfileSave = async () => {
    if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
      toast.error('Names cannot be empty.');
      return;
    }
    setProfileLoading(true);
    try {
      const updated = await api.put('/api/users/me', profileData);
      setCurrentUser(updated);
      setIsEditingProfile(false);
      toast.success('Profile updated successfully!');
    } catch (e: any) {
      toast.error(e.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  // ── Password Section ─────────────────────────────────────────────────
  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('All password fields are required.');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setPasswordLoading(true);
    try {
      await api.put('/api/users/me/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully!');
    } catch (e: any) {
      toast.error(e.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const inp: React.CSSProperties = {
    width: '100%',
    padding: '10px 13px',
    borderRadius: '10px',
    border: '1.5px solid #e0eaff',
    background: '#f7faff',
    fontSize: '13.5px',
    outline: 'none',
    color: '#001a4d',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  const Card = ({ title, icon: Icon, color, children }: any) => (
    <div
      style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0,47,108,0.07)',
        border: '1px solid rgba(59,130,246,0.08)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: color === 'blue' ? '#EFF6FF' : '#FEF2F2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={18} color={color === 'blue' ? '#3B82F6' : '#DC2626'} />
        </div>
        <h2 style={{ color: '#001a4d', fontWeight: 800, fontSize: '16px', margin: 0 }}>{title}</h2>
      </div>
      {children}
    </div>
  );

  return (
    <DashboardLayout role="ADMIN">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#001a4d', fontWeight: 800, fontSize: '24px', letterSpacing: '-0.5px', marginBottom: '4px', margin: 0 }}>Settings</h1>
        <p style={{ color: '#5a7bad', fontSize: '14px', margin: 0 }}>Manage your account and security settings.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* ── Profile Card ── */}
        <Card title="Profile Information" icon={User} color="blue">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', color: '#6B8FC4', fontSize: '12px', fontWeight: 700, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                First Name
              </label>
              <input
                type="text"
                value={profileData.firstName}
                onChange={(e) => setProfileData((p) => ({ ...p, firstName: e.target.value }))}
                disabled={!isEditingProfile}
                style={{
                  ...inp,
                  background: isEditingProfile ? '#f7faff' : '#f0f4fa',
                  color: isEditingProfile ? '#001a4d' : '#6B8FC4',
                  cursor: isEditingProfile ? 'text' : 'default',
                }}
                onFocus={(e) => {
                  if (isEditingProfile) e.target.style.borderColor = '#3B82F6';
                }}
                onBlur={(e) => {
                  if (isEditingProfile) e.target.style.borderColor = '#e0eaff';
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#6B8FC4', fontSize: '12px', fontWeight: 700, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Last Name
              </label>
              <input
                type="text"
                value={profileData.lastName}
                onChange={(e) => setProfileData((p) => ({ ...p, lastName: e.target.value }))}
                disabled={!isEditingProfile}
                style={{
                  ...inp,
                  background: isEditingProfile ? '#f7faff' : '#f0f4fa',
                  color: isEditingProfile ? '#001a4d' : '#6B8FC4',
                  cursor: isEditingProfile ? 'text' : 'default',
                }}
                onFocus={(e) => {
                  if (isEditingProfile) e.target.style.borderColor = '#3B82F6';
                }}
                onBlur={(e) => {
                  if (isEditingProfile) e.target.style.borderColor = '#e0eaff';
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#6B8FC4', fontSize: '12px', fontWeight: 700, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Email
              </label>
              <input
                type="email"
                value={currentUser?.email || ''}
                disabled
                style={{ ...inp, background: '#f0f4fa', color: '#6B8FC4', cursor: 'default' }}
              />
            </div>

            {isEditingProfile ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleProfileSave}
                  disabled={profileLoading}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#3B82F6',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: profileLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    opacity: profileLoading ? 0.7 : 1,
                  }}
                >
                  {profileLoading ? (
                    <>
                      <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving
                    </>
                  ) : (
                    <>
                      <Check size={13} /> Save Changes
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsEditingProfile(false);
                    setProfileData({
                      firstName: currentUser?.firstName || '',
                      lastName: currentUser?.lastName || '',
                    });
                  }}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: '10px',
                    border: '1px solid #e0eaff',
                    background: 'white',
                    color: '#6B8FC4',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingProfile(true)}
                style={{
                  width: '100%',
                  padding: '11px',
                  borderRadius: '10px',
                  border: '1px solid #BFDBFE',
                  background: '#EFF6FF',
                  color: '#2563EB',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Edit Profile
              </button>
            )}
          </div>
        </Card>

        {/* ── Password Card ── */}
        <Card title="Change Password" icon={Lock} color="red">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', color: '#6B8FC4', fontSize: '12px', fontWeight: 700, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Current Password
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData((p) => ({ ...p, currentPassword: e.target.value }))}
                placeholder="Enter current password"
                style={inp}
                onFocus={(e) => (e.target.style.borderColor = '#DC2626')}
                onBlur={(e) => (e.target.style.borderColor = '#e0eaff')}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#6B8FC4', fontSize: '12px', fontWeight: 700, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                New Password
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData((p) => ({ ...p, newPassword: e.target.value }))}
                placeholder="Enter new password (min. 6 characters)"
                style={inp}
                onFocus={(e) => (e.target.style.borderColor = '#DC2626')}
                onBlur={(e) => (e.target.style.borderColor = '#e0eaff')}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#6B8FC4', fontSize: '12px', fontWeight: 700, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData((p) => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Confirm your new password"
                style={inp}
                onFocus={(e) => (e.target.style.borderColor = '#DC2626')}
                onBlur={(e) => (e.target.style.borderColor = '#e0eaff')}
              />
            </div>

            <button
              onClick={handlePasswordChange}
              disabled={passwordLoading}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '10px',
                border: 'none',
                background: '#DC2626',
                color: 'white',
                fontWeight: 700,
                fontSize: '13px',
                cursor: passwordLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                opacity: passwordLoading ? 0.7 : 1,
              }}
            >
              {passwordLoading ? (
                <>
                  <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> Updating
                </>
              ) : (
                <>
                  <Lock size={13} /> Update Password
                </>
              )}
            </button>
          </div>
        </Card>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </DashboardLayout>
  );
}