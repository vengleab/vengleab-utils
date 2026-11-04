import handler, { createServerEntry } from '@tanstack/react-start/server-entry'
import { getSubdomain, getToolPath } from './subdomains'

export default createServerEntry({
  fetch(request, options) {
    const url = new URL(request.url)
    const host = request.headers.get('host') || url.hostname
    const subdomain = getSubdomain(host)
    // Mirror the old middleware matcher: leave assets and file paths untouched.
    if (subdomain && !url.pathname.includes('.')) {
      if (!getToolPath(host)) return new Response('Not Found', { status: 404 })
      if (url.pathname !== '/') {
        url.pathname = '/'
        return Response.redirect(url, 307)
      }
    }
    return handler.fetch(request, options)
  },
})
