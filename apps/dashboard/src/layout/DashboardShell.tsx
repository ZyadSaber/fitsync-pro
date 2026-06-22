import { useState } from "react";
import { Outlet, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import Sidebar from "./Sidebar";
import { SidebarContext } from "./SidebarContext";
import { SECTION_ROLE, type SectionKey } from "@/constants/navigation";

// Re-exported for backwards compatibility — canonical source is @/constants/navigation.
export { ROLE_HOME } from "@/constants/navigation";

export default function DashboardShell({ section }: { section: SectionKey }) {
  const { pathname } = useLocation();
  const { i18n } = useTranslation();
  const role = SECTION_ROLE[section];
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          active={pathname}
          locale={i18n.language}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-auto">
          <Outlet />
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
