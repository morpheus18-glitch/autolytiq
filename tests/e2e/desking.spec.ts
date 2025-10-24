import { test, expect, Page } from "@playwright/test";

const login = async (page: Page) => {
  await page.goto("http://localhost:3000/login");
  await page.fill('[data-testid="login-email"]', "mike@deal.com");
  await page.fill('[data-testid="login-password"]', "password123!");
  await page.click('[data-testid="login-submit"]');
  await page.waitForURL("**/dashboard");
};

test.describe("Desking happy path", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("Create initial pencil → optimize → select scenario → print", async ({ page }) => {
    // Navigate to a seeded working deal
    await page.goto("http://localhost:3000/desking/deals/D-2025-4567");

    // Initial pencil
    await page.click('[data-testid="action-generate-initial-pencil"]');
    await page.waitForSelector('[data-testid="pencil-form"]');

    // Fill minimal fields (assumes defaults for seed)
    await page.fill('[data-testid="selling-price-input"]', "27995");
    await page.fill('[data-testid="cash-down-input"]', "2000");
    await page.fill('[data-testid="trade-allow-input"]', "8500");
    await page.fill('[data-testid="trade-payoff-input"]', "7200");

    // Debounced AI panel appears
    await expect(page.getByTestId("ai-optimal-price")).toBeVisible();

    // Generate and preview
    await page.click('[data-testid="pencil-generate"]');
    await page.waitForSelector('[data-testid="print-preview-modal"]');
    await expect(page.getByTestId("print-amount-financed")).toContainText("$");

    // Save to deal & close preview
    await page.click('[data-testid="pencil-save-to-deal"]');
    await page.click('[data-testid="modal-close"]');

    // Run optimization
    await page.click('[data-testid="ai-optimize-deal"]');
    await page.waitForSelector('[data-testid="optimization-results"]');
    await expect(page.getByTestId("scenario-card-0")).toBeVisible();

    // Select recommended scenario
    await page.click('[data-testid="scenario-card-recommended"] >> [data-testid="select-scenario"]');
    await expect(page.getByTestId("version-current-badge")).toHaveText(/CURRENT/i);

    // Print final worksheet
    await page.click('[data-testid="header-print"]');
    await page.waitForSelector('[data-testid="print-preview-modal"]');
    await expect(page.getByTestId("print-payment-table")).toBeVisible();
  });
});

test.describe("Customer counter flow", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("Counter → AI options → choose → new version in history", async ({ page }) => {
    await page.goto("http://localhost:3000/desking/deals/D-2025-4567");

    // Open counter page
    await page.click('[data-testid="action-customer-counter"]');
    await page.waitForSelector('[data-testid="counter-form"]');

    // Capture customer ask
    await page.check('[data-testid="obj-selling-price"]');
    await page.fill('[data-testid="counter-selling-price"]', "26500");
    await page.fill('[data-testid="counter-notes"]',
      "Has competing quote at 26800; wants sub-$400/month; spouse hesitant."
    );
    await page.selectOption('[data-testid="urgency-level"]', "HIGH");

    // Run AI analysis
    await page.click('[data-testid="counter-run-analysis"]');
    await page.waitForSelector('[data-testid="counter-options-grid"]');
    await expect(page.getByTestId("counter-option-recommended")).toBeVisible();

    // Choose AI recommended
    await page.click('[data-testid="counter-option-recommended"] >> [data-testid="select-option"]');

    // Verify version history updated
    await page.click('[data-testid="panel-history-open"]');
    await expect(page.getByTestId("history-version-latest")).toContainText(/AI Optimized/i);

    // Generate new pencil and preview
    await page.click('[data-testid="generate-new-pencil"]');
    await page.waitForSelector('[data-testid="print-preview-modal"]');
    await expect(page.getByTestId("print-payment-table")).toBeVisible();
  });
});
