"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { SidebarContext } from "@/components/layout/SidebarContext";

type Role = "admin" | "coach";

function getRole(pathname: string): Role | null {
  if (pathname.includes("/admin")) return "admin";
  if (pathname.includes("/coach")) return "coach";
  return null;
}

function getActive(pathname: string): string {
  const segments = pathname.split("/");
  const roleIndex = segments.findIndex((s) => s === "admin" || s === "coach");
  if (roleIndex === -1) return pathname;
  return "/" + segments.slice(roleIndex).join("/");
}

export default function AppShell({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  const pathname = usePathname();
  const role = getRole(pathname);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!role) return <>{children}</>;

  return (
    <SidebarContext.Provider value={{ open: sidebarOpen, setOpen: setSidebarOpen }}>
      <div className="flex h-dvh bg-[var(--paper)] overflow-hidden">
        {/* Backdrop — mobile/tablet only */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <Sidebar
          role={role}
          active={getActive(pathname)}
          locale={locale}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-auto">
          {children}
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
