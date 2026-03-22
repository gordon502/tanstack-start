import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowUpDown, Download, FileText, Trash2, Upload } from 'lucide-react'
import { Button } from '@/common/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/common/components/ui/dialog'
import { Input } from '@/common/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/common/components/ui/table'
import { toast } from '@/common/components/ui/sonner'
import ReportStatusBadge from '@/modules/reports/components/ReportStatusBadge'
import { createReport } from '@/modules/reports/api/create-report'
import { deleteReport } from '@/modules/reports/api/delete-report'
import { getReports } from '@/modules/reports/api/get-reports'
import type { Report } from '@/modules/reports/logic/report-schema'
import { REPORTS_STORAGE_BUCKET } from '@/modules/reports/logic/report-schema'
import { getSupabaseBrowserClient } from '@/modules/auth/utils/supabase-browser'

type SortKey = 'fileName' | 'status' | 'createdAt'

interface ReportGeneratorPageProps {
  initialData: Report[]
}

function buildStoragePath(userId: string, fileName: string) {
  const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
  return `${userId}/${crypto.randomUUID()}-${safeFileName}`
}

export default function ReportGeneratorPage({
  initialData,
}: ReportGeneratorPageProps) {
  const [reports, setReports] = useState<Report[]>(initialData)
  const [importOpen, setImportOpen] = useState(false)
  const [errorReport, setErrorReport] = useState<Report | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortAsc, setSortAsc] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [deletingReportId, setDeletingReportId] = useState<string | null>(null)
  const [downloadingReportId, setDownloadingReportId] = useState<string | null>(
    null,
  )

  const refreshReports = useCallback(async () => {
    try {
      const latest = await getReports()
      setReports(latest)
    } catch {
      toast.error('Unable to refresh reports')
    }
  }, [])

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    const channel = supabase
      .channel('reports-status-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reports' },
        () => {
          void refreshReports()
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [refreshReports])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void refreshReports()
    }, 5000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [refreshReports])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc)
      return
    }

    setSortKey(key)
    setSortAsc(true)
  }

  const sortedReports = useMemo(() => {
    return [...reports].sort((left, right) => {
      const leftValue = left[sortKey]
      const rightValue = right[sortKey]
      const result =
        leftValue < rightValue ? -1 : leftValue > rightValue ? 1 : 0
      return sortAsc ? result : -result
    })
  }, [reports, sortKey, sortAsc])

  const handleImport = async () => {
    if (!selectedFile || isImporting) {
      return
    }

    setIsImporting(true)
    const supabase = getSupabaseBrowserClient()
    const storageBucket = REPORTS_STORAGE_BUCKET
    let storagePath: string | null = null
    let shouldCleanupUploadedFile = false

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        throw new Error('You must be logged in to upload reports.')
      }

      storagePath = buildStoragePath(user.id, selectedFile.name)

      const { error: uploadError } = await supabase.storage
        .from(storageBucket)
        .upload(storagePath, selectedFile, {
          contentType: selectedFile.type || undefined,
          upsert: false,
        })

      if (uploadError) {
        throw new Error('Unable to upload file.')
      }

      shouldCleanupUploadedFile = true

      const createdReport = await createReport({
        data: {
          fileName: selectedFile.name,
          storageBucket,
          storagePath,
          mimeType: selectedFile.type || null,
          fileSizeBytes: selectedFile.size,
        },
      })

      shouldCleanupUploadedFile = false

      setReports((currentReports) => [createdReport, ...currentReports])
      setSelectedFile(null)
      setImportOpen(false)
      toast.success('Report scheduled')
    } catch {
      if (shouldCleanupUploadedFile && storagePath) {
        const { error: cleanupError } = await supabase.storage
          .from(storageBucket)
          .remove([storagePath])

        if (cleanupError) {
          console.error('Unable to rollback uploaded report file', cleanupError)
        }
      }

      toast.error('Unable to schedule report')
    } finally {
      setIsImporting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (deletingReportId) {
      return
    }

    const previousReports = reports
    setDeletingReportId(id)
    setReports((currentReports) =>
      currentReports.filter((report) => report.id !== id),
    )

    try {
      await deleteReport({
        data: { id },
      })
      toast.success('Report deleted')
    } catch {
      setReports(previousReports)
      toast.error('Unable to delete report')
    } finally {
      setDeletingReportId(null)
    }
  }

  const handleDownload = async (report: Report) => {
    if (downloadingReportId) {
      return
    }

    setDownloadingReportId(report.id)
    const supabase = getSupabaseBrowserClient()

    try {
      const { data, error } = await supabase.storage
        .from(report.storageBucket)
        .createSignedUrl(report.storagePath, 60)

      if (error || !data.signedUrl) {
        throw new Error('Unable to create download URL.')
      }

      window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
    } catch {
      toast.error('Unable to download report')
    } finally {
      setDownloadingReportId(null)
    }
  }

  return (
    <div className="max-w-7xl space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Report Generator
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and schedule your report imports
          </p>
        </div>
        <Button
          onClick={() => setImportOpen(true)}
          disabled={isImporting}
          className="h-10 bg-accent px-5 font-semibold text-accent-foreground hover:bg-accent/90"
        >
          <Upload className="mr-2 h-4 w-4" />
          Schedule New Report
        </Button>
      </div>

      <div
        className="overflow-hidden rounded-xl border bg-card"
        style={{ boxShadow: 'var(--shadow-md)' }}
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              {(['fileName', 'status', 'createdAt'] as SortKey[]).map((key) => (
                <TableHead key={key}>
                  <button
                    type="button"
                    onClick={() => handleSort(key)}
                    className="flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase transition-colors hover:text-foreground"
                  >
                    {key === 'fileName'
                      ? 'File Name'
                      : key === 'status'
                        ? 'Status'
                        : 'Created At'}
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
              ))}
              <TableHead className="text-xs font-semibold tracking-wider uppercase">
                Download
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-wider uppercase">
                Delete
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedReports.map((report) => (
              <TableRow key={report.id} className="group">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    {report.fileName}
                  </div>
                </TableCell>
                <TableCell>
                  <ReportStatusBadge
                    status={report.status}
                    onFailedClick={
                      report.status === 'FAILED'
                        ? () => setErrorReport(report)
                        : undefined
                    }
                  />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {report.createdAt}
                </TableCell>
                <TableCell>
                  {report.status === 'Done' && (
                    <button
                      type="button"
                      onClick={() => void handleDownload(report)}
                      disabled={downloadingReportId === report.id}
                      className="text-muted-foreground transition-colors hover:text-accent"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                </TableCell>
                <TableCell>
                  <button
                    type="button"
                    onClick={() => void handleDelete(report.id)}
                    disabled={deletingReportId === report.id}
                    className="text-muted-foreground opacity-0 transition-all duration-150 group-hover:opacity-100 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
            {sortedReports.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-12 text-center text-muted-foreground"
                >
                  No reports found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              Schedule New Report
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <Input
              type="file"
              accept=".xlsx,.csv"
              disabled={isImporting}
              onChange={(event) =>
                setSelectedFile(event.target.files?.[0] ?? null)
              }
              className="h-11"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setImportOpen(false)}
                disabled={isImporting}
                className="h-10"
              >
                Cancel
              </Button>
              <Button
                onClick={() => void handleImport()}
                disabled={!selectedFile || isImporting}
                className="h-10 bg-accent font-semibold text-accent-foreground hover:bg-accent/90"
              >
                {isImporting ? 'Importing...' : 'Import'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(errorReport)}
        onOpenChange={() => setErrorReport(null)}
      >
        <DialogContent className="max-w-2xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {errorReport?.fileName} - Error Details
            </DialogTitle>
          </DialogHeader>
          <pre className="max-h-96 overflow-auto rounded-lg border bg-muted/50 p-5 font-mono text-xs">
            {JSON.stringify(errorReport?.errors, null, 2)}
          </pre>
        </DialogContent>
      </Dialog>
    </div>
  )
}
