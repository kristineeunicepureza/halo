import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useApp, UserRole } from '../../context/AppContext';
import { RegisterRequest, isValidRegisterEmail, CIT_DOMAIN } from '../../services/authService';
import { toast } from 'sonner';
import { BookOpen, Mail, Lock, User, ArrowRight, GraduationCap, Users2, AlertCircle } from 'lucide-react';

export function SignupPage() {
  const [formData, setFormData] = useState({
    lastName: '', firstName: '', middleInitial: '',
    email: '', password: '', confirmPassword: '',
    role: 'STUDENT' as UserRole,
  });
  const [emailError, setEmailError]       = useState('');
  const [passwordError, setPasswordError] = useState('');

  const navigate = useNavigate();
  const { signup, isLoading, error, currentUser, clearError } = useApp();

  useEffect(() => {
    if (currentUser) redirectAfterSignup();
  }, [currentUser]);

  const redirectAfterSignup = () => {
    if (!currentUser) return;
    if (currentUser.role === 'STUDENT') navigate('/student/dashboard');
    else if (currentUser.role === 'ADMIN') navigate('/admin/dashboard');
    else if (currentUser.role === 'TUTOR') {
      // New tutors are always PENDING — send them to the waiting page
      if (currentUser.verificationStatus === 'APPROVED') {
        navigate('/tutor/dashboard');
      } else {
        navigate('/tutor/pending');
      }
    }
  };

  const validateEmail = (value: string) => {
    if (!value) { setEmailError(''); return; }
    if (!isValidRegisterEmail(value)) {
      setEmailError(`Only ${CIT_DOMAIN} institutional email addresses are accepted.`);
    } else {
      setEmailError('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    clearError();
    if (name === 'email') validateEmail(value);
    if (name === 'confirmPassword' || name === 'password') {
      const pw  = name === 'password' ? value : formData.password;
      const cpw = name === 'confirmPassword' ? value : formData.confirmPassword;
      setPasswordError(cpw && pw !== cpw ? 'Passwords do not match.' : '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidRegisterEmail(formData.email)) {
      toast.error(`Only ${CIT_DOMAIN} institutional email addresses are accepted.`);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }

    const registerData: RegisterRequest = {
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      middleInitial: formData.middleInitial || undefined,
      role: formData.role,
    };

    const success = await signup(registerData);
    if (success) toast.success('Account created successfully! Welcome to TutorTime.');
    else toast.error(error || 'Registration failed. Please try again.');
  };

  const inputBase: React.CSSProperties = {
    width: '100%', padding: '12px 14px 12px 42px', borderRadius: '11px',
    border: '1.5px solid #e0eaff', background: '#f7faff',
    color: '#001a4d', fontSize: '14px',
    outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  };
  const inputNoIcon: React.CSSProperties = { ...inputBase, paddingLeft: '14px' };
  const inputErr: React.CSSProperties   = { ...inputBase, borderColor: '#FCA5A5', background: '#FFF5F5' };
  const labelStyle: React.CSSProperties = { color: '#1e3a6e', fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '6px' };
  const iconStyle: React.CSSProperties  = { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' };

  const canSubmit = !emailError && !passwordError && !isLoading;

  return (
    <div className="min-h-screen flex" style={{ background: 'white' }}>

      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden"
        style={{ width: '38%', background: 'linear-gradient(145deg, #001a4d 0%, #002F6C 45%, #0047AB 80%, #1a6eef 100%)', padding: '44px' }}
      >
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '260px', height: '260px', borderRadius: '50%', background: 'rgba(59,130,246,0.18)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '-50px', left: '-30px', width: '230px', height: '230px', borderRadius: '50%', background: 'rgba(37,99,235,0.2)', filter: 'blur(45px)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #60A5FA, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(59,130,246,0.45)' }}>
            <BookOpen size={20} color="white" />
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: '18px', letterSpacing: '-0.4px' }}>TutorTime</div>
            <div style={{ color: 'rgba(147,197,253,0.7)', fontSize: '11px' }}>CIT Campus Tutoring</div>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <h2 style={{ color: 'white', fontWeight: 800, fontSize: '32px', lineHeight: 1.2, letterSpacing: '-0.8px', marginBottom: '16px' }}>
            Join the<br />
            <span style={{ background: 'linear-gradient(90deg, #93C5FD, #60A5FA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TutorTime</span>
            <br />Community
          </h2>
          <p style={{ color: 'rgba(186,214,255,0.8)', fontSize: '14px', lineHeight: 1.7, maxWidth: '280px' }}>
            Use your <strong style={{ color: '#93C5FD' }}>@cit.edu</strong> email to register as a student or tutor.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '30px' }}>
            {[
              { icon: GraduationCap, text: 'Find expert peer tutors' },
              { icon: Users2,        text: 'Book flexible sessions' },
              { icon: BookOpen,      text: 'Track your progress' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'rgba(59,130,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} color="#93C5FD" />
                </div>
                <span style={{ color: 'rgba(200,220,255,0.85)', fontSize: '13.5px' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', color: 'rgba(147,197,253,0.45)', fontSize: '11px' }}>© 2025 TutorTime · IT342 Group 7</div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10 overflow-y-auto" style={{ background: 'white' }}>
        <div style={{ width: '100%', maxWidth: '520px', paddingTop: '20px', paddingBottom: '20px' }}>

          <div className="flex lg:hidden items-center gap-3 mb-6">
            <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: 'linear-gradient(135deg, #3B82F6, #0047AB)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={19} color="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '18px', color: '#001f5c' }}>TutorTime</span>
          </div>

          <h1 style={{ color: '#001a4d', fontWeight: 800, fontSize: '26px', letterSpacing: '-0.6px', marginBottom: '4px' }}>Create your account</h1>
          <p style={{ color: '#5a7bad', fontSize: '14px', marginBottom: '28px' }}>Use your <strong>@cit.edu</strong> email to get started</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Name row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: '12px' }}>
              {['lastName', 'firstName'].map((field) => (
                <div key={field}>
                  <label style={labelStyle}>{field === 'lastName' ? 'Last Name' : 'First Name'}</label>
                  <div style={{ position: 'relative' }}>
                    <User size={15} color="#93C5FD" style={iconStyle} />
                    <input name={field} type="text" value={(formData as any)[field]} onChange={handleChange} required
                      style={inputBase}
                      onFocus={(e) => { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#e0eaff'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                </div>
              ))}
              <div>
                <label style={labelStyle}>M.I.</label>
                <input name="middleInitial" type="text" value={formData.middleInitial} onChange={handleChange} maxLength={1}
                  style={inputNoIcon}
                  onFocus={(e) => { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e0eaff'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={labelStyle}>CIT Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color={emailError ? '#EF4444' : '#93C5FD'} style={iconStyle} />
                <input name="email" type="email" value={formData.email} onChange={handleChange}
                  placeholder="yourname@cit.edu" required
                  style={emailError ? inputErr : inputBase}
                  onFocus={(e) => { if (!emailError) { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; } }}
                  onBlur={(e) => { if (!emailError) { e.target.style.borderColor = '#e0eaff'; e.target.style.boxShadow = 'none'; } }}
                />
              </div>
              {emailError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', color: '#DC2626', fontSize: '12px' }}>
                  <AlertCircle size={13} /> {emailError}
                </div>
              )}
            </div>

            {/* Passwords */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { name: 'password', label: 'Password', placeholder: 'Min 8 chars' },
                { name: 'confirmPassword', label: 'Confirm Password', placeholder: 'Repeat password' },
              ].map(({ name, label, placeholder }) => (
                <div key={name}>
                  <label style={labelStyle}>{label}</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color="#93C5FD" style={iconStyle} />
                    <input name={name} type="password" value={(formData as any)[name]} onChange={handleChange}
                      placeholder={placeholder} required
                      style={(name === 'confirmPassword' && passwordError) ? inputErr : inputBase}
                      onFocus={(e) => { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                      onBlur={(e) => { if (!passwordError) { e.target.style.borderColor = '#e0eaff'; e.target.style.boxShadow = 'none'; } }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {passwordError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '-8px', color: '#DC2626', fontSize: '12px' }}>
                <AlertCircle size={13} /> {passwordError}
              </div>
            )}

            {/* Role */}
            <div>
              <label style={{ ...labelStyle, marginBottom: '10px' }}>Register as</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {(['STUDENT', 'TUTOR'] as UserRole[]).map((r) => (
                  <label key={r} style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    padding: '12px 16px', borderRadius: '12px', cursor: 'pointer',
                    border: `1.5px solid ${formData.role === r ? '#3B82F6' : '#e0eaff'}`,
                    background: formData.role === r ? 'linear-gradient(135deg, #eff6ff, #dbeafe)' : '#f7faff',
                    transition: 'all 0.2s',
                  }}>
                    <input type="radio" name="role" value={r} checked={formData.role === r} onChange={handleChange} style={{ display: 'none' }} />
                    {r === 'STUDENT'
                      ? <GraduationCap size={18} color={formData.role === r ? '#2563EB' : '#93C5FD'} />
                      : <Users2 size={18} color={formData.role === r ? '#2563EB' : '#93C5FD'} />
                    }
                    <span style={{ color: formData.role === r ? '#1e3a6e' : '#6B8FC4', fontWeight: formData.role === r ? 700 : 500, fontSize: '14px' }}>
                      {r.charAt(0) + r.slice(1).toLowerCase()}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Server error */}
            {error && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px', borderRadius: '10px', background: '#FEF2F2', border: '1px solid #FCA5A5' }}>
                <AlertCircle size={16} color="#DC2626" style={{ flexShrink: 0, marginTop: '1px' }} />
                <span style={{ color: '#991B1B', fontSize: '13px', lineHeight: 1.5 }}>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit" disabled={!canSubmit}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                background: canSubmit
                  ? 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'
                  : 'linear-gradient(135deg, #93C5FD, #60A5FA)',
                color: 'white', fontWeight: 700, fontSize: '15px',
                boxShadow: '0 6px 20px rgba(37,99,235,0.38)',
                transition: 'all 0.2s', opacity: isLoading ? 0.8 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px',
              }}
              onMouseEnter={(e) => { if (canSubmit) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(37,99,235,0.45)'; } }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,99,235,0.38)'; }}
            >
              {isLoading ? (
                <><span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> Creating Account…</>
              ) : (
                <>Create Account <ArrowRight size={17} /></>
              )}
            </button>
          </form>

          <p style={{ color: '#5a7bad', fontSize: '13.5px', textAlign: 'center', marginTop: '20px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none' }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >Sign in</Link>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}