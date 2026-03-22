import { createLazyFileRoute } from '@tanstack/react-router'
import LoginPage from '@/modules/auth/pages/LoginPage'

export const Route = createLazyFileRoute('/login/')({
  component: LoginPage,
})
