import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/page-header";
import { CouponForm } from "@/components/admin/coupon-form";

export default async function EditCouponPage({ params }: { params: { id: string } }) {
  const coupon = await prisma.coupon.findUnique({ where: { id: params.id } });
  if (!coupon) notFound();

  return (
    <div>
      <AdminPageHeader title={`Edit — ${coupon.code}`} />
      <CouponForm
        initial={{
          id: coupon.id,
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: Number(coupon.discountValue),
          maxDiscountAmount: coupon.maxDiscountAmount ? Number(coupon.maxDiscountAmount) : undefined,
          minBookingAmount: coupon.minBookingAmount ? Number(coupon.minBookingAmount) : undefined,
          startDate: coupon.startDate.toISOString().slice(0, 10),
          expiryDate: coupon.expiryDate.toISOString().slice(0, 10),
          usageLimit: coupon.usageLimit ?? undefined,
          perCustomerLimit: coupon.perCustomerLimit ?? undefined,
          isActive: coupon.isActive,
        }}
      />
    </div>
  );
}
