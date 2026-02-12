"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, User, GitCompare, Heart } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useInteractions } from "@/providers/InteractionsProvider"
import { NAVIGATION_LINKS } from "@/constants/navigation"
import { cn } from "@/lib/utils"

interface MobileMenuProps {
    className?: string;
    triggerColor?: string;
}

export function MobileMenu({ className, triggerColor }: MobileMenuProps) {
    const { favorites } = useInteractions()

    return (
        <div className={cn("lg:hidden", className)}>
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className={`transition-colors ${triggerColor || "text-white hover:bg-white/10"}`}>
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-zinc-950 border-zinc-800 text-white w-[300px] z-[100]">
                    <SheetHeader className="mb-8">
                        <SheetTitle className="text-left text-white flex items-center gap-2">
                            <div className="border border-white/10 px-3 py-1 rounded-xl bg-white/5">
                                <span className="text-xl font-black tracking-tighter">
                                    Garza Casas <span className="text-blue-500">IA</span>
                                </span>
                            </div>
                        </SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col gap-4">
                        {NAVIGATION_LINKS.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="group flex items-center gap-3 text-lg font-medium text-zinc-400 hover:text-white hover:pl-2 transition-all p-2 rounded-lg hover:bg-white/5"
                            >
                                <link.icon className="h-5 w-5 transition-transform group-hover:scale-110 group-hover:text-blue-500" />
                                {link.label}
                            </Link>
                        ))}

                        <div className="h-px bg-zinc-800 my-4" />

                        <Link
                            href="/favoritos"
                            className="flex items-center gap-3 text-lg font-medium text-zinc-400 hover:text-red-500 hover:pl-2 transition-all p-2 rounded-lg hover:bg-white/5"
                        >
                            <Heart className={cn("h-5 w-5", favorites.length > 0 && "fill-current text-red-500")} />
                            Favoritos
                            {favorites.length > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    {favorites.length}
                                </span>
                            )}
                        </Link>

                        <Link
                            href="/comparar"
                            className="flex items-center gap-3 text-lg font-medium text-zinc-400 hover:text-blue-500 hover:pl-2 transition-all p-2 rounded-lg hover:bg-white/5"
                        >
                            <GitCompare className="h-5 w-5" />
                            Comparar
                        </Link>

                        <div className="h-px bg-zinc-800 my-4" />

                        <Link href="/dashboard" className="w-full">
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12">
                                <User className="mr-2 h-4 w-4" />
                                Entrar / Dashboard
                            </Button>
                        </Link>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}
