import { Skeleton } from "@/components/ui/skeleton";

export default function TripDetailLoading() {
  return (
    <>
      <div className="flex min-h-[70vh] items-end bg-navy/95 px-6 pb-14 sm:px-8 lg:px-10">
        <div className="mx-auto w-full max-w-7xl space-y-4">
          <Skeleton className="h-4 w-40 bg-ivory/10" />
          <Skeleton className="h-12 w-2/3 bg-ivory/10" />
          <Skeleton className="h-4 w-48 bg-ivory/10" />
        </div>
      </div>
      <div className="section space-y-6">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </>
  );
}
