// FitSync Pro — reusable design system components
// All read window.FS for tokens.

const FS = window.FS;

// ── Iconography (minimal stroke icons, no AI-slop SVGs) ─────────────────
function Icon({ name, size = 16, stroke = 1.6, color = 'currentColor', style }) {
  const s = { width: size, height: size, display: 'inline-block', flexShrink: 0, ...style };
  const p = { fill: 'none', stroke: color, strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'home':       return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="M3 11l9-8 9 8M5 9.5V21h5v-7h4v7h5V9.5"/></svg>);
    case 'users':      return (<svg viewBox="0 0 24 24" style={s}><circle {...p} cx="9" cy="8" r="4"/><path {...p} d="M2 21v-1a6 6 0 016-6h2a6 6 0 016 6v1M17 4a4 4 0 010 8M22 21v-1a5 5 0 00-4-4.9"/></svg>);
    case 'user':       return (<svg viewBox="0 0 24 24" style={s}><circle {...p} cx="12" cy="8" r="4"/><path {...p} d="M4 21v-1a6 6 0 016-6h4a6 6 0 016 6v1"/></svg>);
    case 'card':       return (<svg viewBox="0 0 24 24" style={s}><rect {...p} x="3" y="6" width="18" height="13" rx="2"/><path {...p} d="M3 10h18M7 15h4"/></svg>);
    case 'tag':        return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="M3 12V4h8l10 10-8 8L3 12z"/><circle {...p} cx="8" cy="9" r="1.2"/></svg>);
    case 'qr':         return (<svg viewBox="0 0 24 24" style={s}><rect {...p} x="3" y="3" width="7" height="7"/><rect {...p} x="14" y="3" width="7" height="7"/><rect {...p} x="3" y="14" width="7" height="7"/><path {...p} d="M14 14h3v3M21 14v7M14 21h3"/></svg>);
    case 'dumbbell':   return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="M3 9v6M6 6v12M18 6v12M21 9v6M6 12h12"/></svg>);
    case 'chart':      return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="M3 21h18M6 17v-5M11 17V8M16 17v-3M20 17V5"/></svg>);
    case 'plus':       return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="M12 5v14M5 12h14"/></svg>);
    case 'search':     return (<svg viewBox="0 0 24 24" style={s}><circle {...p} cx="11" cy="11" r="7"/><path {...p} d="M20 20l-3.5-3.5"/></svg>);
    case 'filter':     return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="M4 5h16l-6 8v6l-4 2v-8L4 5z"/></svg>);
    case 'bell':       return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="M6 8a6 6 0 0112 0c0 7 3 8 3 8H3s3-1 3-8M10 21h4"/></svg>);
    case 'arrow-up':   return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="M12 19V5M5 12l7-7 7 7"/></svg>);
    case 'arrow-down': return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="M12 5v14M5 12l7 7 7-7"/></svg>);
    case 'arrow-right':return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="M5 12h14M12 5l7 7-7 7"/></svg>);
    case 'check':      return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="M5 12l5 5L20 7"/></svg>);
    case 'flame':      return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="M12 3s5 4 5 9a5 5 0 11-10 0c0-2 1-3 1-3s0 2 2 2c0-3 2-5 2-8z"/></svg>);
    case 'whatsapp':   return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="M3 21l1.7-5A8 8 0 1119 18a8 8 0 01-8 1L3 21z"/><path {...p} d="M8.5 9.5c0 3 2 5 5 5l1-1.5-2-1-1 .5c-1 0-2-1-2-2l.5-1-1-2L8 8c0 .5.5 1 .5 1.5z"/></svg>);
    case 'logo':       return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="M4 16L9 6l3 6 3-3 5 9" stroke={color} strokeWidth="2.2"/></svg>);
    case 'more':       return (<svg viewBox="0 0 24 24" style={s}><circle cx="5" cy="12" r="1.6" fill={color}/><circle cx="12" cy="12" r="1.6" fill={color}/><circle cx="19" cy="12" r="1.6" fill={color}/></svg>);
    case 'wallet':     return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="M3 7a2 2 0 012-2h13v4M3 7v11a2 2 0 002 2h15V9H5a2 2 0 01-2-2z"/><circle {...p} cx="17" cy="14" r="1.2"/></svg>);
    case 'apple':      return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="M16 8c-1.5 0-3 1-4 1s-2.5-1-4-1c-2.5 0-4 2-4 5s2 8 4 8c1 0 1.5-1 3-1s2 1 3 1c1 0 2-1 3-3M14 4c0 1.5-1 3-2.5 3"/></svg>);
    case 'google':     return (<svg viewBox="0 0 24 24" style={s}><circle {...p} cx="12" cy="12" r="9"/><path {...p} d="M12 8v4h5c-.5 2-2 3.5-5 3.5"/></svg>);
    case 'play':       return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="M7 5l12 7-12 7V5z"/></svg>);
    default: return null;
  }
}

// ── StatusBadge ─────────────────────────────────────────────────────────
function StatusBadge({ status = 'active', children, dot = true }) {
  const labels = { active: 'Active', frozen: 'Frozen', expired: 'Expired', pending: 'Pending', gym: 'Gym only' };
  return (
    <span className={`fs-badge ${status}`}>
      {dot && <span className="dot" />}
      {children || labels[status]}
    </span>
  );
}

// ── MetricCard ──────────────────────────────────────────────────────────
function MetricCard({ label, value, trend, trendDir = 'up', sub, icon }) {
  return (
    <div className="fs-metric">
      <div className="label">{icon && <Icon name={icon} size={12} />}{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <div className="value fs-num">{value}</div>
        {trend && (
          <div className={`trend ${trendDir} fs-num`}>
            <Icon name={trendDir === 'up' ? 'arrow-up' : trendDir === 'down' ? 'arrow-down' : 'arrow-right'} size={12} />
            {trend}
          </div>
        )}
      </div>
      {sub && <div className="sub">{sub}</div>}
    </div>
  );
}

// ── Avatar (with optional role badge) ───────────────────────────────────
function Avatar({ name = '?', size = 'md', role }) {
  const cls = size === 'lg' ? 'fs-av lg' : size === 'xl' ? 'fs-av xl' : 'fs-av';
  // Generate consistent muted bg from name hash
  const colors = ['#0B0F1A', '#1E293B', '#334155', '#0F172A', '#111827'];
  const i = (name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % colors.length;
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(s => s[0]).join('').toUpperCase();
  return (
    <span className={cls} style={{ background: colors[i] }}>
      {initials}
      {role && <span className="role" style={{ background: role === 'coach' ? FS.accent : role === 'admin' ? FS.amber : FS.green }} />}
    </span>
  );
}

// ── ComplianceRing — circular progress for weekly workout completion ────
function ComplianceRing({ value = 0, size = 56, stroke = 5, label, sub }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  const color = value >= 75 ? FS.green : value >= 40 ? FS.amber : FS.red;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={FS.hairline} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
                strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset .3s' }} />
      </svg>
      {label !== false && (
        <div style={{ display: 'inline-flex', flexDirection: 'column', transform: 'translateX(-100%)', marginLeft: -size + 6, marginRight: 0, alignItems: 'center', width: size, justifyContent: 'center', textAlign: 'center' }}>
          <div className="fs-num" style={{ fontSize: size > 60 ? 16 : 13, fontWeight: 700, color: FS.text, lineHeight: 1 }}>{value}<span style={{ fontSize: 9, color: FS.muted, fontWeight: 600 }}>%</span></div>
        </div>
      )}
    </div>
  );
}

// Cleaner ring with centered label
function Ring({ value = 0, size = 56, stroke = 5 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  const color = value >= 75 ? FS.green : value >= 40 ? FS.amber : FS.red;
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-block' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={FS.hairline} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
                strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', lineHeight: 1 }}>
        <span className="fs-num" style={{ fontSize: size > 60 ? 15 : 12, fontWeight: 700, color: FS.text }}>{value}</span>
        <span style={{ fontSize: 8, color: FS.muted, fontWeight: 600, letterSpacing: '0.06em' }}>%</span>
      </div>
    </div>
  );
}

// ── ClientCard — used on coach dashboards ───────────────────────────────
function ClientCard({ name, plan, week, compliance = 0, lastSeen = '', weight = [], flag = false, online = false }) {
  // SparkLine
  const sparkW = 80, sparkH = 24;
  const min = Math.min(...weight), max = Math.max(...weight);
  const path = weight.map((v, i) => {
    const x = (i / (weight.length - 1)) * sparkW;
    const y = sparkH - ((v - min) / (max - min || 1)) * sparkH;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const trendUp = weight[weight.length - 1] > weight[0];
  return (
    <div className="fs-card" style={{ padding: 16, position: 'relative', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {flag && <span style={{ position: 'absolute', top: 12, insetInlineEnd: 12, width: 8, height: 8, borderRadius: '50%', background: FS.red }} title="3+ days inactive" />}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Avatar name={name} size="lg" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: FS.text, lineHeight: 1.2 }}>{name}</div>
          <div style={{ fontSize: 11, color: FS.muted, marginTop: 2, display: 'flex', gap: 6, alignItems: 'center' }}>
            <span>{plan}</span>{week && <><span>·</span><span>Week {week}</span></>}
          </div>
        </div>
        <Ring value={compliance} size={42} stroke={4} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${FS.hairline2}`, paddingTop: 12 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: FS.muted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Weight</div>
          <div className="fs-num" style={{ fontSize: 13, fontWeight: 600, color: FS.text, marginTop: 2 }}>
            {weight[weight.length - 1]} kg <span style={{ color: trendUp ? FS.red : FS.green, fontSize: 11 }}>{trendUp ? '↑' : '↓'} {Math.abs(weight[weight.length - 1] - weight[0]).toFixed(1)}</span>
          </div>
        </div>
        <svg width={sparkW} height={sparkH} style={{ overflow: 'visible' }}>
          <path d={path} fill="none" stroke={FS.text} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: FS.muted }}>
        <span>Last seen {lastSeen}</span>
        {online && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: FS.accent, fontWeight: 600 }}>Online client</span>}
      </div>
    </div>
  );
}

// ── MacroBar — protein / carbs / fats ───────────────────────────────────
function MacroBar({ protein = 0, carbs = 0, fats = 0, target }) {
  const total = protein + carbs + fats;
  const seg = (v) => `${(v / total) * 100}%`;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
      <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', background: FS.hairline2 }}>
        <div style={{ width: seg(protein), background: FS.accent }} />
        <div style={{ width: seg(carbs), background: '#F59E0B' }} />
        <div style={{ width: seg(fats), background: FS.text }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
        <Macro color={FS.accent} label="Protein" value={protein} />
        <Macro color="#F59E0B" label="Carbs" value={carbs} />
        <Macro color={FS.text} label="Fats" value={fats} />
      </div>
    </div>
  );
}
function Macro({ color, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 6, height: 6, borderRadius: 1, background: color }} />
      <span style={{ color: FS.muted, fontWeight: 500 }}>{label}</span>
      <span className="fs-num" style={{ fontWeight: 600, color: FS.text }}>{value}g</span>
    </div>
  );
}

// ── CheckinHeatmap — 7×N grid (calendar) ────────────────────────────────
function CheckinHeatmap({ weeks = 12, data }) {
  // data: array of N*7 values 0..3
  const cells = data || Array.from({ length: weeks * 7 }, () => Math.floor(Math.random() * 4));
  const colors = ['#EEF0F4', '#C7D2FE', '#6B85FF', FS.accent];
  return (
    <div style={{ display: 'grid', gridTemplateRows: 'repeat(7, 12px)', gridAutoFlow: 'column', gridAutoColumns: '12px', gap: 3 }}>
      {cells.map((v, i) => <div key={i} style={{ background: colors[v], borderRadius: 2 }} />)}
    </div>
  );
}

// ── SparkLine ───────────────────────────────────────────────────────────
function SparkLine({ data = [], width = 100, height = 28, color }) {
  const min = Math.min(...data), max = Math.max(...data);
  const path = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / (max - min || 1)) * height;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <path d={path} fill="none" stroke={color || FS.text} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ── ExerciseCard ────────────────────────────────────────────────────────
function ExerciseCard({ name, muscles = [], difficulty = 'Intermediate', equip }) {
  const diffColor = difficulty === 'Beginner' ? FS.green : difficulty === 'Advanced' ? FS.red : FS.amber;
  return (
    <div className="fs-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Placeholder for YouTube thumbnail — striped */}
      <div style={{ height: 110, background: `repeating-linear-gradient(135deg, ${FS.hairline2} 0 8px, ${FS.paper} 8px 16px)`, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(11,15,26,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="play" size={14} color="#fff" />
        </div>
        <span className="fs-mono" style={{ position: 'absolute', bottom: 6, left: 8, fontSize: 9, color: FS.muted }}>YT_THUMB</span>
      </div>
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: FS.text, lineHeight: 1.2 }}>{name}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {muscles.map(m => (
            <span key={m} style={{ fontSize: 10, fontWeight: 500, padding: '2px 6px', borderRadius: 3, background: FS.hairline2, color: FS.text }}>{m}</span>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: FS.muted, borderTop: `1px solid ${FS.hairline2}`, paddingTop: 8 }}>
          <span style={{ color: diffColor, fontWeight: 600 }}>{difficulty}</span>
          <span>{equip}</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  Icon, StatusBadge, MetricCard, Avatar, ComplianceRing, Ring,
  ClientCard, MacroBar, CheckinHeatmap, SparkLine, ExerciseCard,
});
