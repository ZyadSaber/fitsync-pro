export default function Placeholder({ title }: { title: string }) {
  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ margin: "0 0 8px", fontSize: 24 }}>{title}</h1>
      <p style={{ color: "var(--muted)", fontSize: 14 }}>
        This section is not yet ported to the Vite dashboard.
      </p>
    </div>
  );
}
