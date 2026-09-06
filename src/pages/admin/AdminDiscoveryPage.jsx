// AdminDiscoveryPage — manage Discover: the 5 canonical shelves (sections)
// and the curated items on each. Sections are a fixed, one-per-content-type
// set (seeded by scripts/seed-discover-sections.js) -- this page lets an
// admin rename/reorder/hide them and adjust visibility, but doesn't offer
// "create a new section" (that would let an admin create a shelf with no
// contentType at all, which the read side can't resolve).
//
// Adding NEW items isn't done here -- it's the "Add to Discovery" action
// already wired into Post/Circle pages and the admin Posts/Circles tables
// (components/discover/AddToDiscoveryModal.jsx). This page is for managing
// what's already curated: reorder, edit the commentary, hide, or remove.

import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronUp, ChevronDown, Trash2, RotateCcw, Pencil, Check, X, AlertTriangle } from 'lucide-react'
import { useClient } from '../../hooks/useClient'
import Spinner from '../../components/ui/Spinner'

const REF_TYPE_PATH = {
  Post: '/posts/',
  Circle: '/circles/',
  Group: '/groups/',
  Bookmark: '/bookmarks/',
  Page: '/pages/',
}

function linkFor(item) {
  if (item.refType === 'Server') return `/server/${item.ref.replace(/^@/, '')}`
  const base = REF_TYPE_PATH[item.refType]
  return base ? `${base}${encodeURIComponent(item.ref)}` : null
}

function titleOf(item) {
  const t = item.target
  if (!t) return null
  return t.title || t.name || null
}

function imageOf(item) {
  const t = item.target
  if (!t) return null
  return t.icon || t.featuredImage || t.image || null
}

// ── Section header: name/summary/visibility, inline-editable ──────────────

function SectionHeader({ section, onSave, onToggleActive, pending }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(section.name)
  const [summary, setSummary] = useState(section.summary ?? '')
  const [to, setTo] = useState(section.to === '@public' ? 'public' : 'server')

  const startEdit = () => {
    setName(section.name)
    setSummary(section.summary ?? '')
    setTo(section.to === '@public' ? 'public' : 'server')
    setEditing(true)
  }

  const save = async () => {
    await onSave(section, { name: name.trim() || section.name, summary: summary.trim(), to: to === 'public' ? '@public' : `@${section.originDomain ?? ''}` })
    setEditing(false)
  }

  return (
    <div className="flex items-start justify-between gap-4 pb-3 border-b-2 border-base-300">
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex flex-col gap-2 max-w-md">
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="border-2 border-base-300 focus:border-primary bg-base-100 px-3 py-1.5 font-display text-xl outline-none" />
            <input value={summary} onChange={(e) => setSummary(e.target.value)}
              placeholder="Optional shelf blurb"
              className="border border-base-300 focus:border-primary bg-base-100 px-2 py-1.5 font-ui text-xs outline-none" />
            <div className="flex gap-0 self-start">
              {['public', 'server'].map((v) => (
                <button key={v} type="button" onClick={() => setTo(v)}
                  className={`px-3 py-1.5 font-ui text-[10px] uppercase tracking-widest border-r border-base-300 last:border-r-0 transition-colors ${
                    to === v ? 'bg-secondary text-secondary-content' : 'bg-base-200 text-base-content/60 hover:bg-base-300'
                  }`}>
                  {v === 'public' ? 'Public' : 'Server-only'}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display text-2xl tracking-wide">{section.name}</h2>
              <span className="font-ui text-[10px] uppercase tracking-widest px-1.5 py-0.5 bg-base-300 text-base-content/50">
                {section.contentType}
              </span>
              <span className="font-ui text-[10px] uppercase tracking-widest px-1.5 py-0.5 bg-base-200 text-base-content/40">
                {section.source}
              </span>
              <span className="font-ui text-[10px] uppercase tracking-widest text-base-content/40">
                {section.to === '@public' ? 'Public' : 'Server-only'}
              </span>
            </div>
            {section.summary && <p className="font-reading text-sm text-base-content/50 italic mt-1">{section.summary}</p>}
          </>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {editing ? (
          <>
            <button onClick={() => setEditing(false)} className="p-1.5 text-base-content/40 hover:text-base-content transition-colors" title="Cancel">
              <X size={15} />
            </button>
            <button onClick={save} disabled={pending} className="p-1.5 text-primary hover:text-primary/80 transition-colors disabled:opacity-40" title="Save">
              <Check size={15} />
            </button>
          </>
        ) : (
          <>
            <button onClick={startEdit} className="p-1.5 text-base-content/40 hover:text-base-content transition-colors" title="Edit shelf">
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onToggleActive(section)}
              disabled={pending}
              className={`px-3 py-1.5 font-ui text-[10px] uppercase tracking-widest border transition-colors disabled:opacity-40 ${
                section.active ? 'border-base-300 text-base-content/60 hover:bg-base-200' : 'border-warning text-warning bg-warning/10'
              }`}
            >
              {section.active ? 'Active' : 'Hidden'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ── One curated item row ────────────────────────────────────────────────

function ItemRow({ item, isFirst, isLast, onMove, onToggleActive, onSaveNote, onRemove, onRestore, pending }) {
  const [editingNote, setEditingNote] = useState(false)
  const [note, setNote] = useState(item.note ?? '')
  const missing = !item.target || item.target.deletedAt
  const href = !missing ? linkFor(item) : null

  const saveNote = async () => {
    await onSaveNote(item, note.trim())
    setEditingNote(false)
  }

  return (
    <div className={`flex items-center gap-3 py-3 border-b border-base-200 last:border-b-0 ${item.deletedAt ? 'opacity-50' : ''}`}>
      <div className="flex flex-col shrink-0">
        <button onClick={() => onMove(item, -1)} disabled={isFirst || pending} className="p-0.5 text-base-content/30 hover:text-base-content disabled:opacity-20 transition-colors">
          <ChevronUp size={14} />
        </button>
        <button onClick={() => onMove(item, 1)} disabled={isLast || pending} className="p-0.5 text-base-content/30 hover:text-base-content disabled:opacity-20 transition-colors">
          <ChevronDown size={14} />
        </button>
      </div>

      {imageOf(item) ? (
        <img src={imageOf(item)} alt="" className="w-11 h-11 object-cover shrink-0 bg-base-200" />
      ) : (
        <div className="w-11 h-11 bg-base-200 shrink-0 flex items-center justify-center">
          {missing && <AlertTriangle size={16} className="text-warning" />}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-ui text-[10px] uppercase tracking-widest px-1.5 py-0.5 bg-base-200 text-base-content/50 shrink-0">
            {item.refType}
          </span>
          {missing ? (
            <span className="font-ui text-sm text-warning italic truncate">
              {item.target?.deletedAt ? 'Target deleted' : 'Target not found'} — {item.ref}
            </span>
          ) : href ? (
            <Link to={href} className="font-ui text-sm hover:text-primary transition-colors truncate">
              {titleOf(item) || item.ref}
            </Link>
          ) : (
            <span className="font-ui text-sm truncate">{titleOf(item) || item.ref}</span>
          )}
        </div>
        {editingNote ? (
          <div className="flex items-center gap-2 mt-1">
            <input value={note} onChange={(e) => setNote(e.target.value)} autoFocus
              placeholder="Why this is worth featuring…"
              className="flex-1 border border-base-300 focus:border-primary bg-base-100 px-2 py-1 font-ui text-xs outline-none" />
            <button onClick={() => setEditingNote(false)} className="text-base-content/40 hover:text-base-content transition-colors"><X size={13} /></button>
            <button onClick={saveNote} className="text-primary hover:text-primary/80 transition-colors"><Check size={13} /></button>
          </div>
        ) : (
          <button onClick={() => { setNote(item.note ?? ''); setEditingNote(true) }} className="block mt-0.5 text-left">
            <span className={`font-reading text-xs italic ${item.note ? 'text-base-content/50' : 'text-base-content/30'}`}>
              {item.note || 'Add commentary…'}
            </span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {!item.deletedAt && (
          <button
            onClick={() => onToggleActive(item)}
            disabled={pending}
            className={`px-2 py-1 font-ui text-[9px] uppercase tracking-widest border transition-colors disabled:opacity-40 ${
              item.active ? 'border-base-300 text-base-content/50 hover:bg-base-200' : 'border-warning text-warning bg-warning/10'
            }`}
          >
            {item.active ? 'Shown' : 'Hidden'}
          </button>
        )}
        {item.deletedAt ? (
          <button onClick={() => onRestore(item)} disabled={pending} className="p-1 text-base-content/40 hover:text-success transition-colors disabled:opacity-30" title="Restore">
            <RotateCcw size={14} />
          </button>
        ) : (
          <button onClick={() => onRemove(item)} disabled={pending} className="p-1 text-base-content/40 hover:text-error transition-colors disabled:opacity-30" title="Remove">
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function AdminDiscoveryPage() {
  const client = useClient()
  const [sections, setSections] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [denied, setDenied] = useState(false)
  const [showRemoved, setShowRemoved] = useState(false)
  const [pending, setPending] = useState(null)

  const load = useCallback(async () => {
    if (!client) return
    setLoading(true)
    try {
      const [sectionsRes, itemsRes] = await Promise.all([
        client.admin.getSections(),
        client.admin.getDiscoveryItems(showRemoved ? { deleted: 'include' } : {}),
      ])
      setSections(sectionsRes?.sections ?? [])
      setItems(itemsRes?.discoveries ?? [])
    } catch (err) {
      if (err?.status === 403 || err?.statusCode === 403) setDenied(true)
    } finally {
      setLoading(false)
    }
  }, [client, showRemoved])

  useEffect(() => { load() }, [load])

  const withPending = async (id, fn) => {
    setPending(id)
    try { await fn() } catch {}
    setPending(null)
  }

  const saveSectionEdit = (section, updates) =>
    withPending(section.id, async () => {
      const res = await client.admin.updateSection({ sectionId: section.id, updates })
      setSections((prev) => prev.map((s) => s.id === section.id ? res.section : s))
    })

  const toggleSectionActive = (section) =>
    saveSectionEdit(section, { active: !section.active })

  const toggleItemActive = (item) =>
    withPending(item.id, async () => {
      const res = await client.admin.updateDiscoveryItem({ discoveryId: item.id, updates: { active: !item.active } })
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...res.discovery, target: i.target } : i))
    })

  const saveNote = (item, note) =>
    withPending(item.id, async () => {
      const res = await client.admin.updateDiscoveryItem({ discoveryId: item.id, updates: { note } })
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...res.discovery, target: i.target } : i))
    })

  const removeItem = (item) =>
    withPending(item.id, async () => {
      await client.admin.removeDiscoveryItem({ discoveryId: item.id })
      if (showRemoved) await load()
      else setItems((prev) => prev.filter((i) => i.id !== item.id))
    })

  const restoreItem = (item) =>
    withPending(item.id, async () => {
      const res = await client.admin.restoreDiscoveryItem({ discoveryId: item.id })
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...res.discovery, target: i.target } : i))
    })

  const moveItem = (item, dir) =>
    withPending(item.id, async () => {
      const siblings = items
        .filter((i) => i.section === item.section && !i.deletedAt)
        .sort((a, b) => a.order - b.order)
      const idx = siblings.findIndex((i) => i.id === item.id)
      const swapWith = siblings[idx + dir]
      if (!swapWith) return
      const [a, b] = [
        client.admin.updateDiscoveryItem({ discoveryId: item.id, updates: { order: swapWith.order } }),
        client.admin.updateDiscoveryItem({ discoveryId: swapWith.id, updates: { order: item.order } }),
      ]
      const [resA, resB] = await Promise.all([a, b])
      setItems((prev) => prev.map((i) => {
        if (i.id === item.id) return { ...resA.discovery, target: i.target }
        if (i.id === swapWith.id) return { ...resB.discovery, target: i.target }
        return i
      }))
    })

  if (denied) return (
    <div className="py-16 text-center"><p className="font-display text-3xl tracking-wide">Access Denied</p></div>
  )

  const sortedSections = [...sections].sort((a, b) => a.order - b.order)

  return (
    <div>
      <div className="flex items-baseline justify-between border-b-2 border-base-300 pb-4 mb-2">
        <h1 className="font-display text-5xl tracking-wide">Discover</h1>
      </div>
      <p className="font-reading text-sm text-base-content/50 italic mb-4">
        To add something new, use "Add to Discovery" from its own page (or from the admin Posts/Circles lists).
      </p>

      <label className="flex items-center gap-2 mb-6 cursor-pointer w-fit">
        <input type="checkbox" checked={showRemoved} onChange={(e) => setShowRemoved(e.target.checked)} className="cursor-pointer" />
        <span className="font-ui text-xs uppercase tracking-widest text-base-content/60">Show removed items</span>
      </label>

      {loading ? <Spinner centered /> : (
        <div className="flex flex-col gap-10">
          {sortedSections.map((section) => {
            const sectionItems = items
              .filter((i) => i.section === section.id)
              .sort((a, b) => a.order - b.order)
            const visibleItems = sectionItems.filter((i) => !i.deletedAt)
            return (
              <div key={section.id}>
                <SectionHeader
                  section={section}
                  onSave={saveSectionEdit}
                  onToggleActive={toggleSectionActive}
                  pending={pending === section.id}
                />
                {sectionItems.length === 0 ? (
                  <p className="font-ui text-xs uppercase tracking-widest text-base-content/40 py-6 text-center">
                    No items in this shelf yet
                  </p>
                ) : (
                  <div className="mt-1">
                    {sectionItems.map((item) => {
                      const activeIdx = visibleItems.findIndex((i) => i.id === item.id)
                      return (
                        <ItemRow
                          key={item.id}
                          item={item}
                          isFirst={activeIdx <= 0}
                          isLast={activeIdx === -1 || activeIdx === visibleItems.length - 1}
                          onMove={moveItem}
                          onToggleActive={toggleItemActive}
                          onSaveNote={saveNote}
                          onRemove={removeItem}
                          onRestore={restoreItem}
                          pending={pending === item.id}
                        />
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
          {sortedSections.length === 0 && (
            <p className="font-ui text-xs uppercase tracking-widest text-base-content/40 py-8 text-center">
              No Discover shelves found — run scripts/seed-discover-sections.js
            </p>
          )}
        </div>
      )}
    </div>
  )
}
