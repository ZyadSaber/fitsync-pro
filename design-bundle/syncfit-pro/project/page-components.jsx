// FitSync Pro — screens
// Each screen is a self-contained React component sized for its artboard.

const FS = window.FS;
const { Icon, StatusBadge, MetricCard, Avatar, Ring, ClientCard, MacroBar, CheckinHeatmap, SparkLine, ExerciseCard } = window;

// ─────────────────────────────────────────────────────────────────────────
// COMPONENT LIBRARY PAGE
// ─────────────────────────────────────────────────────────────────────────
function ComponentLibrary() {
  return (
    <div className="fs" style={{ width: '100%', height: '100%', background: FS.paper, padding: '40px 48px', overflow: 'auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 36 }}>
        <div className="fs-eyebrow">FitSync Pro · Design System v1</div>
        <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>Component library</h1>
        <p style={{ fontSize: 14, color: FS.muted, maxWidth: 560, margin: 0 }}>
          Five primitives — StatusBadge, MetricCard, ClientCard, ComplianceRing, MacroBar — plus support utilities.
          Every screen below this page is composed from these.
        </p>
      </div>

      {/* StatusBadge */}
      <Section eyebrow="01 / Status badge" title="StatusBadge"
               note="Used for membership state. Five semantic variants. Always pairs a colored dot + label so it remains legible if printed in greyscale.">
        <StateGrid columns={5} rows={['Default']}>
          {[<StatusBadge status="active" />,
            <StatusBadge status="frozen" />,
            <StatusBadge status="expired" />,
            <StatusBadge status="pending" />,
            <StatusBadge status="gym" />]}
        </StateGrid>
      </Section>

      {/* MetricCard */}
      <Section eyebrow="02 / Metric card" title="MetricCard"
               note="Top-of-dashboard KPIs. Label · value · trend pill · optional sub-line. Loading skeleton replaces the value with a 32px high pulse bar.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <MetricCard label="Active members" value="847" trend="+24" trendDir="up" sub="vs last month" />
          <MetricCard label="Revenue (May)" value="284,500" trend="+12%" trendDir="up" sub="EGP" />
          <MetricCard label="Expiring this week" value="18" trend="−4" trendDir="down" sub="renewal needed" />
          <SkeletonMetric />
        </div>
      </Section>

      {/* ComplianceRing */}
      <Section eyebrow="03 / Compliance ring" title="ComplianceRing"
               note="Weekly workout completion. Color shifts with value: green ≥75, amber ≥40, red below.">
        <StateGrid columns={5} rows={['Sizes / values']}>
          {[<Ring value={92} size={64} stroke={6} />,
            <Ring value={68} size={64} stroke={6} />,
            <Ring value={32} size={64} stroke={6} />,
            <Ring value={0}  size={64} stroke={6} />,
            <Ring value={100} size={64} stroke={6} />]}
        </StateGrid>
      </Section>

      {/* ClientCard */}
      <Section eyebrow="04 / Client card" title="ClientCard"
               note="Coach dashboard primitive. Avatar · name · plan · compliance ring · weight sparkline · last seen. Red dot top-right if 3+ days inactive.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <ClientCard name="Ahmed Hassan"  plan="Hypertrophy 12W" week={4} compliance={86}
                      lastSeen="today, 6:42 AM"  weight={[82.4, 82.1, 81.8, 81.2, 80.9, 80.5, 80.1]} />
          <ClientCard name="Sara Mohamed"   plan="Fat-loss 8W"   week={2} compliance={45}
                      lastSeen="2 days ago"  weight={[68.1, 68.0, 67.8, 67.6, 67.5, 67.4, 67.3]} online />
          <ClientCard name="Omar El-Sayed"  plan="Strength"      week={6} compliance={18}
                      lastSeen="5 days ago"  weight={[78.2, 78.4, 78.5, 78.7, 79.0, 79.2, 79.4]} flag />
        </div>
      </Section>

      {/* MacroBar */}
      <Section eyebrow="05 / Macro bar" title="MacroBar"
               note="Single-row protein / carbs / fats split. Inline legend with gram values; widths sum to 100%.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 520 }}>
          <MacroBar protein={180} carbs={240} fats={70} />
          <MacroBar protein={120} carbs={180} fats={55} />
          <MacroBar protein={0}   carbs={0}   fats={0} />
        </div>
      </Section>

      {/* Buttons + states */}
      <Section eyebrow="06 / Buttons" title="Button states"
               note="Three intents: primary (ink), accent (CTA), ghost (secondary). All five interaction states.">
        <StateGrid columns={5} rows={['Primary', 'Accent', 'Ghost']}>
          {/* primary */}
          {['default', 'hover', 'active', 'disabled', 'loading'].map(s => (
            <BtnDemo key={'p'+s} variant="primary" state={s} />
          ))}
          {['default', 'hover', 'active', 'disabled', 'loading'].map(s => (
            <BtnDemo key={'a'+s} variant="accent" state={s} />
          ))}
          {['default', 'hover', 'active', 'disabled', 'loading'].map(s => (
            <BtnDemo key={'g'+s} variant="ghost" state={s} />
          ))}
        </StateGrid>
      </Section>

      {/* Color tokens */}
      <Section eyebrow="07 / Tokens" title="Color tokens">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
          {[['Ink',FS.ink],['Paper',FS.paper],['Surface',FS.surface],['Hairline',FS.hairline],['Muted',FS.muted],['Accent',FS.accent],
            ['Green',FS.green],['Amber',FS.amber],['Red',FS.red],['Slate',FS.slate],['WhatsApp',FS.whatsapp],['Text',FS.text]].map(([n,v]) => (
            <div key={n} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ height: 56, borderRadius: 6, background: v, border: `1px solid ${FS.hairline}` }} />
              <div style={{ fontSize: 11, fontWeight: 600 }}>{n}</div>
              <div className="fs-mono" style={{ fontSize: 10, color: FS.muted }}>{v}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Type */}
      <Section eyebrow="08 / Type" title="Typography pairing"
               note="Inter for Latin, Cairo for Arabic. Weights: 700 / 600 headings, 500 labels, 400 body. Tabular numerals throughout dashboards.">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          <div>
            <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1 }}>FitSync Pro</div>
            <div style={{ fontSize: 32, fontWeight: 600, marginTop: 18 }}>Heading · 32 / 600</div>
            <div style={{ fontSize: 18, fontWeight: 500, marginTop: 12 }}>Section label · 18 / 500</div>
            <div style={{ fontSize: 14, fontWeight: 400, color: FS.muted, marginTop: 8, maxWidth: 380, lineHeight: 1.5 }}>Body 14 / 400. Used for table cells, descriptions, secondary copy throughout the admin and coach portals.</div>
          </div>
          <div dir="rtl" style={{ fontFamily: FS.fAr }}>
            <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>فِت‑سِنك برو</div>
            <div style={{ fontSize: 32, fontWeight: 600, marginTop: 18 }}>عنوان · 32 / 600</div>
            <div style={{ fontSize: 18, fontWeight: 500, marginTop: 12 }}>تسمية القسم · 18 / 500</div>
            <div style={{ fontSize: 14, fontWeight: 400, color: FS.muted, marginTop: 8, maxWidth: 380, lineHeight: 1.6 }}>نص أساسي ١٤ / ٤٠٠. يُستخدم في خلايا الجداول والأوصاف والنسخ الثانوية في بوابتَي المسؤول والمدرّب.</div>
          </div>
        </div>
      </Section>

      <div style={{ marginTop: 40, paddingTop: 24, borderTop: `1px solid ${FS.hairline}`, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: FS.muted }}>
        <span className="fs-mono">fitsync.design-system / v1.0 / 04 May 2026</span>
        <span>WhatsApp <Icon name="whatsapp" size={11} color={FS.whatsapp} /> indicates messaging touch-points throughout the product.</span>
      </div>
    </div>
  );
}

function Section({ eyebrow, title, note, children }) {
  return (
    <section style={{ marginBottom: 44, paddingBottom: 32, borderBottom: `1px solid ${FS.hairline}` }}>
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32, alignItems: 'flex-start' }}>
        <div>
          <div className="fs-eyebrow" style={{ marginBottom: 6 }}>{eyebrow}</div>
          <h2 style={{ fontSize: 22, fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>{title}</h2>
          {note && <p style={{ fontSize: 12, color: FS.muted, marginTop: 8, lineHeight: 1.5 }}>{note}</p>}
        </div>
        <div>{children}</div>
      </div>
    </section>
  );
}

function StateGrid({ columns = 5, rows = [], children }) {
  const items = React.Children.toArray(children);
  const labels = ['Default', 'Hover', 'Active', 'Disabled', 'Loading'].slice(0, columns);
  const perRow = columns;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `100px repeat(${columns}, 1fr)`, gap: 8, alignItems: 'center' }}>
      <div />
      {labels.map(l => <div key={l} className="fs-eyebrow" style={{ fontSize: 9 }}>{l}</div>)}
      {rows.map((r, ri) => (
        <React.Fragment key={r}>
          <div style={{ fontSize: 12, fontWeight: 500, color: FS.muted }}>{r}</div>
          {Array.from({ length: perRow }).map((_, ci) => (
            <div key={ci} style={{ padding: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
              {items[ri * perRow + ci]}
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}

function SkeletonMetric() {
  return (
    <div className="fs-metric">
      <div className="label">Loading state</div>
      <div style={{ height: 32, width: '70%', borderRadius: 4, background: `linear-gradient(90deg, ${FS.hairline2}, ${FS.hairline}, ${FS.hairline2})`, backgroundSize: '200% 100%', animation: 'fs-pulse 1.4s linear infinite' }} />
      <div style={{ height: 12, width: '40%', borderRadius: 3, background: FS.hairline2 }} />
      <style>{`@keyframes fs-pulse { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
    </div>
  );
}

function BtnDemo({ variant, state }) {
  const isLoading = state === 'loading';
  const isDisabled = state === 'disabled';
  const isHover = state === 'hover';
  const isActive = state === 'active';
  const base = {
    primary: { bg: FS.ink,   color: '#fff', border: 'transparent' },
    accent:  { bg: FS.accent, color: '#fff', border: 'transparent' },
    ghost:   { bg: 'transparent', color: FS.text, border: FS.hairline },
  }[variant];
  let bg = base.bg;
  if (variant === 'primary'  && isHover)  bg = '#000';
  if (variant === 'accent'   && isHover)  bg = '#1F47E0';
  if (variant === 'ghost'    && isHover)  bg = FS.paper;
  if (variant === 'primary'  && isActive) bg = '#1F2937';
  if (variant === 'accent'   && isActive) bg = '#1A3CC9';
  if (variant === 'ghost'    && isActive) bg = FS.hairline2;
  return (
    <button disabled={isDisabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        height: 36, padding: '0 14px', borderRadius: 6,
        fontSize: 13, fontWeight: 600,
        background: bg, color: base.color,
        border: `1px solid ${base.border === 'transparent' ? 'transparent' : base.border}`,
        opacity: isDisabled ? 0.45 : 1,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        boxShadow: isActive ? 'inset 0 1px 2px rgba(0,0,0,0.18)' : 'none',
      }}>
      {isLoading && <Spinner color={base.color} />}
      {!isLoading && variant === 'accent' && <Icon name="plus" size={13} color="#fff" />}
      {isLoading ? 'Loading' : 'Add member'}
    </button>
  );
}
function Spinner({ color = '#fff' }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeOpacity="0.25" strokeWidth="3" />
      <path d="M12 3a9 9 0 019 9" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.9s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

window.ComponentLibrary = ComponentLibrary;
