import { test, expect } from "@playwright/test";
test("complete deterministic workflow", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto("/");
  await expect(page.locator(".app-shell")).toHaveAttribute(
    "data-ready",
    "true",
  );
  const nav = page.getByRole("navigation", {
    name:
      testInfo.project.name === "mobile"
        ? "Mobile navigation"
        : "Main navigation",
    exact: true,
  });
  const go = async (name: string) => {
    await nav.getByRole("button", { name: new RegExp(name + "$") }).click();
  };
  await expect(page.getByTestId("fee")).toHaveText("৳1,200");
  await page.getByText("⚡ Instant Demo Scenario Controller").click();
  await page.getByRole("button", { name: /QRDR triple mutant/ }).click();
  await expect(page.getByTestId("fee")).toHaveText("৳2,050");
  await go("Decide");
  await expect(page.getByTestId("decision")).toContainText("TRIGGER STAGE 4");
  await go("qPCR");
  await page
    .getByRole("checkbox", { name: "Toggle mcr-1", exact: true })
    .check();
  await go("Report");
  await expect(page.getByTestId("drug-Colistin").locator(".sir")).toHaveText(
    "R",
  );
  await page
    .getByRole("button", { name: /Carbapenem-sparing wild type/ })
    .click();
  await go("Sanger");
  await page
    .getByRole("checkbox", { name: "Toggle S83L", exact: true })
    .check();
  await page
    .getByRole("checkbox", { name: "Toggle D87N", exact: true })
    .check();
  await expect(
    page.getByRole("img", { name: /synthetic four-color/ }),
  ).toBeVisible();
  await go("Report");
  await expect(
    page.getByTestId("drug-Ciprofloxacin").locator(".sir"),
  ).toHaveText("R");
  await page.reload();
  await go("Validation");
  await page.getByRole("button", { name: /Simulate Batch AST/ }).click();
  await expect(page.getByRole("status")).toContainText("Model v1.3");
  await expect(page.getByRole("status")).toContainText(
    "1056 reconciled records",
  );
  await go("Collect");
  await page.getByRole("button", { name: "Register collection" }).click();
  await expect(page.getByRole("status")).toContainText("Collection registered");
  await go("Surveillance");
  await expect(
    page.getByRole("heading", { name: /national picture/ }),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV", exact: true }).click();
  expect((await download).suggestedFilename()).toContain(
    "synthetic-surveillance.csv",
  );
  await go("qPCR");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `../../outputs/${testInfo.project.name}-genamr.png`,
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
