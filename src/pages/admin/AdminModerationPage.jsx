// AdminModerationPage — review and resolve flagged items.

import { useState, useEffect, useCallback } from 'react'
import { ExternalLink, CheckCircle, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useClient } from '../../hooks/useClient'
import Spinner from '../../components/ui/Spinner'

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

// Flag.reason is a required Object ({code, label, description, details?} --
// see schema/Flag.js and ActivityParser/handlers/Flag/index.js), never a
// plain string -- rendering it directly threw "Objects are not valid as a
// React child" (minified error #31) for every flag with a reason set.
function reasonLabel(reason, fallback = '—') {
  if (!reason) return fallback
  if (typeof reason === 'string') return reason
  return reason.label || reason.description || reason.code || fallback
}

function ResolveModal({ flag, onClose, onResolved }) {
  const client = useClient()
  const [status, setStatus] = useState('resolved')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await client.admin.resolveFlag({ flagId: flag.id, status, notes: notes || undefined })
      onResolved(res.flag)
    } catch (err) {
      setError(err?.message || 'Failed to resolve flag')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <form onSubmit={handleSubmit} className="bg-base-100 border-2 border-base-300 p-6 w-full max-w-md flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-2xl tracking-wide">Resolve Flag</h2>
        <p className="font-ui text-xs text-base-content/60">{reasonLabel(flag.reason, 'No reason given')}</p>
        {error && <p className="font-ui text-xs text-error">{error}</p>}

        <div className="flex gap-0">
          {['resolved', 'dismissed'].map((s) => (
            <button key={s} type="button" onClick={() => setStatus(s)}
              className={`px-4 py-2 font-ui text-xs uppercase tracking-widest border-r border-base-300 last:border-r-0 transition-colors ${
                status === s ? 'bg-secondary text-secondary-content' : 'bg-base-200 text-base-content/60 hover:bg-base-300'
              }`}>
              {s}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-ui text-xs uppercase tracking-widest text-base-content/50">Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
            className="border-2 border-base-300 focus:border-primary bg-base-100 px-3 py-2 font-ui text-sm outline-none resize-none" />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="px-5 py-2 bg-primary text-primary-content font-ui text-xs uppercase tracking-widest disabled:opacity-50">
            {saving ? 'Saving…' : 'Confirm'}
          </button>
          <button type="button" onClick={onClose}
            className="px-5 py-2 border border-base-300 font-ui text-xs uppercase tracking-widest hover:bg-base-200 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

function targetPath(flag) {
  if (!flag?.targetId) return null
  const id = flag.targetId
  if (id.startsWith('post:')) return `/posts/${encodeURIComponent(id)}`
  if (id.startsWith('group:')) return `/groups/${encodeURIComponent(id)}`
  if (id.startsWith('@')) return `/users/${encodeURIComponent(id)}`
  return null
}

export default function AdminModerationPage() {
  const client = useClient()
  const [flags, setFlags] = useState([])
  const [loading, setLoading] = useState(true)
  const [denied, setDenied] = useState(false)
  const [filter, setFilter] = useState('open')
  const [resolving, setResolving] = useState(null)

  const load = useCallback(async () => {
    if (!client) return
    setLoading(true)
    try {
      const res = await client.admin.getFlagged({ status: filter })
      setFlags(res?.orderedItems ?? [])
    } catch (err) {
      if (err?.status === 403 || err?.statusCode === 403) setDenied(true)
    } finally {
      setLoading(false)
    }
  }, [client, filter])

  useEffect(() => { load() }, [load])

  const handleResolved = (updated) => {
    setFlags((prev) => prev.map((f) => f.id === updated.id ? updated : f))
    setResolving(null)
  }

  if (denied) return (
    <div className="py-16 text-center"><p className="font-display text-3xl tracking-wide">Access Denied</p></div>
  )

  const FILTERS = [['open', 'Open'], ['resolved', 'Resolved'], ['dismissed', 'Dismissed']]

  return (
    <div>
      {resolving && <ResolveModal flag={resolving} onClose={() => setResolving(null)} onResolved={handleResolved} />}

      <div className="flex items-baseline justify-between border-b-2 border-base-300 pb-4 mb-6">
        <h1 className="font-display text-5xl tracking-wide">Moderation</h1>
        <span className="font-ui text-xs uppercase tracking-widest text-base-content/40">{flags.length} items</span>
      </div>

      <div className="flex gap-0 mb-6">
        {FILTERS.map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-4 py-2 font-ui text-xs uppercase tracking-widest border-r border-base-300 last:border-r-0 transition-colors ${
              filter === val ? 'bg-secondary text-secondary-content' : 'bg-base-200 text-base-content/60 hover:bg-base-300'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? <Spinner centered /> : (
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-base-300">
              {['Target', 'Reporter', 'Reason', 'Flagged', 'Status', ''].map((h) => (
                <th key={h} className="font-ui text-xs uppercase tracking-widest text-base-content/50 text-left pb-2 pr-4 last:pr-0">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {flags.map((flag) => {
              const path = targetPath(flag)
              return (
                <tr key={flag.id} className="border-b border-base-300 hover:bg-base-200">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-xs text-base-content/50 max-w-36 truncate block">{flag.targetId ?? '—'}</span>
                      {path && (
                        <Link to={path} className="p-0.5 text-base-content/30 hover:text-base-content transition-colors" title="View">
                          <ExternalLink size={11} />
                        </Link>
                      )}
                    </div>
                    {flag.targetType && (
                      <span className="font-ui text-xs uppercase tracking-widest text-base-content/40">{flag.targetType}</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 font-ui text-xs text-base-content/50 max-w-28 truncate">{flag.actorId ?? '—'}</td>
                  <td className="py-3 pr-4 font-ui text-sm max-w-48">
                    <span className="line-clamp-2">{reasonLabel(flag.reason)}</span>
                    {flag.notes && <span className="block font-ui text-xs text-base-content/40 mt-0.5 line-clamp-1">{flag.notes}</span>}
                  </td>
                  <td className="py-3 pr-4 font-ui text-xs text-base-content/50 whitespace-nowrap">{fmtDate(flag.createdAt)}</td>
                  <td className="py-3 pr-4">
                    <span className={`font-ui text-xs uppercase tracking-widest px-2 py-0.5 ${
                      flag.status === 'open' ? 'bg-warning/15 text-warning' :
                      flag.status === 'resolved' ? 'bg-success/15 text-success' :
                      'bg-base-300 text-base-content/50'
                    }`}>
                      {flag.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    {flag.status === 'open' && (
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => setResolving(flag)}
                          className="p-1 text-base-content/40 hover:text-success transition-colors" title="Resolve">
                          <CheckCircle size={14} />
                        </button>
                        <button onClick={() => {
                          client.admin.resolveFlag({ flagId: flag.id, status: 'dismissed' })
                            .then((res) => handleResolved(res.flag))
                            .catch(() => {})
                        }}
                          className="p-1 text-base-content/40 hover:text-error transition-colors" title="Dismiss">
                          <XCircle size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
            {flags.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center font-ui text-xs uppercase tracking-widest text-base-content/40">
                {filter === 'open' ? 'No open flags — all clear.' : 'No items found.'}
              </td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}
