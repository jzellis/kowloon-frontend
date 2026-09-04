import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, RotateCcw, ExternalLink, Plus, X, ImagePlus, Pencil, Compass } from 'lucide-react'
import { useClient } from '../../hooks/useClient'
import { useBatchSelect } from '../../hooks/useBatchSelect'
import Spinner from '../../components/ui/Spinner'
import BatchActionBar from '../../components/admin/BatchActionBar'
import AddToDiscoveryModal from '../../components/discover/AddToDiscoveryModal'

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

// Mirrors the server's getServerActorId() fallback (`@${domain}`) — used only
// to decide whether to show the Edit affordance. The server is the source of
// truth: it 403s if a custom `actorId` setting makes this guess wrong.
function serverActorId(client) {
  try {
    return `@${new URL(client.http.baseUrl).host}`
  } catch {
    return null
  }
}

const VISIBILITY_OPTIONS = [
  { value: '@public', label: 'Public' },
  { value: '@server', label: 'Server only' },
]

function CircleForm({ initial, onSave, onCancel }) {
  const client = useClient()
  const [name, setName] = useState(initial?.name ?? '')
  const [summary, setSummary] = useState(initial?.summary ?? '')
  const [to, setTo] = useState(initial?.to || '@public')
  const [iconFile, setIconFile] = useState(null)
  const [iconPreview, setIconPreview] = useState(initial?.icon ?? null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const iconInputRef = useRef(null)

  const handleIconChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIconFile(file)
    setIconPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      let iconValue
      if (iconFile) {
        const res = await client.files.upload({
          file: iconFile,
          filename: iconFile.name,
          contentType: iconFile.type,
          to,
          generateThumbnail: true,
        })
        iconValue = res?.file?.url
      }

      const opts = {
        name,
        summary: summary || undefined,
        to,
        canReply: to,
        canReact: to,
        ...(iconValue ? { icon: iconValue } : {}),
      }

      let res
      if (initial?.id) {
        res = await client.admin.updateCircle({ circleId: initial.id, updates: opts })
        onSave(res.circle)
      } else {
        res = await client.admin.createCircle(opts)
        onSave(res.circle)
      }
    } catch (err) {
      setError(
        err?.status === 403 || err?.statusCode === 403
          ? "Only circles this server created can be edited here."
          : err?.message || 'Failed to save circle'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-2 border-primary p-6 mb-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl tracking-wide">{initial?.id ? 'Edit Circle' : 'New Circle'}</h2>
        <button type="button" onClick={onCancel} className="p-1 text-base-content/40 hover:text-base-content transition-colors">
          <X size={16} />
        </button>
      </div>

      {error && <p className="font-ui text-xs text-error">{error}</p>}

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1 col-span-2">
          <label className="font-ui text-xs uppercase tracking-widest text-base-content/50">Name *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required
            className="border-2 border-base-300 focus:border-primary bg-base-100 px-3 py-2 font-ui text-sm outline-none" />
        </div>
        <div className="flex flex-col gap-1 col-span-2">
          <label className="font-ui text-xs uppercase tracking-widest text-base-content/50">Summary</label>
          <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={3}
            className="border-2 border-base-300 focus:border-primary bg-base-100 px-3 py-2 font-ui text-sm outline-none resize-y" />
        </div>

        <div className="flex flex-col gap-2 col-span-2">
          <label className="font-ui text-xs uppercase tracking-widest text-base-content/50">Icon</label>
          {iconPreview ? (
            <div className="relative w-24">
              <img src={iconPreview} alt="Icon" className="w-24 h-24 object-cover" />
              <button type="button" onClick={() => { setIconFile(null); setIconPreview(null) }}
                className="absolute top-1 right-1 p-1 bg-base-100/90 text-base-content hover:text-error transition-colors" title="Remove icon">
                <X size={12} />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => iconInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-base-300 hover:border-primary text-base-content/40 hover:text-primary transition-colors font-ui text-xs uppercase tracking-widest self-start">
              <ImagePlus size={14} /> Upload icon
            </button>
          )}
          <input ref={iconInputRef} type="file" accept="image/*" onChange={handleIconChange} className="hidden" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-ui text-xs uppercase tracking-widest text-base-content/50">Visibility</label>
          <select value={to} onChange={(e) => setTo(e.target.value)}
            className="border-2 border-base-300 focus:border-primary bg-base-100 px-3 py-2 font-ui text-sm outline-none">
            {VISIBILITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={saving || !name.trim()}
          className="px-5 py-2 bg-primary text-primary-content font-ui text-xs uppercase tracking-widest disabled:opacity-50">
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-5 py-2 border border-base-300 font-ui text-xs uppercase tracking-widest hover:bg-base-200 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  )
}

export default function AdminCirclesPage() {
  const client = useClient()
  const [circles, setCircles] = useState([])
  const [loading, setLoading] = useState(true)
  const [denied, setDenied] = useState(false)
  const [filter, setFilter] = useState('active')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pending, setPending] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [discoveryItem, setDiscoveryItem] = useState(null)
  const { selected, toggle, selectAll, clear, isSelected, allSelected, someSelected, count } = useBatchSelect(circles)

  const ownActorId = serverActorId(client)

  const load = useCallback(async () => {
    if (!client) return
    setLoading(true)
    try {
      const params = { page }
      if (filter === 'deleted') params.showDeleted = true
      const res = await client.admin.getCircles(params)
      setCircles(res?.orderedItems ?? [])
      setTotal(res?.totalItems ?? 0)
    } catch (err) {
      if (err?.status === 403 || err?.statusCode === 403) setDenied(true)
    } finally {
      setLoading(false)
    }
  }, [client, filter, page])

  useEffect(() => { load() }, [load])
  useEffect(() => { clear() }, [filter, page])

  const handleDelete = async (circleId) => {
    setPending(true)
    try {
      await client.admin.deleteCircle({ circleId })
      setCircles((prev) => prev.map((c) => c.id === circleId ? { ...c, deletedAt: new Date().toISOString() } : c))
    } catch {}
    setPending(false)
  }

  const handleRestore = async (circleId) => {
    setPending(true)
    try {
      await client.admin.restoreCircle({ circleId })
      setCircles((prev) => prev.map((c) => c.id === circleId ? { ...c, deletedAt: null } : c))
    } catch {}
    setPending(false)
  }

  const handleSaved = (circle) => {
    if (editing) {
      setCircles((prev) => prev.map((c) => c.id === circle.id ? circle : c))
      setEditing(null)
    } else {
      setCircles((prev) => [circle, ...prev])
      setShowForm(false)
    }
  }

  const handleBatchSoftDelete = async () => {
    if (!confirm(`Soft-delete ${count} circle(s)?`)) return
    setPending(true)
    await Promise.allSettled([...selected].map((id) => client.admin.deleteCircle({ circleId: id })))
    clear()
    await load()
    setPending(false)
  }

  const handleBatchHardDelete = async () => {
    if (!confirm(`Permanently delete ${count} circle(s)? This cannot be undone.`)) return
    setPending(true)
    await Promise.allSettled([...selected].map((id) => client.admin.deleteCircle({ circleId: id, fullDelete: true })))
    clear()
    await load()
    setPending(false)
  }

  const handleBatchRestore = async () => {
    setPending(true)
    await Promise.allSettled([...selected].map((id) => client.admin.restoreCircle({ circleId: id })))
    clear()
    await load()
    setPending(false)
  }

  if (denied) return (
    <div className="py-16 text-center"><p className="font-display text-3xl tracking-wide">Access Denied</p></div>
  )

  const FILTERS = [['active', 'Active'], ['deleted', 'Deleted']]
  const limit = 20
  const pages = Math.ceil(total / limit)

  return (
    <div>
      <div className="flex items-baseline justify-between border-b-2 border-base-300 pb-4 mb-6">
        <h1 className="font-display text-5xl tracking-wide">Circles</h1>
        <div className="flex items-center gap-4">
          <span className="font-ui text-xs uppercase tracking-widest text-base-content/40">{total} total</span>
          <button onClick={() => { setShowForm((v) => !v); setEditing(null) }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-content font-ui text-xs uppercase tracking-widest">
            <Plus size={13} /> New Circle
          </button>
        </div>
      </div>

      {showForm && !editing && (
        <CircleForm onSave={handleSaved} onCancel={() => setShowForm(false)} />
      )}
      {editing && (
        <CircleForm initial={editing} onSave={handleSaved} onCancel={() => setEditing(null)} />
      )}

      <div className="flex gap-0 mb-4">
        {FILTERS.map(([val, label]) => (
          <button key={val} onClick={() => { setFilter(val); setPage(1) }}
            className={`px-4 py-2 font-ui text-xs uppercase tracking-widest border-r border-base-300 last:border-r-0 transition-colors ${
              filter === val ? 'bg-secondary text-secondary-content' : 'bg-base-200 text-base-content/60 hover:bg-base-300'
            }`}>
            {label}
          </button>
        ))}
      </div>

      <BatchActionBar count={count} filter={filter} busy={pending}
        onSoftDelete={handleBatchSoftDelete} onHardDelete={handleBatchHardDelete}
        onRestore={handleBatchRestore} onClear={clear} />

      {loading ? <Spinner centered /> : (
        <>
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-base-300">
                <th className="pb-2 pr-3 w-6">
                  <input type="checkbox" checked={allSelected} ref={(el) => { if (el) el.indeterminate = someSelected }}
                    onChange={() => allSelected ? clear() : selectAll()} className="cursor-pointer" />
                </th>
                {['Name', 'Creator', 'Members', 'Created', 'Status', ''].map((h) => (
                  <th key={h} className="font-ui text-xs uppercase tracking-widest text-base-content/50 text-left pb-2 pr-4 last:pr-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {circles.map((c) => (
                <tr key={c.id} className={`border-b border-base-300 hover:bg-base-200 ${c.deletedAt ? 'opacity-50' : ''} ${isSelected(c.id) ? 'bg-secondary/10' : ''}`}>
                  <td className="py-3 pr-3">
                    <input type="checkbox" checked={isSelected(c.id)} onChange={() => toggle(c.id)} className="cursor-pointer" />
                  </td>
                  <td className="py-3 pr-4">
                    <Link to={`/circles/${encodeURIComponent(c.id)}`} className="font-ui text-sm hover:text-primary transition-colors">
                      {c.name ?? c.id}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 font-ui text-xs text-base-content/50 max-w-28 truncate">{c.actorId}</td>
                  <td className="py-3 pr-4 font-ui text-sm">{c.memberCount ?? '—'}</td>
                  <td className="py-3 pr-4 font-ui text-xs text-base-content/50 whitespace-nowrap">{fmtDate(c.createdAt)}</td>
                  <td className="py-3 pr-4">
                    <span className={`font-ui text-xs uppercase tracking-widest px-2 py-0.5 ${c.deletedAt ? 'bg-error/15 text-error' : 'bg-success/15 text-success'}`}>
                      {c.deletedAt ? 'Deleted' : 'Active'}
                    </span>
                  </td>
                  <td className="py-3 text-right whitespace-nowrap">
                    <Link to={`/circles/${encodeURIComponent(c.id)}`}
                      className="p-1 text-base-content/30 hover:text-base-content transition-colors inline-block mr-1" title="View">
                      <ExternalLink size={13} />
                    </Link>
                    {!c.deletedAt && (
                      <button onClick={() => setDiscoveryItem(c)}
                        className="p-1 text-base-content/30 hover:text-base-content transition-colors inline-block mr-1" title="Add to Discovery">
                        <Compass size={13} />
                      </button>
                    )}
                    {!c.deletedAt && ownActorId && c.actorId === ownActorId && (
                      <button onClick={() => { setEditing(c); setShowForm(false) }}
                        className="p-1 text-base-content/30 hover:text-base-content transition-colors inline-block mr-1" title="Edit">
                        <Pencil size={13} />
                      </button>
                    )}
                    {c.deletedAt ? (
                      <button onClick={() => handleRestore(c.id)} disabled={pending}
                        className="p-1 text-base-content/40 hover:text-success transition-colors disabled:opacity-30" title="Restore">
                        <RotateCcw size={14} />
                      </button>
                    ) : (
                      !c.deletedAt && ownActorId && c.actorId === ownActorId && (
                        <button onClick={() => handleDelete(c.id)} disabled={pending}
                          className="p-1 text-base-content/40 hover:text-error transition-colors disabled:opacity-30" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
              {circles.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center font-ui text-xs uppercase tracking-widest text-base-content/40">No circles found</td></tr>
              )}
            </tbody>
          </table>

          {pages > 1 && (
            <div className="flex items-center gap-3 mt-6">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="font-ui text-xs uppercase tracking-widest px-3 py-1.5 border border-base-300 disabled:opacity-30 hover:bg-base-200 transition-colors">
                Prev
              </button>
              <span className="font-ui text-xs text-base-content/50">{page} / {pages}</span>
              <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}
                className="font-ui text-xs uppercase tracking-widest px-3 py-1.5 border border-base-300 disabled:opacity-30 hover:bg-base-200 transition-colors">
                Next
              </button>
            </div>
          )}
        </>
      )}

      <AddToDiscoveryModal
        item={discoveryItem}
        refType="Circle"
        open={!!discoveryItem}
        onClose={() => setDiscoveryItem(null)}
      />
    </div>
  )
}
