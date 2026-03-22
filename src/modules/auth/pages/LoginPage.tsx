import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useRouter, useSearch } from '@tanstack/react-router'
import { Zap } from 'lucide-react'
import { Button } from '@/common/components/ui/button'
import { Input } from '@/common/components/ui/input'
import { Label } from '@/common/components/ui/label'
import { signInWithEmailPassword } from '@/modules/auth/logic/auth-client'
import { sanitizeAuthRedirect } from '@/modules/auth/utils/redirect'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const router = useRouter()
  const search = useSearch({ from: '/login/' })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      const result = await signInWithEmailPassword({
        email,
        password,
      })

      if (!result.ok) {
        setErrorMessage(result.message)
        setIsSubmitting(false)
        return
      }

      await router.invalidate()
      await navigate({
        to: sanitizeAuthRedirect(search.redirect),
        replace: true,
      })
    } catch {
      setErrorMessage('Unable to sign in right now. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div
            className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary"
            style={{ boxShadow: 'var(--shadow-lg)' }}
          >
            <Zap className="h-7 w-7 text-accent" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            YY<span className="text-accent">Wireless</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to your account
          </p>
        </div>

        <div
          className="rounded-xl border bg-card p-6"
          style={{ boxShadow: 'var(--shadow-lg)' }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-xs font-medium tracking-wider text-muted-foreground uppercase"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@company.com"
                className="h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-xs font-medium tracking-wider text-muted-foreground uppercase"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                className="h-11"
                required
              />
            </div>

            {errorMessage ? (
              <p className="text-sm text-destructive" role="alert">
                {errorMessage}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full bg-accent text-sm font-semibold text-accent-foreground hover:bg-accent/90"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
