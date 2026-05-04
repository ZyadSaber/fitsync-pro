// FitSync Pro — design tokens
// Athletic + serious. Nike Training Club × fintech dashboard.

window.FS = {
  // Surfaces
  ink: '#0B0F1A',          // near-black with cool cast
  ink2: '#161B26',         // raised cards on dark
  paper: '#FAFAF7',        // off-white page bg
  surface: '#FFFFFF',      // card surface
  hairline: '#E5E7EB',     // 1px borders
  hairline2: '#EEF0F4',
  muted: '#6B7280',        // secondary text
  muted2: '#9AA1AE',
  text: '#0B0F1A',

  // Accent (electric blue per question)
  accent: '#2D5BFF',
  accentInk: '#FFFFFF',
  accentSoft: '#EAF0FF',

  // Status
  green: '#16A34A',
  greenSoft: '#E8F6EE',
  amber: '#D97706',
  amberSoft: '#FBF1E0',
  red: '#DC2626',
  redSoft: '#FCEAEA',
  slate: '#475569',
  slateSoft: '#EEF1F4',

  // WhatsApp
  whatsapp: '#25D366',

  // Type
  fSans: '"Inter", "Helvetica Neue", Helvetica, Arial, sans-serif',
  fAr:   '"Cairo", "Tajawal", "Inter", system-ui, sans-serif',
  fMono: '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace',
};

// One global stylesheet for all FS-prefixed classes used inside artboards.
if (!document.getElementById('fs-styles')) {
  const FS = window.FS;
  const s = document.createElement('style');
  s.id = 'fs-styles';
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Cairo:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

    .fs { font-family: ${FS.fSans}; color: ${FS.text}; -webkit-font-smoothing: antialiased; font-feature-settings: "ss01","cv11"; }
    .fs *, .fs *::before, .fs *::after { box-sizing: border-box; }
    .fs[dir="rtl"] { font-family: ${FS.fAr}; }

    .fs-num { font-variant-numeric: tabular-nums; letter-spacing: -0.01em; }
    .fs-mono { font-family: ${FS.fMono}; }
    .fs-eyebrow { font-size: 10px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: ${FS.muted}; }

    /* ── StatusBadge ─────────────────────────────────────── */
    .fs-badge { display:inline-flex; align-items:center; gap:6px; height:22px; padding:0 8px; border-radius:4px; font-size:11px; font-weight:600; letter-spacing:0.02em; line-height:1; white-space:nowrap; }
    .fs-badge .dot { width:6px; height:6px; border-radius:50%; }
    .fs-badge.active   { background:${FS.greenSoft}; color:${FS.green}; }
    .fs-badge.active   .dot { background:${FS.green}; }
    .fs-badge.frozen   { background:${FS.slateSoft}; color:${FS.slate}; }
    .fs-badge.frozen   .dot { background:${FS.slate}; }
    .fs-badge.expired  { background:${FS.redSoft}; color:${FS.red}; }
    .fs-badge.expired  .dot { background:${FS.red}; }
    .fs-badge.pending  { background:${FS.amberSoft}; color:${FS.amber}; }
    .fs-badge.pending  .dot { background:${FS.amber}; }
    .fs-badge.gym      { background:${FS.accentSoft}; color:${FS.accent}; }
    .fs-badge.gym      .dot { background:${FS.accent}; }

    /* ── MetricCard ──────────────────────────────────────── */
    .fs-metric { background:${FS.surface}; border:1px solid ${FS.hairline}; border-radius:8px; padding:18px 20px; display:flex; flex-direction:column; gap:8px; min-height:108px; }
    .fs-metric .label { font-size:11px; font-weight:600; color:${FS.muted}; letter-spacing:0.08em; text-transform:uppercase; display:flex; align-items:center; gap:6px; }
    .fs-metric .value { font-size:32px; font-weight:700; letter-spacing:-0.02em; color:${FS.text}; line-height:1.05; }
    .fs-metric .trend { display:inline-flex; align-items:center; gap:4px; font-size:12px; font-weight:600; }
    .fs-metric .trend.up { color:${FS.green}; }
    .fs-metric .trend.down { color:${FS.red}; }
    .fs-metric .trend.flat { color:${FS.muted}; }
    .fs-metric .sub { font-size:12px; color:${FS.muted}; }

    /* ── Buttons ─────────────────────────────────────────── */
    .fs-btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; height:36px; padding:0 14px; border-radius:6px; font-size:13px; font-weight:600; cursor:pointer; border:1px solid transparent; transition: background .12s, border-color .12s, color .12s; white-space:nowrap; }
    .fs-btn.primary { background:${FS.ink}; color:#fff; }
    .fs-btn.primary:hover { background:#000; }
    .fs-btn.accent  { background:${FS.accent}; color:#fff; }
    .fs-btn.accent:hover  { background:#1F47E0; }
    .fs-btn.ghost   { background:transparent; border-color:${FS.hairline}; color:${FS.text}; }
    .fs-btn.ghost:hover   { background:${FS.paper}; }
    .fs-btn.sm { height:30px; padding:0 10px; font-size:12px; }

    /* ── Input ───────────────────────────────────────────── */
    .fs-input { height:36px; border:1px solid ${FS.hairline}; border-radius:6px; padding:0 12px; font-size:13px; background:#fff; color:${FS.text}; outline:none; }
    .fs-input:focus { border-color:${FS.accent}; box-shadow:0 0 0 3px ${FS.accentSoft}; }

    /* ── Sidebar nav item ───────────────────────────────── */
    .fs-nav { display:flex; align-items:center; gap:10px; height:34px; padding:0 12px; border-radius:6px; font-size:13px; font-weight:500; color:#C7CDD9; cursor:pointer; }
    .fs-nav:hover { background:rgba(255,255,255,0.04); color:#fff; }
    .fs-nav.active { background:rgba(255,255,255,0.08); color:#fff; }
    .fs-nav .ico { width:16px; height:16px; opacity:0.85; }

    /* ── Table ───────────────────────────────────────────── */
    .fs-th { font-size:11px; font-weight:600; color:${FS.muted}; letter-spacing:0.06em; text-transform:uppercase; text-align:left; padding:10px 16px; border-bottom:1px solid ${FS.hairline}; background:#FBFBFA; }
    .fs-td { padding:14px 16px; font-size:13px; color:${FS.text}; border-bottom:1px solid ${FS.hairline2}; vertical-align:middle; }
    .fs-tr:hover .fs-td { background:#FBFBFA; }

    /* ── Avatar ──────────────────────────────────────────── */
    .fs-av { display:inline-flex; align-items:center; justify-content:center; width:32px; height:32px; border-radius:50%; background:${FS.ink}; color:#fff; font-weight:600; font-size:12px; letter-spacing:0.02em; flex-shrink:0; position:relative; }
    .fs-av.lg { width:44px; height:44px; font-size:14px; }
    .fs-av.xl { width:64px; height:64px; font-size:18px; }
    .fs-av .role { position:absolute; bottom:-2px; right:-2px; width:14px; height:14px; border-radius:50%; border:2px solid #fff; background:${FS.accent}; }

    /* ── Card ────────────────────────────────────────────── */
    .fs-card { background:${FS.surface}; border:1px solid ${FS.hairline}; border-radius:8px; }
    .fs-card.pad { padding:20px; }
  `;
  document.head.appendChild(s);
}
