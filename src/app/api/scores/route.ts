import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const limit = Math.min(
    parseInt(req.nextUrl.searchParams.get("limit") ?? "10"),
    100
  );

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scores")
    .select("id, name, score, level, created_at")
    .order("score", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, score, level } = body as Record<string, unknown>;

  if (
    typeof name !== "string" ||
    name.trim().length === 0 ||
    name.trim().length > 20
  ) {
    return NextResponse.json(
      { error: "name must be 1–20 characters" },
      { status: 400 }
    );
  }

  if (typeof score !== "number" || !Number.isInteger(score) || score < 0) {
    return NextResponse.json(
      { error: "score must be a non-negative integer" },
      { status: 400 }
    );
  }

  if (typeof level !== "number" || !Number.isInteger(level) || level < 1) {
    return NextResponse.json(
      { error: "level must be a positive integer" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scores")
    .insert({ name: name.trim(), score, level })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Calculate rank
  const { count } = await supabase
    .from("scores")
    .select("*", { count: "exact", head: true })
    .gt("score", score);

  const rank = (count ?? 0) + 1;

  return NextResponse.json({ ...data, rank }, { status: 201 });
}
