import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client.js'

const T = {
  primary: '#236331',
  border: '#e3e6e3',
  surface: '#ffffff',
  bg: '#f5f6f5',
  text: '#1a2b1e',
  muted: '#515953',
  faint: '#8a948d',
}

export default function TicketsPage() {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    client.get('/tickets')
      .then(({ data }) => setTickets(data || []))
      .catch(err => setError(err.response?.data?.message || 'Failed to load tickets'))
      .finally(() => setLoading(false))
  }, [])

  const counts = useMemo(() => tickets.reduce((acc, ticket) => {
    acc[ticket.status] = (acc[ticket.status] || 0) + 1
    return acc
  }, {}), [tickets])

  return (
    <PageShell title="Tickets" subtitle="Track incident reports and their current workflow state.">
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'].map(status => (
          <StatCard key={status} label={status.replace('_', ' ')} value={counts[status] || 0} />
        ))}
      </div>
      {loading ? <StateBox text="Loading tickets…" /> : error ? <StateBox text={error} error /> : tickets.length === 0 ? <StateBox text="No tickets found." /> : (
        <div style={tableWrapStyle}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: T.primary }}>
                {['Title', 'Priority', 'Status', 'Reporter', 'Technician', 'Created'].map(header => (
                  <th key={header} style={thStyle}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket, index) => (
                <tr key={ticket.id} onClick={() => navigate(`/tickets/${ticket.id}`)} style={{ background: index % 2 === 0 ? '#fff' : '#fafbfa', cursor: 'pointer' }}>
                  <td style={tdStyle}>
                    <div style={{ color: T.text, fontWeight: 600 }}>{ticket.title}</div>
                    <div style={{ color: T.faint, fontSize: 12 }}>{ticket.location || 'No location'}</div>
                  </td>
                  <td style={tdStyle}><Tag bg="#eef2ff" color="#4338ca" text={ticket.priority || '—'} /></td>
                  <td style={tdStyle}><StatusTag status={ticket.status} /></td>
                  <td style={tdStyle}>{ticket.reporterFullName || ticket.reporterUsername || '—'}</td>
                  <td style={tdStyle}>{ticket.technicianFullName || ticket.technicianUsername || 'Unassigned'}</td>
                  <td style={tdStyle}>{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  )
}

function StatusTag({ status }) {
  const colors = {
    OPEN: ['#fef3c7', '#d97706'],
    IN_PROGRESS: ['#dbeafe', '#2563eb'],
    RESOLVED: ['#dcfce7', '#15803d'],
    CLOSED: ['#f0f1f0', '#515953'],
    REJECTED: ['#fee2e2', '#dc2626'],
  }
  const [bg, color] = colors[status] || ['#eef2ff', '#4338ca']
  return <Tag bg={bg} color={color} text={status || 'UNKNOWN'} />
}

function Tag({ bg, color, text }) {
  return <span style={{ background: bg, color, borderRadius: 999, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>{text}</span>
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