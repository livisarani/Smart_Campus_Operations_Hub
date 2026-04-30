import { useEffect, useMemo, useState } from 'react'
import useAuthStore from '../context/authStore.js'
import { createResource, deleteResource, getResources, updateResource } from '../api/resourceApi.js'

const T = {
  primary: '#236331',
  border: '#e3e6e3',
  surface: '#ffffff',
  bg: '#f5f6f5',
  text: '#1a2b1e',
  muted: '#515953',
  faint: '#8a948d',
}

export default function ResourcesPage() {
  const { user } = useAuthStore()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    name: '',
    type: '',
    location: '',
    description: '',
    available: true,
  })

  const roles = (user?.roles || []).map(role => String(role).toUpperCase())
  const isAdmin = roles.includes('ADMIN') || roles.includes('ROLE_ADMIN')

  const loadResources = () => {
    setLoading(true)
    setError('')
    getResources()
      .then(data => setResources(data || []))
      .catch(err => setError(err.response?.data?.message || 'Failed to load resources'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadResources()
  }, [])

  const filteredResources = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return resources
    return resources.filter(resource =>
      (resource.name || '').toLowerCase().includes(q) ||
      (resource.location || '').toLowerCase().includes(q) ||
      (resource.type || '').toLowerCase().includes(q)
    )
  }, [query, resources])

  const resetForm = () => {
    setEditingId(null)
    setForm({ name: '', type: '', location: '', description: '', available: true })
  }

  const handleEdit = resource => {
    setEditingId(resource.id)
    setForm({
      name: resource.name || '',
      type: resource.type || '',
      location: resource.location || '',
      description: resource.description || '',
      available: !!resource.available,
    })
    setShowForm(true)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Resource name is required')
      return
    }

    setSaving(true)
    setError('')
    const payload = {
      name: form.name.trim(),
      type: form.type.trim() || null,
      location: form.location.trim() || null,
      description: form.description.trim() || null,
      available: !!form.available,
    }

    try {
      if (editingId) {
        await updateResource(editingId, payload)
      } else {
        await createResource(payload)
      }
      resetForm()
      setShowForm(false)
      loadResources()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save resource')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async id => {
    if (!window.confirm('Delete this resource?')) return
    setError('')
    try {
      await deleteResource(id)
      loadResources()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete resource')
    }
  }

  return (
    <PageShell
      title={isAdmin ? 'Resource Management' : 'Resources'}
      subtitle={
        isAdmin
          ? 'Admin workflow: add, update, and retire campus facilities and equipment.'
          : 'Student/Technician workflow: browse currently available campus resources.'
      }
    >
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name, location, or type"
          style={{ flex: 1, minWidth: 240, padding: '10px 12px', borderRadius: 10, border: `1px solid ${T.border}` }}
        />
        <button onClick={loadResources} style={buttonStyle('secondary')}>Refresh</button>
        {isAdmin && (
          <button
            onClick={() => {
              resetForm()
              setShowForm(v => !v)
            }}
            style={buttonStyle('primary')}
          >
            {showForm ? 'Close Form' : 'Add Resource'}
          </button>
        )}
      </div>

      {isAdmin && showForm && (
        <form onSubmit={handleSubmit} style={{ ...cardStyle, marginBottom: 16 }}>
          <h3 style={{ marginTop: 0, color: T.text, fontSize: 16 }}>
            {editingId ? `Edit Resource #${editingId}` : 'Create Resource'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Name" value={form.name} onChange={value => setForm(prev => ({ ...prev, name: value }))} required />
            <Field label="Type" value={form.type} onChange={value => setForm(prev => ({ ...prev, type: value }))} />
            <Field label="Location" value={form.location} onChange={value => setForm(prev => ({ ...prev, location: value }))} />
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', color: T.text, fontSize: 13 }}>
              <input
                type="checkbox"
                checked={form.available}
                onChange={e => setForm(prev => ({ ...prev, available: e.target.checked }))}
              />
              Available
            </label>
          </div>
          <div style={{ marginTop: 10 }}>
            <label style={{ display: 'block', color: T.faint, fontSize: 11, marginBottom: 4 }}>Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              style={{ width: '100%', border: `1px solid ${T.border}`, borderRadius: 10, padding: 10, resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button disabled={saving} type="submit" style={buttonStyle('primary')}>
              {saving ? 'Saving...' : editingId ? 'Update Resource' : 'Create Resource'}
            </button>
            <button
              type="button"
              style={buttonStyle('secondary')}
              onClick={() => {
                setShowForm(false)
                resetForm()
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? <StateBox text="Loading resources…" /> : error ? <StateBox text={error} error /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {filteredResources.map(resource => (
            <div key={resource.id} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', color: T.text, fontSize: 16 }}>{resource.name}</h3>
                  <p style={{ margin: 0, color: T.faint, fontSize: 12 }}>{resource.type || 'Resource'}</p>
                </div>
                <StatusPill active={resource.available} />
              </div>
              <p style={{ margin: '0 0 10px', color: T.muted, fontSize: 13 }}>{resource.location || 'Location not set'}</p>
              <p style={{ margin: 0, color: T.faint, fontSize: 13, lineHeight: 1.5 }}>{resource.description || 'No description available.'}</p>
              {isAdmin && (
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <button style={buttonStyle('secondary')} onClick={() => handleEdit(resource)}>Edit</button>
                  <button style={buttonStyle('danger')} onClick={() => handleDelete(resource.id)}>Delete</button>
                </div>
              )}
            </div>
          ))}
          {filteredResources.length === 0 && <StateBox text="No resources available." />}
        </div>
      )}
    </PageShell>
  )
}

function Field({ label, value, onChange, required = false }) {
  return (
    <div>
      <label style={{ display: 'block', color: T.faint, fontSize: 11, marginBottom: 4 }}>
        {label}{required ? ' *' : ''}
      </label>
      <input
        value={value}
        required={required}
        onChange={e => onChange(e.target.value)}
        style={{ width: '100%', border: `1px solid ${T.border}`, borderRadius: 10, padding: 10 }}
      />
    </div>
  )
}

function buttonStyle(kind) {
  if (kind === 'primary') {
    return { background: T.primary, color: '#fff', border: 'none', borderRadius: 10, padding: '9px 14px', cursor: 'pointer', fontWeight: 700 }
  }
  if (kind === 'danger') {
    return { background: '#dc2626', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 14px', cursor: 'pointer', fontWeight: 700 }
  }
  return { background: T.surface, color: T.text, border: `1px solid ${T.border}`, borderRadius: 10, padding: '9px 14px', cursor: 'pointer', fontWeight: 600 }
}

function StatusPill({ active }) {
  return <span style={{ background: active ? '#dcfce7' : '#fee2e2', color: active ? '#15803d' : '#dc2626', borderRadius: 999, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>{active ? 'Available' : 'Unavailable'}</span>
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

const cardStyle = {
  background: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: 14,
  padding: 18,
  boxShadow: '0 2px 10px rgba(35,99,49,0.06)',
}