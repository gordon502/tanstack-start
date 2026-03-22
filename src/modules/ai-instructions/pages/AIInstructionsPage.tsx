import { useState } from 'react'
import { Code2, Database, Monitor, Radio } from 'lucide-react'
import { Button } from '@/common/components/ui/button'
import { Textarea } from '@/common/components/ui/textarea'
import { toast } from '@/common/components/ui/sonner'
import { updateAIInstructions } from '@/modules/ai-instructions/api/update-ai-instructions'
import EditableList from '@/modules/ai-instructions/components/EditableList'
import type { AIInstructions } from '@/modules/ai-instructions/logic/ai-instructions-schema'
import {
  modelsJsonTextSchema,
  parseModelsJsonText,
} from '@/modules/ai-instructions/logic/ai-instructions-schema'

interface AIInstructionsPageProps {
  initialData: AIInstructions
}

function getJsonValidationMessage(value: string) {
  const validation = modelsJsonTextSchema.safeParse(value)
  return validation.success
    ? ''
    : (validation.error.issues[0]?.message ?? 'Invalid JSON')
}

export default function AIInstructionsPage({
  initialData,
}: AIInstructionsPageProps) {
  const [storage, setStorage] = useState(initialData.storageOptions)
  const [screenSizes, setScreenSizes] = useState(initialData.watchScreenSizes)
  const [carriers, setCarriers] = useState(initialData.carriers)
  const [modelsJson, setModelsJson] = useState(
    JSON.stringify(initialData.allModels, null, 2),
  )
  const [jsonError, setJsonError] = useState('')
  const [isSavingJson, setIsSavingJson] = useState(false)

  const handleJsonChange = (value: string) => {
    setModelsJson(value)
    setJsonError(getJsonValidationMessage(value))
  }

  const handleSaveJson = async () => {
    if (isSavingJson) {
      return
    }

    const validationMessage = getJsonValidationMessage(modelsJson)
    if (validationMessage) {
      setJsonError(validationMessage)
      return
    }

    const parsedModels = parseModelsJsonText(modelsJson)
    setIsSavingJson(true)

    try {
      const updated = await updateAIInstructions({
        data: {
          allModels: parsedModels,
        },
      })
      setModelsJson(JSON.stringify(updated.allModels, null, 2))
      setJsonError('')
      toast.success('Models JSON saved')
    } catch {
      toast.error('Unable to save models JSON')
    } finally {
      setIsSavingJson(false)
    }
  }

  return (
    <div className="max-w-7xl space-y-8 p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Instructions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure model data, storage options, and carrier settings
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <EditableList
          title="Storage Options"
          icon={<Database className="h-4 w-4" />}
          items={storage}
          onAdd={async (item) => {
            const previous = storage
            const next = [...previous, item]
            setStorage(next)

            try {
              const updated = await updateAIInstructions({
                data: {
                  storageOptions: next,
                },
              })
              setStorage(updated.storageOptions)
              toast.success('Storage options saved')
            } catch (error) {
              setStorage(previous)
              throw error
            }
          }}
          onDelete={async (index) => {
            const previous = storage
            const next = previous.filter(
              (_, currentIndex) => currentIndex !== index,
            )
            setStorage(next)

            try {
              const updated = await updateAIInstructions({
                data: {
                  storageOptions: next,
                },
              })
              setStorage(updated.storageOptions)
              toast.success('Storage options saved')
            } catch (error) {
              setStorage(previous)
              throw error
            }
          }}
        />
        <EditableList
          title="Watch Screen Sizes"
          icon={<Monitor className="h-4 w-4" />}
          items={screenSizes}
          onAdd={async (item) => {
            const previous = screenSizes
            const next = [...previous, item]
            setScreenSizes(next)

            try {
              const updated = await updateAIInstructions({
                data: {
                  watchScreenSizes: next,
                },
              })
              setScreenSizes(updated.watchScreenSizes)
              toast.success('Watch screen sizes saved')
            } catch (error) {
              setScreenSizes(previous)
              throw error
            }
          }}
          onDelete={async (index) => {
            const previous = screenSizes
            const next = previous.filter(
              (_, currentIndex) => currentIndex !== index,
            )
            setScreenSizes(next)

            try {
              const updated = await updateAIInstructions({
                data: {
                  watchScreenSizes: next,
                },
              })
              setScreenSizes(updated.watchScreenSizes)
              toast.success('Watch screen sizes saved')
            } catch (error) {
              setScreenSizes(previous)
              throw error
            }
          }}
        />
        <EditableList
          title="Carriers"
          icon={<Radio className="h-4 w-4" />}
          items={carriers}
          onAdd={async (item) => {
            const previous = carriers
            const next = [...previous, item]
            setCarriers(next)

            try {
              const updated = await updateAIInstructions({
                data: {
                  carriers: next,
                },
              })
              setCarriers(updated.carriers)
              toast.success('Carriers saved')
            } catch (error) {
              setCarriers(previous)
              throw error
            }
          }}
          onDelete={async (index) => {
            const previous = carriers
            const next = previous.filter(
              (_, currentIndex) => currentIndex !== index,
            )
            setCarriers(next)

            try {
              const updated = await updateAIInstructions({
                data: {
                  carriers: next,
                },
              })
              setCarriers(updated.carriers)
              toast.success('Carriers saved')
            } catch (error) {
              setCarriers(previous)
              throw error
            }
          }}
        />

        <div
          className="overflow-hidden rounded-xl border bg-card"
          style={{ boxShadow: 'var(--shadow-md)' }}
        >
          <div className="border-b bg-muted/30 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Code2 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">All Models (JSON)</h3>
                <p className="text-xs text-muted-foreground">
                  Raw model configuration data
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-3 p-4">
            <Textarea
              value={modelsJson}
              onChange={(event) => handleJsonChange(event.target.value)}
              className="min-h-[260px] max-h-[400px] border-border/60 bg-muted/30 font-mono text-xs"
              disabled={isSavingJson}
            />
            {jsonError && (
              <p className="text-sm font-medium text-destructive">
                {jsonError}
              </p>
            )}
            <Button
              size="sm"
              onClick={() => void handleSaveJson()}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={isSavingJson}
            >
              {isSavingJson ? 'Saving...' : 'Save JSON'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
