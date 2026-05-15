"use server";

import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export const gymSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().optional(),
  phone: z
    .string()
    .regex(/^[+\d\s()-]{0,20}$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  logo_url: z.string().optional(),
});

export type GymFormData = z.infer<typeof gymSchema>;

export type ActionResult =
  | { success: true; id: string }
  | { success: false; error: string };

export async function createGym(data: GymFormData): Promise<ActionResult> {
  const parsed = gymSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthenticated" };

  const { data: gym, error } = await supabase
    .from("gyms")
    .insert({
      name: parsed.data.name,
      address: parsed.data.address || null,
      phone: parsed.data.phone || null,
      logo_url: parsed.data.logo_url || null,
      owner_id: user.id,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/management/gyms", "page");
  return { success: true, id: gym.id };
}

export async function updateGym(
  id: string,
  data: GymFormData
): Promise<ActionResult> {
  const parsed = gymSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("gyms")
    .update({
      name: parsed.data.name,
      address: parsed.data.address || null,
      phone: parsed.data.phone || null,
      logo_url: parsed.data.logo_url || null,
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/management/gyms", "page");
  return { success: true, id };
}
