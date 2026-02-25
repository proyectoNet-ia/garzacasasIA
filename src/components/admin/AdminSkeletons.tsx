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

export function CMSSkeleton() {
    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-9 w-72" />
                    <Skeleton className="h-5 w-52" />
                </div>
                <Skeleton className="h-10 w-36 rounded-xl" />
            </div>
            {/* Hero Banner card */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4">
                <Skeleton className="h-6 w-56" />
                <Skeleton className="aspect-video w-full rounded-xl" />
                <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-10 rounded-lg" />
                    <Skeleton className="h-10 rounded-lg" />
                </div>
            </div>
            {/* Two column cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4">
                    <Skeleton className="h-6 w-44" />
                    <Skeleton className="h-24 w-24 rounded-xl" />
                    <Skeleton className="h-10 rounded-lg" />
                </div>
                <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4">
                    <Skeleton className="h-6 w-36" />
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-10 rounded-lg" />
                    ))}
                </div>
                <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4 lg:col-span-2">
                    <Skeleton className="h-6 w-44" />
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-10 rounded-lg" />
                        <Skeleton className="h-10 rounded-lg" />
                    </div>
                    <Skeleton className="h-20 rounded-lg" />
                </div>
            </div>
        </div>
    )
}

export function PropertyDetailSkeleton() {
    return (
        <div className="min-h-screen bg-zinc-50">
            {/* Navbar placeholder */}
            <div className="h-20 bg-white border-b border-zinc-200" />
            <main className="pt-32 pb-20 lg:pb-32">
                <div className="container mx-auto px-4 md:px-6">
                    {/* Breadcrumb */}
                    <div className="flex items-center justify-between gap-4 mb-8">
                        <Skeleton className="h-9 w-40 rounded-lg" />
                        <div className="flex gap-2">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-10 w-10 rounded-full" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Left column */}
                        <div className="lg:col-span-2 space-y-8">
                            <Skeleton className="aspect-video w-full rounded-[2.5rem]" />
                            <div className="space-y-4">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-12 w-3/4" />
                                <Skeleton className="h-10 w-40" />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[...Array(4)].map((_, i) => (
                                    <Skeleton key={i} className="h-28 rounded-[2rem]" />
                                ))}
                            </div>
                            <Skeleton className="h-48 w-full rounded-[2.5rem]" />
                        </div>
                        {/* Right column */}
                        <div className="space-y-6">
                            <Skeleton className="h-80 w-full rounded-[3rem]" />
                            <Skeleton className="h-40 w-full rounded-[3rem]" />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
