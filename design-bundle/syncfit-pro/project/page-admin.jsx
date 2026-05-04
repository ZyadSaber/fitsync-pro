// FitSync Pro — Admin & Coach desktop screens

const FS = window.FS;
const { Icon, StatusBadge, MetricCard, Avatar, Ring, ClientCard, MacroBar, CheckinHeatmap, SparkLine, ExerciseCard } = window;

// ── Shared admin/coach shell pieces ─────────────────────────────────────
function Sidebar({ active = 'dashboard', role = 'admin', dir = 'ltr' }) {
  const isRtl = dir === 'rtl';
  const t = isRtl ? {
    brand: 'فِت‑سِنك برو', gym: 'نادي القاهرة الرياضي',
    dashboard: 'لوحة التحكم', members: 'الأعضاء', plans: 'الباقات',
    offers: 'العروض', staff: 'الفريق', checkins: 'تسجيل الدخول', settings: 'الإعدادات',
    coach: 'المدرّب', profile: 'أحمد المدرّب',
  } : {
    brand: 'FitSync Pro', gym: 'Cairo Fit · Zamalek',
    dashboard: 'Dashboard', members: 'Members', plans: 'Plans',
    offers: 'Offers', staff: 'Staff', checkins: 'Live check-ins', settings: 'Settings',
    coach: 'Coach', profile: 'Ahmed Coach',
  };

  const items = role === 'admin'
    ? [['dashboard', t.dashboard, 'home'], ['members', t.members, 'users'], ['plans', t.plans, 'card'], ['offers', t.offers, 'tag'], ['checkins', t.checkins, 'qr'], ['staff', t.staff, 'user']]
    : [['dashboard', t.dashboard, 'home'], ['clients', isRtl ? 'العملاء' : 'Clients', 'users'], ['exercises', isRtl ? 'مكتبة التمارين' : 'Exercise library', 'dumbbell'], ['workouts', isRtl ? 'خطط التدريب' : 'Workouts', 'chart'], ['nutrition', isRtl ? 'التغذية' : 'Nutrition', 'flame']];

  return (
    <aside style={{ width: 220, background: FS.ink, color: '#C7CDD9', padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 24, height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px' }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: FS.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="logo" size={18} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>{t.brand}</div>
          <div style={{ fontSize: 10, color: '#9AA1AE' }}>{t.gym}</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map(([k, label, ico]) => (
          <div key={k} className={`fs-nav ${active === k ? 'active' : ''}`}>
            <Icon name={ico} size={15} />
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 'auto', padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar name={role === 'admin' ? 'Mona Khaled' : 'Ahmed Coach'} size="md" />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{role === 'admin' ? (isRtl ? 'منى خالد' : 'Mona Khaled') : t.profile}</div>
          <div style={{ fontSize: 10, color: '#9AA1AE' }}>{role === 'admin' ? (isRtl ? 'مديرة النادي' : 'Gym admin') : t.coach}</div>
        </div>
        <Icon name="more" size={14} color="#9AA1AE" />
      </div>
    </aside>
  );
}

function Topbar({ title, subtitle, actions, dir = 'ltr' }) {
  const isRtl = dir === 'rtl';
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: `1px solid ${FS.hairline}`, background: '#fff' }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-0.015em' }}>{title}</h1>
        {subtitle && <div style={{ fontSize: 12, color: FS.muted, marginTop: 4 }}>{subtitle}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', insetInlineStart: 10, top: 10, color: FS.muted2 }}><Icon name="search" size={14} /></span>
          <input className="fs-input" placeholder={isRtl ? 'بحث…' : 'Search…'} style={{ paddingInlineStart: 32, width: 220 }} />
        </div>
        <button className="fs-btn ghost"><Icon name="bell" size={14} /></button>
        {actions}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// 1. Admin Dashboard (desktop)
// ─────────────────────────────────────────────────────────────────────────
function AdminDashboard({ dir = 'ltr' }) {
  const isRtl = dir === 'rtl';
  const t = isRtl ? {
    title: 'لوحة التحكم', subtitle: 'الخميس ٤ مايو ٢٠٢٦', addMember: 'إضافة عضو', createOffer: 'إنشاء عرض',
    activeMembers: 'الأعضاء النشطون', activeToday: 'النشطون اليوم', expiringWeek: 'تنتهي هذا الأسبوع', revenueMonth: 'إيرادات الشهر',
    liveTitle: 'تسجيلات الدخول المباشرة', liveSub: '٤٢ عضوًا حتى الآن اليوم',
    expiringTitle: 'العضويات المنتهية قريبًا', viewAll: 'عرض الكل', daysLeft: 'يومان متبقيان', remind: 'تذكير',
    ramadan: 'وضع رمضان', ramadanSub: 'حملة الخصومات نشطة · تنتهي ٣٠ مايو',
    quickActions: 'إجراءات سريعة',
  } : {
    title: 'Dashboard', subtitle: 'Thursday, 4 May 2026', addMember: 'Add member', createOffer: 'Create offer',
    activeMembers: 'Active members', activeToday: 'Active today', expiringWeek: 'Expiring this week', revenueMonth: 'Revenue (May)',
    liveTitle: 'Live check-in feed', liveSub: '42 members so far today',
    expiringTitle: 'Memberships expiring soon', viewAll: 'View all', daysLeft: '2 days left', remind: 'Remind',
    ramadan: 'Ramadan campaign', ramadanSub: 'Discount overlay active · ends 30 May',
    quickActions: 'Quick actions',
  };

  const checkins = isRtl ? [
    { name: 'كريم منصور', time: 'منذ ٣٢ ث', status: 'active' },
    { name: 'ليلى عبد الله', time: 'منذ ١م', status: 'active' },
    { name: 'يوسف إبراهيم', time: 'منذ ٤م', status: 'pending' },
    { name: 'هدى السيد', time: 'منذ ٧م', status: 'active' },
    { name: 'طارق نبيل', time: 'منذ ١٢م', status: 'frozen' },
  ] : [
    { name: 'Karim Mansour', time: '32s ago', status: 'active' },
    { name: 'Layla Abdullah', time: '1m ago', status: 'active' },
    { name: 'Youssef Ibrahim', time: '4m ago', status: 'pending' },
    { name: 'Hoda El-Sayed', time: '7m ago', status: 'active' },
    { name: 'Tarek Nabil', time: '12m ago', status: 'frozen' },
  ];

  const expiring = isRtl ? [
    { name: 'سارة محمد', plan: 'باقة شهرية', days: 'يومان' },
    { name: 'محمود فاروق', plan: 'باقة فصلية', days: '٣ أيام' },
    { name: 'نور الدين', plan: 'باقة سنوية', days: '٥ أيام' },
    { name: 'دينا حسن', plan: 'باقة شهرية', days: '٦ أيام' },
  ] : [
    { name: 'Sara Mohamed', plan: 'Monthly · 1,500 EGP', days: '2 days' },
    { name: 'Mahmoud Farouk', plan: 'Quarterly · 4,000 EGP', days: '3 days' },
    { name: 'Nour El-Din', plan: 'Annual · 14,000 EGP', days: '5 days' },
    { name: 'Dina Hassan', plan: 'Monthly · 1,500 EGP', days: '6 days' },
  ];

  return (
    <div className="fs" dir={dir} style={{ display: 'flex', width: '100%', height: '100%', background: FS.paper }}>
      <Sidebar active="dashboard" role="admin" dir={dir} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
        <Topbar title={t.title} subtitle={t.subtitle} dir={dir}
          actions={<>
            <button className="fs-btn ghost"><Icon name="tag" size={13} />{t.createOffer}</button>
            <button className="fs-btn accent"><Icon name="plus" size={13} color="#fff" />{t.addMember}</button>
          </>}/>

        <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Ramadan strip */}
          <div style={{ background: FS.ink, color: '#fff', borderRadius: 8, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="flame" size={18} color={FS.accent} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{t.ramadan}</div>
              <div style={{ fontSize: 11, color: '#9AA1AE', marginTop: 2 }}>{t.ramadanSub}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="fs-btn ghost sm" style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', color: '#fff' }}>{isRtl ? 'تكوين' : 'Configure'}</button>
            </div>
          </div>

          {/* Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <MetricCard label={t.activeMembers} value={isRtl ? '٨٤٧' : '847'} trend={isRtl ? '+٢٤' : '+24'} trendDir="up" sub={isRtl ? 'مقارنة بالشهر الماضي' : 'vs last month'} />
            <MetricCard label={t.activeToday} value={isRtl ? '١٤٢' : '142'} trend={isRtl ? '+٨' : '+8'} trendDir="up" sub={isRtl ? 'متوسط ١٢١' : 'avg. 121'} />
            <MetricCard label={t.expiringWeek} value={isRtl ? '١٨' : '18'} trend={isRtl ? '−٤' : '−4'} trendDir="down" sub={isRtl ? 'تجديد مطلوب' : 'renewal needed'} />
            <MetricCard label={t.revenueMonth} value={isRtl ? '٢٨٤٬٥٠٠' : '284,500'} trend={isRtl ? '+١٢٪' : '+12%'} trendDir="up" sub="EGP" />
          </div>

          {/* Two-col: live feed + expiring */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
            <div className="fs-card" style={{ padding: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${FS.hairline}` }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{t.liveTitle}</div>
                  <div style={{ fontSize: 11, color: FS.muted, marginTop: 2 }}>{t.liveSub}</div>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: FS.green, fontWeight: 600 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: FS.green, animation: 'fs-blink 1.6s ease-in-out infinite' }} />
                  {isRtl ? 'مباشر' : 'Live'}
                </div>
              </div>
              <div>
                {checkins.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: i < checkins.length - 1 ? `1px solid ${FS.hairline2}` : 'none' }}>
                    <Avatar name={c.name} size="md" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: FS.muted, marginTop: 2 }}>{c.time}</div>
                    </div>
                    <StatusBadge status={c.status} />
                    <Icon name="qr" size={14} color={FS.muted} />
                  </div>
                ))}
              </div>
              <style>{`@keyframes fs-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }`}</style>
            </div>

            <div className="fs-card" style={{ padding: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${FS.hairline}` }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{t.expiringTitle}</div>
                <span style={{ fontSize: 11, color: FS.accent, fontWeight: 600, cursor: 'pointer' }}>{t.viewAll} →</span>
              </div>
              <div>
                {expiring.map((e, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: i < expiring.length - 1 ? `1px solid ${FS.hairline2}` : 'none' }}>
                    <Avatar name={e.name} size="md" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{e.name}</div>
                      <div style={{ fontSize: 11, color: FS.muted, marginTop: 2 }}>{e.plan}</div>
                    </div>
                    <span className="fs-badge expired"><span className="dot" />{e.days}</span>
                    <button className="fs-btn ghost sm" style={{ gap: 6 }}>
                      <Icon name="whatsapp" size={12} color={FS.whatsapp} />
                      {t.remind}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity heatmap */}
          <div className="fs-card pad">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{isRtl ? 'نشاط الحضور · ١٢ أسبوعًا' : 'Attendance activity · 12 weeks'}</div>
                <div style={{ fontSize: 11, color: FS.muted, marginTop: 2 }}>{isRtl ? 'أعلى الأيام: الإثنين والخميس' : 'Peak days: Mon, Thu'}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: FS.muted }}>
                <span>{isRtl ? 'أقل' : 'Less'}</span>
                {['#EEF0F4','#C7D2FE','#6B85FF',FS.accent].map(c => <span key={c} style={{ width: 10, height: 10, borderRadius: 2, background: c }} />)}
                <span>{isRtl ? 'أكثر' : 'More'}</span>
              </div>
            </div>
            <CheckinHeatmap weeks={14} />
          </div>

        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// 2. Member List (desktop) — accepts statusFilter from tweaks
// ─────────────────────────────────────────────────────────────────────────
function MemberList({ statusFilter = 'all' }) {
  const all = [
    { id: 'EG-1042', name: 'Ahmed Hassan',     phone: '+20 100 234 5678', plan: 'Annual',    status: 'active',  expiry: '12 Mar 2027', joined: '12 Mar 2024' },
    { id: 'EG-1043', name: 'Sara Mohamed',     phone: '+20 122 987 1234', plan: 'Monthly',   status: 'active',  expiry: '06 May 2026', joined: '06 Jan 2026' },
    { id: 'EG-1044', name: 'Omar El-Sayed',    phone: '+20 111 456 7890', plan: 'Quarterly', status: 'frozen',  expiry: '18 Jun 2026', joined: '18 Sep 2025' },
    { id: 'EG-1045', name: 'Mahmoud Farouk',   phone: '+20 100 111 2233', plan: 'Quarterly', status: 'active',  expiry: '07 May 2026', joined: '07 Feb 2026' },
    { id: 'EG-1046', name: 'Layla Abdullah',   phone: '+20 122 555 6677', plan: 'Annual',    status: 'active',  expiry: '04 Apr 2027', joined: '04 Apr 2025' },
    { id: 'EG-1047', name: 'Karim Mansour',    phone: '+20 111 888 9900', plan: 'Monthly',   status: 'expired', expiry: '02 May 2026', joined: '02 Apr 2026' },
    { id: 'EG-1048', name: 'Hoda El-Sayed',    phone: '+20 100 333 4455', plan: 'Annual',    status: 'active',  expiry: '21 Sep 2026', joined: '21 Sep 2025' },
    { id: 'EG-1049', name: 'Tarek Nabil',      phone: '+20 122 234 5566', plan: 'Quarterly', status: 'frozen',  expiry: '14 Jul 2026', joined: '14 Oct 2025' },
    { id: 'EG-1050', name: 'Dina Hassan',      phone: '+20 111 678 9911', plan: 'Monthly',   status: 'pending', expiry: '—',           joined: '—' },
    { id: 'EG-1051', name: 'Nour El-Din',      phone: '+20 100 444 8822', plan: 'Annual',    status: 'active',  expiry: '09 May 2026', joined: '09 May 2025' },
    { id: 'EG-1052', name: 'Youssef Ibrahim',  phone: '+20 122 909 1010', plan: 'Monthly',   status: 'expired', expiry: '28 Apr 2026', joined: '28 Mar 2026' },
    { id: 'EG-1053', name: 'Mariam Adel',      phone: '+20 111 121 3434', plan: 'Quarterly', status: 'active',  expiry: '15 Aug 2026', joined: '15 Feb 2026' },
  ];
  const rows = statusFilter === 'all' ? all : all.filter(r => r.status === statusFilter);

  return (
    <div className="fs" style={{ display: 'flex', width: '100%', height: '100%', background: FS.paper }}>
      <Sidebar active="members" role="admin" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
        <Topbar title="Members" subtitle={`${rows.length} of ${all.length} members`}
          actions={<>
            <button className="fs-btn ghost"><Icon name="filter" size={13} />Export</button>
            <button className="fs-btn accent"><Icon name="plus" size={13} color="#fff" />Add member</button>
          </>}/>
        <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Filters row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {[['all','All'],['active','Active'],['frozen','Frozen'],['expired','Expired'],['pending','Pending']].map(([k, label]) => (
              <span key={k} style={{
                padding: '6px 12px', borderRadius: 6,
                background: statusFilter === k ? FS.ink : '#fff',
                color: statusFilter === k ? '#fff' : FS.text,
                border: `1px solid ${statusFilter === k ? FS.ink : FS.hairline}`,
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
                {label}
                <span style={{ fontSize: 10, opacity: 0.6 }}>{k === 'all' ? all.length : all.filter(r => r.status === k).length}</span>
              </span>
            ))}
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 11, color: FS.muted }}>Bulk actions:</span>
            <button className="fs-btn ghost sm">Freeze</button>
            <button className="fs-btn ghost sm">Extend</button>
          </div>

          <div className="fs-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th className="fs-th" style={{ width: 36 }}><input type="checkbox" /></th>
                  <th className="fs-th">Member</th>
                  <th className="fs-th">Phone</th>
                  <th className="fs-th">Plan</th>
                  <th className="fs-th">Status</th>
                  <th className="fs-th">Expiry</th>
                  <th className="fs-th" style={{ width: 64 }}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id} className="fs-tr">
                    <td className="fs-td"><input type="checkbox" /></td>
                    <td className="fs-td">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={r.name} size="md" />
                        <div>
                          <div style={{ fontWeight: 600 }}>{r.name}</div>
                          <div className="fs-mono" style={{ fontSize: 10, color: FS.muted, marginTop: 1 }}>{r.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="fs-td fs-num" style={{ color: FS.muted }}>{r.phone}</td>
                    <td className="fs-td">{r.plan}</td>
                    <td className="fs-td"><StatusBadge status={r.status} /></td>
                    <td className="fs-td fs-num" style={{ color: FS.muted }}>{r.expiry}</td>
                    <td className="fs-td"><Icon name="more" size={16} color={FS.muted} /></td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan="7" className="fs-td" style={{ textAlign: 'center', padding: '60px 20px', color: FS.muted }}>
                    No members match this filter.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

window.AdminDashboard = AdminDashboard;
window.MemberList = MemberList;
window.Sidebar = Sidebar;
window.Topbar = Topbar;
