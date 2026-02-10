import { AnalyticsSkeleton } from "@/components/admin/AdminSkeletons"
import { Skeleton } from "@/components/ui/skeleton"

export default function AnalyticsLoading() {
    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-9 w-64" />
                    <Skeleton className="h-5 w-48" />
                </div>
                <div className="flex gap-4">
                    <Skeleton className="h-10 w-32 rounded-xl" />
                    <Skeleton className="h-10 w-32 rounded-xl" />
                </div>
            </div>

            <AnalyticsSkeleton />
        </div>
    )
}
