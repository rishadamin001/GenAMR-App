import { test, expect } from "@playwright/test";
import { writeFileSync } from "node:fs";
test("offline persistence, localization, print and canvas performance", async ({
  page,
  context,
}, testInfo) => {
  const diagnostics: string[] = [];
  page.on("pageerror", (e) => diagnostics.push(e.message));
  await page.addInitScript(() => {
    const values = { lcp: 0, cls: 0 };
    Object.assign(window, { demoVitals: values });
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) values.lcp = e.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        const entry = e as PerformanceEntry & {
          hadRecentInput: boolean;
          value: number;
        };
        if (!entry.hadRecentInput) values.cls += entry.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
  await page.goto("/");
  await expect(page.locator(".app-shell")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  await page.getByRole("button", { name: "Toggle currency" }).click();
  await expect(page.getByTestId("fee")).toHaveText("$10");
  await page.getByRole("button", { name: "Toggle language" }).click();
  await expect(
    page.getByRole("heading", { name: "দ্রুত ফলাফল। সচেতন সিদ্ধান্ত।" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Toggle language" }).click();
  const nav = page.getByRole("navigation", {
    name:
      testInfo.project.name === "mobile"
        ? "Mobile navigation"
        : "Main navigation",
    exact: true,
  });
  await nav.getByRole("button", { name: /Sanger$/ }).click();
  const timings = [];
  for (let i = 0; i < 8; i++) {
    const start = Date.now();
    await page
      .getByRole("checkbox", { name: "Toggle S83L", exact: true })
      .click();
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    );
    timings.push(Date.now() - start);
  }
  await page
    .getByRole("checkbox", { name: "Toggle D87N", exact: true })
    .check();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `../../outputs/${testInfo.project.name}-sanger.png`,
    fullPage: true,
  });
  const measurements = await page.evaluate(() => ({
    canvasDrawMs: performance
      .getEntriesByName("genamr-canvas-draw")
      .map((e) => e.duration),
    vitals: (window as unknown as { demoVitals: object }).demoVitals,
    paint: performance
      .getEntriesByType("paint")
      .map((e) => ({ name: e.name, ms: e.startTime })),
    resources: performance.getEntriesByType("resource").map((e) => ({
      name: e.name,
      bytes: (e as PerformanceResourceTiming).transferSize,
    })),
  }));
  writeFileSync(
    `../../outputs/${testInfo.project.name}-performance.json`,
    JSON.stringify(
      { ...measurements, canvasInteractionRoundtripMs: timings, diagnostics },
      null,
      2,
    ),
  );
  await testInfo.attach("performance.json", {
    body: JSON.stringify(
      { ...measurements, canvasInteractionRoundtripMs: timings, diagnostics },
      null,
      2,
    ),
    contentType: "application/json",
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator(".app-shell")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await nav.getByRole("button", { name: /Sanger$/ }).click();
  await expect(
    page.getByRole("checkbox", { name: "Toggle D87N", exact: true }),
  ).toBeChecked();
  await nav.getByRole("button", { name: /Report$/ }).click();
  await page.emulateMedia({ media: "print" });
  await expect(
    page.getByText("Commitment to Safety:", { exact: false }),
  ).toBeVisible();
  await expect(nav).toBeHidden();
  expect(diagnostics).toEqual([]);
});
