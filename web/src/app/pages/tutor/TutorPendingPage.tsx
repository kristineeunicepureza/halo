import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import { useEffect } from 'react';
import { Clock, ShieldX, BookOpen, LogOut, RefreshCw } from 'lucide-react';

export function TutorPendingPage() {
  const { currentUser, logout, refreshProfile } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) { navigate('/login'); return; }
    if (currentUser.role !== 'TUTOR') { navigate('/login'); return; }
    // If they somehow got approved, redirect to dashboard
    if (currentUser.verificationStatus === 'APPROVED') {
      navigate('/tutor/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const isRejected = currentUser.verificationStatus === 'REJECTED';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleRefresh = async () => {
    await refreshProfile();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #f0f6ff 0%, #e8f0fe 60%, #EFF6FF 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Plus Jakarta Sans', 'Sora', sans-serif",
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '48px 40px',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 24px 64px rgba(0,47,108,0.14), 0 0 0 1px rgba(59,130,246,0.08)',
        textAlign: 'center',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '36px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: 'linear-gradient(135deg,#60A5FA,#2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(59,130,246,0.4)' }}>
            <BookOpen size={18} color="white" />
          </div>
          <span style={{ color: '#001a4d', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.4px' }}>TutorTime</span>
        </div>

        {/* Status Icon */}
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: isRejected ? 'linear-gradient(135deg,#FEE2E2,#FECACA)' : 'linear-gradient(135deg,#FFFBEB,#FEF3C7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: isRejected
            ? '0 8px 28px rgba(220,38,38,0.2)'
            : '0 8px 28px rgba(217,119,6,0.2)',
        }}>
          {isRejected
            ? <ShieldX size={36} color="#DC2626" />
            : <Clock size={36} color="#D97706" />}
        </div>

        {/* Heading */}
        <h1 style={{ color: '#001a4d', fontWeight: 800, fontSize: '24px', marginBottom: '12px', letterSpacing: '-0.5px' }}>
          {isRejected ? 'Account Not Approved' : 'Pending Approval'}
        </h1>

        {/* Message */}
        <p style={{ color: '#5a7bad', fontSize: '15px', lineHeight: 1.7, marginBottom: '32px' }}>
          {isRejected
            ? <>Your tutor account has been <strong style={{ color: '#DC2626' }}>rejected</strong> by an administrator. This may be due to incomplete profile information. Please contact support for more details.</>
            : <>Your tutor account is <strong style={{ color: '#D97706' }}>awaiting review</strong> by an administrator. You'll have full access to your dashboard once your account has been approved.</>}
        </p>

        {/* Status badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '8px 20px', borderRadius: '20px', marginBottom: '32px',
          background: isRejected ? '#FEF2F2' : '#FFFBEB',
          border: `1.5px solid ${isRejected ? '#FECACA' : '#FCD34D'}`,
        }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isRejected ? '#EF4444' : '#F59E0B' }} />
          <span style={{ color: isRejected ? '#DC2626' : '#92400E', fontWeight: 700, fontSize: '13px' }}>
            {isRejected ? 'Rejected' : 'Pending Review'}
          </span>
        </div>

        {/* What to expect (only for pending) */}
        {!isRejected && (
          <div style={{ background: '#f7faff', borderRadius: '14px', padding: '18px 20px', marginBottom: '28px', textAlign: 'left' }}>
            <div style={{ color: '#001a4d', fontWeight: 700, fontSize: '13px', marginBottom: '10px' }}>What happens next?</div>
            {[
              'An admin will review your registration',
              'You\'ll be able to access your dashboard once approved',
              'You can set up sessions and students after approval',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: i < 2 ? '8px' : 0 }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'linear-gradient(135deg,#60A5FA,#2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                  <span style={{ color: 'white', fontSize: '10px', fontWeight: 800 }}>{i + 1}</span>
                </div>
                <span style={{ color: '#5a7bad', fontSize: '13px', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
          {!isRejected && (
            <button
              onClick={handleRefresh}
              style={{
                width: '100%', padding: '13px', borderRadius: '12px',
                border: '1.5px solid #BFDBFE', background: '#EFF6FF',
                color: '#1E40AF', fontWeight: 700, fontSize: '14px',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '8px', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#DBEAFE'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#EFF6FF'; }}
            >
              <RefreshCw size={16} /> Check Approval Status
            </button>
          )}
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '13px', borderRadius: '12px',
              border: 'none', background: 'rgba(239,68,68,0.09)',
              color: '#DC2626', fontWeight: 700, fontSize: '14px',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '8px', transition: 'all 0.15s',
              border2: '1px solid rgba(239,68,68,0.18)',
            } as any}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.16)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.09)'; }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '24px' }}>
          Logged in as <strong>{currentUser.email}</strong>
        </p>
      </div>
    </div>
  );
}