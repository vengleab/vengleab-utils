import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import CommandPalette from '../../components/CommandPalette'
import stylesheet from '../../styles/index.css?url'

export const Route = createRootRoute({
  head: () => ({
    links: [
      { rel: 'stylesheet', href: stylesheet },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap' },
    ],
  }),
  component: RootDocument,
})

function RootDocument() {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        <Outlet />
        <CommandPalette />
        <Scripts />
      </body>
    </html>
  )
}
