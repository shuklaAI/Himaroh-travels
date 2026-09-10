"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPaymentOrderAction, verifyPaymentAction } from "@/app/(public)/payment/actions";
import { formatINR } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function RazorpayCheckoutButton({
  bookingId,
  amountDue,
  bookingRef,
  contactName,
  contactPhone,
  contactEmail,
  mockMode,
}: {
  bookingId: string;
  amountDue: number;
  bookingRef: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  mockMode: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    setLoading(true);
    setError(null);

    const order = await createPaymentOrderAction(bookingId);
    if (!order.success) {
      setError(order.error);
      setLoading(false);
      return;
    }

    if (order.mock) {
      // Mock mode: simulate a gateway round-trip with no real network call, clearly
      // labeled in the UI so nobody mistakes this for a live payment integration.
      await new Promise((r) => setTimeout(r, 900));
      const result = await verifyPaymentAction({
        bookingId,
        razorpayOrderId: order.orderId,
        razorpayPaymentId: `mock_pay_${Date.now()}`,
        razorpaySignature: "mock_signature",
      });
      if (result.success) router.refresh();
      else setError(result.error);
      setLoading(false);
      return;
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setError("Could not load the payment gateway. Check your connection and try again.");
      setLoading(false);
      return;
    }

    const rzp = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: "Himaroh Travels",
      description: `Booking ${bookingRef}`,
      order_id: order.orderId,
      prefill: { name: contactName, contact: contactPhone, email: contactEmail },
      theme: { color: "#D6A63A" },
      handler: async (response: any) => {
        const result = await verifyPaymentAction({
          bookingId,
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });
        if (result.success) router.refresh();
        else setError(result.error);
        setLoading(false);
      },
      modal: { ondismiss: () => setLoading(false) },
    });

    rzp.on("payment.failed", () => {
      setError("Payment failed. Please try again.");
      setLoading(false);
    });

    rzp.open();
  }

  return (
    <div>
      <Button onClick={handlePay} disabled={loading} className="w-full sm:w-auto">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
        {loading ? "Processing…" : `Pay ${formatINR(amountDue)} Now`}
      </Button>
      {mockMode && (
        <p className="mt-2 text-[11px] text-navy/40">
          Test mode — payment completes automatically for demo purposes. No real charge occurs.
        </p>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
