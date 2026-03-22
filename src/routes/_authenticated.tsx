import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import AppLayout from '@/common/components/AppLayout'
import { getAuthenticatedUser } from '@/modules/auth/api/get-auth-user'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const user = await getAuthenticatedUser()

    if (!user) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}
