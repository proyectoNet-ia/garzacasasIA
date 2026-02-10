import { PropertyGridSkeleton } from "@/components/marketing/PropertySkeletons"
import { Navbar } from "@/components/layout/Navbar"
import { Skeleton } from "@/components/ui/skeleton"

export default function PropertiesLoading() {
    return (
        <div className="min-h-screen bg-zinc-50">
            <Navbar />
            <main className="pt-20">
                <div className="bg-zinc-100 py-20 px-4 text-center space-y-4">
                    <Skeleton className="h-12 w-96 mx-auto rounded-xl" />
                    <Skeleton className="h-5 w-[500px] mx-auto" />
                </div>
                <div className="container mx-auto px-4 py-12">
                    <PropertyGridSkeleton count={6} />
                </div>
            </main>
        </div>
    )
}
