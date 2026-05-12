import isArrayHasData from "@/lib/isArrayHasData";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { GymListItem } from "@/types/gyms";

export type { GymListItem };

export type GymsResult =
  | { data: GymListItem[]; error: null | string }

export async function getGyms(): Promise<GymsResult> {
  const supabase = await createServerSupabaseClient();

  try {

    const { data, error } = await supabase
      .from("gym_list")
      .select("id, name, address, created_at, plan_name, price_egp, subscription_status, member_count, last_activity_at");

    if (error) throw error;

    const computedData = !isArrayHasData(data) ? [] :
      data.map(item => ({
        id: item.id,
        name: item.name,
        address: item.address || "",
        joinedAt: item.created_at,
        plan: item.plan_name || "",
        planPriceEgp: Number(item.price_egp || 0),
        status: item.subscription_status || "",
        memberCount: Number(item.member_count || 0),
        lastActivityAt: item.last_activity_at || "",

      }))

    return {
      data: computedData,
      error: null
    }
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : typeof err === "object"
          ? JSON.stringify(err, null, 2)
          : String(err);
    console.error("[getGyms]", message);
    return { data: [], error: message };
  }
}
