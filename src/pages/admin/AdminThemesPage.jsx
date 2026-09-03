// AdminThemesPage — list, create, edit, delete themes; set server default.

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Pencil, Star, Check, X } from 'lucide-react'
import { useClient } from '../../hooks/useClient'
import { useDispatch } from 'react-redux'
import { fetchThemesAsync } from '../../features/theme/themeSlice'
import Spinner from '../../components/ui/Spinner'

// DaisyUI v5 color tokens, grouped and plain-language labeled for admins who
// don't know CSS. The raw token name is still shown as a small hint underneath
// each field for anyone who does want to cross-reference it against the CSS.
const TOKEN_GROUPS = [
  {
    title: 'Backgrounds & Text',
    tokens: [
      { key: 'base-100', label: 'Page Background', hint: 'The main background behind all content' },
      { key: 'base-200', label: 'Card Background', hint: 'Cards, panels, and hover states' },
      { key: 'base-300', label: 'Borders & Dividers', hint: 'Lines between sections and around boxes' },
      { key: 'base-content', label: 'Body Text', hint: 'The default text color' },
    ],
  },
  {
    title: 'Primary Color',
    tokens: [
      { key: 'primary', label: 'Primary Color', hint: 'Buttons, links, and highlights' },
      { key: 'primary-content', label: 'Text on Primary', hint: 'Text and icons shown on the primary color' },
    ],
  },
  {
    title: 'Secondary Color',
    tokens: [
      { key: 'secondary', label: 'Secondary Color', hint: 'Sidebar and secondary buttons' },
      { key: 'secondary-content', label: 'Text on Secondary', hint: 'Text and icons shown on the secondary color' },
    ],
  },
  {
    title: 'Accent Color',
    tokens: [
      { key: 'accent', label: 'Accent Color', hint: 'Extra highlights and decorative touches' },
      { key: 'accent-content', label: 'Text on Accent', hint: 'Text and icons shown on the accent color' },
    ],
  },
  {
    title: 'Dark Surface',
    tokens: [
      { key: 'neutral', label: 'Dark Surface', hint: 'Dark menus and panels' },
      { key: 'neutral-content', label: 'Text on Dark Surface', hint: 'Text and icons on dark panels' },
    ],
  },
  {
    title: 'Status Colors',
    tokens: [
      { key: 'info', label: 'Info Color', hint: 'Informational messages' },
      { key: 'info-content', label: 'Text on Info', hint: '' },
      { key: 'success', label: 'Success Color', hint: 'Confirmations and successful actions' },
      { key: 'success-content', label: 'Text on Success', hint: '' },
      { key: 'warning', label: 'Warning Color', hint: 'Warnings and caution messages' },
      { key: 'warning-content', label: 'Text on Warning', hint: '' },
      { key: 'error', label: 'Error Color', hint: 'Errors and destructive actions' },
      { key: 'error-content', label: 'Text on Error', hint: '' },
    ],
  },
]

const COLOR_TOKENS = TOKEN_GROUPS.flatMap((g) => g.tokens.map((t) => t.key))

const POST_COLOR_FIELDS = [
  { key: 'note', label: 'Note Posts' },
  { key: 'article', label: 'Article Posts' },
  { key: 'media', label: 'Media Posts' },
  { key: 'link', label: 'Link Posts' },
  { key: 'event', label: 'Event Posts' },
]
const POST_COLOR_KEYS = POST_COLOR_FIELDS.map((f) => f.key)

const BLANK_COLORS = Object.fromEntries(COLOR_TOKENS.map((t) => [t, '']))
const BLANK_POST_COLORS = Object.fromEntries(POST_COLOR_KEYS.map((k) => [k, '#888888']))

const BLANK_THEME = {
  id: '', name: '', description: '', colorScheme: 'light',
  colors: { ...BLANK_COLORS },
  postColors: { ...BLANK_POST_COLORS },
}

// <input type="color"> only accepts a plain #rrggbb value -- fall back to a
// neutral gray when the stored value is an oklch(...) string (or anything
// else it can't parse) so the picker still opens instead of silently no-oping.
const HEX_RE = /^#[0-9a-f]{6}$/i
const swatchValue = (v) => (HEX_RE.test(v) ? v : '#888888')

// Small row of color swatches — visual fingerprint for a theme
function ThemeSwatches({ theme }) {
  if (!theme.colors) return <span className="font-ui text-xs text-base-content/40">system</span>
  const keys = ['base-100', 'primary', 'secondary', 'accent', 'base-content']
  return (
    <div className="flex gap-0.5">
      {keys.map((k) => (
        <span
          key={k}
          title={k}
          style={{ background: theme.colors[k] ?? '#888', width: 16, height: 16, display: 'inline-block', border: '1px solid rgba(0,0,0,.15)' }}
        />
      ))}
    </div>
  )
}

// Color field: a native color-picker swatch (doubles as the "sample" and the
// picker button) + a text field for exact values (hex or oklch). The
// plain-language label leads; the raw CSS token name is a small mono hint.
function ColorInput({ label, hint, token, value, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <div>
        <label className="font-ui text-xs text-base-content/80">{label}</label>
        {hint && <p className="font-reading text-[11px] text-base-content/40 italic">{hint}</p>}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={swatchValue(value)}
          onChange={(e) => onChange(e.target.value)}
          title="Pick a color"
          className="w-9 h-9 shrink-0 border border-base-300 p-0 cursor-pointer bg-transparent"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#hex or oklch(…)"
          className="flex-1 min-w-0 border border-base-300 focus:border-primary bg-base-100 px-2 py-1.5 font-mono text-[11px] outline-none"
        />
      </div>
      <span className="font-mono text-[10px] text-base-content/30">{token}</span>
    </div>
  )
}

// Create/Edit form
function ThemeForm({ initial, presets, onSave, onCancel }) {
  const isEdit = !!initial?.id
  const lightPreset = presets?.light
  const darkPreset = presets?.dark

  const [form, setForm] = useState(() => {
    if (initial) {
      return {
        ...BLANK_THEME,
        ...initial,
        colors: { ...BLANK_COLORS, ...(initial.colors ?? {}) },
        postColors: { ...BLANK_POST_COLORS, ...(initial.postColors ?? {}) },
      }
    }
    // New theme: start from the site's Light preset so the admin edits real,
    // already-good colors instead of facing a wall of blank fields.
    return {
      ...BLANK_THEME,
      colorScheme: 'light',
      colors: { ...BLANK_COLORS, ...(lightPreset?.colors ?? {}) },
      postColors: { ...BLANK_POST_COLORS, ...(lightPreset?.postColors ?? {}) },
    }
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const setColor = (key, val) =>
    setForm((f) => ({ ...f, colors: { ...f.colors, [key]: val } }))
  const setPostColor = (key, val) =>
    setForm((f) => ({ ...f, postColors: { ...f.postColors, [key]: val } }))

  const applyPreset = (preset, scheme) => {
    if (!preset) return
    setForm((f) => ({
      ...f,
      colorScheme: scheme,
      colors: { ...BLANK_COLORS, ...(preset.colors ?? {}) },
      postColors: { ...BLANK_POST_COLORS, ...(preset.postColors ?? {}) },
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      // Strip empty color strings — server ignores undefined tokens
      const colors = Object.fromEntries(Object.entries(form.colors).filter(([, v]) => v.trim()))
      const postColors = Object.fromEntries(Object.entries(form.postColors).filter(([, v]) => v.trim()))
      await onSave({ ...form, colors, postColors })
    } catch (err) {
      setError(err?.message || 'Save failed')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-2 border-primary p-6 mb-6 flex flex-col gap-6">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-2xl tracking-wide">{isEdit ? 'Edit Theme' : 'New Theme'}</h2>
        <button type="button" onClick={onCancel} className="p-1 text-base-content/40 hover:text-base-content transition-colors">
          <X size={16} />
        </button>
      </div>

      {error && <p className="font-ui text-xs text-error">{error}</p>}

      {/* Start from a preset — fills every field below in one click */}
      {(lightPreset || darkPreset) && (
        <div className="flex flex-col gap-1.5">
          <label className="font-ui text-xs uppercase tracking-widest text-base-content/50">Start From</label>
          <div className="flex gap-2">
            {lightPreset && (
              <button
                type="button"
                onClick={() => applyPreset(lightPreset, 'light')}
                className="px-4 py-2 border-2 border-base-300 hover:border-primary font-ui text-xs uppercase tracking-widest transition-colors"
              >
                Light Theme
              </button>
            )}
            {darkPreset && (
              <button
                type="button"
                onClick={() => applyPreset(darkPreset, 'dark')}
                className="px-4 py-2 border-2 border-base-300 hover:border-primary font-ui text-xs uppercase tracking-widest transition-colors"
              >
                Dark Theme
              </button>
            )}
          </div>
          <p className="font-reading text-xs text-base-content/40 italic">
            Fills in every color below as a starting point — change any of them afterward.
          </p>
        </div>
      )}

      {/* Basic info */}
      <div className="grid grid-cols-2 gap-4">
        {!isEdit && (
          <div className="flex flex-col gap-1">
            <label className="font-ui text-xs uppercase tracking-widest text-base-content/50">ID *</label>
            <input required value={form.id} onChange={(e) => setForm((f) => ({ ...f, id: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
              placeholder="my-theme"
              className="border-2 border-base-300 focus:border-primary bg-base-100 px-3 py-2 font-mono text-sm outline-none" />
          </div>
        )}
        <div className="flex flex-col gap-1">
          <label className="font-ui text-xs uppercase tracking-widest text-base-content/50">Name *</label>
          <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="border-2 border-base-300 focus:border-primary bg-base-100 px-3 py-2 font-ui text-sm outline-none" />
        </div>
        <div className="flex flex-col gap-1 col-span-2">
          <label className="font-ui text-xs uppercase tracking-widest text-base-content/50">Description</label>
          <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="border-2 border-base-300 focus:border-primary bg-base-100 px-3 py-2 font-ui text-sm outline-none" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-ui text-xs uppercase tracking-widest text-base-content/50">Color Scheme</label>
          <div className="flex gap-0">
            {['light', 'dark', 'system'].map((s) => (
              <button key={s} type="button" onClick={() => setForm((f) => ({ ...f, colorScheme: s }))}
                className={`px-4 py-2 font-ui text-xs uppercase tracking-widest border-r border-base-300 last:border-r-0 transition-colors ${
                  form.colorScheme === s ? 'bg-secondary text-secondary-content' : 'bg-base-200 text-base-content/60 hover:bg-base-300'
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Color tokens */}
      {form.colorScheme !== 'system' && (
        <>
          <div className="flex flex-col gap-6">
            <h3 className="font-display text-lg tracking-wide border-b border-base-300 pb-1">UI Colors</h3>
            {TOKEN_GROUPS.map((group) => (
              <div key={group.title} className="flex flex-col gap-3">
                <h4 className="font-ui text-xs uppercase tracking-widest text-base-content/50">{group.title}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {group.tokens.map((t) => (
                    <ColorInput
                      key={t.key}
                      token={t.key}
                      label={t.label}
                      hint={t.hint}
                      value={form.colors[t.key] ?? ''}
                      onChange={(v) => setColor(t.key, v)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="font-display text-lg tracking-wide border-b border-base-300 pb-1 mb-1">Post Type Colors</h3>
            <p className="font-reading text-xs text-base-content/40 italic mb-3">
              The accent color shown next to each kind of post in the feed.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {POST_COLOR_FIELDS.map(({ key, label }) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="font-ui text-xs text-base-content/80">{label}</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="color"
                      value={swatchValue(form.postColors[key] ?? '#888888')}
                      onChange={(e) => setPostColor(key, e.target.value)}
                      className="w-9 h-9 shrink-0 border border-base-300 p-0 cursor-pointer bg-transparent"
                    />
                    <input
                      value={form.postColors[key] ?? ''}
                      onChange={(e) => setPostColor(key, e.target.value)}
                      className="flex-1 min-w-0 border border-base-300 focus:border-primary bg-base-100 px-2 py-1.5 font-mono text-[11px] outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={saving}
          className="px-5 py-2 bg-primary text-primary-content font-ui text-xs uppercase tracking-widest disabled:opacity-50">
          {saving ? 'Saving…' : (isEdit ? 'Save Changes' : 'Create Theme')}
        </button>
        <button type="button" onClick={onCancel}
          className="px-5 py-2 border border-base-300 font-ui text-xs uppercase tracking-widest hover:bg-base-200 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminThemesPage() {
  const client = useClient()
  const dispatch = useDispatch()
  const [themes, setThemes] = useState([])
  const [defaultId, setDefaultId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [denied, setDenied] = useState(false)
  const [editing, setEditing] = useState(null)   // null | 'new' | theme object
  const [pending, setPending] = useState(null)

  const load = useCallback(async () => {
    if (!client) return
    setLoading(true)
    try {
      const res = await client.themes.list()
      setThemes(res?.themes ?? [])
      setDefaultId(res?.defaultThemeId ?? null)
    } catch (err) {
      if (err?.status === 403 || err?.statusCode === 403) setDenied(true)
    } finally {
      setLoading(false)
    }
  }, [client])

  useEffect(() => { load() }, [load])

  const handleSetDefault = async (id) => {
    setPending(id)
    try {
      await client.themes.setDefault(id)
      setDefaultId(id)
      dispatch(fetchThemesAsync()) // refresh global theme list
    } catch {}
    setPending(null)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this theme?')) return
    setPending(id)
    try {
      await client.themes.delete(id)
      setThemes((prev) => prev.filter((t) => t.id !== id))
    } catch {}
    setPending(null)
  }

  const handleSave = async (form) => {
    if (editing === 'new') {
      const res = await client.themes.create(form)
      setThemes((prev) => [...prev, res.theme])
    } else {
      const res = await client.themes.update(editing.id, form)
      setThemes((prev) => prev.map((t) => t.id === editing.id ? res.theme : t))
    }
    setEditing(null)
    dispatch(fetchThemesAsync())
  }

  if (denied) return (
    <div className="py-16 text-center"><p className="font-display text-3xl tracking-wide">Access Denied</p></div>
  )

  const SCHEME_BADGE = {
    light: 'bg-warning/15 text-warning',
    dark: 'bg-info/15 text-info',
    system: 'bg-base-300 text-base-content/60',
  }

  // Built-in Light/Dark themes — used to prefill "New Theme" and power the
  // "Start From" preset buttons in the form.
  const presets = {
    light: themes.find((t) => t.id === 'kowloon-light'),
    dark: themes.find((t) => t.id === 'kowloon-dark'),
  }

  return (
    <div>
      <div className="flex items-baseline justify-between border-b-2 border-base-300 pb-4 mb-6">
        <h1 className="font-display text-5xl tracking-wide">Themes</h1>
        <button
          onClick={() => setEditing('new')}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-content font-ui text-xs uppercase tracking-widest disabled:opacity-50"
        >
          <Plus size={13} /> New Theme
        </button>
      </div>

      {editing && (
        <ThemeForm
          initial={editing === 'new' ? null : editing}
          presets={presets}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}

      {loading ? <Spinner centered /> : (
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-base-300">
              {['Preview', 'Name', 'Scheme', 'Status', ''].map((h) => (
                <th key={h} className="font-ui text-xs uppercase tracking-widest text-base-content/50 text-left pb-2 pr-4 last:pr-0">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {themes.map((theme) => (
              <tr key={theme.id} className="border-b border-base-300 hover:bg-base-200">
                <td className="py-3 pr-4">
                  <ThemeSwatches theme={theme} />
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-ui text-sm font-medium">{theme.name}</span>
                    {theme.isBuiltIn && (
                      <span className="font-ui text-[10px] uppercase tracking-widest px-1.5 py-0.5 bg-base-300 text-base-content/50">Built-in</span>
                    )}
                  </div>
                  <span className="font-mono text-xs text-base-content/40">{theme.id}</span>
                  {theme.description && (
                    <p className="font-ui text-xs text-base-content/50 mt-0.5 line-clamp-1">{theme.description}</p>
                  )}
                </td>
                <td className="py-3 pr-4">
                  <span className={`font-ui text-xs uppercase tracking-widest px-2 py-0.5 ${SCHEME_BADGE[theme.colorScheme] ?? ''}`}>
                    {theme.colorScheme}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  {defaultId === theme.id ? (
                    <span className="flex items-center gap-1 font-ui text-xs uppercase tracking-widest text-primary">
                      <Star size={11} className="fill-current" /> Default
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetDefault(theme.id)}
                      disabled={pending === theme.id}
                      className="font-ui text-xs uppercase tracking-widest text-base-content/40 hover:text-primary transition-colors disabled:opacity-30 flex items-center gap-1"
                    >
                      <Star size={11} /> Set Default
                    </button>
                  )}
                </td>
                <td className="py-3 text-right whitespace-nowrap">
                  {!theme.isBuiltIn && (
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => setEditing(theme)}
                        disabled={pending === theme.id}
                        className="p-1 text-base-content/40 hover:text-base-content transition-colors disabled:opacity-30"
                        title="Edit"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(theme.id)}
                        disabled={pending === theme.id}
                        className="p-1 text-base-content/40 hover:text-error transition-colors disabled:opacity-30"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {themes.length === 0 && (
              <tr><td colSpan={5} className="py-8 text-center font-ui text-xs uppercase tracking-widest text-base-content/40">No themes found</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}
