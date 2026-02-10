import { Skeleton } from "@/components/ui/skeleton"

export function StatsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-zinc-200 space-y-3">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-8 rounded-lg" />
                    </div>
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-3 w-40" />
                </div>
            ))}
        </div>
    )
}

export function TableSkeleton({ columns = 5, rows = 6 }) {
    return (
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-10 w-32 rounded-xl" />
            </div>
            <div className="p-0">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-zinc-100 bg-zinc-50/50">
                            {Array.from({ length: columns }).map((_, i) => (
                                <th key={i} className="px-6 py-4">
                                    <Skeleton className="h-4 w-full" />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {Array.from({ length: rows }).map((_, i) => (
                            <tr key={i}>
                                {Array.from({ length: columns }).map((_, j) => (
                                    <td key={j} className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {j === 0 && <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />}
                                            <Skeleton className="h-4 w-full" />
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export function AnalyticsSkeleton() {
    return (
        <div className="space-y-8">
            <StatsSkeleton />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 space-y-4">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-[300px] w-full" />
                </div>
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 space-y-4">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-[300px] w-full" />
                </div>
            </div>
        </div>
    )
}
