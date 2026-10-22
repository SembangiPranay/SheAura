---
name: advanced-testing-methodologies
description: >-
  Elite testing decision framework and execution runbook for advanced, production-grade
  testing methodologies: Property-Based Testing, Concurrency & Race Condition Testing,
  Chaos & Network Degradation, Mutation Testing, Consumer-Driven Contract Testing,
  Perceptual Visual Regression with Contrast Auditing, and Shadow/Canary Verification.
  Trigger whenever the user or agent discusses, designs, executes, or evaluates testing
  strategies for applications, e-commerce, APIs, or database integrity.
  Automatically maps any testing query to the optimal methodology, provides concrete
  executable test templates, explains why average tests fail, and solicits user approval.
---

# Advanced Testing Methodologies & Decision Engine

This skill equips Antigravity agents with the testing practices used by staff/principal engineers at Tier-1 technology companies (Stripe, Amazon, Shopify, Netflix, Apple). It transitions the agent from basic happy-path unit tests to resilient, production-grade verification.

---

## 1. Core Operating Directive

Whenever a user presents a testing query, requirement, or scenario:
1. **Analyze the Real-World Failure Mode**: Identify whether the risk is state explosion, race condition, network degradation, schema drift, or visual regression.
2. **Recommend the Optimal Testing Method**: Select the single highest-impact testing method from the 7 Elite Pillars below (plus an optional secondary defense).
3. **Contrast Average vs. Advanced**: Explain clearly why standard unit/manual tests miss this failure mode and why the advanced method guarantees success.
4. **Provide a Concrete, Executable Template**: Provide ready-to-run test code tailored to the user's specific codebase.
5. **Solicit User Approval**: Explicitly ask the user for approval before implementing or executing the proposed test suite.

---

## 2. The Decision Matrix: Test Query ➔ Best Method Mapping

Use this quick-lookup table to map any testing question to the exact best method:

| Customer / System Scenario | Primary Failure Mode | Recommended Method | Core Tool |
| :--- | :--- | :--- | :--- |
| **Coupons, Discounts, Cart Totals, Tax Math** | Edge-case numerical combinations, negative totals, rounding exploits, NaN | **Property-Based Testing** | `fast-check` / `hypothesis` |
| **High Traffic Drops, Flash Sales, Last 2 Units** | 50 users buying simultaneously, inventory overselling, double deductions | **Concurrency & Race Condition Testing** | `Promise.allSettled` + DB Locks |
| **Slow Cellular, Tap-Pay Twice, Gateway Redirects** | Duplicate orders, network dropout mid-checkout, broken state machine | **Chaos & Network Degradation Testing** | Playwright Route Throttling / Idempotency |
| **"Are my unit tests actually any good?"** | High test coverage with zero meaningful assertions (false confidence) | **Mutation Testing** | `stryker` |
| **Frontend/Backend Schema Drift** | Backend renamed `customer_name` to `client_name`; frontend mock tests passed but production crashed | **Consumer-Driven Contract Testing** | `zod` schemas / `pact` |
| **Luxury Aesthetic, Mobile Clipping, Washed-out Colors** | Logo invisible on ivory background, sticky bottom bar covering buttons | **Perceptual Visual Regression & Contrast** | Playwright Visual Snapshots + WCAG Calc |
| **High-Risk Production Migrations** | Zero-downtime database changes, massive refactors under real user traffic | **Shadow Traffic & Canary Releases** | Traffic Mirroring / Feature Flags |

---

## 3. Deep-Dive Guide to the 7 Elite Testing Pillars

### Method 1: Property-Based Invariant Fuzzing
- **The Core Problem**: Humans only think of 3 or 4 examples (`qty = 1, 2, 5`). Attackers and real-world edge cases hit `qty = 0`, `qty = -1`, `qty = 999999999`, `qty = 1.000000001`, or unicode strings.
- **The Solution**: Define **mathematical invariants** that must hold true across 10,000 pseudo-random inputs.
- **SheAura E-Commerce Invariant**:
  $$\text{Final Total} = \max(0, \text{Subtotal} - \text{Discount}) + \text{Shipping} + \text{Tax}$$
- **Template (`@fast-check/vitest` or `@fast-check/jest`)**:
  ```typescript
  import { test } from "vitest";
  import * as fc from "fast-check";
  import { calculateOrderTotals } from "../services/pricingService";

  test("INVARIANT: Order total is never negative and strictly adheres to tax & shipping rules", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            productId: fc.constantFrom("peach-blossom-blush", "scarlet-rose-lipstick", "daffodil"),
            quantity: fc.integer({ min: -5, max: 100 }), // tests negative and extreme quantities
          }),
          { minLength: 1, maxLength: 10 }
        ),
        fc.option(fc.constantFrom("AURA10", "INVALID_CODE", "", "aura10")),
        (items, promoCode) => {
          const result = calculateOrderTotals(items, promoCode ?? undefined);
          
          // Invariant 1: Total must never be negative or NaN
          if (result.total < 0 || Number.isNaN(result.total)) return false;
          
          // Invariant 2: Free shipping strictly at threshold >= ₹1,499
          const effectiveSubtotal = Math.max(0, result.subtotal - result.discount);
          if (effectiveSubtotal >= 1499 && result.shipping !== 0) return false;
          if (effectiveSubtotal < 1499 && result.shipping !== 150) return false;

          return true;
        }
      ),
      { numRuns: 1000 }
    );
  });
  ```

---

### Method 2: Concurrency & Transactional Race-Condition Testing
- **The Core Problem**: Sequential testing tests 1 customer at a time. In real production, 100 customers hit the checkout endpoint at the exact same millisecond. If the database uses simple read-then-write without atomic locks (`SELECT FOR UPDATE`), the stock oversells.
- **The Solution**: Fire concurrent asynchronous promises at the exact same millisecond and verify ACID transaction boundaries.
- **Template**:
  ```typescript
  test("RACE CONDITION: 20 concurrent customers attempting to purchase the last unit", async () => {
    const limitedProductId = "sheaura-discovery-wardrobe";
    // 1. Force stock to exactly 1
    await db.query("UPDATE products SET stock_quantity = 1 WHERE slug = $1", [limitedProductId]);

    // 2. Fire 20 simultaneous checkout requests
    const concurrentAttempts = Array.from({ length: 20 }).map((_, i) =>
      submitOrderToBackend({
        items: [{ productId: limitedProductId, quantity: 1 }],
        customer: { email: `buyer_${i}@test.com`, name: `Buyer ${i}` },
        paymentMethod: "upi"
      })
    );

    const outcomes = await Promise.allSettled(concurrentAttempts);
    const successfulPurchases = outcomes.filter(o => o.status === "fulfilled" && o.value.success);
    const rejectedOutOfStock = outcomes.filter(o => o.status === "rejected" || !o.value?.success);

    // EXACTLY 1 order must succeed; 19 must receive an out-of-stock response
    expect(successfulPurchases.length).toBe(1);
    expect(rejectedOutOfStock.length).toBe(19);
  });
  ```

---

### Method 3: Chaos & Network Degradation Testing (Mobile Simulation)
- **The Core Problem**: Customers on cellular mobile networks tap buttons multiple times when an interface freezes, lose 4G connectivity mid-flight, or experience 3,000ms latency.
- **The Solution**: Test double-submission idempotency, network interruptions, and recovery state machines.
- **Template (Playwright Network Throttling & Idempotency)**:
  ```typescript
  test("CHAOS: Double-click payment under 2,000ms slow 3G cellular network", async ({ page, context }) => {
    // 1. Emulate slow 3G network
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 2000, // 2 second delay
      downloadThroughput: (500 * 1024) / 8,
      uploadThroughput: (500 * 1024) / 8,
    });

    await page.goto("/cart");
    const payButton = page.locator("button:has-text('Complete Luxury Order')");

    // 2. Rapid double-click by impatient mobile user
    await Promise.all([
      payButton.click({ clickCount: 2, delay: 50 }),
    ]);

    // 3. Verify Idempotency: Exactly 1 order created, no duplicate billing
    await page.waitForSelector(".order-confirmed-modal");
    const orderCountInDb = await getOrdersCountForEmail("guest@sheaura.com");
    expect(orderCountInDb).toBe(1);
  });
  ```

---

### Method 4: Mutation Testing (Testing Test Quality)
- **The Core Problem**: Code coverage (e.g. 95%) is misleading. A test that executes code without asserting specific outcomes gives 100% coverage but zero bug detection.
- **The Solution**: Mutation testing automatically edits your source code (inverts conditionals, swaps operators, drops statements). If tests still pass, the mutant survived, indicating a blind spot.
- **Workflow**:
  1. Configure `stryker.config.json`.
  2. Run `npx stryker run`.
  3. Aim for a **Mutation Score > 80%**. Eliminate tests that have zero assertions.

---

### Method 5: Consumer-Driven Contract Testing
- **The Core Problem**: Frontend teams mock APIs using static JSON files. Backend teams rename a field (`customer_name` ➔ `client_name`). Both test suites pass independently in CI, but production breaks immediately upon deployment.
- **The Solution**: Enforce a single shared contract (e.g. Zod schema or Pact contract) that validates both client requests and server responses automatically.
- **Template**:
  ```typescript
  import { z } from "zod";

  export const SharedOrderContract = z.object({
    id: z.string().startsWith("ORD-"),
    client_name: z.string().min(1),
    total_amount: z.string().regex(/^₹[0-9,]+(\.[0-9]{2})?$/),
    items: z.array(z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
      unitPrice: z.number().positive(),
    })).min(1),
    status: z.enum(["pending", "processing", "dispatched", "delivered", "cancelled"]),
  });

  // Client and Server test suites both validate against SharedOrderContract
  ```

---

### Method 6: Perceptual Visual Regression & Automated Contrast Auditing
- **The Core Problem**: Unit tests verify that `<SheAuraLogo />` exists in the DOM. They do not know that the logo has `color: #ffffff` on a `#faf6ed` background, making it completely invisible to users.
- **The Solution**: Capture viewport screenshots at desktop and mobile widths, run WCAG 2.1 contrast calculations, and perform pixel-differential testing.
- **Template (Playwright Visual & Accessibility)**:
  ```typescript
  import { test, expect } from "@playwright/test";

  test("AESTHETIC INTEGRITY: Nav logo has WCAG AAA contrast ratio on ivory hero", async ({ page }) => {
    await page.goto("/");
    const logo = page.locator(".nav .brand-logo-svg");
    await expect(logo).toBeVisible();

    // 1. Pixel snapshot comparison
    await expect(page.locator(".nav")).toHaveScreenshot("hero-nav-master.png", {
      maxDiffPixelRatio: 0.01,
    });

    // 2. Computed color verification
    const logoColor = await logo.evaluate((el) => window.getComputedStyle(el).color);
    // Must be signature midnight navy #191970 (rgb(25, 25, 112)), NEVER white
    expect(logoColor).toBe("rgb(25, 25, 112)");
  });
  ```

---

### Method 7: Shadow Traffic & Production Canary Releases
- **The Core Problem**: Staging environments never replicate real-world database scale, bot traffic, or concurrent user behavior.
- **The Solution**:
  1. **Shadowing**: Mirror 5% of production traffic to the new backend silently. Compare latency and database query plans without returning responses to users.
  2. **Canary**: Deploy the new release to 2% of users. Monitor error rates via telemetry. If error rate > 0.05%, auto-rollback within 60 seconds.

---

## 4. The Response Protocol for User Testing Inquiries

When the user asks any question about testing:
1. **Identify the exact risk profile** of the scenario.
2. **Present the recommended testing method** with a clear explanation of why standard tests fail.
3. **Show the proposed test code snippet**.
4. **Close with an approval check**:
   > *"Would you like me to approve and implement this [Method Name] test suite for [Component/Endpoint]?"*
