// PicsGridPage — pics.<domain>'s home. Instagram-style grid of Media-post
// photos. Logged-in viewers get the same feed-source selector as the main
// site (Community Posts / My Posts / a Circle / a Group), just with no
// post-type filter — pics is always Media/photo, so that axis doesn't apply.
// Anonymous viewers see public photos only, no selector, mirroring the main
// site's own anonymous home feed.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useClient } from '../hooks/useClient'
import { useFeed } from '../hooks/useFeed'
import { useJoinedGroups } from '../hooks/useJoinedGroups'
import { setView } from '../app/feedSlice'
import FeedViewSelector from '../components/posts/FeedViewSelector'
import LoadMoreButton from '../components/ui/LoadMoreButton'
import Spinner from '../components/ui/Spinner'
import ErrorState from '../components/ui/ErrorState'
import PhotoCard from './PhotoCard'
import PicsLightbox from './PicsLightbox'
import PicsComposeFab from './PicsComposeFab'

// Normalize a page-based feed response into { items, nextCursor, hasMore }.
// Same shape useFeed expects everywhere else in the app (HomePage.jsx).
function pageResult(res, page, { mapPublished = false } = {}) {
  let items = res?.orderedItems ?? []
  if (mapPublished) items = items.map((p) => ({ ...p, published: p.published ?? p.createdAt }))
  const { totalItems = 0, itemsPerPage = 20 } = res ?? {}
  const fetchedPage = res?.page ?? page
  const hasMore = fetchedPage * itemsPerPage < totalItems
  return { items, nextCursor: hasMore ? fetchedPage + 1 : null, hasMore }
}

export default function PicsGridPage() {
  const dispatch = useDispatch()
  const client = useClient()
  const { user, sessionChecked } = useSelector((state) => state.auth)
  const { view } = useSelector((state) => state.feed)
  const { items: myCircles } = useSelector((state) => state.myCircles)
  const joinedGroups = useJoinedGroups()

  const [refreshKey, setRefreshKey] = useState(0)
  // { postIndex, photoIndex } into `items` below, or null when the lightbox is closed.
  const [active, setActive] = useState(null)

  const isCircleView = typeof view === 'string' && view.startsWith('circle:')
  const isGroupView = typeof view === 'string' && view.startsWith('group:')
  const ownedCircle = myCircles.find((c) => c.id === view)
  const joinedGroup = joinedGroups.find((g) => g.id === view)
  // Viewing a circle/group you're no longer a member of (stale local state) —
  // fall back to Community Posts rather than reproducing HomePage's full
  // subject-resolution fetch for this pass (noted simplification in the plan).
  const recognizedCircleView = isCircleView && !!ownedCircle
  const recognizedGroupView = isGroupView && !!joinedGroup

  const fetchAuthed = useCallback(async (cursor) => {
    if (view === 'mine') {
      const page = cursor ?? 1
      const res = await client.feeds.getUserPosts({ userId: user.id, type: 'Media', kind: 'photo', page })
      return pageResult(res, page)
    }
    if (recognizedGroupView) {
      const page = cursor ?? 1
      const res = await client.feeds.getGroupPosts({ groupId: view, type: 'Media', kind: 'photo', page })
      return pageResult(res, page)
    }
    if (recognizedCircleView) {
      const res = await client.feeds.getCirclePosts({ circleId: view, types: ['Media'], kind: 'photo', before: cursor ?? undefined })
      const items = res?.orderedItems ?? []
      const nc = res?.nextCursor ?? null
      return { items, nextCursor: nc, hasMore: nc !== null }
    }
    // 'all' (Community Posts) or an unrecognized view — falls back here.
    const page = cursor ?? 1
    const res = await client.feeds.getServerPosts({ type: 'Media', kind: 'photo', page })
    return pageResult(res, page, { mapPublished: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, view, recognizedGroupView, recognizedCircleView, user?.id, refreshKey])

  const fetchPublic = useCallback(async (cursor) => {
    const page = cursor ?? 1
    const res = await client.feeds.getServerPosts({ type: 'Media', kind: 'photo', page })
    return pageResult(res, page, { mapPublished: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, refreshKey])

  const fetchFn = !sessionChecked ? null : user ? fetchAuthed : fetchPublic

  const { items, hasMore, loading, loadingMore, error, loadMore } = useFeed(fetchFn)

  // Flatten posts -> one grid tile per photo, keeping post-grouping (postIndex)
  // for the lightbox's up/down (next/previous post) navigation.
  const tiles = useMemo(() => {
    const out = []
    items.forEach((post, postIndex) => {
      (post.attachments ?? []).forEach((attachment, photoIndex) => {
        out.push({ post, postIndex, photoIndex, attachment, key: `${post.id}:${photoIndex}` })
      })
    })
    return out
  }, [items])

  // Proactively load more once the lightbox is browsing near the end of the
  // currently-loaded posts, so up/down nav doesn't dead-end mid-browse.
  useEffect(() => {
    if (!active || !hasMore || loadingMore) return
    if (active.postIndex >= items.length - 3) loadMore()
  }, [active, hasMore, loadingMore, items.length, loadMore])

  if (!sessionChecked) return <Spinner centered />

  return (
    <div className="flex flex-col">
      {user && (
        <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-2">
          <FeedViewSelector
            value={view}
            onChange={(v) => { dispatch(setView(v)); setRefreshKey((k) => k + 1) }}
            circles={myCircles}
            groups={joinedGroups}
            account={user}
            allowCreate={false}
          />
        </div>
      )}

      {loading ? (
        <Spinner centered />
      ) : error ? (
        <ErrorState message={error} />
      ) : tiles.length === 0 ? (
        <p className="font-ui text-sm text-base-content/40 text-center py-16">No photos yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1 px-1">
          {tiles.map((tile) => (
            <PhotoCard
              key={tile.key}
              post={tile.post}
              attachment={tile.attachment}
              onOpen={() => setActive({ postIndex: tile.postIndex, photoIndex: tile.photoIndex })}
            />
          ))}
        </div>
      )}

      <LoadMoreButton hasMore={hasMore} loading={loadingMore} onClick={loadMore} />

      {user && <PicsComposeFab onPostCreated={() => setRefreshKey((k) => k + 1)} />}

      {active && (
        <PicsLightbox
          posts={items}
          activePostIndex={active.postIndex}
          activePhotoIndex={active.photoIndex}
          // MediaLightbox's onNavigate passes a DELTA (-1/+1), not an absolute
          // index — wrap within the current post's own attachment count,
          // mirroring MediaLightbox's own internal prev/next indexing.
          onNavigatePhoto={(delta) => setActive((prev) => {
            const post = items[prev.postIndex]
            const len = post?.attachments?.length ?? 1
            const nextPhotoIndex = ((prev.photoIndex + delta) % len + len) % len
            return { ...prev, photoIndex: nextPhotoIndex }
          })}
          onNavigatePost={(postIndex) => setActive({ postIndex, photoIndex: 0 })}
          onClose={() => setActive(null)}
        />
      )}
    </div>
  )
}
