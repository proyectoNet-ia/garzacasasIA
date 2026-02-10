import { StatsSkeleton } from "@/components/admin/AdminSkeletons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminLoading() {
    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-5 w-96" />
            </div>

            {/* Stats Grid Skeleton */}
            <StatsSkeleton />

            {/* Quick Actions Skeleton */}
            <Card className="border-zinc-200">
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 rounded-xl border border-zinc-200 space-y-3">
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Recent Activity Skeleton */}
            <Card className="border-zinc-200">
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-4 w-64" />
                </CardContent>
            </Card>
        </div>
    )
}
