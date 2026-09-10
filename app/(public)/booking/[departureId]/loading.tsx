import { Skeleton } from "@/components/ui/skeleton";

export default function BookingLoading() {
  return (
    <div>
      <div className="border-b border-navy/10 bg-white py-6">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
          <Skeleton className="mb-2 h-3 w-24" />
          <Skeleton className="h-7 w-64" />
        </div>
      </div>
      <div className="section grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-12 w-48" />
        </div>
        <Skeleton className="hidden h-72 w-full rounded-2xl lg:block" />
      </div>
    </div>
  );
}
