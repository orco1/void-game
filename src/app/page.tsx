import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#030310",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Courier New', monospace",
        gap: "2rem",
        padding: "2rem",
      }}
    >
      <h1
        style={{
          fontSize: "clamp(3rem, 12vw, 7rem)",
          fontWeight: 900,
          letterSpacing: "0.3em",
          color: "#00CCFF",
          textShadow: "0 0 40px #00AAFF88, 0 0 80px #0044FF44",
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
          textAlign: "center",
          maxWidth: 400,
          lineHeight: 1.8,
        }}
      >
        DRAW LINES · CLOSE ZONES · DON&apos;T LET THE MONSTERS TOUCH YOUR TRAIL
      </p>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          href="/game"
          style={{
            display: "inline-block",
            padding: "0.75rem 2.5rem",
            background: "#00CCFF",
            color: "#030310",
            textDecoration: "none",
            letterSpacing: "0.2em",
            fontSize: "0.85rem",
            fontFamily: "'Courier New', monospace",
            fontWeight: 900,
          }}
        >
          PLAY
        </Link>
        <Link
          href="/leaderboard"
          style={{
            display: "inline-block",
            padding: "0.75rem 2.5rem",
            background: "transparent",
            border: "2px solid #00CCFF44",
            color: "#4488aa",
            textDecoration: "none",
            letterSpacing: "0.2em",
            fontSize: "0.85rem",
            fontFamily: "'Courier New', monospace",
            fontWeight: 700,
          }}
        >
          LEADERBOARD
        </Link>
      </div>
    </main>
  );
}
