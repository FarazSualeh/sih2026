import { AlertCircle, Inbox, LoaderCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoadingState({ label = "Loading records..." }: { label?: string }) {
  return <div className="flex min-h-36 items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-white p-8 text-sm text-muted"><LoaderCircle className="h-4 w-4 animate-spin" />{label}</div>;
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="flex min-h-36 flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-white p-8 text-center"><Inbox className="h-6 w-6 text-muted" /><p className="mt-3 font-semibold text-ink">{title}</p><p className="mt-1 max-w-sm text-sm text-muted">{description}</p></div>;
}

export function NoResultsState({ onReset }: { onReset: () => void }) {
  return <div className="flex min-h-36 flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-white p-8 text-center"><Inbox className="h-6 w-6 text-muted" /><p className="mt-3 font-semibold text-ink">No matching records</p><p className="mt-1 text-sm text-muted">Try changing your search or filters.</p><Button variant="outline" size="sm" className="mt-4" onClick={onReset}>Reset filters</Button></div>;
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return <div className="flex min-h-36 flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center"><AlertCircle className="h-6 w-6 text-rose-600" /><p className="mt-3 font-semibold text-rose-900">Unable to load records</p><p className="mt-1 text-sm text-rose-700">Please retry the request.</p><Button variant="outline" size="sm" className="mt-4 border-rose-200" onClick={onRetry}><RefreshCw className="h-3.5 w-3.5" />Retry</Button></div>;
}
