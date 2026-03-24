import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

interface Score {
  id: string;
  name: string;
  score: number;
  level: number;
  created_at: string;
}

export const revalidate = 30;

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { data: scores } = await supabase
    .from("scores")
    .select("id, name, score, level, created_at")
    .order("score", { ascending: false })
    .limit(50);

  const rows = (scores ?? []) as Score[];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#030310",
        color: "#e0f0ff",
        fontFamily: "'Courier New', monospace",
        padding: "2rem 1rem",
      }}
    >
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: "clamp(2rem, 6vw, 3.5rem)",
              fontWeight: 900,
              letterSpacing: "0.25em",
              color: "#00CCFF",
              textShadow: "0 0 24px #00AAFF88",
              margin: 0,
            }}
          >
            VOID
          </h1>
          <p
            style={{
              color: "#4488aa",
              letterSpacing: "0.15em",
              fontSize: "0.75rem",
              marginTop: "0.25rem",
            }}
          >
            GLOBAL LEADERBOARD
          </p>
        </div>

        {/* Table */}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                borderBottom: "1px solid #0088BB44",
                color: "#4488aa",
                fontSize: "0.7rem",
                letterSpacing: "0.12em",
              }}
            >
              <th style={{ padding: "0.5rem 0.75rem", textAlign: "left" }}>
                RANK
              </th>
              <th style={{ padding: "0.5rem 0.75rem", textAlign: "left" }}>
                NAME
              </th>
              <th style={{ padding: "0.5rem 0.75rem", textAlign: "right" }}>
                SCORE
              </th>
              <th style={{ padding: "0.5rem 0.75rem", textAlign: "right" }}>
                LEVEL
              </th>
              <th
                style={{
                  padding: "0.5rem 0.75rem",
                  textAlign: "right",
                  display: "none",
                }}
                className="sm-show"
              >
                DATE
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "#4488aa",
                    fontSize: "0.85rem",
                    letterSpacing: "0.1em",
                  }}
                >
                  NO SCORES YET — BE THE FIRST
                </td>
              </tr>
            )}
            {rows.map((row, i) => (
              <tr
                key={row.id}
                style={{
                  borderBottom: "1px solid #0088BB22",
                  background: i % 2 === 0 ? "transparent" : "#00111a44",
                  transition: "background 0.15s",
                }}
              >
                <td
                  style={{
                    padding: "0.6rem 0.75rem",
                    color:
                      i === 0
                        ? "#FFD700"
                        : i === 1
                          ? "#C0C0C0"
                          : i === 2
                            ? "#CD7F32"
                            : "#4488aa",
                    fontWeight: i < 3 ? 700 : 400,
                    fontSize: "0.85rem",
                  }}
                >
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                </td>
                <td
                  style={{
                    padding: "0.6rem 0.75rem",
                    color: i < 3 ? "#00EEFF" : "#c0dde8",
                    fontWeight: i < 3 ? 700 : 400,
                    letterSpacing: "0.05em",
                  }}
                >
                  {row.name}
                </td>
                <td
                  style={{
                    padding: "0.6rem 0.75rem",
                    textAlign: "right",
                    color: "#00FF88",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                  }}
                >
                  {row.score.toString().padStart(6, "0")}
                </td>
                <td
                  style={{
                    padding: "0.6rem 0.75rem",
                    textAlign: "right",
                    color: "#4488aa",
                  }}
                >
                  {row.level}
                </td>
                <td
                  style={{
                    padding: "0.6rem 0.75rem",
                    textAlign: "right",
                    color: "#2a5566",
                    fontSize: "0.75rem",
                  }}
                >
                  {new Date(row.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Play button */}
        <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
          <Link
            href="/game"
            style={{
              display: "inline-block",
              padding: "0.75rem 2.5rem",
              background: "transparent",
              border: "2px solid #00CCFF",
              color: "#00CCFF",
              textDecoration: "none",
              letterSpacing: "0.2em",
              fontSize: "0.85rem",
              fontFamily: "'Courier New', monospace",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            PLAY
          </Link>
        </div>
      </div>
    </main>
  );
}
