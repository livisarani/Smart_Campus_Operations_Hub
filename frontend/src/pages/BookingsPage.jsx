import { useEffect, useMemo, useState } from 'react'
import client from '../api/client.js'
import useAuthStore from '../context/authStore.js'

const T = {
  primary: '#236331',
  border: '#e3e6e3',
  surface: '#ffffff',
  bg: '#f5f6f5',
  text: '#1a2b1e',
  muted: '#515953',
  faint: '#8a948d',
}

export default function BookingsPage() {
  const { user } = useAuthStore()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState(null)
  const roles = (user?.roles || []).map(role => String(role).toUpperCase())
  const isAdmin = roles.includes('ADMIN') || roles.includes('ROLE_ADMIN')

  useEffect(() => {
    if (!user?.email) return
    const headers = { 'X-User-Email': user.email, 'X-User-Name': user.name || user.username || 'User' }
    const request = isAdmin
      ? client.get('/bookings', { headers })
      : client.get('/bookings/my', { headers })

    request
      .then(({ data }) => setBookings(data || []))
      .catch(err => setError(err.response?.data?.message || 'Failed to load bookings'))
      .finally(() => setLoading(false))
  }, [user, isAdmin])

  const headers = { 'X-User-Email': user?.email || '', 'X-User-Name': user?.name || user?.username || 'User' }

  const updateBookingRow = (bookingId, next) => {
    setBookings(prev => prev.map(booking => (booking.id === bookingId ? { ...booking, ...next } : booking)))
  }

  const approveBooking = async booking => {
    setActionLoadingId(booking.id)
    setError('')
    try {
      const { data } = await client.put(`/bookings/${booking.id}/approve`, { reason: '' }, { headers })
      updateBookingRow(booking.id, data || { status: 'APPROVED' })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve booking')
    } finally {
      setActionLoadingId(null)
    }
  }

  const rejectBooking = async booking => {
    const reason = window.prompt('Enter rejection reason:')
    if (reason === null) return
    const trimmed = reason.trim()
    if (!trimmed) {
      setError('Rejection reason is required')
      return
    }

    setActionLoadingId(booking.id)
    setError('')
    try {
      const { data } = await client.put(`/bookings/${booking.id}/reject`, { reason: trimmed }, { headers })
      updateBookingRow(booking.id, data || { status: 'REJECTED', rejectionReason: trimmed })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject booking')
    } finally {
      setActionLoadingId(null)
    }
  }

  const cancelBooking = async booking => {
    const reason = window.prompt('Enter cancellation reason (optional):')
    if (reason === null) return

    setActionLoadingId(booking.id)
    setError('')
    try {
      const { data } = await client.put(`/bookings/${booking.id}/cancel`, { reason: reason.trim() }, { headers })
      updateBookingRow(booking.id, data || { status: 'CANCELLED' })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking')
    } finally {
      setActionLoadingId(null)
    }
  }

  const counts = useMemo(() => bookings.reduce((acc, booking) => {
    acc[booking.status] = (acc[booking.status] || 0) + 1
    return acc
  }, {}), [bookings])

  return (
    <PageShell
      title={isAdmin ? 'All Bookings' : 'My Bookings'}
      subtitle={isAdmin ? 'Admin view: all booking requests and approvals across the system.' : 'Review your current booking requests and approvals.'}
    >
      {isAdmin && (
        <div style={{ marginBottom: 14, color: T.primary, fontSize: 12, fontWeight: 700 }}>
          Admin Dashboard View
        </div>
      )}
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        {['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map(status => (
          <StatCard key={status} label={status} value={counts[status] || 0} />
        ))}
      </div>
      {loading ? <StateBox text="Loading bookings…" /> : error ? <StateBox text={error} error /> : bookings.length === 0 ? <StateBox text="No bookings found." /> : (
        <div style={tableWrapStyle}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: T.primary }}>
                {['Resource', 'Booked By', 'Schedule', 'Attendees', 'Status', 'Actions'].map(header => (
                  <th key={header} style={thStyle}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking, index) => (
                <tr key={booking.id} style={{ background: index % 2 === 0 ? '#fff' : '#fafbfa' }}>
                  <td style={tdStyle}>
                    <div style={{ color: T.text, fontWeight: 600 }}>{booking.resourceName || `Resource #${booking.resourceId}`}</div>
                    <div style={{ color: T.faint, fontSize: 12 }}>{booking.purpose || 'No purpose provided'}</div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ color: T.text }}>{booking.userName || 'Unknown user'}</div>
                    <div style={{ color: T.faint, fontSize: 12 }}>{booking.userEmail || 'No email'}</div>
                  </td>
                  <td style={tdStyle}>{formatBookingWindow(booking.startTime, booking.endTime)}</td>
                  <td style={tdStyle}>{booking.expectedAttendees ?? '—'}</td>
                  <td style={tdStyle}><StatusTag status={booking.status} /></td>
                  <td style={tdStyle}>
                    {isAdmin && booking.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button disabled={actionLoadingId === booking.id} style={actionButton('#15803d')} onClick={() => approveBooking(booking)}>Approve</button>
                        <button disabled={actionLoadingId === booking.id} style={actionButton('#dc2626')} onClick={() => rejectBooking(booking)}>Reject</button>
                      </div>
                    )}
                    {!isAdmin && (booking.status === 'PENDING' || booking.status === 'APPROVED') && (
                      <button disabled={actionLoadingId === booking.id} style={actionButton('#d97706')} onClick={() => cancelBooking(booking)}>Cancel</button>
                    )}
                    {((isAdmin && booking.status !== 'PENDING') || (!isAdmin && booking.status !== 'PENDING' && booking.status !== 'APPROVED')) && (
                      <span style={{ color: T.faint, fontSize: 12 }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  )
}

function formatBookingWindow(startTime, endTime) {
  const start = startTime ? new Date(startTime) : null
  const end = endTime ? new Date(endTime) : null
  if (!start || !end) return '—'
  return `${start.toLocaleDateString()} ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
}

function StatusTag({ status }) {
  const colors = {
    PENDING: ['#fef3c7', '#d97706'],
    APPROVED: ['#dcfce7', '#15803d'],
    REJECTED: ['#fee2e2', '#dc2626'],
    CANCELLED: ['#f0f1f0', '#515953'],
  }
  const [bg, color] = colors[status] || ['#eef2ff', '#4338ca']
  return <span style={{ background: bg, color, borderRadius: 999, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>{status || 'UNKNOWN'}</span>
}

function StatCard({ label, value }) {
  return <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '14px 16px', minWidth: 120 }}><div style={{ color: T.faint, fontSize: 11, fontWeight: 700 }}>{label}</div><div style={{ color: T.text, fontSize: 24, fontWeight: 800 }}>{value}</div></div>
}

function PageShell({ title, subtitle, children }) {
  return (
    <div style={{ padding: '32px 36px', background: T.bg, minHeight: 'calc(100vh - 62px)' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 4px', color: T.text, fontSize: 22, fontWeight: 800 }}>{title}</h1>
        <p style={{ margin: 0, color: T.muted, fontSize: 14 }}>{subtitle}</p>
      </div>
      {children}
    </div>
  )
}

function StateBox({ text, error = false }) {
  return <div style={{ padding: 40, borderRadius: 14, background: T.surface, border: `1px solid ${T.border}`, color: error ? '#dc2626' : T.faint, textAlign: 'center', fontSize: 14 }}>{text}</div>
}

const tableWrapStyle = { background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, overflow: 'hidden', boxShadow: '0 2px 10px rgba(35,99,49,0.06)' }
const thStyle = { padding: '12px 16px', textAlign: 'left', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }
const tdStyle = { padding: '14px 16px', borderBottom: `1px solid ${T.border}`, color: T.muted, fontSize: 13, verticalAlign: 'top' }
const actionButton = bg => ({ background: bg, color: '#fff', border: 'none', borderRadius: 8, padding: '6px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer' })