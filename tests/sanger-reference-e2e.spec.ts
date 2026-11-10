import { test, expect } from "@playwright/test";
test("database comparison tracks species, loci and mutations", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator(".app-shell")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await page.getByText("⚡ Instant Demo Scenario Controller").click();
  await page.getByRole("button", { name: /QRDR triple mutant/ }).click();
  const nav = page.getByRole("navigation", {
    name:
      testInfo.project.name === "mobile"
        ? "Mobile navigation"
        : "Main navigation",
    exact: true,
  });
  await nav.getByRole("button", { name: /Sanger$/ }).click();
  const panel = page.getByRole("complementary", {
    name: "Sanger database comparison",
  });
  await expect(panel).toContainText("CP073768.1");
  await expect(page.getByTestId("reference-summary")).toContainText("93.9%");
  await panel.getByRole("checkbox", { name: "Show differences only" }).check();
  await panel.getByText("S83L", { exact: true }).click();
  await panel.getByRole("button", { name: "Locate codon 83 in trace" }).click();
  await expect(
    page.getByText("Inspecting gyrA codon 83", { exact: false }),
  ).toBeVisible();
  await expect(
    panel.getByRole("button", { name: /Inspect codon 83:/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("checkbox", { name: "Toggle S83L", exact: true })
    .uncheck();
  await expect(page.getByTestId("reference-summary")).toContainText("97.0%");
  await page
    .getByRole("checkbox", { name: "Toggle D87N", exact: true })
    .uncheck();
  await expect(
    panel.getByText("No differences in this 33-base window."),
  ).toBeVisible();
  await page.getByLabel("Target locus").selectOption("parC");
  await expect(panel).toContainText("CP084529.1");
  await expect(panel.getByText("S80I", { exact: true })).toBeVisible();
  const downloaded = page.waitForEvent("download");
  await panel.getByRole("button", { name: "Export comparison JSON" }).click();
  const download = await downloaded;
  expect(download.suggestedFilename()).toBe("GAMR-BD-002-parC-comparison.json");
  const { readFile } = await import("node:fs/promises");
  const payload = JSON.parse(await readFile((await download.path())!, "utf8"));
  expect(payload.accession).toBe("CP084529.1");
  expect(payload.differences).toBe(1);
  expect(payload.synthetic).toBe(true);
  await page
    .getByRole("button", { name: /Carbapenem-sparing wild type/ })
    .click();
  await expect(panel).toContainText("AF052258.1");
  await expect(page.getByTestId("reference-summary")).toContainText("100.0%");
  await page.getByLabel("Target locus").selectOption("parC");
  await page
    .getByRole("checkbox", { name: "Toggle S80I", exact: true })
    .check();
  await expect(panel).toContainText("AF303641.1");
  await panel.getByText("S80I", { exact: true }).click();
  await expect(panel).toContainText("different synonymous reference codon");
  await page.getByRole("button", { name: /Acinetobacter ICU/ }).click();
  await expect(panel).toContainText(
    "No reference available for Acinetobacter baumannii",
  );
  await expect(page.getByTestId("reference-summary")).toHaveCount(0);
  await page.getByRole("button", { name: /QRDR triple mutant/ }).click();
  await page
    .getByRole("checkbox", { name: "Toggle S83L", exact: true })
    .check();
  await page
    .getByRole("checkbox", { name: "Toggle D87N", exact: true })
    .check();
  await panel.getByRole("checkbox", { name: "Show differences only" }).check();
  await panel.getByText("S83L", { exact: true }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  if (testInfo.project.name === "desktop") {
    const viewer = await page
      .getByRole("heading", { name: "One base can change the answer." })
      .boundingBox();
    const reference = await panel.boundingBox();
    expect(reference!.x).toBeGreaterThan(viewer!.x);
  }
  await page.screenshot({
    path: `../../outputs/${testInfo.project.name}-sanger-reference.png`,
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

