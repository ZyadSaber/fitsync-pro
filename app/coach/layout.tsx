import Sidebar from "@/components/layout/Sidebar";

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--paper)", overflow: "hidden" }}>
      <Sidebar role="coach" active="/coach" dir="ltr" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "auto" }}>
        {children}
      </div>
    </div>
  );
}
