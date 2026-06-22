import { z } from "zod";

// Query-string filters for the super-admin activity feed. All optional — an
// empty object returns the most recent events with platform-wide KPI totals.
export const activityFiltersSchema = z.object({
  gym: z.string().optional(),
  coach: z.string().optional(),
  event: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  search: z.string().optional(),
});

export type ActivityFilters = z.infer<typeof activityFiltersSchema>;
