import Razorpay from "razorpay";
import crypto from "crypto";

const KEY_ID = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

/**
 * Mock mode is on if PAYMENTS_MOCK_MODE=true is set explicitly, OR if real
 * Razorpay credentials simply aren't present (e.g. local development).
 * This lets the entire booking → payment → confirmation flow be exercised
 * end-to-end without a live payment gateway, per Section 11.
 */
export function isMockPaymentMode(): boolean {
  return process.env.PAYMENTS_MOCK_MODE === "true" || !KEY_ID || !KEY_SECRET;
}

let client: Razorpay | null = null;
function getClient(): Razorpay {
  if (!KEY_ID || !KEY_SECRET) {
    throw new Error("Razorpay credentials are not configured");
  }
  if (!client) client = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });
  return client;
}

export type RazorpayOrderResult = {
  orderId: string;
  amount: number; // paise
  currency: string;
  keyId: string | null; // null in mock mode — client never opens a real checkout
};

export async function createRazorpayOrder(params: {
  amountRupees: number;
  receipt: string;
}): Promise<RazorpayOrderResult> {
  const amountPaise = Math.round(params.amountRupees * 100);

  if (isMockPaymentMode()) {
    // Deterministic, clearly-labeled mock order — never touches the real Razorpay API.
    return {
      orderId: `mock_order_${params.receipt}_${Date.now()}`,
      amount: amountPaise,
      currency: "INR",
      keyId: null,
    };
  }

  const order = await getClient().orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt: params.receipt,
  });

  return { orderId: order.id, amount: Number(order.amount), currency: order.currency, keyId: KEY_ID! };
}

/** Verifies the checkout.js success callback signature (order_id|payment_id, HMAC-SHA256). */
export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (isMockPaymentMode()) {
    // Mock payments are internally generated (see checkout button), never user-supplied,
    // so we just check they carry our mock prefixes rather than doing real HMAC verification.
    return params.orderId.startsWith("mock_order_") && params.paymentId.startsWith("mock_pay_");
  }
  if (!KEY_SECRET) return false;
  const expected = crypto
    .createHmac("sha256", KEY_SECRET)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");
  return expected === params.signature;
}

/** Verifies an inbound Razorpay webhook payload against RAZORPAY_WEBHOOK_SECRET. */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return expected === signature;
}
