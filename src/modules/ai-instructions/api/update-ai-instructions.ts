import { createServerFn } from '@tanstack/react-start'
import { getSupabaseServerClient } from '@/modules/auth/utils/supabase-server'
import {
  aiInstructionsRowSchema,
  aiInstructionsUpdateSchema,
  mapRowToAIInstructions,
  mapUpdateToDatabaseColumns,
} from '@/modules/ai-instructions/logic/ai-instructions-schema'

const AI_INSTRUCTIONS_COLUMNS =
  'id,storage_options,watch_screen_sizes,carriers,all_models'

export const updateAIInstructions = createServerFn({ method: 'POST' })
  .inputValidator(aiInstructionsUpdateSchema)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('You must be logged in to update AI instructions.')
    }

    const updatePayload = mapUpdateToDatabaseColumns(data)

    const { data: updated, error } = await supabase
      .from('ai_instructions')
      .update(updatePayload)
      .eq('id', 1)
      .select(AI_INSTRUCTIONS_COLUMNS)
      .single()

    if (error) {
      throw new Error('Unable to update AI instructions.')
    }

    return mapRowToAIInstructions(aiInstructionsRowSchema.parse(updated))
  })
