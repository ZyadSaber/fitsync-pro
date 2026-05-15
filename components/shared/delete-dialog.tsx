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
import { Trash2 } from "lucide-react";
import useVisibility from "@/hook/useVisibility";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface DeleteDialogProps {
    deleteAction?: () => Promise<void> | void;
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
            await deleteAction?.()
            handleClose()
        })
    }

    return (
        <Dialog open={visible} onOpenChange={handleStateChange}>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        "flex items-center gap-2 text-red-600 w-full",
                        deleteClassName
                    )}
                >
                    <Trash2 size={14} />
                    {deleteText && <span>{deleteText}</span>}
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("delete")}</DialogTitle>
                    <DialogDescription>
                        {t("deleteDesc")}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isPending}
                    >
                        {t("cancel")}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={submitDelete}
                        disabled={isPending}
                    >
                        {t("delete")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteDialog
