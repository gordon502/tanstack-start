import { z } from 'zod'

const aiInstructionListItemSchema = z
  .string()
  .trim()
  .min(1, 'Value is required')

const aiInstructionListSchema = z.array(aiInstructionListItemSchema)
const jsonValueSchema = z.json()

export const aiInstructionsRowSchema = z.object({
  id: z.number().int().positive(),
  storage_options: aiInstructionListSchema,
  watch_screen_sizes: aiInstructionListSchema,
  carriers: aiInstructionListSchema,
  all_models: jsonValueSchema,
})

export const aiInstructionsSchema = z.object({
  storageOptions: aiInstructionListSchema,
  watchScreenSizes: aiInstructionListSchema,
  carriers: aiInstructionListSchema,
  allModels: jsonValueSchema,
})

export type AIInstructions = z.infer<typeof aiInstructionsSchema>

const aiInstructionsUpdateCandidateSchema = z.object({
  storageOptions: aiInstructionListSchema.optional(),
  watchScreenSizes: aiInstructionListSchema.optional(),
  carriers: aiInstructionListSchema.optional(),
  allModels: jsonValueSchema.optional(),
})

export const aiInstructionsUpdateSchema =
  aiInstructionsUpdateCandidateSchema.refine(
    (value) => Object.keys(value).length > 0,
    {
      message: 'At least one field must be provided for update.',
    },
  )

export type AIInstructionsUpdateInput = z.infer<
  typeof aiInstructionsUpdateSchema
>

export const modelsJsonTextSchema = z.string().superRefine((value, ctx) => {
  try {
    JSON.parse(value)
  } catch {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Invalid JSON',
    })
  }
})

export function parseModelsJsonText(value: string) {
  const validated = modelsJsonTextSchema.parse(value)
  return jsonValueSchema.parse(JSON.parse(validated))
}

export function mapRowToAIInstructions(
  row: z.infer<typeof aiInstructionsRowSchema>,
): AIInstructions {
  return aiInstructionsSchema.parse({
    storageOptions: row.storage_options,
    watchScreenSizes: row.watch_screen_sizes,
    carriers: row.carriers,
    allModels: row.all_models,
  })
}

export function mapUpdateToDatabaseColumns(input: AIInstructionsUpdateInput) {
  return {
    ...(input.storageOptions !== undefined
      ? { storage_options: input.storageOptions }
      : {}),
    ...(input.watchScreenSizes !== undefined
      ? { watch_screen_sizes: input.watchScreenSizes }
      : {}),
    ...(input.carriers !== undefined ? { carriers: input.carriers } : {}),
    ...(input.allModels !== undefined ? { all_models: input.allModels } : {}),
  }
}
