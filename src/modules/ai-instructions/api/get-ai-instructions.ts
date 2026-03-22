import { createServerFn } from '@tanstack/react-start'
import { getSupabaseServerClient } from '@/modules/auth/utils/supabase-server'
import {
  aiInstructionsRowSchema,
  mapRowToAIInstructions,
} from '@/modules/ai-instructions/logic/ai-instructions-schema'

const AI_INSTRUCTIONS_COLUMNS =
  'id,storage_options,watch_screen_sizes,carriers,all_models'

export const getAIInstructions = createServerFn({ method: 'GET' }).handler(
  async () => {
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase
      .from('ai_instructions')
      .select(AI_INSTRUCTIONS_COLUMNS)
      .eq('id', 1)
      .single()

    if (error) {
      throw new Error('Unable to load AI instructions.')
    }

    return mapRowToAIInstructions(aiInstructionsRowSchema.parse(data))
  },
)
