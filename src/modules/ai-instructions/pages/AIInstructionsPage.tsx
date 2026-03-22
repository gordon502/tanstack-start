import { useState } from 'react'
import { Code2, Database, Monitor, Radio } from 'lucide-react'
import { Button } from '@/common/components/ui/button'
import { Textarea } from '@/common/components/ui/textarea'
import { toast } from '@/common/components/ui/sonner'
import EditableList from '@/modules/ai-instructions/components/EditableList'
import { modelInfoData } from '@/modules/ai-instructions/utils/model-info'

const initialStorage = [
  '2TB',
  '1TB',
  '512GB',
  '256GB',
  '128GB',
  '64GB',
  '32GB',
  '16GB',
  '8GB',
  '4GB',
  '2GB',
  '1GB',
  '512MB',
  '256MB',
]

const initialScreenSizes = [
  '38MM',
  '40MM',
  '41MM',
  '42MM',
  '43MM',
  '44MM',
  '45MM',
  '46MM',
  '47MM',
  '49MM',
]

const initialCarriers = [
  'Verizon',
  'AT&T',
  'Boost',
  'MetroPCS',
  'T-Mobile',
  'Xfinity',
  'US Cellular',
  'Spectrum',
  'Cricket',
  'Altice',
  'Argon',
  'Bell',
  'C Spire',
  'Carolina West',
  'Chile',
  'Claro',
  'Comcel',
  'Docomo',
  'EMEA',
  'Fido',
  'GCI',
  'Globe Telecom',
  'KDDI',
  'Kt',
  'kr',
  'Kyivstar',
  'Latin America Region',
  'Mint Mobile',
  'Movistar',
  'Nextel',
  'Orange',
  'Panhandle',
  'Redpocket',
  'Rogers',
  'Smart',
  'Softbank',
  'Straight Talk',
  'Telcel',
  'Telefonica',
  'Telstra',
  'Telus',
  'Tigo',
  'TIM',
  'Tracfone',
  'Ultra Mobile',
  'Union Wireless',
  'US Consumer Cellular',
  'US Reseller Flex',
  'USA Region',
  'Viaero',
  'Virgin',
  'Vodafone',
  'WIFI',
  'Puerto Rico Liberty',
  'Visible',
  'Sprint',
  'A1 Telekom',
  'Open Mobile',
  'Flow',
  'Assurance Wireless',
  'Cox',
  'APAC',
  'United Wireless',
  'SK telecom',
  'Central Wireless',
  'Liberty Latin America',
  'Three Ireland',
]

export default function AIInstructionsPage() {
  const [storage, setStorage] = useState(initialStorage)
  const [screenSizes, setScreenSizes] = useState(initialScreenSizes)
  const [carriers, setCarriers] = useState(initialCarriers)
  const [modelsJson, setModelsJson] = useState(
    JSON.stringify(modelInfoData, null, 2),
  )
  const [jsonError, setJsonError] = useState('')

  const handleJsonChange = (value: string) => {
    setModelsJson(value)
    try {
      JSON.parse(value)
      setJsonError('')
    } catch {
      setJsonError('Invalid JSON')
    }
  }

  const handleSaveJson = () => {
    try {
      JSON.parse(modelsJson)
      setJsonError('')
      toast.success('Models JSON saved')
    } catch {
      setJsonError('Invalid JSON - cannot save')
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
          onAdd={(item) => setStorage([...storage, item])}
          onDelete={(index) =>
            setStorage(
              storage.filter((_, currentIndex) => currentIndex !== index),
            )
          }
        />
        <EditableList
          title="Watch Screen Sizes"
          icon={<Monitor className="h-4 w-4" />}
          items={screenSizes}
          onAdd={(item) => setScreenSizes([...screenSizes, item])}
          onDelete={(index) =>
            setScreenSizes(
              screenSizes.filter((_, currentIndex) => currentIndex !== index),
            )
          }
        />
        <EditableList
          title="Carriers"
          icon={<Radio className="h-4 w-4" />}
          items={carriers}
          onAdd={(item) => setCarriers([...carriers, item])}
          onDelete={(index) =>
            setCarriers(
              carriers.filter((_, currentIndex) => currentIndex !== index),
            )
          }
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
            />
            {jsonError && (
              <p className="text-sm font-medium text-destructive">
                {jsonError}
              </p>
            )}
            <Button
              size="sm"
              onClick={handleSaveJson}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Save JSON
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
