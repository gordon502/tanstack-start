import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import RoutePending from '@/common/components/RoutePending'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,

    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    defaultPendingComponent: RoutePending,
    defaultPendingMs: 0,
    defaultPendingMinMs: 0,
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
