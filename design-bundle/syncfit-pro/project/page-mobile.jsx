// FitSync Pro — Mobile client screens (Member Home, Online Client Home, My Plan)

const FS = window.FS;
const { Icon, StatusBadge, Avatar, Ring, MacroBar, SparkLine } = window;

// ── Phone shell — 375 wide ────────────────────────────────────────────
function Phone({ children, dark = false }) {
  return (
    <div style={{ width: '100%', height: '100%', background: dark ? FS.ink : FS.paper, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Status bar */}
      <div style={{ height: 44, padding: '0 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span className="fs-num" style={{ fontSize: 14, fontWeight: 600, color: dark ? '#fff' : FS.text }}>9:41</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: dark ? '#fff' : FS.text }}>
          <svg width="16" height="10" viewBox="0 0 16 10"><path d="M0 9h2v1H0zM4 7h2v3H4zM8 4h2v6H8zM12 1h2v9h-2z" fill="currentColor"/></svg>
          <svg width="14" height="10" viewBox="0 0 14 10"><path d="M7 2C5 2 3 3 1.5 4.5l1 1C3.5 4.5 5 4 7 4s3.5.5 4.5 1.5l1-1C11 3 9 2 7 2zM7 6c-1 0-2 .5-2.5 1l1 1c.5-.5 1-.5 1.5-.5s1 0 1.5.5l1-1C9 6.5 8 6 7 6z" fill="currentColor"/></svg>
          <svg width="22" height="10" viewBox="0 0 22 10"><rect x="0" y="1" width="18" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="0.8"/><rect x="2" y="3" width="14" height="4" rx="1" fill="currentColor"/><rect x="19" y="4" width="2" height="2" fill="currentColor"/></svg>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>{children}</div>
    </div>
  );
}

// ── Bottom tab bar ────────────────────────────────────────────────────
function TabBar({ active = 'home', online = false, dark = false }) {
  const tabs = online
    ? [['home', 'Home', 'home'], ['plan', 'Plan', 'dumbbell'], ['checkin', 'Check-in', 'check'], ['progress', 'Progress', 'chart']]
    : [['home', 'Home', 'home'], ['plan', 'Plan', 'dumbbell'], ['qr', 'Check-in', 'qr'], ['card', 'Card', 'card'], ['progress', 'Progress', 'chart']];
  return (
    <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-around', padding: '8px 8px 14px', background: dark ? FS.ink2 : '#fff', borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : FS.hairline}` }}>
      {tabs.map(([k, label, ico]) => {
        const isActive = active === k;
        const color = isActive ? (dark ? '#fff' : FS.text) : (dark ? '#6B7280' : FS.muted);
        return (
          <div key={k} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '4px 8px' }}>
            <Icon name={ico} size={18} color={color} stroke={isActive ? 2 : 1.6} />
            <span style={{ fontSize: 10, fontWeight: 600, color }}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Gym Member Home (mobile, 375)
// ─────────────────────────────────────────────────────────────────────
function GymMemberHome() {
  return (
    <Phone>
      <div style={{ padding: '8px 20px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, color: FS.muted, fontWeight: 500 }}>Thursday, May 4</div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.015em' }}>Hi, Ahmed</div>
          </div>
          <Avatar name="Ahmed Hassan" size="md" />
        </div>

        {/* Streak card */}
        <div style={{ background: FS.ink, color: '#fff', borderRadius: 12, padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: '#9AA1AE', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Current streak</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
              <span className="fs-num" style={{ fontSize: 36, fontWeight: 700, lineHeight: 1 }}>14</span>
              <span style={{ fontSize: 13, color: '#9AA1AE' }}>days</span>
            </div>
            <div style={{ fontSize: 11, color: '#9AA1AE', marginTop: 6 }}>Keep going — beat your record of 18</div>
          </div>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(45,91,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="flame" size={28} color={FS.accent} />
          </div>
        </div>

        {/* Today's workout */}
        <div className="fs-card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div className="fs-eyebrow">Today's workout</div>
            <span className="fs-badge active"><span className="dot" />Push day</span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Chest, shoulders & triceps</div>
          <div style={{ fontSize: 12, color: FS.muted, marginBottom: 14 }}>6 exercises · ~52 min · Week 4 / 12</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="fs-btn accent" style={{ flex: 1 }}>Start workout <Icon name="arrow-right" size={13} color="#fff" /></button>
            <button className="fs-btn ghost" style={{ width: 36, padding: 0 }}><Icon name="more" size={16} /></button>
          </div>
        </div>

        {/* GYM-ONLY: QR shortcut */}
        <div style={{ background: FS.surface, border: `1px solid ${FS.hairline}`, borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 10, background: FS.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="qr" size={26} color="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Check in at the door</div>
            <div style={{ fontSize: 11, color: FS.muted, marginTop: 2 }}>Tap to show your QR code</div>
          </div>
          <span className="fs-badge gym"><span className="dot" />Gym only</span>
        </div>

        {/* Daily check-in nudge */}
        <div style={{ borderRadius: 12, padding: 14, background: FS.accentSoft, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: FS.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={16} color="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: FS.ink }}>Daily check-in</div>
            <div style={{ fontSize: 11, color: '#1F47E0', marginTop: 1 }}>Log weight, energy & sleep · 60s</div>
          </div>
          <Icon name="arrow-right" size={16} color={FS.accent} />
        </div>

        {/* Membership snippet */}
        <div className="fs-card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 4, alignSelf: 'stretch', borderRadius: 2, background: FS.green }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: FS.muted, fontWeight: 500 }}>Membership</div>
            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>Annual · expires 12 Mar 2027</div>
          </div>
          <StatusBadge status="active" />
        </div>
      </div>
      <TabBar active="home" />
    </Phone>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Online Client Home (mobile, 375) — NO QR, NO WALLET, NO MEMBERSHIP
// ─────────────────────────────────────────────────────────────────────
function OnlineClientHome() {
  return (
    <Phone>
      <div style={{ padding: '8px 20px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, color: FS.muted, fontWeight: 500 }}>Thursday, May 4</div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.015em' }}>Hi, Sara</div>
          </div>
          <Avatar name="Sara Mohamed" size="md" />
        </div>

        {/* Coach card — only present for online clients */}
        <div className="fs-card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar name="Ahmed Coach" size="lg" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: FS.muted, fontWeight: 500 }}>Your coach</div>
            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 1 }}>Ahmed El-Masry</div>
          </div>
          <button className="fs-btn ghost sm" style={{ background: '#E7F8EC', borderColor: 'transparent', color: FS.whatsapp }}>
            <Icon name="whatsapp" size={13} color={FS.whatsapp} /> Message
          </button>
        </div>

        {/* Today's workout */}
        <div className="fs-card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div className="fs-eyebrow">Today's workout</div>
            <span className="fs-badge active"><span className="dot" />Lower</span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Legs & glutes</div>
          <div style={{ fontSize: 12, color: FS.muted, marginBottom: 14 }}>5 exercises · ~45 min · Week 2 / 8</div>
          <button className="fs-btn accent" style={{ width: '100%' }}>Start workout <Icon name="arrow-right" size={13} color="#fff" /></button>
        </div>

        {/* Daily check-in (online: more prominent) */}
        <div style={{ borderRadius: 12, padding: 16, background: FS.ink, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: '#9AA1AE', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Today's check-in</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>How are you feeling?</div>
            </div>
            <Icon name="whatsapp" size={16} color={FS.whatsapp} />
          </div>
          <div style={{ fontSize: 11, color: '#9AA1AE', marginBottom: 14 }}>Coach gets pinged on WhatsApp when you submit</div>
          <button className="fs-btn accent" style={{ width: '100%' }}>Start check-in <Icon name="arrow-right" size={13} color="#fff" /></button>
        </div>

        {/* Progress photo prompt */}
        <div className="fs-card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: FS.hairline2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="chart" size={18} color={FS.text} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Weekly photos due</div>
            <div style={{ fontSize: 11, color: FS.muted, marginTop: 2 }}>Front · Side · Back · Only your coach sees these</div>
          </div>
          <Icon name="arrow-right" size={16} color={FS.muted} />
        </div>

        {/* Compliance ring */}
        <div className="fs-card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
          <Ring value={64} size={72} stroke={6} />
          <div style={{ flex: 1 }}>
            <div className="fs-eyebrow" style={{ marginBottom: 4 }}>This week</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>4 of 6 sessions done</div>
            <div style={{ fontSize: 11, color: FS.muted, marginTop: 2 }}>2 more before Sunday</div>
          </div>
        </div>
      </div>
      <TabBar active="home" online />
    </Phone>
  );
}

// ─────────────────────────────────────────────────────────────────────
// My Plan (mobile, 375) — gym member viewing assigned workout
// ─────────────────────────────────────────────────────────────────────
function MyPlan() {
  const [day, setDay] = React.useState('Thu');
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayState = { Mon: 'done', Tue: 'done', Wed: 'rest', Thu: 'today', Fri: 'pending', Sat: 'pending', Sun: 'rest' };
  const exercises = [
    { name: 'Bench press',    sets: '4 × 8',  rest: '90s', done: true,  notes: 'Add 2.5kg if all reps clean' },
    { name: 'Incline DB press', sets: '4 × 10', rest: '60s', done: true,  notes: '' },
    { name: 'Cable fly',      sets: '3 × 12', rest: '45s', done: false, notes: '' },
    { name: 'Overhead press', sets: '4 × 8',  rest: '90s', done: false, notes: '' },
    { name: 'Lateral raise',  sets: '3 × 15', rest: '45s', done: false, notes: '' },
    { name: 'Triceps pushdown', sets: '3 × 12', rest: '45s', done: false, notes: '' },
  ];
  const completed = exercises.filter(e => e.done).length;
  return (
    <Phone>
      <div style={{ padding: '8px 20px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <div className="fs-eyebrow">Hypertrophy 12W · Week 4</div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.015em', marginTop: 4 }}>My plan</div>
          </div>
          <button className="fs-btn ghost sm"><Icon name="more" size={14} /></button>
        </div>

        {/* Day tabs */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', margin: '0 -20px', padding: '4px 20px 12px', scrollbarWidth: 'none' }}>
          {days.map(d => {
            const s = dayState[d];
            const isToday = s === 'today';
            const isDone = s === 'done';
            const isRest = s === 'rest';
            const isActive = day === d;
            return (
              <button key={d} onClick={() => setDay(d)} style={{
                minWidth: 50, padding: '8px 4px', borderRadius: 8,
                background: isActive ? FS.ink : '#fff',
                color: isActive ? '#fff' : (isRest ? FS.muted2 : FS.text),
                border: `1px solid ${isActive ? FS.ink : FS.hairline}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer',
              }}>
                <span style={{ fontSize: 10, fontWeight: 600, opacity: 0.7 }}>{d}</span>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{['1','2','3','4','5','6','7'][days.indexOf(d)]}</span>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: isDone ? FS.green : isToday ? FS.accent : isRest ? 'transparent' : (isActive ? '#fff' : FS.hairline) }} />
              </button>
            );
          })}
        </div>

        {/* Progress strip */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Push day · Today</div>
            <div style={{ fontSize: 11, color: FS.muted, marginTop: 2 }}>{completed} of {exercises.length} done · ~52 min</div>
          </div>
          <Ring value={Math.round((completed / exercises.length) * 100)} size={44} stroke={4} />
        </div>
      </div>

      {/* Exercises list */}
      <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {exercises.map((e, i) => (
          <div key={i} className="fs-card" style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'flex-start', opacity: e.done ? 0.6 : 1 }}>
            <button style={{
              width: 22, height: 22, borderRadius: 6, marginTop: 2,
              border: `1.5px solid ${e.done ? FS.green : FS.hairline}`,
              background: e.done ? FS.green : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              cursor: 'pointer', padding: 0,
            }}>
              {e.done && <Icon name="check" size={12} color="#fff" stroke={2.5} />}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, textDecoration: e.done ? 'line-through' : 'none' }}>{e.name}</div>
              <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 11, color: FS.muted }}>
                <span className="fs-num"><strong style={{ color: FS.text }}>{e.sets}</strong></span>
                <span>rest <strong style={{ color: FS.text }}>{e.rest}</strong></span>
              </div>
              {e.notes && <div style={{ fontSize: 11, color: FS.muted, fontStyle: 'italic', marginTop: 6, paddingTop: 6, borderTop: `1px dashed ${FS.hairline}` }}>{e.notes}</div>}
            </div>
            <button style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${FS.hairline}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer', padding: 0 }}>
              <Icon name="play" size={11} />
            </button>
          </div>
        ))}
      </div>
      <TabBar active="plan" />
    </Phone>
  );
}

window.GymMemberHome = GymMemberHome;
window.OnlineClientHome = OnlineClientHome;
window.MyPlan = MyPlan;
