import { Badge } from '@/common/components/ui/badge'

type ReportStatus = 'New' | 'Processing' | 'Done' | 'FAILED'

interface ReportStatusBadgeProps {
  status: ReportStatus
  onFailedClick?: () => void
}

export default function ReportStatusBadge({
  status,
  onFailedClick,
}: ReportStatusBadgeProps) {
  if (status === 'FAILED') {
    return (
      <button
        type="button"
        onClick={onFailedClick}
        className="inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/20"
      >
        FAILED
      </button>
    )
  }

  const variant =
    status === 'Done'
      ? 'default'
      : status === 'Processing'
        ? 'secondary'
        : 'outline'

  return <Badge variant={variant}>{status}</Badge>
}
