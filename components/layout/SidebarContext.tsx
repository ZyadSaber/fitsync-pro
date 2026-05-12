"use client";

import { createContext, useContext } from "react";

export const SidebarContext = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({ open: false, setOpen: () => {} });

export function useSidebar() {
  return useContext(SidebarContext);
}
