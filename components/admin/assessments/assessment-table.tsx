"use client";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AssessmentStatusBadge } from "@/components/admin/assessments/assessment-status-badge";
import { CompletionProgress } from "@/components/admin/assessments/completion-progress";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Assessment } from "@/lib/mock-data/assessments";

function ActionMenu({ item, onEdit, onDelete, onArchive }: { item: Assessment; onEdit: () => void; onDelete: () => void; onArchive: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Actions for ${item.title}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 w-36 rounded-xl border border-line bg-white p-1 shadow-lg">
          <button
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-ink hover:bg-slate-50"
            onClick={() => { setOpen(false); onEdit(); }}
          >
            <Pencil className="h-3.5 w-3.5 text-indigo-500" /> Edit
          </button>
          <button
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-amber-700 hover:bg-amber-50"
            onClick={() => { setOpen(false); onArchive(); }}
          >
            Archive
          </button>
          <button
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50"
            onClick={() => { setOpen(false); onDelete(); }}
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

export function AssessmentTable({
  assessments,
  onView,
  onEdit,
  onAction,
}: {
  assessments: Assessment[];
  onView: (item: Assessment) => void;
  onEdit: (item: Assessment) => void;
  onAction: (item: Assessment, action: string) => void;
}) {
  return (
    <Table>
      <TableHeader className="sticky top-0 z-10 bg-white">
        <TableRow>
          <TableHead>Assessment name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Skill</TableHead>
          <TableHead>Difficulty</TableHead>
          <TableHead>Questions</TableHead>
          <TableHead>Participants</TableHead>
          <TableHead>Completion</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assessments.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <button
                onClick={() => onView(item)}
                className="max-w-48 text-left font-semibold text-indigo-700 hover:underline"
              >
                {item.title}
              </button>
            </TableCell>
            <TableCell className="text-xs text-muted">{item.category}</TableCell>
            <TableCell className="text-xs">{item.skill}</TableCell>
            <TableCell><AssessmentStatusBadge status={item.difficulty} /></TableCell>
            <TableCell>{item.questions}</TableCell>
            <TableCell>{item.participants.toLocaleString()}</TableCell>
            <TableCell><CompletionProgress value={item.completionRate} /></TableCell>
            <TableCell><AssessmentStatusBadge status={item.status} /></TableCell>
            <TableCell>
              <ActionMenu
                item={item}
                onEdit={() => onEdit(item)}
                onDelete={() => onAction(item, "Delete")}
                onArchive={() => onAction(item, "Archive")}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
