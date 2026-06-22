import { Link } from "react-router";
import Seo from "../components/Seo";
import SiteNav from "../components/SiteNav";

export default function NotFound() {
  return (
    <>
      <Seo title="Not found — FitSync Pro" description="The page you are looking for does not exist." />
      <SiteNav />
      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "96px 24px", textAlign: "center" }}>
        <h1 style={{ fontSize: 64, margin: 0, color: "var(--ink)" }}>404</h1>
        <p style={{ color: "var(--muted)", fontSize: 17 }}>This page could not be found.</p>
        <Link to="/" className="fs-btn accent" style={{ marginTop: 16 }}>Back home</Link>
      </main>
    </>
  );
}
