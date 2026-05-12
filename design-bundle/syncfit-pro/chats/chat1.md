# Fitness App Design System

_Started 2026-05-04 01:03 UTC_

---

## User



## Assistant

I'll design FitSync Pro — an Egypt-first gym management & online coaching platform. Before I start building, let me ask some focused questions to make sure I deliver the right thing, since this is a large brief with 21 screens and 9 components.

_[tool: questions_v2]_

## User

Questions answered:
- accent: 0
- scope: Start with 6 screens that form the spine of the product — Admin Dashboard, Member List, Coach Dashboard, Client Home, My Plan, and the Coach Exercise Library. These six touch every major UI pattern you'll reuse everywhere else.
- format: As a single flowing Figma-style artboard — all screens on one canvas so you can see the design system emerging consistently across them.
- device_mix: Mobile only for /app/* client screens. Desktop only for /admin and /coach screens. No need to double the work on this pass.
- rtl_dark: Skip dark mode entirely for now. Do one RTL variant — the Admin Dashboard only — just to prove the layout flips correctly. You can apply it everywhere once the pattern is established.
- visual_direction: Athletic and serious. Reference: Nike Training Club meets a fintech dashboard. Clean, high contrast, confident typography. Not playful, not bubbly, no rounded pastel cards. The admin and coach are professionals running a business.
- arabic_demo: Real Arabic text for navigation items and labels — "الأعضاء", "لوحة التحكم", "المدرب" — but placeholder Lorem-style Arabic for longer body content and names. Don't use English words written in Arabic letters.
- components_first: es — deliver it as the first page before any screen. It should show StatusBadge, MetricCard, ClientCard, ComplianceRing, and MacroBar in all their states. Everything else is built from these.
- data_realism: Fully realistic Egyptian context — Arabic names like Ahmed Hassan and Sara Mohamed, prices in EGP (1,500 EGP, 3,000 EGP), dates in the current month, gym name in both Arabic and English, WhatsApp numbers with +20 prefix. Fake data kills the presentation.
- states: Theme color (the primary accent), language direction (LTR/RTL), and membership status filter on the member list. That's enough interactivity without overcomplicating it.
- anything_else: es — two things. First, the online client app must have zero gym UI — no QR, no wallet pass, no membership card, no attendance. Show this by including one online client Home screen next to the gym member Home screen so the difference is visually obvious. Second, every empty state needs a designed version — especially the coach dashboard with no clients yet and the exercise library with no exercises added yet. Those are the first screens real users will see.

## Assistant

I'll build FitSync Pro as a single flowing canvas. Let me set up the structure and start building.

_[tool: update_todos]_

_[tool: copy_starter_component]_

_[tool: copy_starter_component]_

_[tool: read_file]_

_[tool: read_file]_

I have everything I need now. Let me start building. I'll create a single HTML file with the design canvas, build the design system tokens, components, and screens.

_[tool: write_file]_

_[tool: snip]_

_[tool: write_file]_

_[tool: snip]_

_[tool: write_file]_

_[tool: snip]_

_[tool: write_file]_

_[tool: snip]_

_[tool: write_file]_

_[tool: snip]_

_[tool: write_file]_

_[tool: snip]_

_[tool: write_file]_

_[tool: snip]_

_[tool: done]_

_[tool: snip]_

_[tool: fork_verifier_agent]_

Built FitSync Pro as a single design canvas. Here's what landed:

**Section 1 — Design system** (1 artboard)
The component library page with StatusBadge, MetricCard, ComplianceRing, ClientCard, MacroBar — all five interaction states for buttons, color tokens, and Inter/Cairo type pairing showing LTR + RTL side-by-side.

**Section 2 — Admin desktop** (3 artboards)
Dashboard with live check-in feed, expiring-membership alerts (each with a WhatsApp remind button), Ramadan campaign strip, 12-week attendance heatmap. Plus an RTL Arabic variant proving the layout flips. Member list with status filter chips wired to the Tweaks panel.

**Section 3 — Coach desktop** (4 artboards)
Populated dashboard with 8 client cards (compliance ring, weight sparkline, red-dot inactivity flag) and tabs for All / Gym / Online / Needs attention. Plus designed empty states for both the dashboard and the exercise library — those are the first screens real coaches see.

**Section 4 — Client mobile** (3 artboards, 375px)
Gym member Home next to Online client Home so the gym-only UI gap is visible at a glance — QR shortcut, "Gym only" badge, membership card on the gym side; coach contact + WhatsApp-confirmed daily check-in on the online side, zero gym chrome. My Plan with day tabs, expandable exercise rows, completion ring.

**Tweaks** (bottom-right): accent color picker, LTR/RTL direction, member-list status filter.

**Visual system**: Inter + Cairo, ink #0B0F1A on warm off-white, electric blue accent, clean hairlines, tabular numerals on every dashboard number, fully realistic Egyptian data (Ahmed Hassan, Sara Mohamed, +20 phones, EGP prices). WhatsApp icon flags every messaging touch-point as required.

**Next steps when you're ready**: extend RTL across coach/client screens, design the dark mode variants for Client Home + Coach Dashboard, and add the remaining Phase 1 screens (Member Detail, Plans, Offers, Workout Builder, QR check-in fullscreen, Membership Card).

