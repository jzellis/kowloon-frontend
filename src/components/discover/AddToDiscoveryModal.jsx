// AddToDiscoveryModal — admin-only "Add to Discovery" flow, shared across
// Post/Circle/Group. Section is resolved automatically from the item's type
// (DiscoverySections are locked one-per-contentType, so there's no picker to
// show — see DISCOVERY_CONTENT_TYPE_BY_REF_TYPE). Preview is a lightweight,
// honest summary of the item, not a literal DiscoveryCard render — the raw
// Post/Circle/Group shapes used elsewhere in the app don't line up field-for-
// field with the resolved card shape /discovery itself produces.

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useClient } from '../../hooks/useClient'
import { DISCOVERY_CONTENT_TYPE_BY_REF_TYPE } from '@kowloon/client/admin'
import Modal from '../ui/Modal'
import Spinner from '../ui/Spinner'
import sizedUrl from '../../lib/sizedUrl'
import { toast } from '../../app/toast'

const NOTE_MAX = 500

function previewOf(item, refType) {
  if (refType === 'Post') {
    return {
      image: item?.featuredImage || item?.image || null,
      title: item?.title || item?.name || null,
      blurb: item?.summary || item?.textPreview || null,
    }
  }
  // Circle / Group
  return {
    image: item?.icon || item?.image || null,
    title: item?.name || null,
    blurb: item?.summary || item?.description || null,
  }
}

export default function AddToDiscoveryModal({ item, refType, open, onClose, onAdded }) {
  const { t } = useTranslation()
  const client = useClient()
  const [loadingSection, setLoadingSection] = useState(true)
  const [sectionId, setSectionId] = useState(null)
  const [sectionError, setSectionError] = useState(null)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setNote('')
    setSectionId(null)
    setSectionError(null)
    setLoadingSection(true)
    const contentType = DISCOVERY_CONTENT_TYPE_BY_REF_TYPE[refType]
    client.admin.getSections()
      .then((res) => {
        const match = (res?.sections ?? []).find(
          (s) => s.contentType === contentType && !s.deletedAt
        )
        if (!match) {
          setSectionError(
            t('discovery.noSection', {
              defaultValue: 'No Discover section is set up for this content type yet.',
            })
          )
        } else {
          setSectionId(match.id)
        }
      })
      .catch((err) => setSectionError(err?.message || 'Failed to load Discover sections'))
      .finally(() => setLoadingSection(false))
  }, [open, refType, client, t])

  if (!open) return null

  const preview = previewOf(item, refType)

  const handleAdd = async () => {
    if (!sectionId || submitting) return
    setSubmitting(true)
    try {
      await client.admin.addDiscoveryItem({
        ref: item.id,
        section: sectionId,
        note: note.trim() || undefined,
      })
      toast.success(t('discovery.added', { defaultValue: 'Added to Discovery' }))
      onAdded?.()
      onClose()
    } catch (err) {
      toast.error(t('discovery.addFailed', { defaultValue: "Couldn't add to Discovery" }), {
        detail: err?.message,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('discovery.addTitle', { defaultValue: 'Add to Discovery' })}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 p-3 bg-base-200">
          {preview.image ? (
            <img
              src={sizedUrl(preview.image, 200)}
              alt=""
              className="w-14 h-14 object-cover shrink-0 bg-base-300"
            />
          ) : (
            <div className="w-14 h-14 bg-base-300 shrink-0" />
          )}
          <div className="min-w-0 flex flex-col">
            <span className="font-ui text-[10px] uppercase tracking-widest text-base-content/50">
              {refType}
            </span>
            <span className="font-ui text-sm font-bold truncate">
              {preview.title || t('discovery.untitled', { defaultValue: 'Untitled' })}
            </span>
            {preview.blurb && (
              <span className="font-ui text-xs text-base-content/60 truncate">{preview.blurb}</span>
            )}
          </div>
        </div>

        {loadingSection ? (
          <Spinner centered />
        ) : sectionError ? (
          <p className="font-ui text-sm text-error">{sectionError}</p>
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="font-ui text-xs uppercase tracking-widest text-base-content/60">
                {t('discovery.commentary', { defaultValue: 'Commentary (optional)' })}
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, NOTE_MAX))}
                maxLength={NOTE_MAX}
                rows={3}
                placeholder={t('discovery.commentaryPlaceholder', {
                  defaultValue: 'Why this is worth featuring…',
                })}
                className="bg-transparent font-ui text-sm border-2 border-base-300 p-2.5 outline-none focus:border-primary resize-none"
              />
              <span className="font-ui text-[10px] text-base-content/40 self-end">
                {note.length}/{NOTE_MAX}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-ui text-xs uppercase tracking-widest text-base-content/60 hover:text-base-content"
              >
                {t('common.cancel', { defaultValue: 'Cancel' })}
              </button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={submitting || !sectionId}
                className="px-4 py-2 bg-primary text-primary-content font-ui text-xs uppercase tracking-widest hover:bg-primary/85 disabled:opacity-40 transition-colors"
              >
                {submitting
                  ? t('common.adding', { defaultValue: 'Adding…' })
                  : t('common.add', { defaultValue: 'Add' })}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
