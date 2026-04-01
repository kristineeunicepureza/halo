import { useEffect } from 'react';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { useApp } from '../../context/AppContext';
import { Bell, Calendar, ShieldCheck, XCircle, CheckCheck, UserPlus, AlertCircle, CheckCheck as MarkAll } from 'lucide-react';

const typeConfig = {
  BOOKING_CREATED:   { icon: Calendar,    color: '#3B82F6', bg: '#EFF6FF', label: 'New Booking'    },
  BOOKING_CONFIRMED: { icon: CheckCheck,  color: '#059669', bg: '#ECFDF5', label: 'Confirmed'      },
  BOOKING_CANCELLED: { icon: XCircle,     color: '#DC2626', bg: '#FEF2F2', label: 'Cancelled'      },
  BOOKING_REJECTED:  { icon: XCircle,     color: '#DC2626', bg: '#FEF2F2', label: 'Rejected'       },
  TUTOR_REGISTERED:  { icon: UserPlus,    color: '#D97706', bg: '#FFFBEB', label: 'Registration'   },
  TUTOR_APPROVED:    { icon: ShieldCheck, color: '#059669', bg: '#ECFDF5', label: 'Approved'       },
} as const;

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function NotificationsPage() {
  const { currentUser, notifications, unreadCount, fetchNotifications, markNotificationAsRead, markAllNotificationsRead } = useApp();

  useEffect(() => { fetchNotifications(); }, []);

  if (!currentUser) return null;

  const unread = notifications.filter(n => !n.isRead);
  const read   = notifications.filter(n =>  n.isRead);

  const NotifCard = ({ n }: { n: typeof notifications[0] }) => {
    const cfg = typeConfig[n.type] ?? { icon: AlertCircle, color: '#6B7280', bg: '#F3F4F6', label: 'Notice' };
    const { icon: Icon, color, bg, label } = cfg;
    return (
      <div onClick={() => !n.isRead && markNotificationAsRead(n.id)}
        style={{
          background: 'white', borderRadius: '14px', padding: '16px 20px',
          display: 'flex', alignItems: 'flex-start', gap: '14px',
          boxShadow: n.isRead ? '0 2px 8px rgba(0,47,108,0.05)' : '0 4px 16px rgba(0,47,108,0.1)',
          border: `1px solid ${n.isRead ? 'rgba(59,130,246,0.06)' : 'rgba(59,130,246,0.18)'}`,
          borderLeft: `4px solid ${n.isRead ? '#e0eaff' : color}`,
          cursor: n.isRead ? 'default' : 'pointer', transition: 'all 0.15s',
          opacity: n.isRead ? 0.75 : 1,
        }}
        onMouseEnter={e => { if (!n.isRead) e.currentTarget.style.transform = 'translateX(3px)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; }}
      >
        <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={18} color={color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#001a4d', fontWeight: n.isRead ? 500 : 700, fontSize: '14px' }}>{n.title}</span>
              <span style={{ padding: '1px 8px', borderRadius: '20px', fontSize: '10.5px', fontWeight: 700, background: bg, color }}>{label}</span>
            </div>
            <span style={{ color: '#94a3b8', fontSize: '11.5px', whiteSpace: 'nowrap' }}>{timeAgo(n.createdAt)}</span>
          </div>
          <p style={{ color: '#5a7bad', fontSize: '13px', lineHeight: 1.5 }}>{n.message}</p>
        </div>
        {!n.isRead && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0, marginTop: '4px' }} />}
      </div>
    );
  };

  return (
    <DashboardLayout role={currentUser.role}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ color: '#001a4d', fontWeight: 800, fontSize: '24px', letterSpacing: '-0.5px', marginBottom: '4px' }}>Notifications</h1>
          <p style={{ color: '#5a7bad', fontSize: '14px' }}>Stay updated with your latest activities.</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllNotificationsRead}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 18px', borderRadius: '10px', border: '1.5px solid #BFDBFE', background: '#EFF6FF', color: '#2563EB', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
            <MarkAll size={15} /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '16px', padding: '60px 24px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,47,108,0.07)' }}>
          <Bell size={52} style={{ color: '#BFDBFE', margin: '0 auto 16px', display: 'block' }} />
          <h3 style={{ color: '#001a4d', fontWeight: 700, fontSize: '18px', marginBottom: '6px' }}>All Caught Up!</h3>
          <p style={{ color: '#5a7bad', fontSize: '14px' }}>You have no notifications yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {unread.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ color: '#001a4d', fontWeight: 700, fontSize: '14px' }}>Unread</span>
                <span style={{ padding: '2px 9px', borderRadius: '20px', background: '#EFF6FF', color: '#2563EB', fontSize: '12px', fontWeight: 700 }}>{unread.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {unread.map(n => <NotifCard key={n.id} n={n} />)}
              </div>
            </div>
          )}
          {read.length > 0 && (
            <div>
              <div style={{ color: '#94a3b8', fontWeight: 600, fontSize: '13px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Earlier</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {read.map(n => <NotifCard key={n.id} n={n} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}