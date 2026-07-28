'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Building2, Plus, Search, Home, Landmark,
  User, Calendar, CheckCircle2,
  AlertCircle, Trash2, X, Sparkles, MapPin,
  DollarSign, SlidersHorizontal, Wrench,
} from 'lucide-react'
import type { Property } from '@/types'

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'rph_housing_properties'

const GRADIENTS = [
  'from-blue-600 to-indigo-900',
  'from-purple-600 to-pink-900',
  'from-emerald-600 to-teal-900',
  'from-amber-500 to-orange-800',
  'from-rose-500 to-red-800',
  'from-cyan-500 to-blue-800',
]

const DEFAULT_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    title: 'Serene Heights Apartment',
    address: '742 Evergreen Terrace, Springfield',
    type: 'Apartment',
    price: 1850,
    bedrooms: 2,
    bathrooms: 2,
    status: 'Occupied',
    tenantName: 'Homer Simpson',
    leaseStart: '2026-01-01',
    leaseEnd: '2026-12-31',
    imageBg: 'from-blue-600 to-indigo-900',
  },
  {
    id: 'prop-2',
    title: 'Urban Loft Studio',
    address: '123 Neon Boulevard, Metro City',
    type: 'Studio',
    price: 1450,
    bedrooms: 1,
    bathrooms: 1,
    status: 'Available',
    imageBg: 'from-purple-600 to-pink-900',
  },
  {
    id: 'prop-3',
    title: 'Modern Suburban Villa',
    address: '456 Oak Avenue, Pinecrest',
    type: 'House',
    price: 3200,
    bedrooms: 4,
    bathrooms: 3,
    status: 'Maintenance',
    imageBg: 'from-emerald-600 to-teal-900',
  },
  {
    id: 'prop-4',
    title: 'Cozy Shared Room',
    address: '888 University Dr, Campus Town',
    type: 'Room',
    price: 650,
    bedrooms: 1,
    bathrooms: 1,
    status: 'Occupied',
    tenantName: 'Lisa Simpson',
    leaseStart: '2026-03-01',
    leaseEnd: '2027-02-28',
    imageBg: 'from-amber-500 to-orange-800',
  },
]

// ─── Main component ───────────────────────────────────────────────────────────

export default function HousingDashboard() {
  const [properties, setProperties] = useState<Property[]>([])
  const [search, setSearch]         = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filterType, setFilterType]     = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')

  // Modal state
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isAddOpen, setIsAddOpen]               = useState(false)
  // Inline delete confirmation: stores the property id pending deletion
  const [pendingDeleteId, setPendingDeleteId]   = useState<string | null>(null)

  // ── Persistence ──────────────────────────────────────────────────────────

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      try { setProperties(JSON.parse(saved)) }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      catch { setProperties(DEFAULT_PROPERTIES) }
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProperties(DEFAULT_PROPERTIES)
    }
  }, [])

  const saveProperties = useCallback((updated: Property[]) => {
    setProperties(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }, [])

  // ── Search debounce (250 ms) ──────────────────────────────────────────────

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 250)
    return () => clearTimeout(timer)
  }, [search])

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleAddProperty = useCallback((newProp: Property) => {
    setProperties((prev) => {
      const updated = [newProp, ...prev]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
    setIsAddOpen(false)
  }, [])

  const handleDeleteProperty = useCallback((id: string) => {
    setProperties((prev) => {
      const updated = prev.filter((p) => p.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
    if (selectedProperty?.id === id) setSelectedProperty(null)
    setPendingDeleteId(null)
  }, [selectedProperty])

  const toggleStatus = useCallback((id: string) => {
    const order: Property['status'][] = ['Available', 'Occupied', 'Maintenance']
    setProperties((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== id) return p
        const next = order[(order.indexOf(p.status) + 1) % order.length]
        return {
          ...p,
          status: next,
          tenantName: next === 'Occupied' ? 'New Guest Tenant' : undefined,
          leaseStart: next === 'Occupied' ? new Date().toISOString().split('T')[0] : undefined,
          leaseEnd:   next === 'Occupied'
            ? new Date(Date.now() + 31_536_000_000).toISOString().split('T')[0]
            : undefined,
        }
      })
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  // ── Derived data ─────────────────────────────────────────────────────────

  const filtered = properties.filter((p) => {
    const q = debouncedSearch.toLowerCase()
    return (
      (p.title.toLowerCase().includes(q) || p.address.toLowerCase().includes(q)) &&
      (filterType   === 'All' || p.type   === filterType) &&
      (filterStatus === 'All' || p.status === filterStatus)
    )
  })

  const totalCount      = properties.length
  const occupiedCount   = properties.filter((p) => p.status === 'Occupied').length
  const occupancyRate   = totalCount > 0 ? Math.round((occupiedCount / totalCount) * 100) : 0
  const maintenanceCount = properties.filter((p) => p.status === 'Maintenance').length
  const monthlyRevenue  = properties
    .filter((p) => p.status === 'Occupied')
    .reduce((sum, p) => sum + p.price, 0)

  return (
    <div className="space-y-8">

      {/* ── Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard label="Total Properties" value={String(totalCount)} sub="Active units"       icon={<Building2 className="size-4" />} accent="violet" />
        <MetricCard label="Occupancy Rate"   value={`${occupancyRate}%`} sub={`${occupiedCount} Rented`} icon={<CheckCircle2 className="size-4" />} accent="blue" />
        <MetricCard label="Monthly Revenue"  value={`$${monthlyRevenue.toLocaleString()}`} sub="Flowing" icon={<DollarSign className="size-4" />} accent="emerald" />
        <MetricCard label="In Maintenance"   value={String(maintenanceCount)} sub="Needs attention" icon={<Wrench className="size-4" />} accent="amber" />
      </div>

      {/* ── Control bar ── */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between p-4 rounded-2xl border border-white/[0.08] bg-white/[0.01]">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search address or title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search properties"
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-white placeholder-slate-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Type filter */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10">
            <Home className="size-3.5 text-slate-400" aria-hidden="true" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              aria-label="Filter by property type"
              className="bg-transparent text-xs text-slate-200 outline-none border-none cursor-pointer pr-1"
            >
              <option value="All"       className="bg-slate-900">All Types</option>
              <option value="Apartment" className="bg-slate-900">Apartments</option>
              <option value="House"     className="bg-slate-900">Houses</option>
              <option value="Studio"    className="bg-slate-900">Studios</option>
              <option value="Room"      className="bg-slate-900">Shared Rooms</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10">
            <SlidersHorizontal className="size-3.5 text-slate-400" aria-hidden="true" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              aria-label="Filter by status"
              className="bg-transparent text-xs text-slate-200 outline-none border-none cursor-pointer pr-1"
            >
              <option value="All"         className="bg-slate-900">All Status</option>
              <option value="Available"   className="bg-slate-900">Available</option>
              <option value="Occupied"    className="bg-slate-900">Occupied</option>
              <option value="Maintenance" className="bg-slate-900">Maintenance</option>
            </select>
          </div>

          {/* Add button */}
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/20 cursor-pointer transition-all active:scale-[0.98]"
          >
            <Plus className="size-3.5" />
            Add Property
          </button>
        </div>
      </div>

      {/* ── Property grid ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
          <Building2 className="size-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No properties found.</p>
          <p className="text-slate-500 text-xs mt-1">Try resetting your filters or adding a new unit.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <PropertyCard
              key={p.id}
              property={p}
              pendingDeleteId={pendingDeleteId}
              onView={() => setSelectedProperty(p)}
              onToggleStatus={() => toggleStatus(p.id)}
              onRequestDelete={() => setPendingDeleteId(p.id)}
              onConfirmDelete={() => handleDeleteProperty(p.id)}
              onCancelDelete={() => setPendingDeleteId(null)}
            />
          ))}
        </div>
      )}

      {/* ── Details modal ── */}
      {selectedProperty && (
        <PropertyDetailsModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}

      {/* ── Add property modal ── */}
      {isAddOpen && (
        <AddPropertyModal
          onClose={() => setIsAddOpen(false)}
          onAdd={handleAddProperty}
        />
      )}
    </div>
  )
}

// ─── MetricCard ───────────────────────────────────────────────────────────────

type Accent = 'violet' | 'blue' | 'emerald' | 'amber'

const ACCENT_MAP: Record<Accent, { bg: string; icon: string }> = {
  violet:  { bg: 'bg-violet-500/5  group-hover:bg-violet-500/10',  icon: 'bg-violet-500/10  text-violet-400  border-violet-500/10' },
  blue:    { bg: 'bg-blue-500/5    group-hover:bg-blue-500/10',    icon: 'bg-blue-500/10    text-blue-400    border-blue-500/10' },
  emerald: { bg: 'bg-emerald-500/5 group-hover:bg-emerald-500/10', icon: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10' },
  amber:   { bg: 'bg-amber-500/5   group-hover:bg-amber-500/10',   icon: 'bg-amber-500/10   text-amber-400   border-amber-500/10' },
}

const SUB_COLOR: Record<Accent, string> = {
  violet:  'text-emerald-400',
  blue:    'text-slate-400',
  emerald: 'text-emerald-400',
  amber:   'text-amber-400',
}

function MetricCard({
  label, value, sub, icon, accent,
}: {
  label: string
  value: string
  sub: string
  icon: React.ReactNode
  accent: Accent
}) {
  const a = ACCENT_MAP[accent]
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-sm relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-24 h-24 ${a.bg} rounded-bl-full pointer-events-none transition-all duration-300`} />
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-400">{label}</span>
        <div className={`p-2 rounded-xl border ${a.icon}`} aria-hidden="true">{icon}</div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-white">{value}</span>
        <span className={`text-xs font-medium ${SUB_COLOR[accent]}`}>{sub}</span>
      </div>
    </div>
  )
}

// ─── PropertyCard ─────────────────────────────────────────────────────────────

const STATUS_CLASSES: Record<Property['status'], string> = {
  Available:   'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Occupied:    'bg-blue-500/10   text-blue-400   border-blue-500/20',
  Maintenance: 'bg-amber-500/10  text-amber-400  border-amber-500/20',
}

function PropertyCard({
  property: p,
  pendingDeleteId,
  onView,
  onToggleStatus,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
}: {
  property: Property
  pendingDeleteId: string | null
  onView: () => void
  onToggleStatus: () => void
  onRequestDelete: () => void
  onConfirmDelete: () => void
  onCancelDelete: () => void
}) {
  const isPendingDelete = pendingDeleteId === p.id

  return (
    <div className="group rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden hover:border-white/[0.15] transition-all duration-300 flex flex-col h-full">
      {/* Visual header */}
      <div className={`h-36 bg-gradient-to-br ${p.imageBg} relative p-4 flex flex-col justify-between`}>
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
        <div className="flex justify-between items-start relative z-10">
          <span className="px-2.5 py-1 rounded-lg bg-black/35 backdrop-blur-md text-[10px] uppercase font-bold tracking-wider text-white border border-white/10">
            {p.type}
          </span>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${STATUS_CLASSES[p.status]}`}>
            {p.status}
          </span>
        </div>
        <div className="relative z-10 text-2xl font-black text-white tracking-tight flex items-baseline">
          ${p.price}
          <span className="text-xs font-normal text-white/70 ml-1">/ mo</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-white text-lg tracking-tight line-clamp-1 mb-1 group-hover:text-violet-300 transition-colors">
            {p.title}
          </h3>
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-4">
            <MapPin className="size-3 flex-shrink-0 text-slate-500" aria-hidden="true" />
            <span className="line-clamp-1">{p.address}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300 mb-5">
            <div className="flex items-center gap-2">
              <Home className="size-3.5 text-slate-500" aria-hidden="true" />
              <span>{p.bedrooms} {p.bedrooms > 1 ? 'Beds' : 'Bed'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Landmark className="size-3.5 text-slate-500" aria-hidden="true" />
              <span>{p.bathrooms} {p.bathrooms > 1 ? 'Baths' : 'Bath'}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {isPendingDelete ? (
          // Inline confirmation — no browser dialog
          <div className="pt-3 border-t border-white/5">
            <p className="text-xs text-slate-400 mb-3">Delete <strong className="text-white">{p.title}</strong>?</p>
            <div className="flex gap-2">
              <button
                onClick={onCancelDelete}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirmDelete}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20 cursor-pointer transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/5">
            <button
              onClick={onView}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 cursor-pointer transition-colors"
            >
              View Details
            </button>
            <div className="flex items-center gap-1.5">
              <button
                onClick={onToggleStatus}
                aria-label={`Toggle status for ${p.title}`}
                title="Quick Toggle Status"
                className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white cursor-pointer transition-colors"
              >
                <Sparkles className="size-3.5" />
              </button>
              <button
                onClick={onRequestDelete}
                aria-label={`Delete ${p.title}`}
                title="Delete Property"
                className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 cursor-pointer transition-colors"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── PropertyDetailsModal ─────────────────────────────────────────────────────

function PropertyDetailsModal({
  property: p,
  onClose,
}: {
  property: Property
  onClose: () => void
}) {
  // Close on backdrop click
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Details for ${p.title}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
        {/* Banner */}
        <div className={`h-24 bg-gradient-to-br ${p.imageBg} flex items-center justify-between px-6 relative`}>
          <h3 className="font-extrabold text-white text-xl tracking-tight z-10">{p.title}</h3>
          <button
            onClick={onClose}
            aria-label="Close property details"
            className="p-2 rounded-full bg-black/30 hover:bg-black/50 text-white cursor-pointer z-10 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <DetailItem label="Price / Monthly" value={`$${p.price}`} />
            <DetailItem label="Type" value={p.type} />
            <div className="col-span-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Address</span>
              <div className="text-sm text-slate-300 flex items-center gap-1.5 mt-0.5">
                <MapPin className="size-4 text-violet-400 flex-shrink-0" aria-hidden="true" />
                {p.address}
              </div>
            </div>
          </div>

          <div className="h-px bg-white/5" />

          {/* Hosting status */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-300">Hosting Status</h4>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_CLASSES[p.status]}`}>
                {p.status}
              </span>
            </div>

            {p.status === 'Occupied' && p.tenantName ? (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-blue-500/10 border border-blue-500/10 flex items-center justify-center text-blue-400">
                    <User className="size-4" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Current Tenant</div>
                    <div className="text-sm font-bold text-white">{p.tenantName}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-3 text-slate-500" aria-hidden="true" />
                    <span>Start: {p.leaseStart}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-3 text-slate-500" aria-hidden="true" />
                    <span>End: {p.leaseEnd}</span>
                  </div>
                </div>
              </div>
            ) : p.status === 'Maintenance' ? (
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
                <AlertCircle className="size-5 text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <h5 className="text-sm font-bold text-amber-300">Maintenance Active</h5>
                  <p className="text-xs text-slate-400 mt-0.5">
                    This unit is offline for inspections and repairs. Bookings and active hosting are suspended.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-3">
                <CheckCircle2 className="size-5 text-emerald-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <h5 className="text-sm font-bold text-emerald-300">Ready to Host</h5>
                  <p className="text-xs text-slate-400 mt-0.5">
                    No active leases. The property is fully cleaned, inspected, and ready for a new occupant.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-950 border-t border-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
      <div className="text-lg font-bold text-white">{value}</div>
    </div>
  )
}

// ─── AddPropertyModal ─────────────────────────────────────────────────────────

interface AddPropertyForm {
  title: string
  address: string
  type: Property['type']
  price: string
  bedrooms: string
  bathrooms: string
  status: Property['status']
  tenantName: string
}

const EMPTY_FORM: AddPropertyForm = {
  title: '', address: '', type: 'Apartment',
  price: '', bedrooms: '2', bathrooms: '1',
  status: 'Available', tenantName: '',
}

function AddPropertyModal({
  onClose,
  onAdd,
}: {
  onClose: () => void
  onAdd: (property: Property) => void
}) {
  const [form, setForm] = useState<AddPropertyForm>(EMPTY_FORM)

  const set = (key: keyof AddPropertyForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.address || !form.price) return

    const gradient = GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)]
    const newProp: Property = {
      id: `prop-${Date.now()}`,
      title: form.title,
      address: form.address,
      type: form.type,
      price: parseFloat(form.price) || 0,
      bedrooms: parseInt(form.bedrooms) || 1,
      bathrooms: parseInt(form.bathrooms) || 1,
      status: form.status,
      tenantName:  form.status === 'Occupied' ? form.tenantName || 'Unnamed Tenant' : undefined,
      leaseStart:  form.status === 'Occupied' ? new Date().toISOString().split('T')[0] : undefined,
      leaseEnd:    form.status === 'Occupied'
        ? new Date(Date.now() + 31_536_000_000).toISOString().split('T')[0]
        : undefined,
      imageBg: gradient,
    }

    onAdd(newProp)
  }

  const inputClass =
    'w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-white placeholder-slate-500'
  const selectClass =
    'w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white'
  const labelClass = 'text-xs font-semibold text-slate-400'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Create new housing unit"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
        <div className="px-6 py-4 bg-slate-950 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-extrabold text-white text-lg tracking-tight">Create Housing Unit</h3>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-full hover:bg-white/5 text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label htmlFor="new-title" className={labelClass}>Property Title</label>
            <input id="new-title" type="text" required placeholder="e.g. Skyline Luxury Penthouse"
              value={form.title} onChange={set('title')} className={inputClass} />
          </div>

          <div className="space-y-1">
            <label htmlFor="new-address" className={labelClass}>Address</label>
            <input id="new-address" type="text" required placeholder="e.g. 742 Evergreen Terrace, Springfield"
              value={form.address} onChange={set('address')} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="new-type" className={labelClass}>Type</label>
              <select id="new-type" value={form.type} onChange={set('type')} className={selectClass}>
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
                <option value="Studio">Studio</option>
                <option value="Room">Shared Room</option>
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="new-price" className={labelClass}>Price / Month ($)</label>
              <input id="new-price" type="number" required min="0" placeholder="e.g. 1200"
                value={form.price} onChange={set('price')} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="new-beds" className={labelClass}>Bedrooms</label>
              <input id="new-beds" type="number" min="1" value={form.bedrooms} onChange={set('bedrooms')} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label htmlFor="new-baths" className={labelClass}>Bathrooms</label>
              <input id="new-baths" type="number" min="1" value={form.bathrooms} onChange={set('bathrooms')} className={inputClass} />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="new-status" className={labelClass}>Initial Status</label>
            <select id="new-status" value={form.status} onChange={set('status')} className={selectClass}>
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          {form.status === 'Occupied' && (
            <div className="space-y-1">
              <label htmlFor="new-tenant" className={labelClass}>Tenant Name</label>
              <input id="new-tenant" type="text" required placeholder="e.g. John Doe"
                value={form.tenantName} onChange={set('tenantName')} className={inputClass} />
            </div>
          )}

          <div className="pt-4 flex justify-end gap-2 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/20 cursor-pointer transition-colors"
            >
              Save Property
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
