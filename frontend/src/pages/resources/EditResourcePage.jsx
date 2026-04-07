import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getResourceById, updateResource } from '../../api/resourceApi'
import toast from 'react-hot-toast'

const RESOURCE_TYPES = {
  LECTURE_HALL: {
    label: 'Lecture Hall', icon: '🏛️',
    fields: [
      { name: 'block',         label: 'Block',            type: 'text',     placeholder: 'e.g. Block A' },
      { name: 'floor',         label: 'Floor',            type: 'text',     placeholder: 'e.g. Ground Floor' },
      { name: 'hasProjector',  label: 'Projector',        type: 'checkbox' },
      { name: 'hasAC',         label: 'Air Conditioning', type: 'checkbox' },
      { name: 'hasWhiteboard', label: 'Whiteboard',       type: 'checkbox' },
    ]
  },
  COMPUTER_LAB: {
    label: 'Computer Lab', icon: '🖥️',
    fields: [
      { name: 'numberOfComputers', label: 'Number of Computers', type: 'number',   placeholder: 'e.g. 40' },
      { name: 'software',          label: 'Software Available',  type: 'text',     placeholder: 'e.g. MS Office, AutoCAD' },
      { name: 'hasProjector',      label: 'Projector',           type: 'checkbox' },
      { name: 'hasAC',             label: 'Air Conditioning',    type: 'checkbox' },
    ]
  },
  SPORTS_FACILITY: {
    label: 'Sports Court / Gym', icon: '🏋️',
    fields: [
      { name: 'sportType',    label: 'Sport Type',         type: 'text',     placeholder: 'e.g. Basketball, Gym' },
      { name: 'surfaceType',  label: 'Surface Type',       type: 'text',     placeholder: 'e.g. Wooden, Concrete' },
      { name: 'isIndoor',     label: 'Indoor',             type: 'checkbox' },
      { name: 'hasEquipment', label: 'Equipment Provided', type: 'checkbox' },
    ]
  },
  MEETING_ROOM: {
    label: 'Meeting Room', icon: '🪑',
    fields: [
      { name: 'floor',              label: 'Floor',              type: 'text',     placeholder: 'e.g. 3rd Floor' },
      { name: 'hasProjector',       label: 'Projector',          type: 'checkbox' },
      { name: 'hasVideoConference', label: 'Video Conferencing', type: 'checkbox' },
      { name: 'hasWhiteboard',      label: 'Whiteboard',         type: 'checkbox' },
    ]
  },
  VEHICLE: {
    label: 'Vehicle', icon: '🚌',
    fields: [
      { name: 'vehicleNumber',   label: 'Vehicle Number',   type: 'text',   placeholder: 'e.g. WP CAB-1234' },
      { name: 'brand',           label: 'Brand',            type: 'text',   placeholder: 'e.g. Toyota' },
      { name: 'model',           label: 'Model',            type: 'text',   placeholder: 'e.g. HiAce' },
      { name: 'fuelType',        label: 'Fuel Type',        type: 'select', options: ['PETROL', 'DIESEL', 'ELECTRIC'] },
      { name: 'seatingCapacity', label: 'Seating Capacity', type: 'number', placeholder: 'e.g. 14' },
      { name: 'driverRequired',  label: 'Driver Required',  type: 'checkbox' },
    ]
  },
  LIBRARY_STUDY_ROOM: {
    label: 'Library Study Room', icon: '📚',
    fields: [
      { name: 'floor',         label: 'Floor',           type: 'text',   placeholder: 'e.g. 2nd Floor' },
      { name: 'numberOfSeats', label: 'Number of Seats', type: 'number', placeholder: 'e.g. 8' },
      { name: 'isQuietZone',   label: 'Quiet Zone',      type: 'checkbox' },
      { name: 'hasWhiteboard', label: 'Whiteboard',      type: 'checkbox' },
    ]
  },
}

export default function EditResourcePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading]   = useState(false)
  const [fetching, setFetching] = useState(true)
  const [form, setForm] = useState({
    name: '', type: 'LECTURE_HALL', location: '',
    capacity: '', description: '', status: 'AVAILABLE',
  })
  const [details, setDetails] = useState({})

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getResourceById(id)
        setForm({
          name:        data.name        ?? '',
          type:        data.type        ?? 'LECTURE_HALL',
          location:    data.location    ?? '',
          capacity:    data.capacity    ?? '',
          description: data.description ?? '',
          status:      data.status      ?? 'AVAILABLE',
        })
        setDetails(data.details ?? {})
      } catch {
        toast.error('Resource not found.')
        navigate('/resources')
      } finally {
        setFetching(false)
      }
    }
    fetch()
  }, [id])

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleDetailChange = (e) => {
    const { name, type, value, checked } = e.target
    setDetails(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async () => {
    if (!form.name || !form.type) {
      toast.error('Name and type are required.')
      return
    }
    try {
      setLoading(true)
      await updateResource(id, {
        ...form,
        capacity: form.capacity ? parseInt(form.capacity) : null,
        details,
      })
      toast.success('Resource updated!')
      navigate(`/resources/${id}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update.')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return (
    <div className="flex justify-center py-16">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
    </div>
  )

  const currentTypeConfig = RESOURCE_TYPES[form.type]

  return (
    <div className="max-w-xl mx-auto">
      <Link to={`/resources/${id}`}
        className="text-sm text-primary-600 hover:underline flex items-center gap-1 mb-6">
        ← Back to Resource
      </Link>

      <div className="card">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Edit Resource</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resource Name <span className="text-red-500">*</span>
            </label>
            <input name="name" className="input" value={form.name} onChange={handleFormChange} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select name="type" className="input" value={form.type} onChange={handleFormChange}>
              {Object.entries(RESOURCE_TYPES).map(([key, val]) => (
                <option key={key} value={key}>{val.icon} {val.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input name="location" className="input" value={form.location} onChange={handleFormChange} />
          </div>

          {form.type !== 'VEHICLE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <input
                name="capacity" type="number" min="1"
                className="input" value={form.capacity} onChange={handleFormChange}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select name="status" className="input" value={form.status} onChange={handleFormChange}>
              <option value="AVAILABLE">Available</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="UNAVAILABLE">Unavailable</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description" className="input resize-none" rows={3}
              value={form.description} onChange={handleFormChange}
            />
          </div>

          {/* Type-specific fields */}
          {currentTypeConfig && (
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">
                {currentTypeConfig.icon} {currentTypeConfig.label} Details
              </h2>
              <div className="space-y-3">
                {currentTypeConfig.fields.map(field => (
                  <div key={field.name}>
                    {field.type === 'checkbox' ? (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name={field.name}
                          checked={!!details[field.name]}
                          onChange={handleDetailChange}
                          className="w-4 h-4 rounded border-gray-300 text-primary-600"
                        />
                        <span className="text-sm text-gray-700">{field.label}</span>
                      </label>
                    ) : field.type === 'select' ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field.label}
                        </label>
                        <select
                          name={field.name} className="input"
                          value={details[field.name] ?? ''}
                          onChange={handleDetailChange}
                        >
                          <option value="">Select...</option>
                          {field.options.map(o => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field.label}
                        </label>
                        <input
                          type={field.type} name={field.name}
                          className="input" placeholder={field.placeholder}
                          value={details[field.name] ?? ''}
                          onChange={handleDetailChange}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <Link to={`/resources/${id}`} className="btn-secondary flex-1 text-center">
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}