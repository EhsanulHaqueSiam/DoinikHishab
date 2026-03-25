# Feature Research

**Domain:** Personal finance / money tracking app (Bangladesh market, subsequent milestone)
**Researched:** 2026-03-25
**Confidence:** HIGH (cross-verified across YNAB official docs, Monarch official docs, competitor research, community discussions)

**Scope:** This research covers ONLY the features being added in the next milestone. It does NOT cover existing capabilities (envelope budgeting, transaction CRUD, reports, account management, reconciliation, AI chat). See `.planning/research/MONARCH-YNAB-RESEARCH.md` for the full competitor analysis that informs these recommendations.

---

## Feature Landscape

### Table Stakes (Users Expect These)

These are features that users of an envelope-budgeting app with YNAB ideology will expect to exist. Without them, the product feels incomplete relative to its own positioning.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **3-tap transaction entry** | The app promises fast manual entry as its core differentiator. Without it, users are stuck with a multi-step form no different from YNAB's 5-9 step flow. Every taka manual = every second matters. | MEDIUM | Custom numeric keypad + recent categories grid + smart defaults. No system keyboard (causes autocorrect/dismiss issues). Amount-first, then category grid, then auto-save. Default account = last used. |
| **True Expenses / Sinking Funds** | Core YNAB Rule 2. Users who understand zero-based budgeting expect to fund irregular expenses monthly. Without this, envelope budgeting is incomplete — users get "surprised" by Eid, school fees, wedding gifts. | LOW | Already have `targets` table with `savings_balance` and `spending_by_date` types. Need UI that frames these as "True Expenses" with culturally resonant Bengali names, progress bars, and monthly auto-suggest amounts (target / months remaining). |
| **"Give every taka a job" language** | YNAB users expect the zero-based philosophy to be embedded in UI copy, not just implied. "Ready to Assign" must be prominent, and the app should speak the methodology's language throughout. | LOW | String changes + Bengali translations. "বরাদ্দ বাকি" (Remaining to Assign), "প্রতিটি টাকার একটি কাজ আছে" (Every taka has a job). Color-code Ready to Assign: teal (positive), red (negative/over-assigned). Reinforce in empty states, tooltips, onboarding. |
| **YNAB 4 Rules education/onboarding** | Users new to envelope budgeting need to understand WHY they are assigning money, not just HOW. YNAB's onboarding is education-first. Without teaching the rules, the budget screen is just a spreadsheet. | MEDIUM | 4-screen onboarding carousel explaining each rule with Bengali/English toggle. Contextual tips that surface rules when relevant (first overspend triggers Rule 3 tip, first sinking fund triggers Rule 2 tip). Not a one-time setup — progressive disclosure. |
| **Mobile-first reports** | YNAB's biggest complaint: reports are desktop-only. DoinikHishab is mobile-first. All existing reports must be fully functional on phone screens. This is a hygiene fix, not a feature. | MEDIUM | Responsive chart components. Touch-friendly interactions (tap segments to filter, swipe between time periods). Use victory-native or react-native-svg for chart rendering. No web-only gating. |
| **Age of Money metric** | Core YNAB Rule 4 metric. Users tracking envelope budgets expect a measure of financial health. AoM answers "am I living paycheck to paycheck?" — the central question for the target demographic. | HIGH | FIFO queue algorithm: income transactions enter a queue ordered by date. Outflows consume from the oldest income first. Age = days between income date and spend date. Average the last 10 cash outflows. Requires historical income/expense traversal across months. Convex query complexity is non-trivial. |
| **Improved onboarding flow** | Current app likely drops users into an empty budget with no guidance. First-time users need: (1) understand the method, (2) add first account, (3) create categories, (4) assign first money, (5) enter first transaction. | MEDIUM | Guided flow with progress indicator. Merge 4 Rules education into this. Pre-populated Bangladeshi category templates (Housing, Food, Transport, bKash/Nagad, Eid Fund, Education, Medical). Skip-able but strongly encouraged. |

### Differentiators (Competitive Advantage)

Features that set DoinikHishab apart. Not expected by default, but high-value for the target market.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Sankey cash flow diagram** | Monarch's signature visualization. Shows income sources flowing into spending categories as a proportional flow chart. No other Bangladeshi finance app has this. Visually striking, shareable, and builds financial awareness. | HIGH | Use `d3-sankey` for layout computation + `react-native-svg` for rendering. D3 calculates node positions and link paths; React Native renders SVG `<Path>` and `<Rect>` elements. On mobile, simplify to a vertical flow (income top, expenses bottom) since horizontal Sankey is hard to read on narrow screens. Consider web-only full Sankey with mobile simplified bar chart fallback. |
| **Recurring transaction calendar view** | Monarch's best UX pattern. A calendar showing upcoming bills/subscriptions with status indicators (paid/upcoming/overdue). Never miss a bill. Bangladesh's growing subscription economy (Netflix, Spotify, mobile plans, internet) makes this increasingly relevant. | MEDIUM | Already have `scheduled` table with `rrule` (RFC 5545). Need calendar grid UI component rendering next occurrences. Color-coded dots: green (paid), blue (upcoming), red (overdue), yellow (paid at different amount). Summary row showing monthly totals. Toggle between calendar and list view. Push notification integration (3 days before due). |
| **Goals 3.0 debt payoff system** | Combined save-up and pay-down goals with scenario simulation. Avalanche vs. snowball comparison for debt payoff. Deeply relevant for Bangladesh: education loans, motorcycle loans, family debts. Shows debt-free date, interest saved, progress milestones. | HIGH | New `goals` table needed. Save-up: target amount + target date + linked account = monthly contribution calculation + on-track/behind status. Pay-down: loan balance + APR + minimum payment + planned payment = amortization schedule. Avalanche algorithm: sort debts by interest rate descending, apply extra payment to highest rate first. Snowball: sort by balance ascending. Simulation engine calculates month-by-month payoff schedule. Already have `loanDetails` table as foundation. |
| **Subscription tracking and detection** | Auto-detect recurring patterns from transaction history (same payee, similar amount, regular interval). Surface as a "Subscriptions" view showing monthly burn rate. Users often forget active subscriptions — this surfaces hidden costs. | MEDIUM | Pattern detection algorithm: group transactions by payee, check for regular intervals (28-32 days = monthly, 13-15 days = biweekly, 355-375 days = yearly). Require at least 3 occurrences for confident detection. Flag amount variance (same payee, different amount = flagged). Display: list with monthly cost, total annual cost, next expected date. Manual add/remove. |
| **Cash flow forecasting** | Project future account balances based on recurring income/expenses and scheduled transactions. Answers "will I run out of money before next payday?" — critical for paycheck-to-paycheck users (the primary demographic). | MEDIUM | Algorithm: start with current account balances, project forward using scheduled transactions (`scheduled` table with `rrule`). For each future day, add expected inflows, subtract expected outflows. Display as a line chart showing projected balance over next 30/60/90 days. Highlight points where balance dips below zero (danger zone in red). |
| **Days of Buffering metric** | Complements Age of Money. "If income stopped today, how many days would your money last?" More intuitive than AoM for many users. Originally a Toolkit-for-YNAB community metric, not official YNAB. | MEDIUM | Formula: Total available balance across on-budget accounts / Average daily outflow rate. Average daily outflow = sum of outflows over selected period (30/90/180/365 days) / number of days. Configurable lookback period. Display alongside Age of Money as a financial health dashboard. Simpler to compute than AoM (no FIFO queue needed). |
| **bKash/Nagad CSV/PDF import** | The "bank sync" equivalent for Bangladesh. bKash provides PDF statements (request in-app, delivered within 72 hours, password-protected). Nagad provides PDF, TXT, and XLS exports. Parsing these into transactions bridges the manual entry gap for mobile wallet users. | HIGH | bKash: PDF statement with fields (date, transaction type, amount, reference, balance). Transaction types: Cash Out, Send Money, Pay Bill, Mobile Recharge, Cash In, Bank to bKash, etc. Need PDF parsing library (pdf-parse or similar). Nagad: XLS/PDF/TXT with similar fields. CSV column mapping UI for unknown formats. Dedup against existing transactions by date + amount + reference. Privacy: parse locally, never upload statements to server. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems for this specific product and market.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **AI auto-categorization for all transactions** | "Monarch does it with 90-95% accuracy." Seems like it would reduce manual work. | Monarch's AI works because it has millions of transactions from Plaid bank imports to train on. DoinikHishab has zero training data. Manual categorization is not a bug — it is the engagement mechanism. YNAB deliberately keeps categorization manual because reviewing each transaction reinforces financial awareness. Over-automating kills the behavioral benefit. | Keep rule-based auto-suggest (payee memory: "last time you paid Shajgoj, it was Beauty"). Show suggestion, require user tap to confirm. Build accuracy over time from user corrections. Never auto-commit without review. |
| **Flex budgeting (Monarch's 3-bucket system)** | "Not everyone wants to track 20 categories. Just tell me my flexible spending number." | Conflicts directly with YNAB ideology (Give Every Taka a Job). Flex budgeting is the opposite of zero-based — it groups everything into one number and loses granularity. Adding both methods creates UX confusion ("which budget mode am I in?"). | Stick with zero-based only. For users who want simplicity, offer fewer categories (5-8 broad ones) rather than a different budgeting paradigm. The methodology IS the product. |
| **Widget-based customizable dashboard** | "Monarch lets you drag and drop widgets." Sounds premium. | Engineering cost is extremely high for React Native (drag-and-drop across platforms, state persistence, responsive layouts). The current fixed dashboard with clear information hierarchy is better for mobile-first. Customization creates decision fatigue for new users. | Fixed dashboard with well-chosen metrics: Ready to Assign, recent transactions, budget summary, Age of Money. One layout, optimized for the 80% use case. Revisit customization in v2+ when user base can provide feedback on what they want. |
| **Full investment portfolio tracking** | "Monarch tracks stocks, crypto, 401k." Users ask for it. | Investment tracking is a different product. Adding it doubles the schema complexity, requires market data APIs (cost money), and distracts from the core budgeting mission. Bangladesh retail investing is still nascent for the target demographic. | Support "tracking accounts" (assets with manual balance updates) for net worth calculation. Do NOT build price feeds, portfolio allocation views, or performance benchmarks. An investment account is a number that goes up or down — nothing more. |
| **Multi-user / family sharing with separate logins** | "Monarch supports households with individual privacy." Common in Bangladesh joint-family finances. | Requires authentication (Clerk, deferred). Requires per-user permissions, shared vs. individual views, conflict resolution on simultaneous edits. Massive scope increase for a solo-user-first product. | Solo user first. When Clerk auth is added later, implement shared budgets (like YNAB Together) as the simplest multi-user model: one budget, shared view, no per-user filtering. Household privacy features are v2+. |
| **Apple Watch / wearable app** | "YNAB has an Apple Watch app for balance checks." | Target demographic is Android-dominant, mid-range phones. Apple Watch penetration in Bangladesh is negligible. Engineering cost for a watch app is disproportionate to user value. | Home screen widgets via Expo (expo-widgets when stable) for quick balance checks. Much lower cost, much broader reach. |
| **Voice transaction entry** | "৳500 খাবার — just say it." Seems futuristic and cool. | Bengali speech recognition accuracy for financial amounts is poor. "পাঁচশ" (five hundred) vs "পাঁচ শ" (five hundred) — transcription errors in amounts are catastrophic for a finance app. Building a reliable voice parser for BDT amounts + Bengali category names is a research project, not a feature. | 3-tap entry is already faster than voice for short amounts. Revisit when Bengali speech-to-text accuracy improves significantly (Google/OpenAI). Not worth building custom. |

---

## Feature Dependencies

```
[3-tap transaction entry]
    (standalone — no dependencies, build first)

[True Expenses / Sinking Funds]
    └──requires──> [Existing targets system] (already built)
    └──enhances──> [YNAB 4 Rules education] (Rule 2 contextual tips)

[YNAB 4 Rules education]
    └──requires──> [Improved onboarding flow] (education lives inside onboarding)

[Improved onboarding flow]
    └──enhances──> [True Expenses setup] (onboarding creates first sinking funds)
    └──enhances──> ["Give every taka a job" language] (onboarding teaches the language)

["Give every taka a job" language]
    (standalone — string changes throughout app, no dependencies)

[Age of Money metric]
    └──requires──> [Transaction history] (needs 30+ days of data to be meaningful)
    └──enhances──> [Mobile-first reports] (AoM chart is a report)

[Days of Buffering metric]
    └──requires──> [Transaction history] (needs spending history for average daily rate)
    └──enhances──> [Age of Money] (complementary metrics, display together)

[Recurring transaction calendar]
    └──requires──> [Existing scheduled transactions] (already built — `scheduled` table)
    └──enhances──> [Subscription tracking] (detected subscriptions feed into calendar)
    └──enhances──> [Cash flow forecasting] (recurring items are forecast inputs)

[Subscription tracking and detection]
    └──requires──> [Transaction history] (needs 3+ occurrences of same payee)
    └──enhances──> [Recurring transaction calendar] (detected items appear on calendar)

[Cash flow forecasting]
    └──requires──> [Recurring transaction calendar] (forecast uses scheduled/recurring data)
    └──requires──> [Account balances] (starting point for projection)

[Goals 3.0 debt payoff system]
    └──requires──> [Existing loanDetails table] (already built — foundation for pay-down goals)
    └──enhances──> [Budget screen] (goal contributions show as budget line items)

[Sankey cash flow diagram]
    └──requires──> [Transaction history] (needs a month+ of categorized transactions)
    └──requires──> [Mobile-first reports] (Sankey lives in the reports section)

[bKash/Nagad import]
    └──requires──> [Existing CSV import infrastructure] (already have import flow)
    └──enhances──> [Subscription detection] (more transaction data = better detection)
    └──enhances──> [Age of Money] (more complete history = more accurate AoM)

[Mobile-first reports]
    └──requires──> [Chart library setup] (victory-native or react-native-svg)
    (other reports depend on this infrastructure being in place)
```

### Dependency Notes

- **3-tap transaction entry has zero dependencies** — it is purely a UI redesign of the existing add transaction flow. Build it first to establish the core differentiator.
- **True Expenses is low-hanging fruit** — the `targets` table already supports `savings_balance` and `spending_by_date` types. This is a UI/framing exercise, not a backend feature.
- **Age of Money is the most computationally complex feature** — requires a FIFO queue traversal across all historical income and expense transactions. The Convex query needs to be efficient. Consider caching the computed AoM value and updating it only when new transactions are added.
- **Subscription detection feeds into recurring calendar** — build detection first, then the calendar view surfaces detected items alongside manually scheduled ones.
- **Cash flow forecasting depends on recurring data** — without accurate recurring items (both manual and detected), the forecast is meaningless. Build recurring calendar + subscription detection before forecasting.
- **Sankey diagram is visually impressive but low daily-use value** — it is a "wow" feature for reports, not a daily workflow tool. Build after core features are solid.
- **bKash/Nagad import is high-value but high-complexity** — PDF parsing with password protection is non-trivial. Statement formats may change without notice. Build as a separate, well-tested module.

---

## MVP Definition

### This Milestone Must Ship (P1)

These features define the milestone's identity. Without them, the milestone is incomplete.

- [x] **3-tap transaction entry** — The core differentiator. Amount-first keypad, recent categories grid, one-tap save. Under 10 seconds per transaction.
- [x] **True Expenses / Sinking Funds** — Rule 2 of YNAB. Bangladeshi category templates: Eid Fund, School Fees, Wedding Gifts, Medical Reserve, Bike Servicing. Progress bars showing accumulation.
- [x] **"Give every taka a job" language** — Bengali + English strings throughout the app. Ready to Assign prominently displayed and color-coded. Methodology language in empty states and tooltips.
- [x] **YNAB 4 Rules onboarding + improved onboarding flow** — Education-first guided setup. 4 Rules carousel with Bengali/English. First account + first categories + first assignment walkthrough.
- [x] **Mobile-first reports** — All existing reports (spending breakdown, income vs. expense, net worth) fully functional on mobile with touch interactions.

### Should Ship If Possible (P2)

High-value additions that complete the feature picture but could slip to next milestone if needed.

- [ ] **Recurring transaction calendar view** — Calendar grid + list view for scheduled/recurring items. Status indicators. Bill reminder notifications.
- [ ] **Age of Money metric** — FIFO computation with line chart in reports. Dashboard card showing current AoM.
- [ ] **Days of Buffering metric** — Simpler computation (balance / daily spend rate). Display alongside AoM.
- [ ] **Subscription tracking and detection** — Pattern detection from transaction history. Monthly subscription burn rate view.
- [ ] **Cash flow forecasting** — 30/60/90-day projected balance line chart based on recurring items.

### Defer to Future Milestone (P3)

These are valuable but should not gate this milestone's completion.

- [ ] **Sankey cash flow diagram** — Impressive but complex SVG rendering. Web-first with mobile simplified fallback. Ship after chart infrastructure is proven with simpler reports.
- [ ] **Goals 3.0 debt payoff system** — Full avalanche/snowball simulation engine. Requires new schema, amortization math, scenario comparison UI. Ship as its own focused milestone.
- [ ] **bKash/Nagad import** — PDF parsing + password handling + format-specific parsers + deduplication. High value but high risk. Ship as its own focused milestone after transaction patterns are well-understood.

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority | Phase |
|---------|------------|---------------------|----------|-------|
| 3-tap transaction entry | HIGH | MEDIUM | P1 | 1 |
| True Expenses / Sinking Funds | HIGH | LOW | P1 | 1 |
| "Give every taka a job" language | HIGH | LOW | P1 | 1 |
| YNAB 4 Rules onboarding | HIGH | MEDIUM | P1 | 1 |
| Mobile-first reports | HIGH | MEDIUM | P1 | 1 |
| Improved onboarding flow | HIGH | MEDIUM | P1 | 1 |
| Recurring transaction calendar | HIGH | MEDIUM | P2 | 2 |
| Subscription detection | MEDIUM | MEDIUM | P2 | 2 |
| Days of Buffering metric | MEDIUM | LOW | P2 | 2 |
| Cash flow forecasting | MEDIUM | MEDIUM | P2 | 2 |
| Age of Money metric | MEDIUM | HIGH | P2 | 2 |
| Sankey cash flow diagram | MEDIUM | HIGH | P3 | 3 |
| Goals 3.0 debt payoff | MEDIUM | HIGH | P3 | 3 |
| bKash/Nagad import | HIGH | HIGH | P3 | 3 |

**Priority key:**
- P1: Must have for this milestone
- P2: Should have, add when possible within this milestone
- P3: Defer to dedicated future milestone

---

## Competitor Feature Analysis

| Feature | YNAB | Monarch Money | DoinikHishab Approach |
|---------|------|---------------|----------------------|
| **Transaction entry speed** | 5-9 steps (amount, payee, category, account, date, memo, flag, type, save) | 8-11 steps (type toggle, amount, merchant, date, account, category, note, tags, save) | **3 taps** (amount keypad, category grid, auto-save). All optional fields hidden by default. Under 10 seconds. This is the differentiator. |
| **True Expenses / Sinking Funds** | Core Rule 2. Monthly accumulation toward irregular expenses. 6 target types including by-date savings. | "Non-monthly expenses" in budget. Category rollover toggles. Less ideological framing. | YNAB's approach with Bangladeshi framing. Named sinking funds with cultural relevance: "ঈদ তহবিল" (Eid Fund), "স্কুল ফি" (School Fees), "বিয়ের উপহার" (Wedding Gifts), "চিকিৎসা রিজার্ভ" (Medical Reserve). Progress bars, monthly auto-suggest. |
| **Age of Money** | Official metric. FIFO calculation. Averages last 10 outflows. Line chart in reports (web only). | Not available. | Build the FIFO algorithm. Average last 10 cash outflows. Display on dashboard card + line chart in mobile reports. Target: "30+ days = financially stable" messaging. |
| **Days of Buffering** | Not official. Toolkit-for-YNAB community extension. Configurable lookback (1/3/6/12 months or all history). | Not available. | Build natively (not an extension). Formula: total on-budget balance / average daily outflow over lookback period. Configurable lookback. Display alongside AoM. More intuitive metric for many users. |
| **Recurring expenses** | Manual scheduled transactions only. No auto-detection. No calendar view. No bill reminders. | Auto-detection from bank imports. Calendar view. 3-day notifications. Payment confirmation workflow. Best-in-class UX. | Monarch's UX adapted for manual entry. Calendar view from `scheduled` table data. Pattern detection from transaction history (3+ occurrences = suggest as recurring). Manual add. Push notifications (3 days ahead). Status indicators (paid/upcoming/overdue). |
| **Subscription tracking** | Not available. | Auto-detected from bank imports. Shows monthly burn rate. | Pattern detection algorithm on local transaction data. Group by payee, check interval regularity (28-32 day = monthly). Surface total monthly subscription cost. Manual add/remove. |
| **Cash flow forecasting** | Not available (YNAB philosophy: only budget money you have NOW). | Yes. AI-projected balance based on recurring income/expenses. Budget forecasting shows future months. | Project forward using scheduled transactions + detected recurring patterns. Line chart showing projected balance over 30/60/90 days. Highlight danger zones (balance < 0). Simpler than Monarch's AI approach — deterministic based on known recurring items. |
| **Sankey cash flow diagram** | Not available. | Signature feature. Interactive SVG flow diagram. Income sources left, spending categories right. Shareable with amount-hiding. Web only. | D3-sankey for layout + react-native-svg for rendering. Simplified vertical layout on mobile (income top, expenses bottom). Full horizontal Sankey on web. Interactive tap-to-filter. Privacy mode (hide amounts in screenshots). |
| **Goals / debt payoff** | 6 target types. Loan planner with scenario simulation (extra payments, time savings). | Goals 3.0: Save-up + Pay-down. Avalanche vs. snowball comparison. Debt-free date projection. Principal vs. interest breakdown. Milestone cards. | Combined approach. Save-up goals: target + date + monthly contribution + on-track/behind. Pay-down goals: balance + APR + payments = amortization schedule. Avalanche vs. snowball comparison. Linked to budget (contributions as budget line items). |
| **CSV/statement import** | Yes: CSV, QIF, QFX, OFX formats. Designed for bank statement import. | CSV import for manual accounts only (bank sync is primary). | bKash PDF statement parser (date, type, amount, reference). Nagad XLS/PDF/TXT parser. Generic CSV column mapper for unknown formats. Deduplication by date + amount + reference. All parsing local (never upload). |
| **Onboarding** | Education-first. Explains 4 rules in context. Warm copy. Progressive feature disclosure. Best-in-class methodology onboarding. | Connect-and-go. Auto-populates from bank sync. Less educational. | YNAB's education-first approach adapted for Bangladesh. 4 Rules carousel in Bengali + English. Guided first-time flow: add account, create categories (pre-populated BD templates), assign first money, enter first transaction. Contextual rule tips throughout ongoing use. |

---

## Implementation Complexity Deep Dive

### 3-Tap Transaction Entry (MEDIUM)

**What's involved:**
- Custom numeric keypad component (not system keyboard) — prevents autocorrect, keyboard dismiss issues
- Amount display with BDT formatting (paisa to taka conversion live)
- Category grid with recent/frequent categories bubble to top (query last N transactions, extract unique categories, sort by frequency)
- Smart defaults: last-used account auto-selected, date = today, type = expense
- Optional fields (payee, memo, flag) collapsed by default, expandable inline or editable from transaction detail after save
- Haptic feedback + toast confirmation on save
- Bottom sheet or full-screen modal for the entry flow

**Risk:** Getting the interaction design right. The difference between "3 taps" and "3 taps that feel natural" is significant. Prototype and test with real users.

### Age of Money (HIGH)

**What's involved:**
- FIFO queue implementation: Create a queue of income transactions ordered by date. For each outflow, consume from the oldest income bucket. Track the age (days between income date and spend date) for each consumption.
- Average the ages of the last 10 outflows to get the AoM number.
- Edge cases: transfers between accounts (not income, not expense — skip), split transactions (proportional consumption), credit card transactions (consume from the category's funded amount, not directly from income).
- Performance: On Convex, this requires loading all income and expense transactions for the FIFO computation. For users with thousands of transactions, this could be slow. Consider materializing/caching the AoM value and updating incrementally when new transactions are added.
- Display: Dashboard card with current AoM number + trend arrow. Reports: line chart showing AoM over time (compute for each day or week in history).

**Risk:** Computational cost on Convex. May need to pre-compute and store AoM snapshots rather than calculating live.

### Sankey Cash Flow Diagram (HIGH)

**What's involved:**
- `d3-sankey` library for layout computation (node positions, link paths) — works in JS, no DOM needed
- `react-native-svg` for rendering SVG `<Rect>` (nodes) and `<Path>` (links) elements
- Data preparation: aggregate transactions by category for a time period, create nodes (income categories + expense categories) and links (income node -> expense node, proportional to amount)
- Mobile layout challenge: horizontal Sankey requires wide viewport. On phone screens, use a vertical layout (income nodes at top, expense nodes at bottom, flow lines between) or fall back to a stacked bar chart
- Interactivity: tap a link to filter transactions. Tap a node to see category detail.
- Privacy mode: toggle to hide amounts (show only proportions) for sharing/screenshots

**Risk:** react-native-svg performance with many nodes/links. D3-sankey is a computation library, not a rendering library — the bridge to React Native SVG needs careful implementation. Test with real data volumes (20+ categories, 6 months of transactions).

### Goals 3.0 Debt Payoff (HIGH)

**What's involved:**
- New schema: `goals` table with fields for type (save-up/pay-down), target amount, target date, linked account, APR (for debt), minimum payment, planned payment
- Save-up algorithm: monthly contribution = (target - current) / months remaining. Status: on-track (current >= expected), behind (current < expected), ahead (current > expected)
- Pay-down algorithm: amortization schedule computation. For each month: interest = balance * (APR/12), principal = payment - interest, new balance = balance - principal. Iterate until balance = 0. Output: payoff date, total interest paid, total amount paid
- Avalanche vs. snowball: Given N debts, simulate both strategies month-by-month. Avalanche: sort by APR descending, apply extra to highest APR. Snowball: sort by balance ascending, apply extra to smallest balance. Compare total interest and payoff dates.
- Budget integration: goal contributions appear as budget category line items
- UI: goal cards with progress bars, milestone celebrations, debt-free date countdown

**Risk:** Amortization math must be precise (compound interest, rounding). Test against known calculators. The avalanche vs. snowball comparison requires simulating the entire payoff timeline for all debts simultaneously.

### bKash/Nagad Import (HIGH)

**What's involved:**
- bKash PDF parsing: statements are password-protected PDFs. Need `pdf-parse` or similar library that can handle password-protected PDFs. Extract table rows: date, transaction type (Cash Out, Send Money, Pay Bill, etc.), amount, reference, balance.
- Nagad format support: XLS (use `xlsx` library), PDF, TXT parsing. Different column layouts than bKash.
- Generic CSV mapper: for unknown formats, present column headers and let user map columns to fields (date, amount, description, type).
- Transaction type mapping: bKash "Cash Out" = expense, "Cash In" = income, "Send Money" = transfer or expense (user decides), "Pay Bill" = expense, "Mobile Recharge" = expense.
- Deduplication: before importing, check for existing transactions with same date + same amount (within paisa) + similar description. Flag potential duplicates for user review.
- Privacy: all parsing happens on-device (JavaScript, not server-side). Never upload statement files to Convex.
- UX: file picker, format auto-detection, preview of parsed transactions, confirm/edit before import.

**Risk:** bKash/Nagad can change their statement format without notice. Build parsers defensively with format validation. PDF parsing in React Native is tricky — may need to use Expo's DocumentPicker + a JS-based PDF parser. Password-protected PDF support varies by library.

---

## Sources

### Primary (HIGH confidence)
- YNAB Official Method: https://www.ynab.com/ynab-method
- YNAB Features: https://www.ynab.com/features
- YNAB Age of Money: https://support.ynab.com/en_us/age-of-money-H1ZS84W1s
- YNAB Targets: https://support.ynab.com/en_us/how-to-use-targets-rk5kkI9ks
- Monarch Goals 3.0: https://help.monarch.com/hc/en-us/articles/44373110771860-Introducing-Goals-3-0
- Monarch Recurring Expenses: https://www.monarch.com/blog/track-recurring-bills-and-subscriptions
- Monarch Cash Flow Sankey: https://www.monarch.com/blog/visualize-your-cash-flow-like-never-before
- ynab-go Age of Money calculator (FIFO algorithm reference): https://github.com/kevinburke/ynab-go
- Toolkit for YNAB Days of Buffering: https://github.com/toolkit-for-ynab/toolkit-for-ynab

### Secondary (MEDIUM confidence)
- Age of Money vs Days of Buffering comparison: https://medium.com/@penzgil/which-ynab-metric-is-best-a23e4b8aeda9
- D3 Sankey diagram with React: https://www.react-graph-gallery.com/sankey-diagram
- react-native-svg Expo docs: https://docs.expo.dev/versions/latest/sdk/svg/
- Victory Native charting: https://nearform.com/open-source/victory-native/
- Subscription detection algorithms (Subaio): https://subaio.com/subaio-explained/how-does-subaio-detect-recurring-payments
- Recurring transaction detection SQL patterns: https://www.sqlhabit.com/blog/how-to-detect-recurring-payments-with-sql
- bKash statement info: https://www.bkash.com/page/rem-statement
- bKash statement format (Scribd example): https://www.scribd.com/document/897775407/Bkash-Statement
- Debt snowball vs avalanche (Fidelity): https://www.fidelity.com/learning-center/personal-finance/avalanche-snowball-debt
- PocketSmith cash flow forecasting: https://www.pocketsmith.com/tour/cash-flow-forecasts/

### Existing Project Research
- Full YNAB + Monarch competitor analysis: `.planning/research/MONARCH-YNAB-RESEARCH.md`
- Project definition: `.planning/PROJECT.md`

---
*Feature research for: DoinikHishab personal finance app — subsequent milestone features*
*Researched: 2026-03-25*
