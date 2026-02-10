import { Skeleton } from "@/components/ui/skeleton"

export function PropertyCardSkeleton() {
    return (
        <div className="bg-white rounded-3xl overflow-hidden border border-zinc-200 animate-in fade-in duration-500">
            <Skeleton className="aspect-[4/3] w-full" />
            <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-6 w-12 rounded-full" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-7 w-24" />
                    <div className="flex gap-2">
                        <Skeleton className="h-4 w-10" />
                        <Skeleton className="h-4 w-10" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export function PropertyGridSkeleton({ count = 6 }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: count }).map((_, i) => (
                <PropertyCardSkeleton key={i} />
            ))}
        </div>
    )
}
