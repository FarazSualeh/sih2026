"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react";

import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";
import { ConfirmationDialog } from "@/components/admin/shared/confirmation-dialog";
import { GlobalSearch } from "@/components/admin/shared/global-search";
import { NotificationPanel } from "@/components/admin/shared/notification-panel";
import { useSidebar } from "@/components/sidebar-context";

const adminProfile = {
  name: "Aarav Mehta",
  email: "aarav.mehta@skillconnect.in",
  role: "Platform Administrator",
};

export function AdminNavbar() {
  const router = useRouter();
  const { mobileOpen, setMobileOpen } = useSidebar();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setLogoutOpen(true);
    setMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-line bg-[#fbfbf8]/80 backdrop-blur supports-[backdrop-filter]:bg-[#fbfbf8]/75">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              aria-label={mobileOpen ? "Close sidebar" : "Open sidebar"}
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg border border-line bg-white p-2 text-muted transition hover:bg-[#f4f5f0] lg:hidden"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-4">
            <GlobalSearch />
            <div className="hidden min-w-0 lg:block"><AdminBreadcrumbs /></div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationPanel />

            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((current) => !current)}
                className="flex items-center gap-2 rounded-xl border border-line bg-white px-2.5 py-2 text-left shadow-sm transition hover:bg-[#f8f9f6]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e9f0e8] font-display text-sm font-bold text-ink">
                  AM
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold text-ink">{adminProfile.name}</p>
                  <p className="text-[0.65rem] text-muted">{adminProfile.role}</p>
                </div>
                <ChevronDown className={`hidden h-4 w-4 text-muted transition sm:block ${menuOpen ? "rotate-180" : ""}`} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-[calc(100%+0.7rem)] z-30 w-64 rounded-2xl border border-line bg-white p-2 shadow-[0_20px_36px_rgba(15,23,42,0.12)]">
                  <div className="flex items-center gap-3 rounded-xl bg-[#f7f8f5] px-3 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dfe9e3] font-display text-sm font-bold text-ink">
                      AM
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{adminProfile.name}</p>
                      <p className="truncate text-xs text-muted">{adminProfile.email}</p>
                    </div>
                  </div>

                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted">
                      <UserRound className="h-4 w-4" />
                      <span>{adminProfile.role}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        router.push("/admin/settings");
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-ink transition hover:bg-[#f4f5f0]"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-rose-600 transition hover:bg-rose-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <ConfirmationDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title="Log out of admin panel?"
        description="You will be returned to the login screen."
        onConfirm={() => router.push("/login")}
      />
    </>
  );
}
