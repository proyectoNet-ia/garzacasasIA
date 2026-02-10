import { TableSkeleton } from "@/components/admin/AdminSkeletons"
import { Skeleton } from "@/components/ui/skeleton"

export default function AgentsLoading() {
    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-9 w-64" />
                    <Skeleton className="h-5 w-48" />
                </div>
                <Skeleton className="h-10 w-40 rounded-xl" />
            </div>

            <div className="bg-white p-6 rounded-2xl border border-zinc-200">
                <div className="flex gap-4">
                    <Skeleton className="h-10 flex-1 rounded-xl" />
                    <Skeleton className="h-10 w-24 rounded-xl" />
                </div>
            </div>

            <TableSkeleton columns={6} rows={5} />
        </div>
    )
}
