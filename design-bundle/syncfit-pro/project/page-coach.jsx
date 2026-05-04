// FitSync Pro — Coach desktop screens

const FS = window.FS;
const { Icon, StatusBadge, MetricCard, Avatar, Ring, ClientCard, ExerciseCard, Sidebar, Topbar } = window;

// ─────────────────────────────────────────────────────────────────────────
// Coach Dashboard (desktop) — with empty state variant
// ─────────────────────────────────────────────────────────────────────────
function CoachDashboard({ empty = false }) {
  const clients = [
    { name: 'Ahmed Hassan',     plan: 'Hypertrophy 12W', week: 4, compliance: 86, lastSeen: 'today, 6:42 AM',  weight: [82.4, 82.1, 81.8, 81.2, 80.9, 80.5, 80.1] },
    { name: 'Sara Mohamed',     plan: 'Fat-loss 8W',     week: 2, compliance: 45, lastSeen: '2 days ago',      weight: [68.1, 68.0, 67.8, 67.6, 67.5, 67.4, 67.3], online: true },
    { name: 'Omar El-Sayed',    plan: 'Strength 10W',    week: 6, compliance: 18, lastSeen: '5 days ago',      weight: [78.2, 78.4, 78.5, 78.7, 79.0, 79.2, 79.4], flag: true },
    { name: 'Layla Abdullah',   plan: 'Hypertrophy 12W', week: 8, compliance: 92, lastSeen: 'today, 5:10 PM',  weight: [62.4, 62.6, 62.8, 63.0, 63.2, 63.4, 63.6] },
    { name: 'Mahmoud Farouk',   plan: 'Cut 6W',          week: 3, compliance: 71, lastSeen: 'yesterday',       weight: [88.0, 87.6, 87.4, 87.0, 86.8, 86.5, 86.2], online: true },
    { name: 'Mariam Adel',      plan: 'Recomp 16W',      week: 11, compliance: 64, lastSeen: 'today, 7:30 AM', weight: [70.0, 69.8, 69.6, 69.5, 69.3, 69.2, 69.0] },
    { name: 'Karim Mansour',    plan: 'Strength 10W',    week: 5, compliance: 80, lastSeen: 'today, 6:00 AM',  weight: [85.0, 85.2, 85.4, 85.6, 85.8, 86.0, 86.2] },
    { name: 'Hoda El-Sayed',    plan: 'Mobility 4W',     week: 1, compliance: 100, lastSeen: 'today, 8:00 AM', weight: [58.0, 57.9, 57.8, 57.8, 57.7, 57.7, 57.6] },
  ];

  const [tab, setTab] = React.useState('all');

  return (
    <div className="fs" style={{ display: 'flex', width: '100%', height: '100%', background: FS.paper }}>
      <Sidebar active="dashboard" role="coach" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
        <Topbar title="Coach dashboard" subtitle={empty ? 'No clients yet' : '8 clients · 6 active this week'}
          actions={<button className="fs-btn accent"><Icon name="plus" size={13} color="#fff" />Add client</button>}/>

        {empty ? (
          <EmptyState
            icon="users"
            title="Your client roster is empty"
            body="Invite your first client by sending them a WhatsApp signup link. They'll be guided through onboarding and assigned to you automatically."
            primary={{ label: 'Generate invite link', icon: 'whatsapp' }}
            secondary={{ label: 'Import from spreadsheet', icon: 'plus' }}
          />
        ) : (
          <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              <MetricCard label="Total clients" value="8" trend="+2" trendDir="up" sub="this month" />
              <MetricCard label="Avg. compliance" value="69%" trend="+5%" trendDir="up" sub="last 7 days" />
              <MetricCard label="Needs attention" value="1" sub="3+ days inactive" />
              <MetricCard label="Sessions this week" value="34" trend="+8" trendDir="up" sub="of 56 planned" />
            </div>

            {/* Tabs + filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${FS.hairline}` }}>
              {[['all', 'All clients', 8], ['gym', 'Gym clients', 6], ['online', 'Online clients', 2], ['flagged', 'Needs attention', 1]].map(([k, label, n]) => (
                <button key={k} onClick={() => setTab(k)} style={{
                  padding: '12px 14px', background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600,
                  color: tab === k ? FS.text : FS.muted,
                  borderBottom: `2px solid ${tab === k ? FS.text : 'transparent'}`,
                  marginBottom: -1, display: 'inline-flex', alignItems: 'center', gap: 6,
                }}>
                  {label}<span style={{ fontSize: 10, color: FS.muted, fontWeight: 500 }}>{n}</span>
                </button>
              ))}
              <div style={{ flex: 1 }} />
              <button className="fs-btn ghost sm" style={{ marginBottom: 6 }}><Icon name="filter" size={12} />Filter</button>
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {clients
                .filter(c => tab === 'all' || (tab === 'gym' && !c.online) || (tab === 'online' && c.online) || (tab === 'flagged' && c.flag))
                .map(c => <ClientCard key={c.name} {...c} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Coach Exercise Library (desktop) — with empty state variant
// ─────────────────────────────────────────────────────────────────────────
function CoachExerciseLibrary({ empty = false }) {
  const exercises = [
    { name: 'Barbell back squat',     muscles: ['Quads', 'Glutes'],  difficulty: 'Intermediate', equip: 'Barbell' },
    { name: 'Romanian deadlift',      muscles: ['Hamstrings', 'Back'], difficulty: 'Intermediate', equip: 'Barbell' },
    { name: 'Bench press',            muscles: ['Chest', 'Triceps'], difficulty: 'Intermediate', equip: 'Barbell' },
    { name: 'Pull-up',                muscles: ['Back', 'Biceps'],   difficulty: 'Advanced',     equip: 'Bodyweight' },
    { name: 'Walking lunge',          muscles: ['Quads', 'Glutes'],  difficulty: 'Beginner',     equip: 'Dumbbells' },
    { name: 'Seated row',             muscles: ['Back'],             difficulty: 'Beginner',     equip: 'Cable' },
    { name: 'Overhead press',         muscles: ['Shoulders'],        difficulty: 'Intermediate', equip: 'Barbell' },
    { name: 'Hanging leg raise',      muscles: ['Core'],             difficulty: 'Advanced',     equip: 'Bar' },
    { name: 'Goblet squat',           muscles: ['Quads', 'Glutes'],  difficulty: 'Beginner',     equip: 'Kettlebell' },
    { name: 'Incline DB press',       muscles: ['Chest'],            difficulty: 'Intermediate', equip: 'Dumbbells' },
    { name: 'Lat pulldown',           muscles: ['Back'],             difficulty: 'Beginner',     equip: 'Cable' },
    { name: 'Bulgarian split squat',  muscles: ['Quads', 'Glutes'],  difficulty: 'Advanced',     equip: 'Dumbbells' },
  ];

  const filters = ['All muscles', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];
  const [active, setActive] = React.useState('All muscles');

  return (
    <div className="fs" style={{ display: 'flex', width: '100%', height: '100%', background: FS.paper }}>
      <Sidebar active="exercises" role="coach" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
        <Topbar title="Exercise library" subtitle={empty ? 'No exercises yet' : '12 exercises · private to your account'}
          actions={<button className="fs-btn accent"><Icon name="plus" size={13} color="#fff" />Add exercise</button>}/>

        {empty ? (
          <EmptyState
            icon="dumbbell"
            title="Build your exercise library"
            body="Add exercises by pasting a YouTube link — we'll auto-generate the thumbnail. Tag each one with muscle group, equipment, and difficulty so you can pull from it inside the workout plan builder."
            primary={{ label: 'Add first exercise', icon: 'plus' }}
            secondary={{ label: 'Import starter pack (50)', icon: 'arrow-down' }}
          />
        ) : (
          <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Filter chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {filters.map(f => (
                <span key={f} onClick={() => setActive(f)} style={{
                  padding: '6px 12px', borderRadius: 6,
                  background: active === f ? FS.ink : '#fff',
                  color: active === f ? '#fff' : FS.text,
                  border: `1px solid ${active === f ? FS.ink : FS.hairline}`,
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}>{f}</span>
              ))}
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 11, color: FS.muted }}>Difficulty</span>
              <select className="fs-input" style={{ height: 30, fontSize: 12, padding: '0 8px' }}>
                <option>All</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option>
              </select>
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {exercises.map(e => <ExerciseCard key={e.name} {...e} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Empty state — used by both coach screens
// ─────────────────────────────────────────────────────────────────────────
function EmptyState({ icon, title, body, primary, secondary }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ maxWidth: 420, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 72, height: 72, borderRadius: 16, background: '#fff', border: `1px solid ${FS.hairline}`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <Icon name={icon} size={28} color={FS.text} />
          {/* subtle striped backdrop */}
          <div style={{ position: 'absolute', inset: -16, borderRadius: 22, background: `repeating-linear-gradient(135deg, transparent 0 6px, ${FS.hairline2} 6px 7px)`, zIndex: -1, opacity: 0.6 }} />
        </div>
        <div className="fs-eyebrow">Empty state</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>{title}</h2>
        <p style={{ fontSize: 13, color: FS.muted, margin: 0, lineHeight: 1.55 }}>{body}</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {primary && (
            <button className="fs-btn accent">
              {primary.icon === 'whatsapp'
                ? <Icon name="whatsapp" size={13} color="#fff" />
                : <Icon name={primary.icon} size={13} color="#fff" />}
              {primary.label}
            </button>
          )}
          {secondary && (
            <button className="fs-btn ghost"><Icon name={secondary.icon} size={13} />{secondary.label}</button>
          )}
        </div>
      </div>
    </div>
  );
}

window.CoachDashboard = CoachDashboard;
window.CoachExerciseLibrary = CoachExerciseLibrary;
