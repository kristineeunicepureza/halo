import { ReactNode, useState, useRef, useEffect } from 'react';
import { Sidebar } from '../shared/Sidebar';
import { useApp } from '../../context/AppContext';
import { Navigate, useNavigate } from 'react-router';
import { Bell, Check, CheckCheck, X, Calendar, ShieldCheck, XCircle, AlertCircle, UserPlus } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  role: 'STUDENT' | 'TUTOR' | 'ADMIN';
}

const notifIcon = {
  BOOKING_CREATED:   { Icon: Calendar,    color: '#3B82F6', bg: '#EFF6FF' },
  BOOKING_CONFIRMED: { Icon: CheckCheck,  color: '#059669', bg: '#ECFDF5' },
  BOOKING_CANCELLED: { Icon: XCircle,     color: '#DC2626', bg: '#FEF2F2' },
  BOOKING_REJECTED:  { Icon: XCircle,     color: '#DC2626', bg: '#FEF2F2' },
  TUTOR_REGISTERED:  { Icon: UserPlus,    color: '#D97706', bg: '#FFFBEB' },
  TUTOR_APPROVED:    { Icon: ShieldCheck, color: '#059669', bg: '#ECFDF5' },
} as const;

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const { currentUser, notifications, unreadCount, markNotificationAsRead, markAllNotificationsRead, fetchNotifications } = useApp();
  const navigate = useNavigate();
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef   = useRef<HTMLDivElement>(null);

  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role.toUpperCase() !== role.toUpperCase()) return <Navigate to="/login" replace />;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const myNotifs = notifications.slice(0, 20); // show up to 20 in dropdown

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleBellClick = () => {
    setBellOpen(o => !o);
    if (!bellOpen) fetchNotifications(); // refresh when opened
  };

  return (
    <div className="flex min-h-screen" style={{ background: 'linear-gradient(160deg,#f0f6ff 0%,#e8f0fe 50%,#EFF6FF 100%)' }}>
      <Sidebar role={role} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <div style={{
          background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(59,130,246,0.1)',
          padding: '12px 28px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 12px rgba(0,47,108,0.06)',
          position: 'sticky', top: 0, zIndex: 20,
        }}>
          <div>
            <div style={{ color: '#94a3b8', fontSize: '11.5px', fontWeight: 500 }}>{today}</div>
            <div style={{ color: '#001a4d', fontSize: '14.5px', fontWeight: 700, marginTop: '1px' }}>
              Hello, {currentUser.firstName}! 👋
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* ── Bell ── */}
            <div ref={bellRef} style={{ position: 'relative' }}>
              <button
                onClick={handleBellClick}
                style={{
                  width: '38px', height: '38px', borderRadius: '50%',
                  background: bellOpen ? '#EFF6FF' : 'rgba(59,130,246,0.07)',
                  border: '1.5px solid rgba(59,130,246,0.15)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#EFF6FF'; }}
                onMouseLeave={e => { if (!bellOpen) e.currentTarget.style.background = 'rgba(59,130,246,0.07)'; }}
              >
                <Bell size={17} color="#3B82F6" />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-3px', right: '-3px',
                    width: unreadCount > 9 ? '18px' : '16px', height: '16px',
                    borderRadius: '20px', background: 'linear-gradient(135deg,#EF4444,#B91C1C)',
                    color: 'white', fontSize: '9px', fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid white',
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {bellOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                  width: '360px', background: 'white', borderRadius: '16px',
                  boxShadow: '0 16px 48px rgba(0,47,108,0.18), 0 0 0 1px rgba(59,130,246,0.1)',
                  zIndex: 50, overflow: 'hidden',
                }}>
                  {/* Header */}
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid #e0eaff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <Bell size={15} color="#3B82F6" />
                      <span style={{ color: '#001a4d', fontWeight: 700, fontSize: '14px' }}>Notifications</span>
                      {unreadCount > 0 && (
                        <span style={{ padding: '1px 7px', borderRadius: '20px', background: '#EFF6FF', color: '#2563EB', fontSize: '11px', fontWeight: 700 }}>{unreadCount} new</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {unreadCount > 0 && (
                        <button onClick={markAllNotificationsRead} title="Mark all read"
                          style={{ padding: '5px 10px', borderRadius: '8px', border: '1px solid #BFDBFE', background: '#EFF6FF', color: '#2563EB', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Check size={11} /> All read
                        </button>
                      )}
                      <button onClick={() => { setBellOpen(false); navigate('/notifications'); }}
                        style={{ padding: '5px 10px', borderRadius: '8px', border: '1px solid #e0eaff', background: 'white', color: '#5a7bad', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                        See all
                      </button>
                      <button onClick={() => setBellOpen(false)} style={{ padding: '5px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}>
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  {/* List */}
                  <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                    {myNotifs.length === 0 ? (
                      <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                        <Bell size={32} style={{ margin: '0 auto 8px', opacity: 0.3, display: 'block' }} />
                        <p style={{ fontSize: '13px' }}>You're all caught up!</p>
                      </div>
                    ) : myNotifs.map(n => {
                      const cfg = notifIcon[n.type] ?? notifIcon.BOOKING_CREATED;
                      const { Icon, color, bg } = cfg;
                      return (
                        <div key={n.id}
                          onClick={() => markNotificationAsRead(n.id)}
                          style={{
                            padding: '12px 16px', borderBottom: '1px solid #f0f4fa', cursor: 'pointer',
                            background: n.isRead ? 'white' : '#f7faff',
                            display: 'flex', gap: '12px', alignItems: 'flex-start', transition: 'background 0.1s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f0f4fa'}
                          onMouseLeave={e => e.currentTarget.style.background = n.isRead ? 'white' : '#f7faff'}
                        >
                          <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon size={16} color={color} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ color: '#001a4d', fontWeight: n.isRead ? 500 : 700, fontSize: '13px', marginBottom: '2px' }}>{n.title}</div>
                            <div style={{ color: '#5a7bad', fontSize: '12px', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>{n.message}</div>
                            <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '4px' }}>
                              {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          {!n.isRead && <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#3B82F6', flexShrink: 0, marginTop: '4px' }} />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Avatar */}
            <button onClick={() => navigate('/profile')} style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #BFDBFE', cursor: 'pointer', flexShrink: 0, background: 'linear-gradient(135deg,#60A5FA,#2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(59,130,246,0.3)' }}>
              {currentUser.profilePhotoUrl
                ? <img src={currentUser.profilePhotoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ color: 'white', fontSize: '12px', fontWeight: 700 }}>{currentUser.firstName?.[0]}{currentUser.lastName?.[0]}</span>}
            </button>
          </div>
        </div>

        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 28px 40px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}