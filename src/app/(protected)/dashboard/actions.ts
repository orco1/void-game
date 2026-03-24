"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleCountry(countryCode: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: existing } = await supabase
    .from("visited_countries")
    .select("id")
    .eq("user_id", user.id)
    .eq("country_code", countryCode)
    .single();

  if (existing) {
    await supabase
      .from("visited_countries")
      .delete()
      .eq("user_id", user.id)
      .eq("country_code", countryCode);
  } else {
    await supabase
      .from("visited_countries")
      .insert({ user_id: user.id, country_code: countryCode });
  }

  revalidatePath("/dashboard");
}
