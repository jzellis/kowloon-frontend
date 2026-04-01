// CirclesPage — Browse public/server-visible circles, sortable by date or reacts.

import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Copy } from 'lucide-react'
import { useClient } from '../hooks/useClient'
import CircleIcon from '../components/ui/CircleIcon'
import Spinner from '../components/ui/Spinner'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/ui/EmptyState'
import NewCircleModal from '../components/circles/NewCircleModal'

const hexMask = {
  WebkitMaskImage: 'url(/hex-mask.svg)',
  maskImage: 'url(/hex-mask.svg)',
  maskSize: 'contain',
  maskRepeat: 'no-repeat',
  maskPosition: 'center',
}

function CircleAvatar({ circle }) {
  if (circle.icon) {
    return (
      <img
        src={circle.icon}
        alt={circle.name}
        className="w-14 h-14 object-cover shrink-0"
        style={hexMask}
      />
    )
  }
  return (
    <div className="w-14 h-14 bg-secondary flex items-center justify-center shrink-0" style={hexMask}>
      <CircleIcon type="circle" size="lg" className="opacity-70 text-secondary-content" />
    </div>
  )
}

function CircleBrowseCard({ circle, onCopy, isLoggedIn }) {
  const { t } = useTranslation()

  return (
    <div className="flex items-start gap-4 py-5 border-b border-base-300 group">
      <Link to={`/circles/${encodeURIComponent(circle.id)}`} className="shrink-0 mt-1">
        <CircleAvatar circle={circle} />
      </Link>

      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1 min-w-0">
            <Link
              to={`/circles/${encodeURIComponent(circle.id)}`}
              className="font-display text-2xl tracking-wide leading-none hover:text-primary transition-colors"
            >
              {circle.name}
            </Link>
            <div className="flex items-center gap-2 font-ui text-xs uppercase tracking-widest text-base-content/60">
              {circle.actor?.displayName && (
                <>
                  <Link
                    to={`/users/${encodeURIComponent(circle.actorId)}`}
                    className="font-bold hover:text-primary transition-colors"
                  >
                    {circle.actor.displayName}
                  </Link>
                  <span>·</span>
                </>
              )}
              <span>{circle.memberCount ?? 0} {t('circle.members', { defaultValue: 'members' })}</span>
              {circle.reactCount > 0 && (
                <>
                  <span>·</span>
                  <span>{circle.reactCount} {t('circle.reacts', { defaultValue: 'reacts' })}</span>
                </>
              )}
            </div>
          </div>

          {isLoggedIn && (
            <button
              onClick={() => onCopy(circle)}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 border border-base-300 font-ui text-xs uppercase tracking-widest text-base-content/60 hover:border-primary hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
              title={t('circle.copy', { defaultValue: 'Copy' })}
            >
              <Copy size={12} /> {t('circle.copy', { defaultValue: 'Copy' })}
            </button>
          )}
        </div>

        {circle.summary && (
          <p className="font-reading text-base text-base-content/75 leading-relaxed line-clamp-2">
            {circle.summary}
          </p>
        )}
      </div>
    </div>
  )
}

export default function CirclesPage() {
  const { t } = useTranslation()
  const client = useClient()
  const user = useSelector((state) => state.auth.user)

  const [sort, setSort] = useState('date')
  const [circles, setCircles] = useState([])
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copySource, setCopySource] = useState(null)

  const load = useCallback(async (sortOrder, pageNum) => {
    setLoading(true)
    setError(null)
    try {
      const res = await client.feeds.browseCircles({ sort: sortOrder, page: pageNum })
      setCircles(res.orderedItems ?? [])
      setTotalItems(res.totalItems ?? 0)
      setItemsPerPage(res.itemsPerPage ?? 20)
    } catch (err) {
      setError(err.message || 'Failed to load circles.')
    } finally {
      setLoading(false)
    }
  }, [client])

  useEffect(() => {
    load(sort, page)
  }, [sort, page, load])

  const handleSort = (newSort) => {
    if (newSort === sort) return
    setSort(newSort)
    setPage(1)
  }

  const handleCopy = (circle) => {
    setCopySource(circle)
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <>
    <div className="flex flex-col gap-6">

      {/* Page header + sort controls */}
      <div className="flex items-end justify-between border-b-2 border-base-300 pb-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-5xl tracking-wide leading-none">
            {t('circles.browse', { defaultValue: 'Circles' })}
          </h1>
          {totalItems > 0 && !loading && (
            <p className="font-ui text-sm uppercase tracking-widest text-base-content/50">
              {totalItems} {t('circles.total', { defaultValue: 'circles' })}
            </p>
          )}
        </div>

        <div className="flex items-center gap-0 border border-base-300">
          <button
            onClick={() => handleSort('date')}
            className={`px-4 py-2 font-ui text-xs uppercase tracking-widest transition-colors ${
              sort === 'date'
                ? 'bg-secondary text-secondary-content'
                : 'text-base-content/60 hover:text-base-content hover:bg-base-200'
            }`}
          >
            {t('sort.newest', { defaultValue: 'Newest' })}
          </button>
          <button
            onClick={() => handleSort('reacts')}
            className={`px-4 py-2 font-ui text-xs uppercase tracking-widest transition-colors border-l border-base-300 ${
              sort === 'reacts'
                ? 'bg-secondary text-secondary-content'
                : 'text-base-content/60 hover:text-base-content hover:bg-base-200'
            }`}
          >
            {t('sort.popular', { defaultValue: 'Popular' })}
          </button>
        </div>
      </div>

      {/* Content */}
      {loading && <Spinner centered />}
      {!loading && error && <ErrorState message={error} onRetry={() => load(sort, page)} />}
      {!loading && !error && circles.length === 0 && (
        <EmptyState message={t('circles.empty', { defaultValue: 'No circles found.' })} />
      )}
      {!loading && !error && circles.length > 0 && (
        <div className="flex flex-col">
          {circles.map((circle) => (
            <CircleBrowseCard
              key={circle.id}
              circle={circle}
              isLoggedIn={!!user}
              onCopy={handleCopy}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-base-300">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-4 py-2 font-ui text-xs uppercase tracking-widest border border-base-300 text-base-content/60 hover:text-base-content hover:border-base-content transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {t('pagination.prev', { defaultValue: 'Previous' })}
          </button>
          <span className="font-ui text-xs uppercase tracking-widest text-base-content/50">
            {t('pagination.pageOf', { page, total: totalPages, defaultValue: `Page ${page} of ${totalPages}` })}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 font-ui text-xs uppercase tracking-widest border border-base-300 text-base-content/60 hover:text-base-content hover:border-base-content transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {t('pagination.next', { defaultValue: 'Next' })}
          </button>
        </div>
      )}

    </div>

    {copySource && (
      <NewCircleModal
        title={t('circle.copyTitle', { defaultValue: 'Copy Circle' })}
        initialData={{
          name: copySource.name,
          summary: copySource.summary,
          icon: copySource.icon,
          members: copySource.members ?? [],
        }}
        onClose={() => setCopySource(null)}
        onCreated={() => setCopySource(null)}
      />
    )}
    </>
  )
}
