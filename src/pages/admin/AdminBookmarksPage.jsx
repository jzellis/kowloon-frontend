import { useState, useEffect, useCallback, useRef } from 'react'
import { Trash2, RotateCcw, ExternalLink, Plus, X, Pencil } from 'lucide-react'
import { useClient } from '../../hooks/useClient'
import { useBatchSelect } from '../../hooks/useBatchSelect'
import Spinner from '../../components/ui/Spinner'
import BatchActionBar from '../../components/admin/BatchActionBar'

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

// Explicit @<domain> token, NOT the literal '@server' AdminGroupsPage/
// AdminPagesPage use — canSeeObject() (single-item fetch, folder-chain
// checks) has no legacy-token handling for '@server', only
// buildVisibilityQuery() (list endpoints) does, so '@server' content 404s
// on direct fetch. Bookmarks/folders are fetched by id and their folder
// chain is checked, so this distinction actually matters here.
function visibilityOptions(client) {
  const domain = serverActorId(client)
  return [
    { value: '@public', label: 'Public' },
    { value: domain || '@server', label: 'Server only' },
  ]
}

function BookmarkForm({ initial, folders, onSave, onCancel }) {
  const client = useClient()
  const [title, setTitle] = useState(initial?.title ?? '')
  const [summary, setSummary] = useState(initial?.summary ?? '')
  const [type, setType] = useState(initial?.type ?? 'Bookmark')
  const [href, setHref] = useState(initial?.href ?? '')
  const [parentFolder, setParentFolder] = useState(initial?.parentFolder ?? '')
  const [to, setTo] = useState(initial?.to || '@public')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [fetchingPreview, setFetchingPreview] = useState(false)
  // URL already auto-filled from, so a re-fetch (as the user keeps typing)
  // never re-injects title/summary the user has since edited or cleared.
  const autoFilledHrefRef = useRef(null)

  const VISIBILITY_OPTIONS = visibilityOptions(client)

  // Live link preview — debounced as the URL is typed/pasted, matching
  // PostComposer's Link-type autofill. Fills title/summary once per URL,
  // only into fields that are still empty.
  useEffect(() => {
    if (type !== 'Bookmark' || !href.trim() || !client) return
    const url = href.trim()
    const timer = setTimeout(async () => {
      try { new URL(url) } catch { return }
      setFetchingPreview(true)
      try {
        const meta = await client.feeds.getLinkPreview({ url })
        if (meta && autoFilledHrefRef.current !== url) {
          autoFilledHrefRef.current = url
          if (meta.title && !title) setTitle(meta.title)
          if (meta.summary && !summary) setSummary(meta.summary)
        }
      } catch {}
      finally { setFetchingPreview(false) }
    }, 600)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [href, type, client])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const opts = {
        title,
        summary: summary || undefined,
        type,
        href: type === 'Bookmark' ? href : undefined,
        parentFolder: type === 'Bookmark' && parentFolder ? parentFolder : undefined,
        to,
      }

      let res
      if (initial?.id) {
        res = await client.admin.updateBookmark({ bookmarkId: initial.id, updates: opts })
        onSave(res.bookmark)
      } else {
        res = await client.admin.createBookmark(opts)
        onSave(res.bookmark)
      }
    } catch (err) {
      setError(
        err?.status === 403 || err?.statusCode === 403
          ? 'Only bookmarks this server created can be edited here.'
          : err?.message || 'Failed to save bookmark'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-2 border-primary p-6 mb-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl tracking-wide">{initial?.id ? 'Edit Bookmark' : 'New Bookmark'}</h2>
        <button type="button" onClick={onCancel} className="p-1 text-base-content/40 hover:text-base-content transition-colors">
          <X size={16} />
        </button>
      </div>

      {error && <p className="font-ui text-xs text-error">{error}</p>}

      <div className="grid grid-cols-2 gap-4">
        {type === 'Bookmark' && (
          <div className="flex flex-col gap-1 col-span-2">
            <label className="font-ui text-xs uppercase tracking-widest text-base-content/50">
              URL * {fetchingPreview && <span className="normal-case tracking-normal text-base-content/40">fetching preview…</span>}
            </label>
            <input value={href} onChange={(e) => setHref(e.target.value)} required
              placeholder="https://…"
              className="border-2 border-base-300 focus:border-primary bg-base-100 px-3 py-2 font-ui text-sm outline-none" />
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="font-ui text-xs uppercase tracking-widest text-base-content/50">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} disabled={!!initial?.id}
            className="border-2 border-base-300 focus:border-primary bg-base-100 px-3 py-2 font-ui text-sm outline-none disabled:opacity-50">
            <option value="Bookmark">Bookmark (link)</option>
            <option value="Folder">Folder</option>
          </select>
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

        <div className="flex flex-col gap-1 col-span-2">
          <label className="font-ui text-xs uppercase tracking-widest text-base-content/50">Title *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required
            className="border-2 border-base-300 focus:border-primary bg-base-100 px-3 py-2 font-ui text-sm outline-none" />
        </div>

        {type === 'Bookmark' && (
          <>
            <div className="flex flex-col gap-1 col-span-2">
              <label className="font-ui text-xs uppercase tracking-widest text-base-content/50">Summary</label>
              <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={2}
                className="border-2 border-base-300 focus:border-primary bg-base-100 px-3 py-2 font-ui text-sm outline-none resize-y" />
            </div>
            <div className="flex flex-col gap-1 col-span-2">
              <label className="font-ui text-xs uppercase tracking-widest text-base-content/50">Folder</label>
              <select value={parentFolder} onChange={(e) => setParentFolder(e.target.value)}
                className="border-2 border-base-300 focus:border-primary bg-base-100 px-3 py-2 font-ui text-sm outline-none">
                <option value="">— None (top level) —</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>{f.title}</option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={saving || !title.trim() || (type === 'Bookmark' && !href.trim())}
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

export default function AdminBookmarksPage() {
  const client = useClient()
  const [bookmarks, setBookmarks] = useState([])
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(true)
  const [denied, setDenied] = useState(false)
  const [filter, setFilter] = useState('active')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pending, setPending] = useState(false)
  // Deep-link from the dashboard's "Create Bookmark" quick link (/admin/bookmarks?new=1).
  const [showForm, setShowForm] = useState(() => new URLSearchParams(window.location.search).get('new') === '1')
  const [editing, setEditing] = useState(null)
  const { selected, toggle, selectAll, clear, isSelected, allSelected, someSelected, count } = useBatchSelect(bookmarks)

  const ownActorId = serverActorId(client)

  const load = useCallback(async () => {
    if (!client) return
    setLoading(true)
    try {
      const params = { page }
      if (filter === 'deleted') params.showDeleted = true
      const [res, folderRes] = await Promise.all([
        client.admin.getBookmarks(params),
        client.admin.getBookmarks({ type: 'Folder' }),
      ])
      setBookmarks(res?.orderedItems ?? [])
      setTotal(res?.totalItems ?? 0)
      setFolders((folderRes?.orderedItems ?? []).filter((f) => !f.parentFolder))
    } catch (err) {
      if (err?.status === 403 || err?.statusCode === 403) setDenied(true)
    } finally {
      setLoading(false)
    }
  }, [client, filter, page])

  useEffect(() => { load() }, [load])
  useEffect(() => { clear() }, [filter, page])

  const handleDelete = async (bookmarkId) => {
    setPending(true)
    try {
      await client.admin.deleteBookmark({ bookmarkId })
      await load()
    } catch {}
    setPending(false)
  }

  const handleRestore = async (bookmarkId) => {
    setPending(true)
    try {
      await client.admin.restoreBookmark({ bookmarkId })
      await load()
    } catch {}
    setPending(false)
  }

  const handleSaved = async () => {
    setEditing(null)
    setShowForm(false)
    await load()
  }

  const handleBatchSoftDelete = async () => {
    if (!confirm(`Soft-delete ${count} bookmark(s)?`)) return
    setPending(true)
    await Promise.allSettled([...selected].map((id) => client.admin.deleteBookmark({ bookmarkId: id })))
    clear()
    await load()
    setPending(false)
  }

  const handleBatchHardDelete = async () => {
    if (!confirm(`Permanently delete ${count} bookmark(s)? This cannot be undone.`)) return
    setPending(true)
    await Promise.allSettled([...selected].map((id) => client.admin.deleteBookmark({ bookmarkId: id, fullDelete: true })))
    clear()
    await load()
    setPending(false)
  }

  const handleBatchRestore = async () => {
    setPending(true)
    await Promise.allSettled([...selected].map((id) => client.admin.restoreBookmark({ bookmarkId: id })))
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
        <h1 className="font-display text-5xl tracking-wide">Bookmarks</h1>
        <div className="flex items-center gap-4">
          <span className="font-ui text-xs uppercase tracking-widest text-base-content/40">{total} total</span>
          <button onClick={() => { setShowForm((v) => !v); setEditing(null) }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-content font-ui text-xs uppercase tracking-widest">
            <Plus size={13} /> New Bookmark
          </button>
        </div>
      </div>

      {showForm && !editing && (
        <BookmarkForm folders={folders} onSave={handleSaved} onCancel={() => setShowForm(false)} />
      )}
      {editing && (
        <BookmarkForm initial={editing} folders={folders.filter((f) => f.id !== editing.id)} onSave={handleSaved} onCancel={() => setEditing(null)} />
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
                {['Title', 'Type', 'Folder', 'Created', 'Status', ''].map((h) => (
                  <th key={h} className="font-ui text-xs uppercase tracking-widest text-base-content/50 text-left pb-2 pr-4 last:pr-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookmarks.map((b) => (
                <tr key={b.id} className={`border-b border-base-300 hover:bg-base-200 ${b.deletedAt ? 'opacity-50' : ''} ${isSelected(b.id) ? 'bg-secondary/10' : ''}`}>
                  <td className="py-3 pr-3">
                    <input type="checkbox" checked={isSelected(b.id)} onChange={() => toggle(b.id)} className="cursor-pointer" />
                  </td>
                  <td className="py-3 pr-4 font-ui text-sm">{b.title ?? b.id}</td>
                  <td className="py-3 pr-4 font-ui text-xs text-base-content/50">{b.type}</td>
                  <td className="py-3 pr-4 font-ui text-xs text-base-content/50">
                    {folders.find((f) => f.id === b.parentFolder)?.title ?? '—'}
                  </td>
                  <td className="py-3 pr-4 font-ui text-xs text-base-content/50 whitespace-nowrap">{fmtDate(b.createdAt)}</td>
                  <td className="py-3 pr-4">
                    <span className={`font-ui text-xs uppercase tracking-widest px-2 py-0.5 ${b.deletedAt ? 'bg-error/15 text-error' : 'bg-success/15 text-success'}`}>
                      {b.deletedAt ? 'Deleted' : 'Active'}
                    </span>
                  </td>
                  <td className="py-3 text-right whitespace-nowrap">
                    {b.type === 'Bookmark' && b.href && (
                      <a href={b.href} target="_blank" rel="noopener noreferrer"
                        className="p-1 text-base-content/30 hover:text-base-content transition-colors inline-block mr-1" title="Open link">
                        <ExternalLink size={13} />
                      </a>
                    )}
                    {!b.deletedAt && ownActorId && b.actorId === ownActorId && (
                      <button onClick={() => { setEditing(b); setShowForm(false) }}
                        className="p-1 text-base-content/30 hover:text-base-content transition-colors inline-block mr-1" title="Edit">
                        <Pencil size={13} />
                      </button>
                    )}
                    {b.deletedAt ? (
                      <button onClick={() => handleRestore(b.id)} disabled={pending}
                        className="p-1 text-base-content/40 hover:text-success transition-colors disabled:opacity-30" title="Restore">
                        <RotateCcw size={14} />
                      </button>
                    ) : (
                      <button onClick={() => handleDelete(b.id)} disabled={pending}
                        className="p-1 text-base-content/40 hover:text-error transition-colors disabled:opacity-30" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {bookmarks.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center font-ui text-xs uppercase tracking-widest text-base-content/40">No bookmarks found</td></tr>
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
    </div>
  )
}
