// ExternalRedirect — catch-all route for pics.<domain>. Reused main-site
// components (Header, PostMeta, PostToolbar's More menu, etc.) generate
// react-router <Link>s to paths that only exist on the main site (/circles,
// /users/:id, /notifications, /posts/:id/edit, ...). Rather than special-case
// every one, any path the pics router doesn't itself own bounces to the same
// path on the main domain.

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ExternalRedirect() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    const mainDomain = window.location.hostname.replace(/^pics\./, '')
    // Preserve the port — production always runs on the default 443/80 (Caddy
    // terminates TLS there), so this is normally a no-op, but a non-standard
    // local-dev port (e.g. pics.localhost:5799) needs it or the redirect
    // silently drops onto the default port and connection-refuses.
    const port = window.location.port ? `:${window.location.port}` : ''
    const target = `${window.location.protocol}//${mainDomain}${port}${pathname}${search}`
    window.location.replace(target)
  }, [pathname, search])

  return null
}
