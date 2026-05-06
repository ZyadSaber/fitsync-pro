"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";

type Role = "admin" | "coach";

function getRole(pathname: string): Role | null {
  if (pathname.includes("/admin")) return "admin";
  if (pathname.includes("/coach")) return "coach";
  return null;
}

function getActive(pathname: string): string {
  const segments = pathname.split("/");
  // strip locale prefix, reconstruct from role segment onward
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

  if (!role) return <>{children}</>;

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--paper)", overflow: "hidden" }}>
      <Sidebar role={role} active={getActive(pathname)} locale={locale} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "auto" }}>
        {children}
      </div>
    </div>
  );
}
