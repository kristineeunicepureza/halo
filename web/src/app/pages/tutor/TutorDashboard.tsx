import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import { Sidebar } from '../../components/shared/Sidebar';
import { Calendar, User, ArrowRight, Sparkles, Clock, TrendingUp, Bell } from 'lucide-react';
import { api } from '../../services/apiService';

export function TutorDashboard() {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState({ upcomingSessions: 0, completedSessions: 0, hoursTaught: 0 });

  useEffect(() => {
    if (!currentUser) navigate('/login');
    loadStats();
  }, [currentUser, navigate]);

  const loadStats = async () => {
    if (!currentUser?.id) return;
    try {
      const data = await api.get(`/api/stats/tutor/${currentUser.id}`);
      setStatsData(data);
    } catch (e) {
      console.error('Failed to load tutor stats', e);
    }
  };

  if (!currentUser) return null;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const quickActions = [
    { icon: Calendar, label: 'My Schedule', desc: 'Manage availability', path: '/tutor/schedule', gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', shadow: 'rgba(37,99,235,0.3)' },
    { icon: User, label: 'Edit Profile', desc: 'Update your info', path: '/profile', gradient: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', shadow: 'rgba(109,40,217,0.3)' },
    { icon: Bell, label: 'Notifications', desc: 'See your alerts', path: '/notifications', gradient: 'linear-gradient(135deg, #F59E0B, #D97706)', shadow: 'rgba(217,119,6,0.3)' },
  ];

  const stats = [
    { label: 'Upcoming Sessions', value: statsData.upcomingSessions, icon: Calendar, color: '#3B82F6' },
    { label: 'Completed Sessions', value: statsData.completedSessions, icon: TrendingUp, color: '#10B981' },
    { label: 'Hours Taught', value: statsData.hoursTaught, icon: Clock, color: '#F59E0B' },
  ];

  return (
    <div className="flex min-h-screen" style={{ background: 'linear-gradient(160deg, #f0f6ff 0%, #e8f0fe 60%, #EFF6FF 100%)' }}>
      <Sidebar role="TUTOR" />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div style={{
          background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(59,130,246,0.1)',
          padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 2px 12px rgba(0,47,108,0.06)',
        }}>
          <div>
            <div style={{ color: '#94a3b8', fontSize: '12px' }}>{today}</div>
            <div style={{ color: '#001a4d', fontSize: '15px', fontWeight: 700 }}>Tutor Dashboard</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #60A5FA, #2563EB)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 3px 10px rgba(59,130,246,0.35)', cursor: 'pointer',
            }} onClick={() => navigate('/profile')}>
              <span style={{ color: 'white', fontSize: '13px', fontWeight: 700 }}>
                {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
              </span>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>

          {/* Hero */}
          <div style={{
            background: 'linear-gradient(135deg, #1a2a6c 0%, #002F6C 40%, #0047AB 80%, #005bbf 100%)',
            borderRadius: '20px', padding: '28px 32px', marginBottom: '28px', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(59,130,246,0.2)', filter: 'blur(40px)' }} />
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Sparkles size={16} color="#60A5FA" />
                <span style={{ color: '#93C5FD', fontSize: '13px', fontWeight: 600 }}>Welcome back, Tutor</span>
              </div>
              <h1 style={{ color: 'white', fontWeight: 800, fontSize: '26px', letterSpacing: '-0.5px', marginBottom: '8px' }}>
                {currentUser.firstName} {currentUser.lastName}
              </h1>
              <p style={{ color: 'rgba(186,214,255,0.75)', fontSize: '14px', marginBottom: '20px' }}>
                Your knowledge makes a difference. Add availability to start accepting bookings.
              </p>
              <button
                onClick={() => navigate('/tutor/schedule')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '10px 20px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                  color: 'white', fontWeight: 700, fontSize: '13.5px',
                  border: 'none', cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.45)', transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                Manage Schedule <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
            {stats.map(({ label, value, icon: Icon, color }) => (
              <div key={label} style={{
                background: 'white', borderRadius: '16px', padding: '20px',
                boxShadow: '0 4px 20px rgba(0,47,108,0.07)',
                border: '1px solid rgba(59,130,246,0.08)',
                display: 'flex', alignItems: 'center', gap: '16px',
              }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '13px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={22} color={color} />
                </div>
                <div>
                  <div style={{ color: '#001a4d', fontSize: '26px', fontWeight: 800, lineHeight: 1 }}>{value}</div>
                  <div style={{ color: '#6B8FC4', fontSize: '12px', marginTop: '4px' }}>{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <h2 style={{ color: '#001a4d', fontWeight: 800, fontSize: '17px', marginBottom: '14px', letterSpacing: '-0.3px' }}>
            Quick Actions
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
            {quickActions.map(({ icon: Icon, label, desc, path, gradient, shadow }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                style={{
                  background: 'white', borderRadius: '16px', padding: '22px 20px',
                  border: '1px solid rgba(59,130,246,0.1)',
                  boxShadow: '0 4px 18px rgba(0,47,108,0.07)',
                  cursor: 'pointer', transition: 'all 0.25s', textAlign: 'left',
                  display: 'flex', flexDirection: 'column', gap: '14px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 12px 32px ${shadow}`;
                  e.currentTarget.style.borderColor = '#93C5FD';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 18px rgba(0,47,108,0.07)';
                  e.currentTarget.style.borderColor = 'rgba(59,130,246,0.1)';
                }}
              >
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${shadow}` }}>
                  <Icon size={22} color="white" />
                </div>
                <div>
                  <div style={{ color: '#001a4d', fontWeight: 700, fontSize: '14.5px', marginBottom: '3px' }}>{label}</div>
                  <div style={{ color: '#6B8FC4', fontSize: '12px' }}>{desc}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <ArrowRight size={16} color="#93C5FD" />
                </div>
              </button>
            ))}
          </div>

          {/* Profile card */}
          <div style={{
            background: 'white', borderRadius: '16px', padding: '24px',
            boxShadow: '0 4px 20px rgba(0,47,108,0.07)', border: '1px solid rgba(59,130,246,0.08)',
          }}>
            <h2 style={{ color: '#001a4d', fontWeight: 700, fontSize: '15px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} color="#3B82F6" /> Account Details
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {[
                { label: 'Full Name', value: `${currentUser.firstName} ${currentUser.middleInitial ? currentUser.middleInitial + '. ' : ''}${currentUser.lastName}` },
                { label: 'Email', value: currentUser.email },
                { label: 'Role', value: currentUser.role },
              ].map(({ label, value }) => (
                <div key={label} style={{ padding: '14px', borderRadius: '12px', background: '#f7faff', border: '1px solid #e0eaff' }}>
                  <div style={{ color: '#93B4D8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '5px' }}>{label}</div>
                  <div style={{ color: '#001a4d', fontSize: '13.5px', fontWeight: 600 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}