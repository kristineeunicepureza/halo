import { Link } from 'react-router';
import { Home, ArrowLeft, BookOpen } from 'lucide-react';

export function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #001a4d 0%, #002F6C 45%, #0047AB 100%)' }}
    >
      {/* Background decorations */}
      <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '350px', height: '350px', borderRadius: '50%', background: 'rgba(59,130,246,0.18)', filter: 'blur(60px)' }} />
      <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(37,99,235,0.22)', filter: 'blur(50px)' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div style={{ position: 'relative', textAlign: 'center', maxWidth: '480px' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '40px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '13px',
            background: 'linear-gradient(135deg, #60A5FA, #2563EB)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(59,130,246,0.5)',
          }}>
            <BookOpen size={22} color="white" />
          </div>
          <span style={{ color: 'white', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.4px' }}>TutorTime</span>
        </div>

        {/* 404 number */}
        <div style={{
          fontSize: '120px', fontWeight: 900, lineHeight: 1,
          background: 'linear-gradient(135deg, #93C5FD 0%, #60A5FA 50%, #3B82F6 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: '8px', letterSpacing: '-4px',
        }}>
          404
        </div>

        <h1 style={{ color: 'white', fontWeight: 700, fontSize: '26px', marginBottom: '12px', letterSpacing: '-0.5px' }}>
          Page Not Found
        </h1>
        <p style={{ color: 'rgba(186,214,255,0.75)', fontSize: '15px', lineHeight: 1.65, marginBottom: '36px' }}>
          The page you're looking for doesn't exist or has been moved to another location.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link
            to="/login"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '13px 24px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
              color: 'white', fontWeight: 700, fontSize: '14px',
              textDecoration: 'none',
              boxShadow: '0 6px 20px rgba(37,99,235,0.45)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(37,99,235,0.5)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,99,235,0.45)'; }}
          >
            <Home size={17} />
            Back to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '13px 24px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.18)',
              color: 'rgba(200,220,255,0.9)', fontWeight: 600, fontSize: '14px',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
          >
            <ArrowLeft size={17} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}