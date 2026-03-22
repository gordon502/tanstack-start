import { LoaderCircle } from 'lucide-react'

export default function RoutePending() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-8">
      <LoaderCircle className="h-8 w-8 animate-spin text-accent" />
      <p className="text-sm text-muted-foreground">Loading data...</p>
    </div>
  )
}
