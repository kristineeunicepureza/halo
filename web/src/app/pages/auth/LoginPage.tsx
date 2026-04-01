import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useApp } from '../../context/AppContext';
import { toast } from 'sonner';
import { BookOpen, Mail, Lock, ArrowRight, GraduationCap, Users, Star, AlertCircle } from 'lucide-react';
import { isValidLoginEmail, CIT_DOMAIN, ADMIN_DOMAIN } from '../../services/authService';

export function LoginPage() {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [emailError, setEmailError] = useState('');
  const navigate = useNavigate();
  const { login, isLoading, error, currentUser, clearError } = useApp();

  useEffect(() => {
    if (currentUser) redirectAfterLogin();
  }, [currentUser]);

  const redirectAfterLogin = () => {
    if (!currentUser) return;
    if (currentUser.role === 'STUDENT') navigate('/student/dashboard');
    else if (currentUser.role === 'ADMIN') navigate('/admin/dashboard');
    else if (currentUser.role === 'TUTOR') {
      // Pending or rejected tutors land on the waiting page
      if (currentUser.verificationStatus === 'APPROVED') {
        navigate('/tutor/dashboard');
      } else {
        navigate('/tutor/pending');
      }
    }
  };

  const validateEmail = (value: string) => {
    if (!value) { setEmailError(''); return; }
    if (!isValidLoginEmail(value)) {
      setEmailError(`Only ${CIT_DOMAIN} or authorised ${ADMIN_DOMAIN} addresses are accepted.`);
    } else {
      setEmailError('');
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    clearError();
    validateEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields.'); return; }
    if (!isValidLoginEmail(email)) {
      toast.error(`Only ${CIT_DOMAIN} or authorised ${ADMIN_DOMAIN} addresses are accepted.`);
      return;
    }
    const success = await login(email, password);
    if (success) toast.success('Login successful!');
    else toast.error(error || 'Login failed. Please check your credentials.');
  };

  const stats = [
    { icon: GraduationCap, label: 'Active Tutors', value: '200+' },
    { icon: Users,         label: 'Students',       value: '1,500+' },
    { icon: Star,          label: 'Avg Rating',     value: '4.9★' },
  ];

  const inputBase: React.CSSProperties = {
    width: '100%', padding: '13px 14px 13px 42px', borderRadius: '12px',
    border: '1.5px solid #e0eaff', background: '#f7faff',
    color: '#001a4d', fontSize: '14px',
    outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#f0f6ff' }}>

      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden"
        style={{ width: '46%', background: 'linear-gradient(145deg, #001a4d 0%, #002F6C 40%, #0047AB 75%, #1D6FE8 100%)', padding: '48px' }}
      >
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(59,130,246,0.18)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-40px', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(37,99,235,0.22)', filter: 'blur(50px)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'linear-gradient(135deg, #60A5FA, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(59,130,246,0.5)' }}>
            <BookOpen size={22} color="white" />
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.5px' }}>TutorTime</div>
            <div style={{ color: 'rgba(147,197,253,0.75)', fontSize: '12px' }}>CIT Peer Campus Tutoring</div>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <h2 style={{ color: 'white', fontWeight: 800, fontSize: '38px', lineHeight: 1.15, letterSpacing: '-1px', marginBottom: '18px' }}>
            Learn Better,<br />
            <span style={{ background: 'linear-gradient(90deg, #93C5FD, #60A5FA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Together.</span>
          </h2>
          <p style={{ color: 'rgba(186,214,255,0.8)', fontSize: '15px', lineHeight: 1.7, maxWidth: '340px' }}>
            Connect with peer tutors at CIT. Schedule sessions, track progress, and achieve your academic goals.
          </p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '36px' }}>
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ padding: '14px 18px', borderRadius: '14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', textAlign: 'center' }}>
                <Icon size={18} color="#93C5FD" style={{ margin: '0 auto 6px' }} />
                <div style={{ color: 'white', fontWeight: 700, fontSize: '16px' }}>{value}</div>
                <div style={{ color: 'rgba(147,197,253,0.65)', fontSize: '10px', marginTop: '2px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', padding: '18px 20px', borderRadius: '14px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ color: 'rgba(200,220,255,0.85)', fontSize: '13px', fontStyle: 'italic', lineHeight: 1.6 }}>
            "TutorTime helped me finally understand calculus. My tutor explained it so clearly!"
          </p>
          <div style={{ color: 'rgba(147,197,253,0.7)', fontSize: '12px', marginTop: '8px', fontWeight: 600 }}>— Maria Santos, BSIT-2</div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12" style={{ background: 'white' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #3B82F6, #0047AB)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={20} color="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '20px', color: '#001f5c' }}>TutorTime</span>
          </div>

          <h1 style={{ color: '#001a4d', fontWeight: 800, fontSize: '30px', letterSpacing: '-0.7px', marginBottom: '6px' }}>Welcome back</h1>
          <p style={{ color: '#5a7bad', fontSize: '15px', marginBottom: '36px' }}>Sign in to continue to your dashboard</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* Email */}
            <div>
              <label style={{ color: '#1e3a6e', fontWeight: 600, fontSize: '13.5px', display: 'block', marginBottom: '7px' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={17} color={emailError ? '#EF4444' : '#93C5FD'}
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="email" value={email} onChange={handleEmailChange}
                  placeholder="student@cit.edu" required
                  style={{ ...inputBase, ...(emailError ? { borderColor: '#FCA5A5', background: '#FFF5F5' } : {}) }}
                  onFocus={(e) => { if (!emailError) { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 4px rgba(59,130,246,0.1)'; } }}
                  onBlur={(e) => { if (!emailError) { e.target.style.borderColor = '#e0eaff'; e.target.style.boxShadow = 'none'; } }}
                />
              </div>
              {emailError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', color: '#DC2626', fontSize: '12px' }}>
                  <AlertCircle size={13} /> {emailError}
                </div>
              )}
            </div>

            {/* Password */}
            <div>
              <label style={{ color: '#1e3a6e', fontWeight: 600, fontSize: '13.5px', display: 'block', marginBottom: '7px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={17} color="#93C5FD"
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="password" value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError(); }}
                  placeholder="Enter your password" required
                  style={inputBase}
                  onFocus={(e) => { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 4px rgba(59,130,246,0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e0eaff'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px', borderRadius: '10px', background: '#FEF2F2', border: '1px solid #FCA5A5' }}>
                <AlertCircle size={16} color="#DC2626" style={{ flexShrink: 0, marginTop: '1px' }} />
                <span style={{ color: '#991B1B', fontSize: '13px', lineHeight: 1.5 }}>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit" disabled={isLoading || !!emailError}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                cursor: (isLoading || !!emailError) ? 'not-allowed' : 'pointer',
                background: (isLoading || !!emailError)
                  ? 'linear-gradient(135deg, #93C5FD, #60A5FA)'
                  : 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                color: 'white', fontWeight: 700, fontSize: '15px',
                boxShadow: '0 6px 20px rgba(37,99,235,0.38)',
                transition: 'all 0.2s', opacity: isLoading ? 0.8 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                marginTop: '4px',
              }}
              onMouseEnter={(e) => { if (!isLoading && !emailError) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(37,99,235,0.45)'; } }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,99,235,0.38)'; }}
            >
              {isLoading ? (
                <><span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> Signing in…</>
              ) : (
                <>Sign In <ArrowRight size={17} /></>
              )}
            </button>
          </form>

          <p style={{ color: '#5a7bad', fontSize: '13.5px', textAlign: 'center', marginTop: '22px' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none' }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >Create one</Link>
          </p>

          <div style={{ marginTop: '28px', padding: '14px 16px', borderRadius: '12px', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '1px solid #bfdbfe' }}>
            <p style={{ color: '#1e3a6e', fontWeight: 700, fontSize: '12px', marginBottom: '6px' }}>🔒 Access Policy</p>
            <p style={{ color: '#3B6AC0', fontSize: '12px', lineHeight: 1.6 }}>
              Students &amp; Tutors: use your <strong>@cit.edu</strong> institutional email.<br />
              Admin access is restricted to authorised accounts only.
            </p>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}