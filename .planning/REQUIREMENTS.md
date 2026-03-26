# Requirements: DoinikHishab v1.1

**Defined:** 2026-03-25
**Core Value:** 3-tap manual transaction entry with envelope budgeting that changes how Bangladeshi users think about money.

## v1.1 Requirements

### Tooling & Developer Experience

- [x] **TOOL-01**: Biome configured for linting and formatting with project-specific rules, replacing manual style enforcement
- [x] **TOOL-02**: Jest + jest-expo + React Native Testing Library configured for unit and integration tests with Convex mock patterns
- [ ] **TOOL-03**: expo-updates configured with EAS Update free tier for OTA JavaScript updates without app store review
- [ ] **TOOL-04**: Maestro E2E test framework configured with YAML-based flows for critical user paths
- [x] **TOOL-05**: expo-localization + i18next configured for proper Bengali/English internationalization with pluralization, interpolation, and locale detection

### Transaction Experience

- [x] **TRAN-01**: User can enter a transaction in 3 taps: amount via custom numeric keypad, category from recent/frequent grid, auto-save
- [x] **TRAN-02**: Custom numeric keypad displays BDT formatting live (paisa to taka conversion) without system keyboard
- [x] **TRAN-03**: Category grid shows recent/frequent categories first, sorted by usage frequency
- [x] **TRAN-04**: Smart defaults auto-select last-used account, today's date, and expense type
- [x] **TRAN-05**: Optional fields (payee, memo, flag) are collapsed by default, expandable inline

### Budget & YNAB Ideology

- [x] **BUDG-01**: True Expenses / Sinking Funds displayed with culturally relevant Bengali templates (Eid Fund, School Fees, Wedding Gifts, Medical Reserve)
- [ ] **BUDG-02**: Sinking fund progress bars showing accumulation toward target with monthly auto-suggest amounts (target / months remaining)
- [ ] **BUDG-03**: "Give every taka a job" language throughout UI in Bengali and English — Ready to Assign prominently displayed and color-coded (teal positive, red over-assigned)
- [x] **BUDG-04**: Age of Money metric computed via FIFO queue algorithm, displayed on dashboard card with trend arrow
- [x] **BUDG-05**: Days of Buffering metric (total balance / average daily outflow) with configurable lookback period, displayed alongside Age of Money

### Onboarding & Education

- [x] **ONBD-01**: YNAB 4 Rules education carousel with Bengali/English toggle explaining each rule
- [x] **ONBD-02**: Guided first-time flow: add account, create categories (pre-populated Bangladeshi templates), assign first money, enter first transaction
- [x] **ONBD-03**: Contextual rule tips that surface when relevant (first overspend triggers Rule 3, first sinking fund triggers Rule 2)
- [x] **ONBD-04**: Progress indicator showing onboarding completion status

### Reports & Analytics

- [x] **RPRT-01**: All existing reports (spending breakdown, income vs expense, net worth) fully functional on mobile with touch interactions
- [x] **RPRT-02**: Responsive chart components with tap-to-filter segments and swipe between time periods
- [x] **RPRT-03**: Age of Money line chart showing AoM trend over time in reports section
- [x] **RPRT-04**: Sankey cash flow diagram using d3-sankey layout + react-native-svg rendering
- [x] **RPRT-05**: Sankey simplified to vertical layout on mobile (income top, expenses bottom), full horizontal on web
- [x] **RPRT-06**: Sankey privacy mode to hide amounts for screenshots/sharing (show proportions only)

### Recurring & Subscriptions

- [x] **RECR-01**: Calendar view showing upcoming bills/subscriptions with status indicators (paid/upcoming/overdue)
- [x] **RECR-02**: Calendar toggle between calendar grid and list view with monthly totals
- [x] **RECR-03**: Subscription auto-detection from transaction history (3+ occurrences of same payee at regular intervals)
- [x] **RECR-04**: Subscriptions view showing monthly/annual burn rate with manual add/remove
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
| TOOL-01 | Phase 1 | Complete |
| TOOL-02 | Phase 1 | Complete |
| TOOL-05 | Phase 1 | Complete |
| TRAN-01 | Phase 2 | Complete |
| TRAN-02 | Phase 2 | Complete |
| TRAN-03 | Phase 2 | Complete |
| TRAN-04 | Phase 2 | Complete |
| TRAN-05 | Phase 2 | Complete |
| BUDG-01 | Phase 3 | Complete |
| BUDG-02 | Phase 3 | Pending |
| BUDG-03 | Phase 3 | Pending |
| BUDG-04 | Phase 3 | Complete |
| BUDG-05 | Phase 3 | Complete |
| ONBD-01 | Phase 3 | Complete |
| ONBD-02 | Phase 3 | Complete |
| ONBD-03 | Phase 3 | Complete |
| ONBD-04 | Phase 3 | Complete |
| RPRT-01 | Phase 4 | Complete |
| RPRT-02 | Phase 4 | Complete |
| RPRT-03 | Phase 4 | Complete |
| RPRT-04 | Phase 4 | Complete |
| RPRT-05 | Phase 4 | Complete |
| RPRT-06 | Phase 4 | Complete |
| RECR-01 | Phase 5 | Complete |
| RECR-02 | Phase 5 | Complete |
| RECR-03 | Phase 5 | Complete |
| RECR-04 | Phase 5 | Complete |
| RECR-05 | Phase 5 | Pending |
| RECR-06 | Phase 5 | Pending |
| GOAL-01 | Phase 6 | Pending |
| GOAL-02 | Phase 6 | Pending |
| GOAL-03 | Phase 6 | Pending |
| GOAL-04 | Phase 6 | Pending |
| GOAL-05 | Phase 6 | Pending |
| IMPT-01 | Phase 6 | Pending |
| IMPT-02 | Phase 6 | Pending |
| IMPT-03 | Phase 6 | Pending |
| IMPT-04 | Phase 6 | Pending |
| IMPT-05 | Phase 6 | Pending |
| TOOL-03 | Phase 7 | Pending |
| TOOL-04 | Phase 7 | Pending |

**Coverage:**
- v1.1 requirements: 41 total
- Mapped to phases: 41
- Unmapped: 0

---
*Requirements defined: 2026-03-25*
*Last updated: 2026-03-25 after roadmap creation*
