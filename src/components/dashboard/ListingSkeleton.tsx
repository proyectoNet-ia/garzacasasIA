import { Skeleton } from "@/components/ui/skeleton"

export function ListingSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-[200px]" />
                <Skeleton className="h-10 w-[150px]" />
            </div>
            <div className="border rounded-lg overflow-hidden border-zinc-200">
                <div className="bg-zinc-50 p-4 border-b border-zinc-200 flex gap-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-4 flex-1" />
                    ))}
                </div>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="p-4 flex gap-4 border-b border-zinc-200/50">
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-3 w-[150px]" />
                        </div>
                        <Skeleton className="h-6 w-[80px]" />
                        <Skeleton className="h-6 w-[80px]" />
                        <Skeleton className="h-6 w-[100px]" />
                    </div>
                ))}
            </div>
        </div>
    )
}
