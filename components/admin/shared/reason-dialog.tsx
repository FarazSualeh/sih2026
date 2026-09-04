"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ReasonDialog({ open, title, description, confirmLabel = "Confirm", onOpenChange, onConfirm }: { open: boolean; title: string; description: string; confirmLabel?: string; onOpenChange: (open: boolean) => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState("");
  const submit = () => { if (!reason.trim()) return; onConfirm(reason.trim()); setReason(""); onOpenChange(false); };
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader><label className="space-y-1.5 text-sm font-medium">Reason<textarea autoFocus required value={reason} onChange={(event) => setReason(event.target.value)} className="min-h-24 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-coral" placeholder="Add a short reason..." /></label><DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={!reason.trim()} onClick={submit}>{confirmLabel}</Button></DialogFooter></DialogContent></Dialog>;
}
