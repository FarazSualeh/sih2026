"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { students } from "@/lib/mock-data/users";
import { skills } from "@/lib/mock-data/skills";
import { opportunities } from "@/lib/mock-data/opportunities";

type SearchResult = { group: string; label: string; href: string };

const results: SearchResult[] = [
  ...students.map((item) => ({ group: "Students", label: `${item.name} · ${item.email}`, href: "/admin/users" })),
  ...skills.map((item) => ({ group: "Skills", label: item.name, href: "/admin/skills" })),
  ...opportunities.map((item) => ({ group: "Opportunities", label: `${item.title} · ${item.company.name}`, href: "/admin/opportunities" })),
  { group: "Reports", label: "Quarterly Student Readiness", href: "/admin/reports" },
];

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const matches = query.trim() ? results.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())).slice(0, 8) : [];

  useEffect(() => {
    const close = (event: MouseEvent) => { if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") { event.preventDefault(); setActiveIndex((index) => Math.min(index + 1, Math.max(0, matches.length - 1))); }
    if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex((index) => Math.max(0, index - 1)); }
    if (event.key === "Escape") { setOpen(false); setQuery(""); }
    if (event.key === "Enter" && matches[activeIndex]) window.location.href = matches[activeIndex].href;
  };

  return <div ref={ref} className="relative flex min-w-0 flex-1 justify-end md:justify-center"><div className="relative flex w-full max-w-md items-center"><Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted" /><input id="admin-global-search" aria-label="Search admin records" role="combobox" aria-controls="admin-search-results" aria-expanded={open && matches.length > 0} value={query} onFocus={() => setOpen(true)} onChange={(event) => { setQuery(event.target.value); setActiveIndex(0); setOpen(true); }} onKeyDown={handleKeyDown} placeholder="Search students, skills, opportunities..." className="h-11 w-full rounded-xl border border-line bg-white pl-10 pr-9 text-sm text-ink outline-none placeholder:text-muted focus:border-coral" />{query && <button type="button" aria-label="Clear search" onClick={() => { setQuery(""); setOpen(false); }} className="absolute right-3 text-muted hover:text-ink"><X className="h-4 w-4" /></button>}</div>{open && query && <div id="admin-search-results" role="listbox" className="absolute left-0 top-14 z-30 w-full max-w-md rounded-2xl border border-line bg-white p-2 shadow-xl">{matches.length ? matches.map((item, index) => <Link role="option" aria-selected={index === activeIndex} key={`${item.group}-${item.label}`} href={item.href} onClick={() => setOpen(false)} className={`block rounded-xl px-3 py-2 text-sm text-ink ${index === activeIndex ? "bg-slate-50" : "hover:bg-slate-50"}`}><span className="mr-2 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-muted">{item.group}</span>{item.label}</Link>) : <p className="p-3 text-sm text-muted">No search results</p>}</div>}</div>;
}
