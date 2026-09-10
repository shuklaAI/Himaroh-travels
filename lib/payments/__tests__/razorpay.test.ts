import { describe, it, expect, beforeEach, vi } from "vitest";
import crypto from "crypto";

describe("verifyRazorpaySignature", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("accepts a correctly-signed payload in real (non-mock) mode", async () => {
    process.env.PAYMENTS_MOCK_MODE = "false";
    process.env.RAZORPAY_KEY_ID = "rzp_test_key";
    process.env.RAZORPAY_KEY_SECRET = "test_secret";

    const { verifyRazorpaySignature } = await import("@/lib/payments/razorpay");

    const orderId = "order_abc123";
    const paymentId = "pay_xyz789";
    const signature = crypto
      .createHmac("sha256", "test_secret")
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    expect(verifyRazorpaySignature({ orderId, paymentId, signature })).toBe(true);
  });

  it("rejects a tampered signature in real mode", async () => {
    process.env.PAYMENTS_MOCK_MODE = "false";
    process.env.RAZORPAY_KEY_ID = "rzp_test_key";
    process.env.RAZORPAY_KEY_SECRET = "test_secret";

    const { verifyRazorpaySignature } = await import("@/lib/payments/razorpay");

    expect(
      verifyRazorpaySignature({ orderId: "order_abc123", paymentId: "pay_xyz789", signature: "not_the_real_signature" })
    ).toBe(false);
  });

  it("accepts well-formed mock ids in mock mode without real HMAC", async () => {
    process.env.PAYMENTS_MOCK_MODE = "true";
    delete process.env.RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;

    const { verifyRazorpaySignature } = await import("@/lib/payments/razorpay");

    expect(
      verifyRazorpaySignature({ orderId: "mock_order_HT-2026-000123", paymentId: "mock_pay_1699999999", signature: "mock_signature" })
    ).toBe(true);
  });

  it("rejects non-mock-prefixed ids even while mock mode is on", async () => {
    process.env.PAYMENTS_MOCK_MODE = "true";

    const { verifyRazorpaySignature } = await import("@/lib/payments/razorpay");

    expect(
      verifyRazorpaySignature({ orderId: "order_real_looking", paymentId: "pay_real_looking", signature: "x" })
    ).toBe(false);
  });
});
