// src/pages/DashboardPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationsApi } from '../api/index.js'
import useAuthStore from '../context/authStore.js'
import { getMyTickets } from '../api/ticketApi.js'

// ─── Theme Tokens ─────────────────────────────────────────────────────────────
const T = {
  primary:   '#236331',
  secondary: '#515953',
  bg:        '#f5f6f5',
  surface:   '#ffffff',
  border:    '#e3e6e3',
  text:      '#1a2b1e',
  muted:     '#515953',
  faint:     '#8a948d',
}

const NOTIF_ICONS = {
  BOOKING_APPROVED:      { icon: '✓', color: '#16a34a', bg: '#dcfce7' },
  BOOKING_REJECTED:      { icon: '✕', color: '#dc2626', bg: '#fee2e2' },
  BOOKING_CANCELLED:     { icon: '○', color: '#d97706', bg: '#fef3c7' },
  TICKET_STATUS_CHANGED: { icon: '↻', color: '#2563eb', bg: '#dbeafe' },
  TICKET_ASSIGNED:       { icon: '→', color: '#7c3aed', bg: '#ede9fe' },
  TICKET_COMMENT_ADDED:  { icon: '◉', color: '#0891b2', bg: '#cffafe' },
  TICKET_RESOLVED:       { icon: '★', color: '#16a34a', bg: '#dcfce7' },
  SYSTEM_ANNOUNCEMENT:   { icon: '!', color: T.secondary, bg: '#f0f1f0' },
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, accent, icon }) {
  return (
    <div style={{
      background: T.surface, borderRadius: 14, padding: '22px 24px',
      border: `1px solid ${T.border}`, flex: '1 1 180px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.03)', transition: 'all .25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      cursor: 'default', backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)'
    }}
      onMouseOver={e => { e.currentTarget.style.boxShadow = `0 12px 24px ${accent}20`; e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)' }}
      onMouseOut ={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)';  e.currentTarget.style.transform = 'translateY(0) scale(1)' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <p style={{ margin: 0, color: T.muted, fontSize: 12.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</p>
        <div style={{
          width: 38, height: 38, borderRadius: 10, background: accent + '18',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
        }}>{icon}</div>
      </div>
      <p style={{ margin: 0, color: accent, fontSize: 30, fontWeight: 800 }}>{value}</p>
    </div>
  )
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ title, badge, children }) {
  return (
    <div style={{
      background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`,
      overflow: 'hidden', boxShadow: '0 2px 8px rgba(35,99,49,0.06)'
    }}>
      <div style={{
        padding: '14px 20px', background: T.primary,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 13.5, color: '#fff' }}>{title}</p>
        {badge && (
          <span style={{ background: '#fff', color: T.primary, borderRadius: 99, padding: '2px 9px', fontSize: 11, fontWeight: 700 }}>{badge}</span>
        )}
      </div>
      {children}
    </div>
  )
}

// ─── Quick Action Button ──────────────────────────────────────────────────────
function QuickAction({ icon, label, desc, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: T.surface, border: `1px solid ${T.border}`, borderRadius: 11,
      padding: '16px', textAlign: 'left', cursor: 'pointer', width: '100%',
      boxShadow: '0 2px 5px rgba(0,0,0,0.03)', transition: 'all .2s cubic-bezier(0.4, 0, 0.2, 1)'
    }}
      onMouseOver={e => { e.currentTarget.style.borderColor = T.primary; e.currentTarget.style.boxShadow = `0 6px 16px rgba(35,99,49,0.1)`; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseOut ={e => { e.currentTarget.style.borderColor = T.border;   e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.03)';  e.currentTarget.style.transform = 'translateY(0)' }}
    >
      <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
      <p style={{ margin: '0 0 4px', color: T.text, fontSize: 13.5, fontWeight: 600 }}>{label}</p>
      <p style={{ margin: 0, color: T.faint, fontSize: 12 }}>{desc}</p>
    </button>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount]     = useState(0)
  const [loading, setLoading]             = useState(true)
  const [greeting, setGreeting]           = useState('')
  const [myTicketStats, setMyTicketStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0 })

  useEffect(() => {
    const h = new Date().getHours()
    setGreeting(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening')
  }, [])

  useEffect(() => {
    Promise.all([
      notificationsApi.getAll({ page: 0, size: 5 }),
      notificationsApi.getUnreadCount(),
    ]).then(([nr, cr]) => {
      setNotifications(nr.data.content || [])
      setUnreadCount(cr.data.unreadCount || 0)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const topRole = user?.roles?.includes('ADMIN') ? 'Admin'
    : user?.roles?.includes('TECHNICIAN') ? 'Technician'
    : user?.roles?.includes('STAFF') ? 'Staff' : 'Student'
  const isStudent = topRole === 'Student'
  const isAdmin = topRole === 'Admin'
  const isTechnician = topRole === 'Technician'

  useEffect(() => {
    if (!isStudent) return
    getMyTickets()
      .then(tickets => {
        const stats = {
          total: tickets.length,
          open: tickets.filter(t => t.status === 'OPEN').length,
          inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
          resolved: tickets.filter(t => t.status === 'RESOLVED').length,
        }
        setMyTicketStats(stats)
      })
      .catch(() => {})
  }, [isStudent])

  const stats = [
    { label: 'Unread',   value: unreadCount,           accent: T.primary,   icon: '🔔' },
    { label: 'Role',     value: topRole,               accent: T.secondary, icon: '🛡️' },
    { label: 'Provider', value: user?.provider || '—', accent: '#2563eb',   icon: '🔗' },
    { label: 'Status',   value: 'Active',              accent: '#16a34a',   icon: '✅' },
  ]

  const roleColors = {
    ADMIN:      { bg: '#dcfce7', color: T.primary },
    TECHNICIAN: { bg: '#dbeafe', color: '#1d4ed8' },
    STAFF:      { bg: '#fef3c7', color: '#d97706' },
    STUDENT:    { bg: '#f0f1f0', color: T.secondary },
  }

  if (isStudent) {
    return (
      <div style={{ padding: '32px 36px', background: T.bg, minHeight: 'calc(100vh - 62px)', animation: 'fadeSlideUp 0.4s ease-out forwards' }}>
        <div style={{
          background: `linear-gradient(135deg, ${T.primary} 0%, ${T.secondary} 100%)`,
          borderRadius: 18,
          padding: '24px 28px',
          marginBottom: 24,
          boxShadow: '0 4px 20px rgba(35,99,49,0.22)',
        }}>
          <h1 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800, color: '#fff' }}>{greeting}, {user?.name?.split(' ')[0]} 👋</h1>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>
            Student dashboard: track your own tickets and report incidents quickly.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <StatCard label="My Tickets" value={myTicketStats.total} accent={T.primary} icon="🎫" />
          <StatCard label="Open" value={myTicketStats.open} accent="#d97706" icon="🔓" />
          <StatCard label="In Progress" value={myTicketStats.inProgress} accent="#2563eb" icon="⚙️" />
          <StatCard label="Resolved" value={myTicketStats.resolved} accent="#16a34a" icon="✅" />
        </div>

        <div style={{
          background: '#e8f5eb',
          border: '1px solid #c8e6cc',
          borderRadius: 12,
          padding: '11px 16px',
          marginBottom: 18,
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          alignItems: 'center',
          fontSize: 12,
          color: T.muted,
          fontWeight: 600,
        }}>
          <span>🔐 Logged in</span><span style={{ color: T.primary }}>→</span>
          <span>➕ Report incident</span><span style={{ color: T.primary }}>→</span>
          <span>📋 Track my tickets</span><span style={{ color: T.primary }}>→</span>
          <span>💬 View updates/comments</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
          <SectionCard title="Recent Notifications" badge={unreadCount > 0 ? `${unreadCount} unread` : null}>
            {loading ? (
              <div style={{ padding: 32, textAlign: 'center', color: T.faint, fontSize: 13 }}>Loading…</div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: 36, textAlign: 'center', color: T.faint, fontSize: 13 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🔕</div>
                No notifications yet
              </div>
            ) : (
              notifications.map(n => {
                const meta = NOTIF_ICONS[n.type] || { icon: '•', color: T.faint, bg: '#f0f1f0' }
                return (
                  <div key={n.id} style={{
                    padding: '12px 20px', borderBottom: `1px solid ${T.border}`,
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                    background: n.isRead ? T.surface : '#f0faf3'
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, background: meta.bg, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: meta.color, fontSize: 14, fontWeight: 700
                    }}>{meta.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                        <p style={{
                          margin: 0, fontSize: 13, fontWeight: n.isRead ? 400 : 600,
                          color: n.isRead ? T.muted : T.text,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                        }}>{n.title}</p>
                        <span style={{ color: T.faint, fontSize: 11, flexShrink: 0 }}>{timeAgo(n.createdAt)}</span>
                      </div>
                      <p style={{ margin: '2px 0 0', color: T.faint, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {n.message}
                      </p>
                    </div>
                    {!n.isRead && <div style={{ width: 7, height: 7, borderRadius: '50%', background: T.primary, flexShrink: 0, marginTop: 7 }} />}
                  </div>
                )
              })
            )}
          </SectionCard>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <SectionCard title="Student Actions">
              <div style={{ padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <QuickAction icon="➕" label="Report Incident" desc="Create a new ticket" onClick={() => navigate('/tickets/new')} />
                <QuickAction icon="📋" label="My Tickets" desc="Track your own reports" onClick={() => navigate('/tickets/my')} />
                <QuickAction icon="🎫" label="All Tickets" desc="Browse ticket board" onClick={() => navigate('/tickets')} />
                <QuickAction icon="📅" label="My Bookings" desc="View booking requests" onClick={() => navigate('/bookings')} />
              </div>
            </SectionCard>

            <SectionCard title="Your Profile">
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <div style={{
                    width: 50, height: 50, borderRadius: '50%', background: T.primary,
                    overflow: 'hidden', flexShrink: 0, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, fontWeight: 700
                  }}>
                    {user?.imageUrl
                      ? <img src={user.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: T.text }}>{user?.name}</p>
                    <p style={{ margin: '2px 0 0', color: T.faint, fontSize: 12 }}>{user?.email}</p>
                  </div>
                </div>
                <span style={{ background: '#f0f1f0', color: T.secondary, borderRadius: 6, padding: '3px 11px', fontSize: 11, fontWeight: 700 }}>STUDENT</span>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '32px 36px', background: T.bg, minHeight: 'calc(100vh - 62px)', animation: 'fadeSlideUp 0.4s ease-out forwards' }}>

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800, color: T.text }}>
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ margin: 0, color: T.muted, fontSize: 14 }}>
          Welcome to the Smart Campus Operations Hub — here's your overview.
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {(isAdmin || isTechnician) && (
        <div style={{
          background: '#e8f5eb',
          border: '1px solid #c8e6cc',
          borderRadius: 12,
          padding: '11px 16px',
          marginBottom: 18,
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          alignItems: 'center',
          fontSize: 12,
          color: T.muted,
          fontWeight: 600,
        }}>
          {isAdmin ? (
            <>
              <span>🛡️ Admin workflow</span><span style={{ color: T.primary }}>→</span>
              <span>📋 Review booking requests</span><span style={{ color: T.primary }}>→</span>
              <span>👷 Assign/monitor tickets</span><span style={{ color: T.primary }}>→</span>
              <span>🏛️ Manage resources & roles</span>
            </>
          ) : (
            <>
              <span>🧰 Technician workflow</span><span style={{ color: T.primary }}>→</span>
              <span>🎫 Work assigned tickets</span><span style={{ color: T.primary }}>→</span>
              <span>✅ Resolve and update notes</span><span style={{ color: T.primary }}>→</span>
              <span>🔔 Track notifications</span>
            </>
          )}
        </div>
      )}

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>

        {/* Notifications */}
        <SectionCard title="Recent Notifications" badge={unreadCount > 0 ? `${unreadCount} unread` : null}>
          {loading ? (
            <div style={{ padding: 32, textAlign: 'center', color: T.faint, fontSize: 13 }}>Loading…</div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: 36, textAlign: 'center', color: T.faint, fontSize: 13 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🔕</div>
              No notifications yet
            </div>
          ) : (
            notifications.map(n => {
              const meta = NOTIF_ICONS[n.type] || { icon: '•', color: T.faint, bg: '#f0f1f0' }
              return (
                <div key={n.id} style={{
                  padding: '12px 20px', borderBottom: `1px solid ${T.border}`,
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                  background: n.isRead ? T.surface : '#f0faf3'
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, background: meta.bg, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: meta.color, fontSize: 14, fontWeight: 700
                  }}>{meta.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <p style={{
                        margin: 0, fontSize: 13, fontWeight: n.isRead ? 400 : 600,
                        color: n.isRead ? T.muted : T.text,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>{n.title}</p>
                      <span style={{ color: T.faint, fontSize: 11, flexShrink: 0 }}>{timeAgo(n.createdAt)}</span>
                    </div>
                    <p style={{ margin: '2px 0 0', color: T.faint, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {n.message}
                    </p>
                  </div>
                  {!n.isRead && <div style={{ width: 7, height: 7, borderRadius: '50%', background: T.primary, flexShrink: 0, marginTop: 7 }} />}
                </div>
              )
            })
          )}
        </SectionCard>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* Profile */}
          <SectionCard title="Your Profile">
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{
                  width: 50, height: 50, borderRadius: '50%', background: T.primary,
                  overflow: 'hidden', flexShrink: 0, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, fontWeight: 700
                }}>
                  {user?.imageUrl
                    ? <img src={user.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : user?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: T.text }}>{user?.name}</p>
                  <p style={{ margin: '2px 0 0', color: T.faint, fontSize: 12 }}>{user?.email}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {user?.roles?.map(role => {
                  const c = roleColors[role] || { bg: '#f0f1f0', color: T.secondary }
                  return (
                    <span key={role} style={{ background: c.bg, color: c.color, borderRadius: 6, padding: '3px 11px', fontSize: 11, fontWeight: 700 }}>{role}</span>
                  )
                })}
              </div>
            </div>
          </SectionCard>

          {/* Quick actions */}
          <SectionCard title="Quick Actions">
            <div style={{ padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <QuickAction
                icon={isAdmin ? '📑' : '📅'}
                label={isAdmin ? 'Review bookings' : 'Book a resource'}
                desc={isAdmin ? 'Approve/reject/cancel requests' : 'Reserve rooms or equipment'}
                onClick={() => navigate('/bookings')}
              />
              <QuickAction
                icon={isTechnician ? '🧰' : '🔧'}
                label={isTechnician ? 'Assigned tickets' : 'Report an issue'}
                desc={isTechnician ? 'Open your ticket queue' : 'Submit a maintenance ticket'}
                onClick={() => navigate('/tickets')}
              />
              <QuickAction icon="🏛️" label="Browse rooms" desc="View available facilities" onClick={() => navigate('/resources')} />
              {isAdmin && (
                <QuickAction icon="🛡️" label="Manage roles" desc="Assign user permissions" onClick={() => navigate('/admin/roles')} />
              )}
            </div>
          </SectionCard>

        </div>
      </div>

      {/* Footer info */}
      <div style={{
        marginTop: 24, padding: '12px 20px', background: T.surface,
        borderRadius: 10, border: `1px solid ${T.border}`,
        display: 'flex', gap: 24, flexWrap: 'wrap',
        boxShadow: '0 1px 4px rgba(35,99,49,0.04)'
      }}>
        {[
          { k: 'System', v: 'Smart Campus Operations Hub' },
          { k: 'Module', v: 'IT3030 PAF 2026' },
          { k: 'Group',  v: 'WE_163_3.2' },
          { k: 'Stack',  v: 'Spring Boot + React' },
        ].map(({ k, v }) => (
          <div key={k}>
            <span style={{ color: T.faint, fontSize: 11 }}>{k}: </span>
            <span style={{ color: T.secondary, fontSize: 11, fontWeight: 600 }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}