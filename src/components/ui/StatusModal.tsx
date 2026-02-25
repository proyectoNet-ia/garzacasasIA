"use client"

import React from "react"
import { CheckCircle2, AlertCircle, Trash2, Info, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type StatusModalType = 'success' | 'error' | 'warning' | 'danger' | 'info'

interface StatusModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    type: StatusModalType
    title: string
    description: string
    onConfirm?: () => void
    confirmLabel?: string
    onCancel?: () => void
    cancelLabel?: string
    loading?: boolean
    variant?: 'confirm' | 'alert'
}

export function StatusModal({
    open,
    onOpenChange,
    type,
    title,
    description,
    onConfirm,
    confirmLabel = "Aceptar",
    onCancel,
    cancelLabel = "Cancelar",
    loading = false,
    variant = 'confirm'
}: StatusModalProps) {

    const configs = {
        success: {
            icon: CheckCircle2,
            bgClass: "bg-green-50",
            iconBgClass: "bg-green-100",
            iconColorClass: "text-green-600",
            titleClass: "text-green-900",
            descClass: "text-green-700/80",
            buttonClass: "bg-green-600 hover:bg-green-700 shadow-green-200"
        },
        error: {
            icon: AlertCircle,
            bgClass: "bg-red-50",
            iconBgClass: "bg-red-100",
            iconColorClass: "text-red-600",
            titleClass: "text-red-900",
            descClass: "text-red-700/80",
            buttonClass: "bg-red-600 hover:bg-red-700 shadow-red-200"
        },
        danger: {
            icon: Trash2,
            bgClass: "bg-red-50",
            iconBgClass: "bg-red-100",
            iconColorClass: "text-red-600",
            titleClass: "text-red-900",
            descClass: "text-red-700/80",
            buttonClass: "bg-red-600 hover:bg-red-700 shadow-red-200"
        },
        warning: {
            icon: AlertCircle,
            bgClass: "bg-orange-50",
            iconBgClass: "bg-orange-100",
            iconColorClass: "text-orange-600",
            titleClass: "text-orange-900",
            descClass: "text-orange-700/80",
            buttonClass: "bg-orange-600 hover:bg-orange-700 shadow-orange-200"
        },
        info: {
            icon: Info,
            bgClass: "bg-blue-50",
            iconBgClass: "bg-blue-100",
            iconColorClass: "text-blue-600",
            titleClass: "text-blue-900",
            descClass: "text-blue-700/80",
            buttonClass: "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
        }
    }

    const config = configs[type]
    const Icon = config.icon

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[400px] border-zinc-200 p-0 overflow-hidden rounded-2xl sm:rounded-2xl shadow-2xl">
                <div className={cn("p-6 flex flex-col items-center justify-center gap-4", config.bgClass)}>
                    <div className={cn("h-14 w-14 rounded-full flex items-center justify-center animate-in zoom-in duration-300", config.iconBgClass, config.iconColorClass)}>
                        <Icon className="h-7 w-7" />
                    </div>
                    <DialogHeader className="space-y-1">
                        <DialogTitle className={cn("text-lg font-black tracking-tight text-center", config.titleClass)}>
                            {title}
                        </DialogTitle>
                        <DialogDescription className={cn("text-sm font-medium px-4 text-center", config.descClass)}>
                            {description}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6 bg-white flex flex-col gap-3">
                    {onConfirm && (
                        <Button
                            className={cn("w-full h-12 rounded-xl font-bold text-white shadow-lg transition-all hover:-translate-y-0.5", config.buttonClass)}
                            onClick={onConfirm}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : confirmLabel}
                        </Button>
                    )}

                    {variant === 'confirm' && onCancel && (
                        <Button
                            variant="ghost"
                            className="w-full h-12 rounded-xl font-bold text-zinc-500 hover:text-zinc-900 border border-transparent hover:border-zinc-100 transition-all font-bold"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            {cancelLabel}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
