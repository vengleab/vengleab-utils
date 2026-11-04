import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { getToolPath } from './subdomains'

export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    rewrite: {
      input: ({ url }) => {
        const path = getToolPath(url.hostname)
        if (path && url.pathname === '/') url.pathname = path
        return url
      },
      output: ({ url }) => {
        const path = getToolPath(url.hostname)
        if (path && url.pathname === path) url.pathname = '/'
        return url
      },
    },
  })
}

declare module '@tanstack/react-router' {
  interface Register { router: ReturnType<typeof getRouter> }
}
