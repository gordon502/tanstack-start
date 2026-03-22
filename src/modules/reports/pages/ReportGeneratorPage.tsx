import { useMemo, useState } from 'react'
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

interface ReportError {
  error_index: number
  error_description: string
  error: string
  request_id: string
}

interface Report {
  id: string
  fileName: string
  status: 'New' | 'Processing' | 'Done' | 'FAILED'
  createdAt: string
  errors?: ReportError[]
}

const initialReports: Report[] = [
  {
    id: '1',
    fileName: 'Q1_Sales_Report.xlsx',
    status: 'Done',
    createdAt: '2026-03-15 09:30:00',
  },
  {
    id: '2',
    fileName: 'Inventory_March.csv',
    status: 'Processing',
    createdAt: '2026-03-16 14:20:00',
  },
  {
    id: '3',
    fileName: 'Customer_Data.xlsx',
    status: 'FAILED',
    createdAt: '2026-03-16 16:45:00',
    errors: [
      {
        error_index: 1,
        error_description: "Invalid column mapping for 'phone_number'",
        error: 'COLUMN_MAPPING_ERROR',
        request_id: 'req_abc123def456',
      },
      {
        error_index: 2,
        error_description: "Row 245: Missing required field 'carrier'",
        error: 'VALIDATION_ERROR',
        request_id: 'req_abc123def457',
      },
      {
        error_index: 3,
        error_description: 'API rate limit exceeded during processing',
        error: 'RATE_LIMIT_ERROR',
        request_id: 'req_abc123def458',
      },
    ],
  },
  {
    id: '4',
    fileName: 'Weekly_Summary.csv',
    status: 'New',
    createdAt: '2026-03-17 08:00:00',
  },
]

type SortKey = 'fileName' | 'status' | 'createdAt'

export default function ReportGeneratorPage() {
  const [reports, setReports] = useState<Report[]>(initialReports)
  const [importOpen, setImportOpen] = useState(false)
  const [errorReport, setErrorReport] = useState<Report | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortAsc, setSortAsc] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

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

  const handleImport = () => {
    if (!selectedFile) {
      return
    }

    const newReport: Report = {
      id: Date.now().toString(),
      fileName: selectedFile.name,
      status: 'New',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    }

    setReports([newReport, ...reports])
    setSelectedFile(null)
    setImportOpen(false)
    toast.success('Report scheduled')
  }

  const handleDelete = (id: string) => {
    setReports(reports.filter((report) => report.id !== id))
    toast('Report deleted')
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
                      className="text-muted-foreground transition-colors hover:text-accent"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                </TableCell>
                <TableCell>
                  <button
                    type="button"
                    onClick={() => handleDelete(report.id)}
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
              onChange={(event) =>
                setSelectedFile(event.target.files?.[0] ?? null)
              }
              className="h-11"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setImportOpen(false)}
                className="h-10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={!selectedFile}
                className="h-10 bg-accent font-semibold text-accent-foreground hover:bg-accent/90"
              >
                Import
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
