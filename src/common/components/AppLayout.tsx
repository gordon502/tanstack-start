import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useNavigate, useRouter } from '@tanstack/react-router'
import { FileText, LogOut, Settings, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/common/utils/cn'
import { signOutUser } from '@/modules/auth/logic/auth-client'

const navItems = [
  { to: '/', label: 'Report Generator', icon: FileText },
  { to: '/ai-instructions', label: 'AI Instructions', icon: Settings },
] as const

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleLogout = async () => {
    if (isSigningOut) {
      return
    }

    setIsSigningOut(true)

    try {
      await signOutUser()
      await router.invalidate()
      await navigate({ to: '/login', replace: true })
    } catch {
      toast.error('Unable to sign out. Please try again.')
      setIsSigningOut(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="flex w-64 flex-shrink-0 flex-col bg-sidebar text-sidebar-foreground">
        <div className="border-sidebar-border border-b px-6 py-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <Zap className="h-4 w-4 text-accent-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight text-sidebar-foreground">
              YY<span className="text-accent">Wireless</span>
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={item.to === '/' ? { exact: true } : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all duration-150',
                'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground',
              )}
              activeProps={{
                className:
                  'bg-accent text-accent-foreground shadow-sm hover:bg-accent',
              }}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-sidebar-border border-t px-3 py-4">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isSigningOut}
            className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm text-sidebar-foreground transition-all duration-150 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <LogOut className="h-4 w-4" />
            {isSigningOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-background">{children}</main>
    </div>
  )
}
