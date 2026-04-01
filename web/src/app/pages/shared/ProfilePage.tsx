import { useState, useRef, useEffect } from 'react';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { useApp } from '../../context/AppContext';
import { uploadProfilePhoto } from '../../services/profileService';
import { toast } from 'sonner';
import {
  User, Camera, Lock, Save, X, Eye, EyeOff,
  CheckCircle, AlertCircle, Loader2,
} from 'lucide-react';

// ─── Mini helpers ─────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: 'white', borderRadius: '16px', padding: '24px',
  boxShadow: '0 4px 20px rgba(0,47,108,0.07)',
  border: '1px solid rgba(59,130,246,0.08)',
};

const labelSt: React.CSSProperties = {
  color: '#1e3a6e', fontWeight: 600, fontSize: '13px',
  display: 'block', marginBottom: '6px',
};

const inputSt: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: '10px',
  border: '1.5px solid #e0eaff', background: '#f7faff',
  color: '#001a4d', fontSize: '14px', outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  boxSizing: 'border-box',
};

const focusSt = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.target.style.borderColor  = '#3B82F6';
  e.target.style.boxShadow    = '0 0 0 3px rgba(59,130,246,0.1)';
};
const blurSt  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.target.style.borderColor  = '#e0eaff';
  e.target.style.boxShadow    = 'none';
};

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '7px',
  padding: '10px 20px', borderRadius: '10px', border: 'none',
  background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)',
  color: 'white', fontWeight: 700, fontSize: '13.5px',
  cursor: 'pointer', transition: 'all 0.2s',
  boxShadow: '0 4px 12px rgba(37,99,235,0.32)',
};

const btnOutline: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '7px',
  padding: '10px 20px', borderRadius: '10px',
  border: '1.5px solid #BFDBFE', background: 'white',
  color: '#1E40AF', fontWeight: 600, fontSize: '13.5px',
  cursor: 'pointer', transition: 'all 0.2s',
};

// ─── Component ───────────────────────────────────────────────────────────

export function ProfilePage() {
  const { currentUser, updateProfile, changePassword, isLoading, error, clearError } = useApp();

  // ── Profile form state ─────────────────────────────────────────────────
  const [editing, setEditing]   = useState(false);
  const [saving,  setSaving]    = useState(false);
  const [form, setForm] = useState({
    firstName:     '',
    lastName:      '',
    middleInitial: '',
    bio:           '',
    expertise:     '',
    subjects:      '',
    location:      '',
  });

  // ── Password form state ────────────────────────────────────────────────
  const [pwOpen,   setPwOpen]   = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [showPw,   setShowPw]   = useState({ current: false, newPw: false, confirm: false });
  const [pwForm, setPwForm] = useState({
    currentPassword: '', newPassword: '', confirmNewPassword: '',
  });

  // ── Photo state ────────────────────────────────────────────────────────
  const [photoUploading, setPhotoUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Sync form with currentUser ─────────────────────────────────────────
  useEffect(() => {
    if (currentUser) {
      setForm({
        firstName:     currentUser.firstName     || '',
        lastName:      currentUser.lastName      || '',
        middleInitial: currentUser.middleInitial || '',
        bio:           (currentUser as any).bio       || '',
        expertise:     (currentUser as any).expertise || '',
        subjects:      (currentUser as any).subjects  || '',
        location:      (currentUser as any).location  || '',
      });
    }
  }, [currentUser]);

  if (!currentUser) return null;

  const isTutor = currentUser.role === 'TUTOR';

  // ── Handlers ──────────────────────────────────────────────────────────

  const handleSaveProfile = async () => {
    setSaving(true);
    clearError();
    const payload: any = {
      firstName:     form.firstName.trim(),
      lastName:      form.lastName.trim(),
      middleInitial: form.middleInitial || undefined,
    };
    if (isTutor) {
      payload.bio       = form.bio;
      payload.expertise = form.expertise;
      payload.subjects  = form.subjects;
      payload.location  = form.location;
    }
    const ok = await updateProfile(payload);
    setSaving(false);
    if (ok) { toast.success('Profile updated successfully!'); setEditing(false); }
    else     toast.error(error || 'Failed to update profile.');
  };

  const handleChangePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmNewPassword) {
      toast.error('Please fill in all password fields.'); return;
    }
    if (pwForm.newPassword !== pwForm.confirmNewPassword) {
      toast.error('New passwords do not match.'); return;
    }
    if (pwForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.'); return;
    }
    setPwSaving(true);
    clearError();
    const ok = await changePassword(pwForm);
    setPwSaving(false);
    if (ok) {
      toast.success('Password changed successfully!');
      setPwOpen(false);
      setPwForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } else {
      toast.error(error || 'Failed to change password.');
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Photo must be under 5 MB.'); return; }

    setPhotoUploading(true);
    try {
      const url = await uploadProfilePhoto(file, currentUser.id);
      const ok  = await updateProfile({ profilePhotoUrl: url });
      if (ok) toast.success('Profile photo updated!');
      else    toast.error(error || 'Photo upload failed.');
    } catch (err: any) {
      toast.error(err.message || 'Photo upload failed.');
    } finally {
      setPhotoUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <DashboardLayout role={currentUser.role}>
      {/* Page heading */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#001a4d', fontWeight: 800, fontSize: '24px', letterSpacing: '-0.5px', marginBottom: '4px' }}>
          My Profile
        </h1>
        <p style={{ color: '#5a7bad', fontSize: '14px' }}>
          Manage your account information and settings.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', alignItems: 'start' }}>

        {/* ── Left column: photo + quick info ──────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Photo card */}
          <div style={{ ...card, textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
              {/* Avatar */}
              <div style={{ width: '96px', height: '96px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto', border: '3px solid #DBEAFE', boxShadow: '0 4px 16px rgba(0,47,108,0.15)' }}>
                {currentUser.profilePhotoUrl ? (
                  <img src={currentUser.profilePhotoUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#3B82F6,#0047AB)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={40} color="white" />
                  </div>
                )}
              </div>

              {/* Upload button */}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={photoUploading}
                style={{ position: 'absolute', bottom: 0, right: 0, width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg,#3B82F6,#0047AB)', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(59,130,246,0.4)' }}
              >
                {photoUploading
                  ? <Loader2 size={14} color="white" style={{ animation: 'spin 0.8s linear infinite' }} />
                  : <Camera size={14} color="white" />
                }
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
            </div>

            <h2 style={{ color: '#001a4d', fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>
              {currentUser.firstName} {currentUser.lastName}
            </h2>
            <p style={{ color: '#5a7bad', fontSize: '13px', marginBottom: '10px' }}>{currentUser.email}</p>
            <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: '20px', background: 'linear-gradient(135deg,#DBEAFE,#EFF6FF)', color: '#1D4ED8', fontSize: '12px', fontWeight: 700 }}>
              {currentUser.role}
            </span>
            <p style={{ color: '#94a3b8', fontSize: '11px', marginTop: '12px' }}>
              Click the camera icon to update your photo
            </p>
          </div>

          {/* Change password card */}
          <div style={card}>
            <h3 style={{ color: '#001a4d', fontWeight: 700, fontSize: '14px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <Lock size={15} color="#3B82F6" /> Security
            </h3>
            <button
              onClick={() => { setPwOpen(true); clearError(); }}
              style={{ ...btnOutline, width: '100%', justifyContent: 'center' }}
              onMouseEnter={e => e.currentTarget.style.background = '#EFF6FF'}
              onMouseLeave={e => e.currentTarget.style.background = 'white'}
            >
              <Lock size={15} /> Change Password
            </button>
          </div>
        </div>

        {/* ── Right column: profile info ────────────────────────────────── */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
            <h2 style={{ color: '#001a4d', fontWeight: 700, fontSize: '16px' }}>Profile Information</h2>
            {!editing ? (
              <button onClick={() => setEditing(true)} style={btnPrimary} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
                Edit Profile
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => { setEditing(false); clearError(); }} style={btnOutline} onMouseEnter={e => e.currentTarget.style.background = '#EFF6FF'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                  <X size={14} /> Cancel
                </button>
                <button onClick={handleSaveProfile} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }} onMouseEnter={e => { if (!saving) e.currentTarget.style.transform = 'translateY(-1px)'; }} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  {saving ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Save size={14} />}
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          {/* Error banner */}
          {error && (
            <div style={{ display: 'flex', gap: '10px', padding: '12px 14px', borderRadius: '10px', background: '#FEF2F2', border: '1px solid #FCA5A5', marginBottom: '18px' }}>
              <AlertCircle size={16} color="#DC2626" style={{ flexShrink: 0, marginTop: '1px' }} />
              <span style={{ color: '#991B1B', fontSize: '13px' }}>{error}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: '14px' }}>
            {/* Last Name */}
            <div>
              <label style={labelSt}>Last Name</label>
              {editing ? (
                <input value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} style={inputSt} onFocus={focusSt} onBlur={blurSt} />
              ) : (
                <div style={{ color: '#1e3a6e', fontSize: '14px', padding: '10px 0' }}>{currentUser.lastName}</div>
              )}
            </div>
            {/* First Name */}
            <div>
              <label style={labelSt}>First Name</label>
              {editing ? (
                <input value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} style={inputSt} onFocus={focusSt} onBlur={blurSt} />
              ) : (
                <div style={{ color: '#1e3a6e', fontSize: '14px', padding: '10px 0' }}>{currentUser.firstName}</div>
              )}
            </div>
            {/* Middle Initial */}
            <div>
              <label style={labelSt}>M.I.</label>
              {editing ? (
                <input value={form.middleInitial} maxLength={1} onChange={e => setForm(p => ({ ...p, middleInitial: e.target.value }))} style={inputSt} onFocus={focusSt} onBlur={blurSt} />
              ) : (
                <div style={{ color: '#1e3a6e', fontSize: '14px', padding: '10px 0' }}>{currentUser.middleInitial || '—'}</div>
              )}
            </div>
          </div>

          {/* Email (read-only) */}
          <div style={{ marginTop: '14px' }}>
            <label style={labelSt}>Email Address</label>
            <div style={{ ...inputSt, background: '#f0f4fa', color: '#6B8FC4', cursor: 'not-allowed' }}>
              {currentUser.email}
            </div>
            <p style={{ color: '#94a3b8', fontSize: '11px', marginTop: '4px' }}>Email cannot be changed.</p>
          </div>

          {/* Tutor-only fields */}
          {isTutor && (
            <div style={{ marginTop: '22px', borderTop: '1px solid #e0eaff', paddingTop: '20px' }}>
              <h3 style={{ color: '#001a4d', fontWeight: 700, fontSize: '14px', marginBottom: '14px' }}>Tutor Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Bio */}
                <div>
                  <label style={labelSt}>Bio</label>
                  {editing ? (
                    <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} rows={3} style={{ ...inputSt, resize: 'vertical', padding: '11px 14px' }} onFocus={focusSt} onBlur={blurSt} />
                  ) : (
                    <div style={{ color: '#1e3a6e', fontSize: '14px', lineHeight: 1.6 }}>{(currentUser as any).bio || <span style={{ color: '#94a3b8' }}>Not set</span>}</div>
                  )}
                </div>
                {/* Expertise */}
                <div>
                  <label style={labelSt}>Expertise</label>
                  {editing ? (
                    <input value={form.expertise} onChange={e => setForm(p => ({ ...p, expertise: e.target.value }))} placeholder="e.g., Web Development, Algorithms" style={inputSt} onFocus={focusSt} onBlur={blurSt} />
                  ) : (
                    <div style={{ color: '#1e3a6e', fontSize: '14px' }}>{(currentUser as any).expertise || <span style={{ color: '#94a3b8' }}>Not set</span>}</div>
                  )}
                </div>
                {/* Subjects */}
                <div>
                  <label style={labelSt}>Subjects (comma-separated)</label>
                  {editing ? (
                    <input value={form.subjects} onChange={e => setForm(p => ({ ...p, subjects: e.target.value }))} placeholder="e.g., Math, Physics, Programming" style={inputSt} onFocus={focusSt} onBlur={blurSt} />
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                      {(currentUser as any).subjects
                        ? (currentUser as any).subjects.split(',').map((s: string) => (
                            <span key={s} style={{ padding: '3px 10px', borderRadius: '20px', background: '#EFF6FF', color: '#2563EB', fontSize: '12px', fontWeight: 600 }}>{s.trim()}</span>
                          ))
                        : <span style={{ color: '#94a3b8', fontSize: '14px' }}>Not set</span>}
                    </div>
                  )}
                </div>
                {/* Location */}
                <div>
                  <label style={labelSt}>Location / Room</label>
                  {editing ? (
                    <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="e.g., Library Room 3, Online" style={inputSt} onFocus={focusSt} onBlur={blurSt} />
                  ) : (
                    <div style={{ color: '#1e3a6e', fontSize: '14px' }}>{(currentUser as any).location || <span style={{ color: '#94a3b8' }}>Not set</span>}</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Change Password Modal ───────────────────────────────────────── */}
      {pwOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,10,35,0.65)', backdropFilter: 'blur(6px)' }} onClick={() => { setPwOpen(false); clearError(); }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '18px', padding: '28px', maxWidth: '420px', width: '100%', boxShadow: '0 28px 60px rgba(0,47,108,0.25)', animation: 'ttModal 0.2s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ color: '#001a4d', fontWeight: 800, fontSize: '18px' }}>Change Password</h3>
              <button onClick={() => { setPwOpen(false); clearError(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B8FC4' }}><X size={20} /></button>
            </div>

            {error && (
              <div style={{ display: 'flex', gap: '10px', padding: '11px 14px', borderRadius: '10px', background: '#FEF2F2', border: '1px solid #FCA5A5', marginBottom: '16px' }}>
                <AlertCircle size={15} color="#DC2626" style={{ flexShrink: 0 }} />
                <span style={{ color: '#991B1B', fontSize: '13px' }}>{error}</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { key: 'currentPassword', label: 'Current Password',   show: showPw.current, toggle: () => setShowPw(p => ({ ...p, current: !p.current })) },
                { key: 'newPassword',     label: 'New Password',       show: showPw.newPw,   toggle: () => setShowPw(p => ({ ...p, newPw: !p.newPw })) },
                { key: 'confirmNewPassword', label: 'Confirm New Password', show: showPw.confirm, toggle: () => setShowPw(p => ({ ...p, confirm: !p.confirm })) },
              ].map(({ key, label, show, toggle }) => (
                <div key={key}>
                  <label style={labelSt}>{label}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={show ? 'text' : 'password'}
                      value={(pwForm as any)[key]}
                      onChange={e => { setPwForm(p => ({ ...p, [key]: e.target.value })); clearError(); }}
                      style={{ ...inputSt, paddingRight: '42px' }}
                      onFocus={focusSt} onBlur={blurSt}
                    />
                    <button type="button" onClick={toggle} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                      {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '22px' }}>
              <button onClick={() => { setPwOpen(false); clearError(); }} style={{ ...btnOutline, flex: 1, justifyContent: 'center' }} onMouseEnter={e => e.currentTarget.style.background = '#EFF6FF'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                Cancel
              </button>
              <button onClick={handleChangePassword} disabled={pwSaving} style={{ ...btnPrimary, flex: 1, justifyContent: 'center', opacity: pwSaving ? 0.7 : 1 }} onMouseEnter={e => { if (!pwSaving) e.currentTarget.style.transform = 'translateY(-1px)'; }} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                {pwSaving ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <CheckCircle size={14} />}
                {pwSaving ? 'Saving…' : 'Update Password'}
              </button>
            </div>
          </div>
          <style>{`@keyframes ttModal{from{opacity:0;transform:scale(0.9) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </DashboardLayout>
  );
}