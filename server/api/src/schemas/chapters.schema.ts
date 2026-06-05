/**
 * Zod schemas for chapter endpoints.
 */

import { z } from "zod"

/** URL slug: lowercase letters, numbers, and hyphens only */
export const SlugParamsSchema = z.object({
  slug: z
    .string()
    .min(1, "slug is required")
    .regex(/^[a-z0-9-]+$/, "slug may only contain lowercase letters, numbers, and hyphens"),
})

export type SlugParams = z.infer<typeof SlugParamsSchema>
