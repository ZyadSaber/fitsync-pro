'use client'

import { useTransition } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Trash2 } from "lucide-react";
import useVisibility from "@/hook/useVisibility";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ActionResult } from "@/types/common"
import { toast } from "sonner";

interface DeleteDialogProps {
    deleteAction?: () => Promise<ActionResult | void> | void;
    deleteClassName?: string;
    deleteText?: string;
}

const DeleteDialog = ({
    deleteAction,
    deleteClassName,
    deleteText,
}: DeleteDialogProps) => {
    const { visible, handleClose, handleStateChange } = useVisibility()
    const [isPending, startTransition] = useTransition()
    const t = useTranslations("common")

    const submitDelete = () => {
        startTransition(async () => {
            const result = await deleteAction?.()
            if (result && !result.success) {
                toast.error(result.error || t("deleteFailed"))
                return
            }
            toast.success(t("deleteSuccess"))
            handleClose()
        })
    }

    return (
        <Dialog open={visible} onOpenChange={handleStateChange}>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        "flex items-center gap-2 w-full",
                        deleteClassName
                    )}
                >
                    <Trash2 size={14} />
                    {deleteText && <span>{deleteText}</span>}
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-hairline bg-surface">
                <div className="flex flex-col items-center gap-3 px-6 pt-8 pb-5 text-center">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-soft">
                        <Trash2 size={20} className="text-red-600" />
                    </div>
                    <DialogHeader className="gap-1" hideClose>
                        <DialogTitle className="text-[15px] font-semibold text-ink">
                            {t("delete")}
                        </DialogTitle>
                        <DialogDescription className="text-[13px] leading-snug text-muted">
                            {t("deleteDesc")}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="border-t border-hairline" />

                <DialogFooter className="flex flex-row gap-2 px-6 py-4 sm:justify-stretch">
                    <button
                        type="button"
                        className="fs-btn ghost flex-1"
                        onClick={handleClose}
                        disabled={isPending}
                    >
                        {t("cancel")}
                    </button>
                    <button
                        type="button"
                        className="fs-btn flex-1 bg-red-600 text-white border-transparent hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
                        onClick={submitDelete}
                        disabled={isPending}
                    >
                        {isPending ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <Trash2 size={14} />
                        )}
                        {isPending ? t("deleting") : t("delete")}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteDialog
