import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WorldMap } from "@/components/world-map";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: visited } = await supabase
    .from("visited_countries")
    .select("country_code")
    .eq("user_id", user.id);

  const visitedCodes = (visited ?? []).map((r) => r.country_code);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold">My Travel Map</h1>
      <p className="mb-6 text-muted-foreground">
        Click any country to mark it as visited.
      </p>
      <WorldMap visitedCodes={visitedCodes} />
    </div>
  );
}
