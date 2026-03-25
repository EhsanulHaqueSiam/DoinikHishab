# Requirements: DoinikHishab v1.1

**Defined:** 2026-03-25
**Core Value:** 3-tap manual transaction entry with envelope budgeting that changes how Bangladeshi users think about money.

## v1.1 Requirements

### Tooling & Developer Experience

- [ ] **TOOL-01**: Biome configured for linting and formatting with project-specific rules, replacing manual style enforcement
- [ ] **TOOL-02**: Jest + jest-expo + React Native Testing Library configured for unit and integration tests with Convex mock patterns
- [ ] **TOOL-03**: expo-updates configured with EAS Update free tier for OTA JavaScript updates without app store review
- [ ] **TOOL-04**: Maestro E2E test framework configured with YAML-based flows for critical user paths
- [ ] **TOOL-05**: expo-localization + i18next configured for proper Bengali/English internationalization with pluralization, interpolation, and locale detection

### Transaction Experience

- [ ] **TRAN-01**: User can enter a transaction in 3 taps: amount via custom numeric keypad, category from recent/frequent grid, auto-save
- [ ] **TRAN-02**: Custom numeric keypad displays BDT formatting live (paisa to taka conversion) without system keyboard
- [ ] **TRAN-03**: Category grid shows recent/frequent categories first, sorted by usage frequency
- [ ] **TRAN-04**: Smart defaults auto-select last-used account, today's date, and expense type
- [ ] **TRAN-05**: Optional fields (payee, memo, flag) are collapsed by default, expandable inline

### Budget & YNAB Ideology

- [ ] **BUDG-01**: True Expenses / Sinking Funds displayed with culturally relevant Bengali templates (Eid Fund, School Fees, Wedding Gifts, Medical Reserve)
- [ ] **BUDG-02**: Sinking fund progress bars showing accumulation toward target with monthly auto-suggest amounts (target / months remaining)
- [ ] **BUDG-03**: "Give every taka a job" language throughout UI in Bengali and English — Ready to Assign prominently displayed and color-coded (teal positive, red over-assigned)
- [ ] **BUDG-04**: Age of Money metric computed via FIFO queue algorithm, displayed on dashboard card with trend arrow
- [ ] **BUDG-05**: Days of Buffering metric (total balance / average daily outflow) with configurable lookback period, displayed alongside Age of Money

### Onboarding & Education

- [ ] **ONBD-01**: YNAB 4 Rules education carousel with Bengali/English toggle explaining each rule
- [ ] **ONBD-02**: Guided first-time flow: add account, create categories (pre-populated Bangladeshi templates), assign first money, enter first transaction
- [ ] **ONBD-03**: Contextual rule tips that surface when relevant (first overspend triggers Rule 3, first sinking fund triggers Rule 2)
- [ ] **ONBD-04**: Progress indicator showing onboarding completion status

### Reports & Analytics

- [ ] **RPRT-01**: All existing reports (spending breakdown, income vs expense, net worth) fully functional on mobile with touch interactions
- [ ] **RPRT-02**: Responsive chart components with tap-to-filter segments and swipe between time periods
- [ ] **RPRT-03**: Age of Money line chart showing AoM trend over time in reports section
- [ ] **RPRT-04**: Sankey cash flow diagram using d3-sankey layout + react-native-svg rendering
- [ ] **RPRT-05**: Sankey simplified to vertical layout on mobile (income top, expenses bottom), full horizontal on web
- [ ] **RPRT-06**: Sankey privacy mode to hide amounts for screenshots/sharing (show proportions only)

### Recurring & Subscriptions

- [ ] **RECR-01**: Calendar view showing upcoming bills/subscriptions with status indicators (paid/upcoming/overdue)
- [ ] **RECR-02**: Calendar toggle between calendar grid and list view with monthly totals
- [ ] **RECR-03**: Subscription auto-detection from transaction history (3+ occurrences of same payee at regular intervals)
- [ ] **RECR-04**: Subscriptions view showing monthly/annual burn rate with manual add/remove
- [ ] **RECR-05**: Cash flow forecasting chart projecting account balance over 30/60/90 days based on recurring items
- [ ] **RECR-06**: Forecast danger zones highlighted in red where projected balance dips below zero

### Goals & Debt Payoff

- [ ] **GOAL-01**: Save-up goals with target amount, target date, linked account, and monthly contribution calculation
- [ ] **GOAL-02**: Save-up goal status tracking: on-track, behind, or ahead with progress bars
- [ ] **GOAL-03**: Pay-down goals with loan balance, APR, minimum payment, and amortization schedule
- [ ] **GOAL-04**: Avalanche vs snowball strategy comparison showing total interest saved and payoff date difference
- [ ] **GOAL-05**: Goal contributions appear as budget category line items

### Statement Import

- [ ] **IMPT-01**: bKash PDF statement parser handling password-protected PDFs with field extraction (date, type, amount, reference)
- [ ] **IMPT-02**: Nagad statement parser supporting XLS, PDF, and TXT formats
- [ ] **IMPT-03**: Transaction type mapping (bKash Cash Out = expense, Cash In = income, Send Money = user-decided)
- [ ] **IMPT-04**: Deduplication check against existing transactions by date + amount + reference before import
- [ ] **IMPT-05**: All statement parsing happens on-device — never upload files to server

## v2 Requirements

Deferred to future milestone. Tracked but not in current roadmap.

### Styling Upgrade

- **STYLE-01**: Upgrade to NativeWind v5 + Tailwind CSS v4 when v5 reaches stable release
- **STYLE-02**: Migrate custom color tokens and config to Tailwind v4 CSS variable format

### Advanced Features

- **ADV-01**: Push notifications for bill reminders (3 days before due date)
- **ADV-02**: Generic CSV column mapper for unknown statement formats
- **ADV-03**: Expo home screen widgets for quick balance checks
- **ADV-04**: Clerk authentication integration for multi-device sync

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Vitest for React Native components | Verified incompatibility — RNTL has known Vitest issues |
| NativeWind v5 (this milestone) | Pre-release (preview.3), "not intended for production use" |
| AI auto-categorization | No training data; manual categorization IS the engagement mechanism per YNAB philosophy |
| Flex budgeting (Monarch 3-bucket) | Conflicts with YNAB zero-based ideology — the methodology IS the product |
| Widget-based customizable dashboard | Engineering cost too high for RN; fixed layout is better for mobile-first |
| Investment portfolio tracking | Different product; doubles schema complexity; Bangladesh retail investing is nascent |
| Multi-user / family sharing | Requires Clerk auth (deferred); solo user first |
| Apple Watch / wearable app | Target demographic is Android-dominant; Bangladesh Watch penetration negligible |
| Voice transaction entry | Bengali speech recognition accuracy for financial amounts is poor; 3-tap is faster |
| Bank sync / Plaid | No bank API support in Bangladesh |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| TOOL-01 | - | Pending |
| TOOL-02 | - | Pending |
| TOOL-03 | - | Pending |
| TOOL-04 | - | Pending |
| TOOL-05 | - | Pending |
| TRAN-01 | - | Pending |
| TRAN-02 | - | Pending |
| TRAN-03 | - | Pending |
| TRAN-04 | - | Pending |
| TRAN-05 | - | Pending |
| BUDG-01 | - | Pending |
| BUDG-02 | - | Pending |
| BUDG-03 | - | Pending |
| BUDG-04 | - | Pending |
| BUDG-05 | - | Pending |
| ONBD-01 | - | Pending |
| ONBD-02 | - | Pending |
| ONBD-03 | - | Pending |
| ONBD-04 | - | Pending |
| RPRT-01 | - | Pending |
| RPRT-02 | - | Pending |
| RPRT-03 | - | Pending |
| RPRT-04 | - | Pending |
| RPRT-05 | - | Pending |
| RPRT-06 | - | Pending |
| RECR-01 | - | Pending |
| RECR-02 | - | Pending |
| RECR-03 | - | Pending |
| RECR-04 | - | Pending |
| RECR-05 | - | Pending |
| RECR-06 | - | Pending |
| GOAL-01 | - | Pending |
| GOAL-02 | - | Pending |
| GOAL-03 | - | Pending |
| GOAL-04 | - | Pending |
| GOAL-05 | - | Pending |
| IMPT-01 | - | Pending |
| IMPT-02 | - | Pending |
| IMPT-03 | - | Pending |
| IMPT-04 | - | Pending |
| IMPT-05 | - | Pending |

**Coverage:**
- v1.1 requirements: 41 total
- Mapped to phases: 0
- Unmapped: 41 ⚠️

---
*Requirements defined: 2026-03-25*
*Last updated: 2026-03-25 after initial definition*
