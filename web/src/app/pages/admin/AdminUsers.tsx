import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/apiService';
import { Users, Search, Shield, GraduationCap, BookOpen, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface UserRow {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'STUDENT' | 'TUTOR' | 'ADMIN';
  profilePhotoUrl?: string;
  verificationStatus?: string;
}

type RoleFilter = 'ALL' | 'STUDENT' | 'TUTOR' | 'ADMIN';

const roleIcon = { STUDENT: GraduationCap, TUTOR: BookOpen, ADMIN: Shield };
const roleColor: Record<string, string> = {
  STUDENT: '#3B82F6',
  TUTOR:   '#10B981',
  ADMIN:   '#F59E0B',
};
const roleBg: Record<string, string> = {
  STUDENT: '#EFF6FF',
  TUTOR:   '#ECFDF5',
  ADMIN:   '#FFFBEB',
};

export function AdminUsers() {
  const { currentUser } = useApp();
  const [users,       setUsers]       = useState<UserRow[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [roleFilter,  setRoleFilter]  = useState<RoleFilter>('ALL');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.get<UserRow[]>('/api/users');
      setUsers(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  if (!currentUser) return null;

  const counts = { ALL: users.length, STUDENT: 0, TUTOR: 0, ADMIN: 0 };
  users.forEach(u => { counts[u.role] = (counts[u.role] || 0) + 1; });

  const filtered = users.filter(u => {
    const matchSearch = `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const filterTabs: { key: RoleFilter; label: string; icon: React.ElementType; color: string; bg: string }[] = [
    { key: 'ALL',     label: 'All Users', icon: Users,          color: '#3B82F6', bg: '#EFF6FF' },
    { key: 'STUDENT', label: 'Students',  icon: GraduationCap,  color: '#3B82F6', bg: '#EFF6FF' },
    { key: 'TUTOR',   label: 'Tutors',    icon: BookOpen,        color: '#10B981', bg: '#ECFDF5' },
    { key: 'ADMIN',   label: 'Admins',    icon: Shield,          color: '#F59E0B', bg: '#FFFBEB' },
  ];

  return (
    <DashboardLayout role="ADMIN">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#001a4d', fontWeight: 800, fontSize: '24px', letterSpacing: '-0.5px', marginBottom: '4px' }}>
          User Management
        </h1>
        <p style={{ color: '#5a7bad', fontSize: '14px' }}>All registered TutorTime accounts.</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '22px' }}>
        {(['STUDENT', 'TUTOR', 'ADMIN'] as const).map(r => {
          const Icon = roleIcon[r];
          return (
            <div
              key={r}
              onClick={() => setRoleFilter(prev => prev === r ? 'ALL' : r)}
              style={{
                background: roleFilter === r ? roleBg[r] : 'white',
                borderRadius: '14px', padding: '18px 20px',
                display: 'flex', alignItems: 'center', gap: '14px',
                boxShadow: '0 4px 16px rgba(0,47,108,0.07)',
                border: `1.5px solid ${roleFilter === r ? roleColor[r] + '55' : 'rgba(59,130,246,0.08)'}`,
                cursor: 'pointer', transition: 'all 0.18s',
              }}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: roleBg[r], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={20} color={roleColor[r]} />
              </div>
              <div>
                <div style={{ color: '#001a4d', fontWeight: 800, fontSize: '24px', lineHeight: 1 }}>{counts[r]}</div>
                <div style={{ color: '#6B8FC4', fontSize: '12px', marginTop: '3px' }}>{r.charAt(0) + r.slice(1).toLowerCase()}s</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table card */}
      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,47,108,0.07)', border: '1px solid rgba(59,130,246,0.08)', overflow: 'hidden' }}>

        {/* Filter tabs + search toolbar */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #e0eaff' }}>
          {/* Role filter pills */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            {filterTabs.map(({ key, label, icon: Icon, color, bg }) => {
              const active = roleFilter === key;
              return (
                <button
                  key={key}
                  onClick={() => setRoleFilter(key)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '6px 14px', borderRadius: '20px', border: `1.5px solid ${active ? color : '#e0eaff'}`,
                    background: active ? bg : 'white',
                    color: active ? color : '#6B8FC4',
                    fontWeight: active ? 700 : 500, fontSize: '13px',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  <Icon size={13} />
                  {label}
                  <span style={{
                    padding: '1px 7px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                    background: active ? color + '22' : '#f0f4fa',
                    color: active ? color : '#94a3b8',
                  }}>
                    {key === 'ALL' ? counts.ALL : counts[key as keyof typeof counts]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search + refresh row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '340px' }}>
              <Search size={15} color="#93C5FD" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder={`Search ${roleFilter === 'ALL' ? 'users' : roleFilter.toLowerCase() + 's'}…`}
                style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '10px', border: '1.5px solid #e0eaff', background: '#f7faff', fontSize: '13.5px', outline: 'none', color: '#001a4d', boxSizing: 'border-box' as const }}
                onFocus={e => { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#e0eaff'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <button onClick={fetchUsers} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '10px', background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#2563EB', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f7faff' }}>
                {['User', 'Email', 'Role'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', color: '#5a7bad', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.7px', whiteSpace: 'nowrap', borderBottom: '1px solid #e0eaff' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading users…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={3} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  <Users size={40} style={{ margin: '0 auto 10px', opacity: 0.4, display: 'block' }} />
                  No {roleFilter === 'ALL' ? 'users' : roleFilter.toLowerCase() + 's'} found.
                </td></tr>
              ) : filtered.map((u, i) => {
                const Icon   = roleIcon[u.role];
                const isSelf = u.id === currentUser.id;
                return (
                  <tr
                    key={u.id}
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f0f4fa' : 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f7faff')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Name */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid #DBEAFE' }}>
                          {u.profilePhotoUrl ? (
                            <img src={u.profilePhotoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#60A5FA,#2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ color: 'white', fontSize: '12px', fontWeight: 700 }}>{u.firstName?.[0]}{u.lastName?.[0]}</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <div style={{ color: '#001a4d', fontWeight: 600, fontSize: '14px' }}>
                            {u.firstName} {u.lastName}
                            {isSelf && (
                              <span style={{ marginLeft: '6px', padding: '1px 7px', borderRadius: '20px', background: '#EFF6FF', color: '#3B82F6', fontSize: '10px', fontWeight: 700 }}>You</span>
                            )}
                          </div>
                          <div style={{ color: '#94a3b8', fontSize: '12px' }}>ID: {u.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td style={{ padding: '14px 20px', color: '#5a7bad', fontSize: '13.5px' }}>{u.email}</td>

                    {/* Role badge */}
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', background: roleBg[u.role], color: roleColor[u.role], fontSize: '12px', fontWeight: 700 }}>
                        <Icon size={12} /> {u.role}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!loading && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid #f0f4fa', color: '#94a3b8', fontSize: '12px' }}>
            Showing {filtered.length} of {users.length} users
            {roleFilter !== 'ALL' && <span style={{ marginLeft: '4px' }}>· filtered by <strong style={{ color: roleColor[roleFilter] }}>{roleFilter}</strong></span>}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}