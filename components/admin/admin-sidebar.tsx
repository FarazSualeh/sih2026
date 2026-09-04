"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { useState } from "react";

import { ConfirmationDialog } from "@/components/admin/shared/confirmation-dialog";
import { useSidebar } from "@/components/sidebar-context";
import { sidebarItems } from "@/lib/mock-data/admin-dashboard";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { collapsed, mobileOpen, setMobileOpen, toggleCollapsed } = useSidebar();
  const [logoutOpen, setLogoutOpen] = useState(false);

  return (
    <>
      {mobileOpen && (
        <button
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-line bg-[#fbfbf8] transition-all duration-300
          ${collapsed ? "w-[72px]" : "w-[260px]"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="flex items-center border-b border-line px-4 py-5 shrink-0 gap-2">
          {collapsed ? (
            <>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-coral text-sm font-bold text-white">
                SC
              </div>
              <button
                type="button"
                aria-label="Expand sidebar"
                className="ml-auto rounded-lg border border-line bg-white p-2 text-muted transition hover:bg-[#f5f5f2]"
                onClick={toggleCollapsed}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-coral text-sm font-bold text-white">
                SC
              </div>
              <p className="flex-1 font-display text-lg font-semibold tracking-[-0.04em] text-ink truncate">
                SkillConnect
              </p>
              <button
                type="button"
                aria-label="Collapse sidebar"
                className="rounded-lg border border-line bg-white p-2 text-muted transition hover:bg-[#f5f5f2]"
                onClick={toggleCollapsed}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto space-y-1 px-3 py-4">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.title}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.title : undefined}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition
                  ${collapsed ? "justify-center" : ""}
                  ${isActive
                    ? "bg-coral text-white shadow-[0_10px_18px_rgba(228,98,78,0.18)]"
                    : "text-muted hover:bg-[#eef0ea] hover:text-ink"
                  }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.title}</span>}
                {!collapsed && item.badge && (
                  <span
                    className={`ml-auto rounded-full px-2 py-0.5 text-[0.62rem] ${
                      isActive ? "bg-white/20 text-white" : "bg-[#eaece7] text-muted"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-line px-3 py-4 shrink-0">
          <button
            onClick={() => setLogoutOpen(true)}
            title={collapsed ? "Logout" : undefined}
            className={`flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-rose-50 hover:text-rose-600
              ${collapsed ? "justify-center" : "gap-3"}`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

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
