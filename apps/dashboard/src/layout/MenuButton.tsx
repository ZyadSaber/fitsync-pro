"use client";

import { useSidebar } from "./SidebarContext";

export default function MenuButton() {
  const { setOpen } = useSidebar();
  return (
    <button
      onClick={() => setOpen(true)}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--hairline)] bg-white lg:hidden"
      aria-label="Open menu"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="3"    width="14" height="1.5" rx="0.75" fill="var(--ink)" />
        <rect x="1" y="7.25" width="14" height="1.5" rx="0.75" fill="var(--ink)" />
        <rect x="1" y="11.5" width="14" height="1.5" rx="0.75" fill="var(--ink)" />
      </svg>
    </button>
  );
}
