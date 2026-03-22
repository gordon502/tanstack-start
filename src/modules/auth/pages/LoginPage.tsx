import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Zap } from 'lucide-react'
import { Button } from '@/common/components/ui/button'
import { Input } from '@/common/components/ui/input'
import { Label } from '@/common/components/ui/label'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    navigate({ to: '/' })
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
                htmlFor="username"
                className="text-xs font-medium tracking-wider text-muted-foreground uppercase"
              >
                Username
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter username"
                className="h-11"
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
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              className="h-11 w-full bg-accent text-sm font-semibold text-accent-foreground hover:bg-accent/90"
            >
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
