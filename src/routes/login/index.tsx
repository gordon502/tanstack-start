import { createFileRoute, redirect } from '@tanstack/react-router'
import { getAuthenticatedUser } from '@/modules/auth/api/get-auth-user'
import { sanitizeAuthRedirect } from '@/modules/auth/utils/redirect'

interface LoginSearch {
  redirect?: string
}

export const Route = createFileRoute('/login/')({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  beforeLoad: async ({ search }) => {
    const user = await getAuthenticatedUser()

    if (user) {
      throw redirect({ to: sanitizeAuthRedirect(search.redirect) })
    }
  },
})
