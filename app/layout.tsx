import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FitSync Pro",
  description: "Egypt-first gym management & online coaching platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
