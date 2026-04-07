import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getResources, deleteResource, updateResourceStatus } from '../../api/resourceApi'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

const TYPES   = ['ALL', 'ROOM', 'EQUIPMENT', 'VEHICLE', 'LAB']
const STATUSES = ['ALL', 'AVAILABLE', 'MAINTENANCE', 'UNAVAILABLE']

const STATUS_STYLE = {
  AVAILABLE:   'bg-green-100 text-green-700',
  MAINTENANCE: 'bg-yellow-100 text-yellow-700',
  UNAVAILABLE: 'bg-red-100 text-red-700',
}

const TYPE_ICON = {
  ROOM:      '🏛️',
  EQUIPMENT: '🎥',
  VEHICLE:   '🚌',
  LAB:       '🖥️',
}

export default function ResourcesPage() {
  const { isAdmin } = useAuth()
  const [resources, setResources]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showForm, setShowForm]     = useState(false)

  useEffect(() => { fetchResources() }, [])

  const fetchResources = async () => {
    try {
      setLoading(true)
      const { data } = await getResources()
      setResources(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Failed to load resources.')
      setResources([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resource?')) return
    try {
      await deleteResource(id)
      setResources(prev => prev.filter(r => r.id !== id))
      toast.success('Resource deleted.')
    } catch {
      toast.error('Failed to delete.')
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await updateResourceStatus(id, status)
      setResources(prev =>
        prev.map(r => r.id === id ? { ...r, status } : r)
      )
      toast.success('Status updated.')
    } catch {
      toast.error('Failed to update status.')
    }
  }

  const filtered = resources.filter(r => {
    const matchSearch = r.name?.toLowerCase().includes(search.toLowerCase()) ||
                        r.location?.toLowerCase().includes(search.toLowerCase())
    const matchType   = typeFilter   === 'ALL' || r.type   === typeFilter
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter
    return matchSearch && matchType && matchStatus
  })

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {resources.length} total resources
          </p>
        </div>
        {isAdmin && (
          <Link to="/resources/new" className="btn-primary">
            + Add Resource
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          className="input max-w-xs"
          placeholder="Search by name or location..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
        >
          {TYPES.map(t => (
            <option key={t} value={t}>
              {t === 'ALL' ? 'All Types' : t}
            </option>
          ))}
        </select>

        <select
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          {STATUSES.map(s => (
            <option key={s} value={s}>
              {s === 'ALL' ? 'All Statuses' : s}
            </option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-3xl mb-3">🏛️</p>
          <p className="text-gray-400 text-sm">No resources found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(resource => (
            <div key={resource.id}
              className="card hover:shadow-md transition-shadow flex flex-col">

              {/* Top */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {TYPE_ICON[resource.type] ?? '📦'}
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {resource.name}
                    </h3>
                    <p className="text-xs text-gray-500">{resource.type}</p>
                  </div>
                </div>
                <span className={`badge ${STATUS_STYLE[resource.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {resource.status}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-1 mb-4 flex-1">
                {resource.location && (
                  <p className="text-xs text-gray-500">
                    📍 {resource.location}
                  </p>
                )}
                {resource.capacity && (
                  <p className="text-xs text-gray-500">
                    👥 Capacity: {resource.capacity}
                  </p>
                )}
                {resource.description && (
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {resource.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-auto">
                <Link
                  to={`/resources/${resource.id}`}
                  className="flex-1 text-center btn-secondary text-xs py-1.5"
                >
                  View details
                </Link>
                {resource.status === 'AVAILABLE' && (
                  <Link
                    to={`/bookings/new?resourceId=${resource.id}`}
                    className="flex-1 text-center btn-primary text-xs py-1.5"
                  >
                    Book
                  </Link>
                )}
              </div>

              {/* Admin actions */}
              {isAdmin && (
                <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
                  <select
                    value={resource.status}
                    onChange={e => handleStatusChange(resource.id, e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-xs
                               focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="UNAVAILABLE">Unavailable</option>
                  </select>
                  <Link
                    to={`/resources/${resource.id}/edit`}
                    className="btn-secondary text-xs py-1 px-2"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(resource.id)}
                    className="btn-danger text-xs py-1 px-2"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}