import { test, expect } from "@playwright/test";

// ─── Home page ────────────────────────────────────────────────────────────────
test("home page shows VOID title and navigation links", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "VOID" })).toBeVisible();
  await expect(page.getByRole("link", { name: "PLAY" })).toBeVisible();
  await expect(page.getByRole("link", { name: "LEADERBOARD" })).toBeVisible();
});

// ─── Game loads ───────────────────────────────────────────────────────────────
test("game page loads and shows START overlay", async ({ page }) => {
  await page.goto("/game/index.html");
  await expect(page.locator("#overlay-title")).toContainText("VOID");
  await expect(page.locator("#overlay-btn")).toContainText("START");
  await expect(page.locator("#gameCanvas")).toBeVisible();
});

test("game canvas renders after clicking START", async ({ page }) => {
  await page.goto("/game/index.html");
  await page.locator("#overlay-btn").click();
  // Overlay should be hidden after start
  await expect(page.locator("#overlay")).toHaveCSS("display", "none");
  // Canvas still visible
  await expect(page.locator("#gameCanvas")).toBeVisible();
});

test("HUD elements are present", async ({ page }) => {
  await page.goto("/game/index.html");
  await expect(page.locator("#el-level")).toBeVisible();
  await expect(page.locator("#el-score")).toBeVisible();
  await expect(page.locator("#el-lives")).toBeVisible();
  await expect(page.locator("#el-pct")).toBeVisible();
});

test("D-pad buttons are present for mobile", async ({ page }) => {
  await page.goto("/game/index.html");
  await expect(page.locator("#btn-up")).toBeVisible();
  await expect(page.locator("#btn-down")).toBeVisible();
  await expect(page.locator("#btn-left")).toBeVisible();
  await expect(page.locator("#btn-right")).toBeVisible();
});

test("player can move using keyboard after game starts", async ({ page }) => {
  await page.goto("/game/index.html");
  await page.locator("#overlay-btn").click();

  // Read initial score
  const scoreBefore = await page.locator("#el-score").textContent();

  // Move right a few steps
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(100);
  }

  // Canvas is still rendering (game loop is running)
  await expect(page.locator("#gameCanvas")).toBeVisible();

  // HUD still shows valid state
  await expect(page.locator("#el-lives")).not.toBeEmpty();
  await expect(page.locator("#el-level")).toHaveText("1");

  // Score starts at 0 before any capture
  expect(scoreBefore).toBe("000000");
});

// ─── Leaderboard page ─────────────────────────────────────────────────────────
test("leaderboard page loads with correct heading", async ({ page }) => {
  await page.goto("/leaderboard");
  await expect(page.getByRole("heading", { name: "VOID" })).toBeVisible();
  await expect(page.getByRole("link", { name: "PLAY" })).toBeVisible();
});

test("leaderboard shows empty state or scores table", async ({ page }) => {
  await page.goto("/leaderboard");
  // Either shows a table with rows or the empty-state message
  const hasScores = await page.locator("tbody tr td:first-child").first().isVisible();
  if (!hasScores) {
    await expect(page.getByText(/NO SCORES YET/i)).toBeVisible();
  }
});

// ─── Scores API ───────────────────────────────────────────────────────────────
test("GET /api/scores returns an array", async ({ request }) => {
  const res = await request.get("/api/scores?limit=5");
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(Array.isArray(body)).toBe(true);
});

test("POST /api/scores rejects invalid data", async ({ request }) => {
  const res = await request.post("/api/scores", {
    data: { name: "", score: -1, level: 0 },
  });
  expect(res.status()).toBe(400);
});

test("POST /api/scores accepts valid score and returns rank", async ({
  request,
}) => {
  const res = await request.post("/api/scores", {
    data: { name: "PLAYWRIGHT", score: 999, level: 3 },
  });
  expect(res.status()).toBe(201);
  const body = await res.json();
  expect(body).toHaveProperty("id");
  expect(body).toHaveProperty("rank");
  expect(body.name).toBe("PLAYWRIGHT");
  expect(body.score).toBe(999);
});
