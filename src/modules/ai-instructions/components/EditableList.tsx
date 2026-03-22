import { useState } from 'react'
import type { ReactNode } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/common/components/ui/button'
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

interface EditableListProps {
  title: string
  icon: ReactNode
  items: string[]
  onAdd: (item: string) => void
  onDelete: (index: number) => void
}

export default function EditableList({
  title,
  icon,
  items,
  onAdd,
  onDelete,
}: EditableListProps) {
  const [newItem, setNewItem] = useState('')

  const handleAdd = () => {
    const trimmed = newItem.trim()
    if (!trimmed) {
      return
    }

    if (items.includes(trimmed)) {
      toast.error('Already exists')
      return
    }

    onAdd(trimmed)
    setNewItem('')
  }

  return (
    <div
      className="overflow-hidden rounded-xl border bg-card"
      style={{ boxShadow: 'var(--shadow-md)' }}
    >
      <div className="border-b bg-muted/30 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-semibold">{title}</h3>
            <p className="text-xs text-muted-foreground">
              {items.length} items
            </p>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="mb-3 flex gap-2">
          <Input
            placeholder={`Add new ${title.toLowerCase().replace(/s$/, '')}...`}
            value={newItem}
            onChange={(event) => setNewItem(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && handleAdd()}
            className="h-9 flex-1 text-sm"
          />
          <Button
            size="sm"
            onClick={handleAdd}
            className="h-9 bg-accent px-3 text-accent-foreground hover:bg-accent/90"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="max-h-64 overflow-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="h-9 text-xs font-semibold tracking-wider uppercase">
                  Value
                </TableHead>
                <TableHead className="h-9 w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={`${item}-${index}`} className="group">
                  <TableCell className="py-2 text-sm font-medium">
                    {item}
                  </TableCell>
                  <TableCell className="py-2">
                    <button
                      type="button"
                      onClick={() => onDelete(index)}
                      className="text-muted-foreground opacity-0 transition-all duration-150 group-hover:opacity-100 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
