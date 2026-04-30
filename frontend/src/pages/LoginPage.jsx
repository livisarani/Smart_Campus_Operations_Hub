// src/pages/LoginPage.jsx
import { useState } from 'react'
import { useSearchParams, Navigate } from 'react-router-dom'
import useAuthStore from '../context/authStore.js'

const T = { primary: '#236331', primaryDark: '#1a4a25', primaryLight: '#2d7a3d', secondary: '#515953', bg: '#f5f6f5', border: '#e3e6e3' }

function GoogleLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.55-.2-2.27H12v4.31h6.44a5.5 5.5 0 0 1-2.39 3.61v2.99h3.87c2.26-2.08 3.57-5.15 3.57-8.64Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.87-2.99c-1.07.72-2.44 1.15-4.06 1.15-3.12 0-5.76-2.11-6.71-4.95H1.29v3.08A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.29 14.3A7.2 7.2 0 0 1 4.91 12c0-.8.14-1.58.38-2.3V6.62H1.29A12 12 0 0 0 0 12c0 1.94.46 3.77 1.29 5.38l4-3.08Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.61 4.58 1.8l3.43-3.43C17.94 1.2 15.24 0 12 0A12 12 0 0 0 1.29 6.62l4 3.08c.95-2.84 3.59-4.93 6.71-4.93Z"
      />
    </svg>
  )
}

function GitHubLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 .5C5.65.5.5 5.66.5 12.03c0 5.09 3.3 9.4 7.87 10.93.58.11.79-.25.79-.56 0-.27-.01-1-.02-1.95-3.2.69-3.88-1.55-3.88-1.55-.52-1.33-1.28-1.68-1.28-1.68-1.04-.72.08-.71.08-.71 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.67 1.25 3.32.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.3 1.18-3.11-.12-.29-.51-1.46.11-3.03 0 0 .97-.31 3.17 1.19a11 11 0 0 1 5.77 0c2.2-1.5 3.17-1.19 3.17-1.19.62 1.57.23 2.74.11 3.03.73.81 1.18 1.85 1.18 3.11 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.05.78 2.12 0 1.53-.01 2.76-.01 3.14 0 .31.21.68.8.56A11.54 11.54 0 0 0 23.5 12.03C23.5 5.66 18.35.5 12 .5Z"
      />
    </svg>
  )
}

function OAuthButton({ provider, icon, label, bg, color = '#fff', border }) {
  const href = `/oauth2/authorize/${provider}?redirect_uri=${encodeURIComponent(window.location.origin + '/oauth2/redirect')}`
  return (
    <a href={href} style={{
      display: 'flex', alignItems: 'center', gap: 13, padding: '13px 22px',
      background: bg, color, borderRadius: 10, fontWeight: 600, fontSize: 14,
      boxShadow: '0 2px 5px rgba(0,0,0,0.06)', border: border || 'none',
      transition: 'all .25s cubic-bezier(0.175, 0.885, 0.32, 1.275)', letterSpacing: 0.1,
      textDecoration: 'none', justifyContent: 'center'
    }}
      onMouseOver={e => { e.currentTarget.style.opacity = '.9'; e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 6px 15px rgba(0,0,0,0.1)' }}
      onMouseOut ={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.06)' }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>{label}
    </a>
  )
}

export default function LoginPage() {
  const [params]            = useSearchParams()
  const { isAuthenticated, loginWithPassword } = useAuthStore()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('password123')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const error               = params.get('error')
  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setFormError('')
    try {
      await loginWithPassword(username, password)
      window.location.href = '/dashboard'
    } catch (err) {
      setFormError(err.response?.data?.message || 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* ── Left green panel ── */}
      <div style={{
        width: '44%', background: `linear-gradient(135deg, ${T.primaryDark} 0%, ${T.primary} 50%, ${T.primaryLight} 100%)`, 
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '60px 52px', position: 'relative', overflow: 'hidden'
      }}>
        {/* Animated Background Blobs */}
        <div style={{ position:'absolute', top:'-10%', left:'-20%', width:400, height:400, borderRadius:'50%', background:'rgba(255,255,255,0.05)', filter: 'blur(60px)', animation: 'floatSlow 8s infinite alternate' }} />
        <div style={{ position:'absolute', bottom:'-20%', right:'-10%', width:300, height:300, borderRadius:'50%', background:'rgba(35, 99, 49, 0.4)', filter: 'blur(80px)', animation: 'floatSlow 10s infinite alternate-reverse' }} />
        
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', width: '100%', maxWidth: 320, animation: 'fadeSlideUp 0.6s ease-out forwards' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 72, height: 72, borderRadius: 20, background: '#fff',
            fontSize: 36, fontWeight: 900, color: T.primary, marginBottom: 24, letterSpacing: -2,
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
          }}>S</div>
          <h1 style={{ margin: '0 0 10px', color: '#fff', fontSize: 30, fontWeight: 800 }}>Smart Campus</h1>
          <p style={{ margin: '0 0 40px', color: 'rgba(255,255,255,0.65)', fontSize: 14.5, lineHeight: 1.65 }}>
            Operations Hub · SLIIT IT3030<br/>Group WE_163_3.2
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left' }}>
            {[
              { icon: '🏛️', text: 'Manage campus resources & bookings' },
              { icon: '🎫', text: 'Submit and track incident tickets' },
              { icon: '🛡️', text: 'Role-based access control' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.13)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0
                }}>{icon}</div>
                <span style={{ color: 'rgba(255,255,255,0.82)', fontSize: 13.5 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right white panel ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 64px', background: '#fff' }}>
        <div style={{ width: '100%', maxWidth: 360, animation: 'fadeSlideUp 0.6s ease-out forwards', animationDelay: '0.1s', opacity: 0 }}>
          <h2 style={{ margin: '0 0 6px', color: '#1a2b1e', fontSize: 26, fontWeight: 800 }}>Welcome back</h2>
          <p style={{ margin: '0 0 34px', color: T.secondary, fontSize: 14 }}>Sign in with Google or a seeded campus account</p>

          {(error || formError) && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 9,
              padding: '11px 15px', marginBottom: 22, color: '#dc2626', fontSize: 13
            }}>⚠️ {formError || decodeURIComponent(error)}</div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                <OAuthButton provider="google" icon={<GoogleLogo />} label="Continue with Google" bg="#fff" color="#374151" border={`1px solid ${T.border}`} />
                <OAuthButton provider="github" icon={<GitHubLogo />} label="Continue with GitHub" bg="#111827" color="#ffffff" border="1px solid #111827" />
          </div>

          <div style={{ margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: T.border }} />
            <span style={{ color: T.secondary, fontSize: 12 }}>or use password login</span>
            <div style={{ flex: 1, height: 1, background: T.border }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, color: T.secondary, fontSize: 12.5, fontWeight: 600 }}>
              Username
              <input value={username} onChange={e => setUsername(e.target.value)} style={inputStyle} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, color: T.secondary, fontSize: 12.5, fontWeight: 600 }}>
              Password
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
            </label>
            <button type="submit" disabled={submitting} style={submitStyle}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div style={{ margin: '28px 0 0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: T.border }} />
            <span style={{ color: T.secondary, fontSize: 12 }}>OAuth 2.0 + Demo credentials</span>
            <div style={{ flex: 1, height: 1, background: T.border }} />
          </div>

          <p style={{ color: '#9ca3af', fontSize: 12, textAlign: 'center', marginTop: 24, lineHeight: 1.65 }}>
            Try `admin` / `password123` or `student_alice` / `password123`.
          </p>
        </div>
      </div>
    </div>
  )
}

const inputStyle = {
  border: `1px solid ${T.border}`,
  borderRadius: 10,
  padding: '12px 14px',
  fontSize: 14,
  outline: 'none',
}

const submitStyle = {
  marginTop: 4,
  border: 'none',
  borderRadius: 10,
  padding: '13px 18px',
  background: T.primary,
  color: '#fff',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
}
