import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { saveStringToFile } from "@/lib/fileUtils";
import { Download } from "lucide-react";

interface ExportPreviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialCode: string;
    suggestedFileName: string;
}

export function ExportPreviewDialog({
    open,
    onOpenChange,
    initialCode,
    suggestedFileName
}: ExportPreviewDialogProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [code, setCode] = useState(initialCode);

    // Reset code and scroll to top when dialog opens
    useEffect(() => {
        if (open) {
            setCode(initialCode);
            // Small timeout to ensure render
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.scrollTop = 0;
                }
            }, 0);
        }
    }, [open, initialCode]);

    const handleSave = async () => {
        await saveStringToFile(code, suggestedFileName);
        // Optional: close dialog upon successful save? 
        // Usually better to keep it open or let user close it to confirm it worked.
        // For now, let's keep it open so they can make more edits if they realize they made a mistake.
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="fixed z-[200] flex flex-col gap-0 w-full bg-[#0a0a0c] p-0 shadow-2xl overflow-hidden
            bottom-0 top-auto translate-y-0 left-0 right-0 translate-x-0 mx-auto
            h-[85vh] rounded-t-xl border-t border-x border-white/10
            sm:bottom-6 sm:h-[85vh] sm:max-w-4xl sm:rounded-xl sm:border">
                <div className="flex flex-col w-full h-full">
                    <DialogHeader className="px-6 pt-6">
                        <DialogTitle className="text-brand">Export Preview</DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 flex flex-col min-h-0 mt-4 relative px-6">
                        <div className="absolute inset-0 border border-white/10 rounded-md overflow-hidden">
                            <textarea
                                ref={textareaRef}
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full h-full resize-none bg-[#111] p-4 font-mono text-xs text-emerald-400 focus:outline-none custom-scrollbar leading-relaxed"
                                spellCheck={false}
                                style={{ tabSize: 4 }}
                            />
                        </div>
                    </div>

                    <DialogFooter className="px-6 pb-6 mt-6 flex justify-end gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="hover:bg-white/5 hover:text-white text-zinc-400"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            className="bg-brand hover:bg-brand/90 text-white font-bold"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Save Code
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
