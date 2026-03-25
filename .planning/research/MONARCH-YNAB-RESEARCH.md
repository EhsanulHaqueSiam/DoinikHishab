# Competitor Research: YNAB + Monarch Money
## Feature Intelligence for DoinikHishab Roadmap

**Researched:** 2026-03-25
**Domain:** Personal Finance App Competitive Analysis (YNAB + Monarch Money)
**Confidence:** HIGH (cross-verified across official docs, multiple reviews, help centers)

---

## Summary

This research deconstructs two best-in-class personal finance apps — YNAB (You Need A Budget) and Monarch Money — across ideology, features, UI/UX, and workflow. The goal is to synthesize a clear product direction for DoinikHishab: a Bangladeshi money tracking app that brings YNAB's budgeting discipline together with Monarch's comprehensive financial picture, delivered through a simpler input method suited to mobile-first, cash-heavy markets.

**YNAB's core thesis:** Change how you think about money. Assign every taka a job before you spend it. Zero-based budgeting forces proactive planning rather than reactive regret. The app's value is not in software features — it's in the behavioral transformation the methodology produces.

**Monarch's core thesis:** See your entire financial life in one place. Combine budgeting with investment tracking, net worth history, cash flow forecasting, and collaboration. Less about behavior change, more about comprehensive visibility with minimal manual effort.

**Primary recommendation:** Build DoinikHishab with YNAB's zero-based ideology as the philosophical core (every taka gets a job) and Monarch's structural completeness (net worth, goals, recurring expenses, cash flow) as the feature surface. The differentiator for Bangladesh: make transaction entry faster than both (3-tap entry, amount-first keypad), integrate bKash/Nagad as accounts, and support graceful offline operation.

---

## Part 1 — YNAB: Ideology and Feature Architecture

### 1.1 The YNAB Method (4 Rules / 5 Questions Framework)

YNAB has evolved its communication from "4 rules" to a "5 questions" framework, but the underlying principles are identical. Both framings are documented here because YNAB users and the community still refer to the 4 rules.

#### Rule 1: Give Every Dollar a Job (Question: "What does this money need to do before I'm paid again?")

- The foundational rule. Every taka in your accounts must be assigned to a named category before it can be spent.
- You only assign money you currently have — no budgeting against future income.
- The budget is a spending plan, not a ledger of what already happened.
- This forces the mental model of "I have ৳15,000 — how much of that is for groceries, rent, and fun money?" before spending occurs.
- **"Ready to Assign"** is the central metric: it shows unallocated money. The goal is to drive it to zero by assigning every taka somewhere.
- Mental accounting: The budget screen acts as a virtual set of labeled envelopes. Checking "Clothing" before buying tells you exactly how much you can spend guilt-free.

#### Rule 2: Embrace True Expenses (Question: "What larger, less frequent spending do I need to prepare for?")

- Irregular but predictable costs (car repair, Eid shopping, annual insurance, back-to-school, medical) are "true expenses" — not emergencies.
- Solution: Fund these categories monthly in small installments. A ৳12,000 yearly expense becomes ৳1,000/month.
- This eliminates the budget-derailing "surprise" that was always predictable if you thought about it.
- Categories accumulate balance over time (positive rollover) so money is ready when the expense arrives.
- **Behavioral shift:** No expense is truly unexpected — only un-planned.

#### Rule 3: Roll With the Punches (Question: "What changes do I need to make, if any?")

- Budgets are not rigid. Life is unpredictable.
- When you overspend a category, you don't fail — you adjust. Move money from a less important category to cover the overage.
- No guilt, no shame. The system resets your view of budgeting from "pass/fail" to "adapt/learn."
- YNAB UI reinforces this: overspent categories turn orange/red, but the fix is a drag-and-drop or tap-to-move that resolves instantly.
- **Behavioral shift:** Flexibility is built in. The budget is a living document, not a locked plan.

#### Rule 4: Age Your Money (Question: "What can I set aside for next month's spending?")

- The ultimate goal: break the paycheck-to-paycheck cycle by building a time buffer between earning and spending.
- **Age of Money (AoM) metric:** How many days, on average, between when a dollar entered your budget and when it was spent.
- Low AoM (< 10 days): Living paycheck to paycheck — money is spent as fast as it arrives.
- AoM = 30 days: You are living on last month's income. Payday and due dates no longer matter.
- AoM = 60+ days: Financially buffered. True financial resilience.
- **Days of Buffering (DoB):** Third-party metric (Toolkit for YNAB extension). At your current spending rate, how many days would your existing funds last? Different from AoM in that it measures reserves, not timing.
- **Getting a month ahead:** YNAB's aspirational state. Assign all of next month's income before the month begins. The budget becomes a 30-day cushion.

#### Question 5 / Rule 5: Build Stability and Resilience

- Build reserves against next month so that payday and due-dates stop mattering.
- Practically: Once all current month's envelopes are funded, start funding next month's categories.

### 1.2 Zero-Based Budgeting Mechanics in YNAB

- **Income arrives → Ready to Assign increases**
- **User manually assigns money to categories → Ready to Assign decreases**
- **Goal: Ready to Assign = ৳0** (every taka is working)
- **Transactions are entered → Category Available balance decreases**
- **Month end:** Positive balances roll forward automatically; overspending reduces next month's Ready to Assign (cash) or creates a debt warning (credit card)
- **Monthly fresh start:** All assigned amounts reset to zero at month turn. Goals, accounts, and category balances persist. User must reassign for the new month.
- **AutoAssign:** YNAB can auto-assign based on saved targets/templates

### 1.3 Credit Card Handling (YNAB's Most Complex but Powerful Feature)

YNAB's credit card handling is unique and counterintuitive at first:

- Credit card accounts have a special "Credit Card Payment" category.
- When you charge ৳500 to dining out using a credit card, YNAB automatically moves ৳500 from the Dining Out category balance into the Credit Card Payment category.
- This means the money "follows the transaction" — you always know if your credit card payment category is fully funded.
- **If you have no credit card debt:** The Credit Card Payment category should equal your full balance. Pay the full statement.
- **If you are paying down existing debt:** The payment category shows only what you've assigned this month. Budget extra toward the card to chip away at debt.
- **Credit card overspending:** Different from cash overspending. Cash overspending reduces next month's Ready to Assign. Credit card overspending creates a new debt — the system alerts you separately.
- **The credit card float:** Spending tomorrow's money on a credit card without having the cash today is visible and warned against. YNAB surfaces this as a "float" situation.

### 1.4 Complete YNAB Feature List

#### Account Management
- Checking, savings, cash, credit cards, loans, mortgages, tracking accounts (investment/asset without full sync)
- Direct bank sync via Plaid (2,300+ institutions in US; expanded to European banks 2025)
- Apple Card import (near-instant)
- Manual account entry (cash accounts, foreign accounts)
- File-based import: CSV, QIF, QFX, OFX formats
- Account reconciliation (web + Android; iOS manual reconcile)
- Closed account support

#### Transaction Management
- Manual transaction entry: date, payee, category, memo, amount, account, cleared status
- Bank-imported transaction approval (imported transactions appear as pending; user approves and optionally recategorizes)
- Transaction matching (import + manual = one transaction)
- Split transactions (one transaction divided across multiple categories — e.g., Costco split between groceries, household, clothing)
- Transfer transactions between accounts
- Inflow vs. outflow (income vs. expense)
- Memo/note field
- Flag transactions with colors (6 flag colors for marking/filtering)
- Search and filter transactions
- Bulk actions on multiple transactions
- Recurring transactions: manual scheduled; no auto-recurring detection

#### Budgeting
- Category Groups (folders, e.g., "Housing", "Food", "Fun")
- Categories within groups (e.g., "Rent", "Utilities" under Housing)
- Category targets/goals — 6 types:
  - Monthly spending target (spend ৳X each month)
  - Weekly spending target
  - Yearly spending target
  - By-date savings target (save ৳X by a specific date)
  - Monthly savings builder (save ৳X/month, no cap)
  - Refill up to (keep balance at ৳X)
- Ready to Assign (central dashboard metric)
- Assign money to categories manually or via AutoAssign
- Category templates (importable pre-made category setups)
- Focused Views (customize which categories are visible)
- Budget copy from previous month
- Category emoji support

#### Reporting (Desktop/Web only — not mobile as of 2025)
- Net Worth report: assets vs. liabilities month by month chart
- Spending Breakdown: pie chart by category/group + percentage
- Spending Trends: bar chart of total spending over time
- Income vs. Expense: monthly income and expense comparison with averages
- Age of Money report: line chart showing AoM over time
- Filter by: category groups, accounts, timeframe
- Reflect feature (new name for reports section)

#### Debt Management
- Loan Planner: input loan details, simulate extra payments, see time/interest savings
- Supports mortgages, auto loans, home equity loans
- Credit card debt paydown via Credit Card Payment category
- Debt balance visible in Net Worth report

#### Collaboration
- YNAB Together: share one budget with up to 6 people on a single subscription
- All users see the same budget simultaneously
- No separate logins with individual views — shared view only

#### Mobile Experience
- iOS app: full budgeting, transaction entry, reports NOT available (web only)
- Android app: full budgeting, transaction entry, reconciliation
- Apple Watch app: check category balances, quick spending decisions
- iOS widgets: category balances on home screen
- Long-press app icon (Android): jump directly to transaction entry
- Home screen shortcut (Android): drag "+" icon to desktop
- Apple Shortcuts integration (iOS): view balances, add transactions via Shortcuts
- Offline support: full offline functionality, syncs when reconnected

#### Education and Community
- Live workshops (daily, free for subscribers)
- Video library
- Active subreddit community (r/ynab)
- YNAB Certified Coaches (third-party coaches trained by YNAB)
- "The YNAB Method" guide (free, available without account)

#### Pricing (as of 2025)
- 34-day free trial (no credit card required)
- $14.99/month or $109/year
- Single subscription covers up to 6 people

### 1.5 YNAB UI/UX Design Patterns

#### Budget Screen Layout
- Spreadsheet-like grid: rows = categories, columns = Assigned / Activity / Available
- **Assigned:** How much you allocated this month
- **Activity:** How much was actually spent (from transactions)
- **Available:** Assigned minus Activity — what you can still spend
- Categories grouped under collapsible group headers
- Color coding:
  - Green available balance = fully funded, money available to spend
  - Yellow available balance = underfunded (target not met, but positive)
  - Orange available balance = overspent (negative balance)
  - Gray = category hidden or archived
- "Ready to Assign" header bar at the top — turns yellow/orange if negative
- Tapping a category opens an assignment panel on web; opens detail screen on mobile
- Focused Views: filter to show only certain groups/categories

#### Transaction Entry Flow (Mobile)
1. Tap "+" or use widget/long-press shortcut
2. Select transaction type (Expense / Income / Transfer)
3. Enter amount (numeric keypad)
4. Select payee (previous payees surfaced first, or type new)
5. Select category (category grid/list)
6. Select account
7. Date (defaults to today)
8. Optional: memo/note, flag
9. Save

The mobile entry flow is efficient but requires navigating through several screens (amount → payee → category → account).

#### Empty State / Onboarding Philosophy
- Education-first: YNAB explains WHY at each onboarding step before asking you to do anything
- Friendly, warm copy ("Welcome to your budget!" not "Complete setup")
- Explains the 4 rules in context as you set up categories
- No data = no problem; guides you through adding first account and first categories
- Doesn't overwhelm with features — surfaces the core workflow (assign → spend → adjust)

#### Navigation
- Primary navigation: Sidebar (web) / Tab bar (mobile) with Budget, Accounts, Reports, and Spotlight
- Spotlight (launched March 2025): A new dashboard area showing priority alerts and top financial priorities — "what needs your attention NOW"
- Reports accessible from web sidebar; NOT available in mobile app

---

## Part 2 — Monarch Money: Philosophy and Feature Architecture

### 2.1 Monarch's Core Philosophy

Monarch Money is a **comprehensive financial dashboard** rather than a strict budgeting methodology. The philosophy:

- **See everything in one place:** Bank accounts, investments, real estate, crypto, loans — all unified.
- **Passive is acceptable:** You can connect accounts, let Monarch auto-categorize, and check in periodically. No mandatory daily engagement.
- **Flexibility over rules:** Offers both strict category budgeting AND loose flex budgeting. Users choose their engagement level.
- **Cash flow over envelope:** The default lens is "how much came in, how much went out" rather than "I need to assign every dollar before spending it."
- **Net worth as the north star:** Your financial progress is measured by growing net worth, not just budget compliance.
- **Collaboration is core:** Couples and families are a primary use case — separate logins, shared view, individual privacy preserved.

### 2.2 Monarch's Two Budgeting Methods

#### Flex Budgeting (Default)
- Simplifies budget into 3 high-level buckets:
  - **Fixed expenses:** Rent, loan payments, subscriptions — predictable monthly amounts
  - **Non-monthly expenses:** Annual insurance, car maintenance, irregular bills — amortized monthly
  - **Flexible spending:** Everything else — dining, entertainment, shopping — tracked as a single number
- The user monitors one number (their flex budget) rather than 10+ individual categories.
- Good for: People who want budget awareness without detailed tracking
- Visual: One primary number showing remaining flex spending budget

#### Category Budgeting
- Traditional method: every expense category gets its own budget target
- Users track spending vs. target per category
- Budget rollover: Unspent amounts can roll over to next month (configurable per category)
- Non-monthly categories: Fund a monthly amount that accumulates until the expense is due
- Visual: Progress bars per category, color-coded against budget
- Good for: Users who want YNAB-style detail without the ideological commitment

### 2.3 Complete Monarch Money Feature List

#### Account Management
- Direct sync via Plaid + multiple additional data providers (13,000+ institutions)
- Account types: checking, savings, credit cards, loans, mortgages, 401(k)s, IRAs, brokerage accounts, crypto (Coinbase), real estate (Zillow Zestimate)
- Manual accounts (cash, foreign accounts, anything not syncing)
- Cryptocurrency tracking
- Net worth calculated automatically across all accounts
- Collapsible account groups
- Account-level tagging for household/individual split

#### Transaction Management
- Auto-import from connected accounts (near real-time)
- AI auto-categorization (~90-95% accuracy after learning period)
- Manual transaction entry (only for manual accounts)
- Transaction editing: date, merchant, category, account, amount, notes, tags
- Split transactions: divide one transaction across multiple categories (on mobile and web)
- Transaction rules: create rules to auto-categorize based on merchant name
- Transaction swipe-to-review on mobile
- Notes displayed as icons in transaction list
- Transaction flags/tags (custom labels)
- Search and filter across all accounts
- Transaction assignment to household member ("mine/theirs/ours")

#### Budgeting
- Flex budgeting (3 buckets: fixed, non-monthly, flexible)
- Category budgeting (traditional per-category targets)
- Category groups (customizable, emoji-supported)
- Budget rollovers per category (toggle on/off)
- Non-monthly expense planning (savings accumulate toward infrequent expenses)
- Budget forecasting (see future months based on recurring income/expenses)
- iOS budget widget (real-time tracking on home screen)
- Budget templates

#### Recurring Expenses (Standout Feature)
- Automatic recurring detection: scans transaction history for patterns
- Calendar view: monthly calendar showing all upcoming bills and subscriptions
- List view: filterable by frequency, category, account, amount
- Status indicators: green checkmark (paid as expected), yellow (paid at different amount)
- Manual recurring addition
- Push/email notifications 3 days before expected payment
- Bill Sync feature: auto-detects credit card and loan bill due dates
- Merchant management: deduplicate, merge, rename merchants
- One-tap confirmation when a recurring item is paid

#### Goals (Goals 3.0)
- **Save Up Goals:** Set target amount, target date, monthly contribution; system calculates on-track/ahead/behind status
- **Pay Down Goals:** Debt payoff with APR, minimum payment, planned payment; shows debt-free date, principal vs. interest breakdown over time
- Debt payoff scenarios: compare avalanche vs. snowball vs. custom payments; lump sum simulation
- Assign specific accounts to specific goals
- Multiple simultaneous goals (unlimited)
- Goal progress visualization with milestone cards
- Goals integrated into monthly budget (contributions show up as budget line items)

#### Net Worth Tracking
- Full asset/liability aggregation
- Net worth history chart (multi-year view)
- Real estate via Zillow Zestimate integration
- Investment portfolio breakdown by asset class (stocks, ETFs, mutual funds, 401k, crypto, cash)
- Investment performance vs. benchmarks
- Top movers widget

#### Recurring Expenses
- (see Recurring Expenses section above)

#### Reports and Analytics
- **Spending Report:** Category-level breakdown, historical comparisons, filters by account/date/category/merchant/tag
- **Cash Flow Report (Sankey Diagram):** Visual flow chart showing income sources → spending categories. Interactive. Sharable (with optional amount-hiding for privacy). Household view and individual view.
- **Cash Flow Bar Charts:** Two chart types showing monthly trends
- **Net Worth Report:** Multi-year history with asset and liability breakdown
- **Investment Performance Report:** Select account groups, view returns
- Custom saved reports (save filter combinations for reuse)
- Interactive charts: click segments to filter transactions on the same page
- **Reports availability:** Web only for most advanced reports (Sankey, full interactivity); mobile has core charts

#### AI Features
- AI auto-categorization (always on, not opt-out)
- AI Assistant: natural language questions about your finances ("Why did my spending increase last month?")
- AI Insights: sparkle icon on dashboard/accounts — click for AI explanation of changes
- Weekly Recap: AI summary of financial activity
- Receipt scanning: photo → extracts merchant, amount, date, tax, tip, line items
- Projected balance forecasting

#### Collaboration
- Unlimited household members (partners, family) — no extra cost
- Role types: Admin, Member, Professional (advisor/planner)
- Separate logins with individual privacy
- Shared views: mark accounts/transactions as mine/theirs/ours
- Filter reports by individual vs. household
- Household flows in Sankey diagram
- Advisor sharing: invite financial planner to read-only access
- Real-time commenting on transactions

#### Mobile Experience
- iOS and Android apps (4.7-4.9 star ratings)
- Full feature parity with web for most features
- Customizable dashboard: drag-and-drop widgets, hide/show, web and mobile configured independently
- Widget types: net worth, recent transactions, investment performance, budget summary, cash flow
- Transaction swipe-to-review
- Budget category iOS widget (home screen)
- Push notifications for recurring expenses (3 days ahead)
- Mobile notifications in header (not buried in menu)

#### Import/Export
- CSV import (manual accounts)
- CSV export
- No OFX/QIF import (bank sync is the primary path)

#### Pricing (as of 2025)
- 7-day free trial
- $14.99/month or $99.99/year
- All features included; no tiered plans
- Collaboration (household + advisor) included in base price

### 2.4 Monarch UI/UX Design Patterns

#### Dashboard Design
- Widget-based, customizable grid
- Default widgets: net worth chart, recent transactions, budget summary, cash flow, investment performance
- Drag-and-drop reorder, hide/show per widget
- Web and mobile dashboards configured independently
- Information density improvements (2025): reduced row heights, more content visible without scrolling
- Dark mode: full dark mode with improved contrast (2025 refresh moved away from "navy mode")
- Color palette: warm, approachable tones with high contrast; color-coded categories and budget progress

#### Navigation
- Sidebar navigation (web): Dashboard, Transactions, Budget, Recurring, Goals, Reports, Net Worth, Investments
- Collapsible sidebar: provides more screen real estate
- Breadcrumbs on detail pages for wayfinding
- Tab navigation (mobile): bottom tabs
- Notifications in header (mobile) for low-friction access

#### Budget Screen Layout
- Progress bars per category (visual fill showing spent/remaining)
- Collapsible income/expense sections
- Color-coded: green (under budget), red/orange (over budget), gray (unset)
- Group headers with subtotals
- Non-monthly category shows accumulated savings amount

#### Transaction Entry (Manual)
Flow for manual transaction:
1. Tap "..." (options menu) or floating "+" button
2. Select "Add transaction"
3. Toggle debit or credit
4. Enter amount
5. Set merchant (with autocomplete from history)
6. Set date (defaults to today)
7. Choose account
8. Select category (with search)
9. Add note (optional)
10. Add tags (optional)
11. Save

Manual entry is secondary to bank sync in Monarch's design. The UI assumes most transactions come from bank imports — manual entry is for cash or unsyncable accounts.

#### Transaction List Design
- Reduced row height for density (2025)
- Merchant name + category icon
- Note indicator icon (not full note text)
- Swipe left to categorize, swipe right to review/approve
- Color-coded by category

#### Recurring Page Design
- Two views: Calendar (monthly grid showing upcoming bills) and List (sorted by frequency/amount/category)
- Color coding: green checkmark (paid as expected), yellow (paid at different amount than expected), red (missed/overdue)
- Summary row at top: total income, credit card bills, expenses for the month
- 3-day ahead push notification
- Tap any recurring item to see history and manage

#### Empty States
- More automated — fewer empty states since bank sync populates data quickly
- Onboarding emphasis: connect accounts → transactions auto-appear → categorization begins immediately
- Less ideological onboarding than YNAB; more "connect and go"

---

## Part 3 — Feature Comparison Matrix

| Feature | YNAB | Monarch Money | DoinikHishab (Current) |
|---------|------|---------------|------------------------|
| Zero-based budgeting | Yes (core) | Optional (category budgeting) | Yes (YNAB-style) |
| Flex/cash-flow budgeting | No | Yes (default) | No |
| Ready to Assign metric | Yes | No (equivalent: budget surplus) | Yes |
| Net worth tracking | Basic | Comprehensive | Yes (basic) |
| Investment tracking | No | Yes (comprehensive) | No |
| Recurring expense detection | Manual only | Auto-detection | Yes (scheduled) |
| Recurring calendar view | No | Yes | No |
| Goal system | Yes (6 target types) | Yes (save-up + pay-down) | Basic (targets) |
| Debt payoff simulator | Yes (loan planner) | Yes (Goals 3.0) | No |
| Cash flow Sankey diagram | No | Yes | No |
| Collaboration / family | Yes (shared budget, 6 people) | Yes (separate logins, unlimited) | No |
| AI categorization | No | Yes (~90-95% accuracy) | Yes (rule-based) |
| AI assistant / chat | No | Yes | Yes |
| Receipt scanning | No | Yes | No |
| Bank sync | Yes (2,300+) | Yes (13,000+) | No (manual only) |
| CSV/OFX import | Yes | CSV only | Yes |
| Age of Money metric | Yes | No | Yes (calculated) |
| Crypto tracking | Manual | Coinbase integration | No |
| Real estate tracking | No | Zillow integration | No |
| Credit score | No | Yes | No |
| Reports (spending breakdown) | Yes (web only) | Yes (web + mobile) | Yes |
| Income vs. expense | Yes | Yes | Yes |
| Custom saved reports | No | Yes | No |
| Dark mode | Yes | Yes (improved 2025) | Yes |
| Apple Watch app | Yes | No | No |
| Home screen widgets | Yes (iOS/Android) | Yes (iOS) | No |
| Offline support | Full | Partial | Yes (MMKV storage) |
| Multi-currency | Workaround only | Workaround only | No (BDT only) |
| Bengali/local language | No | No | Yes |
| bKash/Nagad accounts | No | No | No (but possible) |

---

## Part 4 — What Makes Each App Best-In-Class

### YNAB's Unmatched Strengths

1. **The methodology is the product.** YNAB is the only app where the philosophy itself transforms user behavior. Average user saves $600 in first 2 months, $6,000 in first year (2025 survey). The 4 rules are internalized, not just used.

2. **Credit card handling is uniquely correct.** No other app models credit card spending the way YNAB does — funds move automatically when you swipe, so your payment category is always accurate. This prevents the "I'll just pay the minimum" trap.

3. **Age of Money is a unique motivational metric.** Watching your Age of Money grow from 3 days to 30 days to 60 days is a journey. It makes abstract financial health concrete and measurable.

4. **Guilt-free spending through intentional allocation.** When you assign money to "Fun Money" and spend it, there's no guilt — you planned for it. This psychological shift is YNAB's most powerful feature.

5. **Education ecosystem.** Daily live workshops, certified coaches, active community — YNAB has built a support infrastructure that makes behavior change possible, not just the tool.

6. **True Expenses as a mindset shift.** Making users think about Eid shopping in January, car maintenance in February, and back-to-school in June changes how people think about surprise expenses.

### Monarch Money's Unmatched Strengths

1. **The Sankey diagram cash flow report** is a genuinely unique visualization — a flowing diagram that shows exactly where money comes from and where it goes, shareable with amount-hiding for privacy. Nothing else like it.

2. **Recurring expenses as first-class citizens.** The calendar view with automatic detection, 3-day reminders, and payment confirmation workflow is the industry's best recurring expense UX. Never miss a bill, never forget a subscription.

3. **Goals 3.0 debt payoff system.** Avalanche vs. snowball scenarios with interest calculation and debt-free date projection is among the most complete debt management tools in a consumer app.

4. **Household collaboration without compromise.** Separate logins, mine/theirs/ours tagging, advisor sharing, and Shared Views that filter reports by individual — this is couples finance done right.

5. **Customizable widget dashboard.** The ability to create your personal financial command center with exactly the widgets you want, configured differently on web vs. mobile.

6. **AI Insights with sparkle icons.** Instead of requiring users to interpret data, AI surfaces explanations proactively — "your dining spending increased 40% last month because of 3 restaurant visits at X."

7. **Receipt scanning.** Photograph a receipt and it extracts merchant, amount, date, tax, tip, and line items. Massive friction reduction for expense tracking.

---

## Part 5 — UI/UX Pattern Library

Specific patterns worth extracting for DoinikHishab:

### Pattern 1: Amount-First Entry (Shared)
Both apps surface the amount field prominently first. Users want to record the number while it's fresh. Amount → category → other details is the correct flow order for mobile transaction entry.

**Implementation:** Large numeric keypad covering 80% of the screen, amount displayed in large font at top. No keyboard — custom keypad prevents autocorrect/keyboard dismiss issues on mobile.

### Pattern 2: Category Grid (YNAB Mobile)
Category selection via scrollable icon grid rather than a flat list. Icons (emoji or custom) provide quick visual scanning. Most-used categories bubble to top.

**Implementation:** 3-4 column grid, tap to select. Recents section at top showing last 4-6 used categories. Full list below with search input.

### Pattern 3: Progress Bars Per Category (Monarch)
Each budget category shows a horizontal progress bar with fill color changing from green → yellow → red as the budget fills. At-a-glance status without reading numbers.

**Implementation:** Progress bar fills left-to-right. Green = under 80% spent, yellow = 80-100%, red = over 100% (overspent). Remaining amount and percentage displayed.

### Pattern 4: Recurring Calendar View (Monarch)
Monthly calendar view for recurring transactions. Each day with scheduled items shows a dot or badge. Tapping a date reveals upcoming/paid items. Status color (green paid, yellow different amount, red overdue).

**Implementation:** Native calendar grid component. Color-coded badges. Summary row above calendar showing monthly totals. Toggle between calendar and list view.

### Pattern 5: Ready to Assign / Unassigned Money Indicator (YNAB)
Persistent header metric showing unassigned money. Drives engagement and completion behavior — users want to drive this to zero.

**Implementation:** Sticky header on budget screen. Color changes: green = some money to assign (positive), red/orange = overassigned (negative). Tap to see explanation.

### Pattern 6: Sankey Cash Flow Diagram (Monarch)
Flow diagram showing income sources on the left, spending categories on the right, with proportional flow lines. Interactive — tap a flow to filter transactions.

**Implementation:** SVG-based flow visualization. Works best on web/larger screens. Mobile: simplified bar chart alternative.

### Pattern 7: Spotlight / Priority Dashboard (YNAB)
A dashboard area that shows ONLY what needs attention: unapproved transactions, overspent categories, accounts needing reconciliation. Reduces cognitive load — don't show what's fine, only show what needs action.

**Implementation:** Alert cards with action buttons. Dismissable. Two sections: "Needs action now" and "Top priorities" (user-selected categories to always watch).

### Pattern 8: Widget-Based Dashboard (Monarch)
Drag-and-drop widget grid for dashboard customization. Users can show/hide widgets, reorder, and configure independently per platform.

**Implementation:** Persistent widget order in user settings. Web widgets ≠ mobile widgets (configured separately). Default set covers 80% of users.

### Pattern 9: Collapsible Category Groups (Both)
Budget categories organized into collapsible groups (Housing, Food, Transport, Fun). Groups show subtotals. Individual categories expand within. Reduces cognitive load on long budgets.

**Implementation:** Section header with group name + total assigned + total activity + total available. Chevron to expand/collapse. Collapsed state shows summary only.

### Pattern 10: Color-Coded Status System (Both)
Consistent color language across the app:
- Green = on track / positive / paid / under budget
- Yellow/amber = warning / approaching limit / slight variance
- Red/orange = over budget / overspent / missed
- Gray = no data / archived / disabled

---

## Part 6 — Transaction Categorization Approaches

### YNAB Approach
- **Bank-imported transactions:** Imported with payee name from bank. User must approve and categorize each one.
- **Manual entry:** User selects category explicitly.
- **Payee memory:** YNAB remembers the last category used for a payee and auto-suggests it.
- **No ML categorization:** YNAB deliberately keeps categorization manual — the act of reviewing and approving each transaction is part of the behavioral engagement model.
- **Split transactions:** Any transaction can be split across multiple categories post-entry.
- **Rename payees:** Users can clean up messy bank payee names to friendly names (applies retroactively and to future imports).

### Monarch Approach
- **AI auto-categorization:** Transactions imported from banks are automatically categorized using AI. ~90-95% accurate after a few weeks.
- **Transaction rules:** Users can create rules ("If merchant contains 'Shajgoj', categorize as Beauty") that run automatically.
- **User correction loop:** When user changes a category, system learns from the correction.
- **Receipt scanning:** Photo → AI extracts and creates transaction draft with all fields.
- **Review queue:** Transactions can be "reviewed" or "approved" with a swipe — encourages daily check-in without requiring it.

### For DoinikHishab
**Current:** Rule-based auto-categorization (pattern matching on payee name/memo).
**Recommended upgrade path:** Start with improved rules, add ML-based categorization later. The key insight from YNAB: manual review is not a bug — it's the engagement mechanism. Don't over-automate early on. Let users build the habit of reviewing transactions.

---

## Part 7 — Reporting and Analytics Deep Dive

### YNAB Reports (5 types, web/desktop only)
1. **Net Worth:** Monthly bar or line chart of total assets minus total liabilities. Simple but motivating.
2. **Spending Breakdown:** Pie/donut chart of spending by category or group. Shows %, total, and average. Filterable by account, category group, and time range.
3. **Spending Trends:** Bar chart of total monthly spending over time. Identifies months with unusual spending. Filterable.
4. **Income vs. Expense:** Side-by-side monthly comparison of income and expenses. Shows surplus/deficit per month. Rolling averages.
5. **Age of Money:** Line chart tracking AoM over time. Motivational — shows financial health improving.

**YNAB reporting gap:** Not available on mobile. Users who primarily use mobile can't access reports. This is a frequently cited complaint.

### Monarch Reports (more extensive)
1. **Spending report:** Category breakdown with historical comparison. Interactive — click chart to filter transaction list on same page.
2. **Cash Flow (Sankey):** Flow diagram. Income sources on left, spending categories on right. Web only. Filterable by account (individual/household).
3. **Cash Flow (bar charts):** Two bar chart variants (monthly income vs. expense, cumulative). Available on mobile.
4. **Net Worth report:** Multi-year history. Asset/liability breakdown with property and investment values.
5. **Investment performance:** Select account groups, view returns vs. benchmarks.
6. **Custom saved reports:** Save any filter combination for reuse.

**Monarch reporting gap:** Advanced reports (Sankey, interactive filtering) are web only. Mobile has core charts only.

### For DoinikHishab
Current reports (spending, income/expense, net worth) are solid. Priority additions:
1. **Mobile-first:** All reports must work fully on mobile (unlike YNAB)
2. **Category trend over time:** Spending by category as a time series — answer "am I spending more on food this month vs. last 3 months?"
3. **Cash flow summary:** Simple: income − fixed − non-monthly − variable = remaining. Not the full Sankey, but the same mental model.
4. **Recurring expense calendar:** See upcoming bills this month at a glance.

---

## Part 8 — Bangladesh Market Synthesis

### Market Context
- **bKash** is the dominant mobile payment platform with 81M+ users. Transactions are cash-like: send/receive money, pay merchants, pay bills.
- **Nagad** is second (Bangladesh Post Office). Similar use case.
- **Cash economy:** Despite mobile payment growth, cash transactions remain dominant in daily life. A personal finance app must handle cash-heavy users well.
- **No bank sync:** Unlike US/Europe, there is no Plaid equivalent for Bangladeshi banks. Every transaction will be manual or semi-manual (import). This is not a disadvantage — it means DoinikHishab must be exceptionally good at manual entry.
- **Mobile-first:** The primary device is a mid-range Android phone. Tablet/web are secondary. Every critical feature must work perfectly on mobile.
- **Offline tolerance:** Variable connectivity means offline capability is required. Convex's local caching helps, but the app must be usable without a constant connection.

### What YNAB's Methodology Solves for Bangladesh
- **Paycheck-to-paycheck:** This is the norm for much of Bangladesh's working population. YNAB's Age of Money concept is directly applicable.
- **True Expenses:** Eid spending, wedding gifts (dawat), school fees, medical emergencies — all of these are "true expenses" that surprise people who don't plan for them. The concept translates perfectly.
- **Roll with the Punches:** Variable income (freelancers, small business owners, daily wage workers) makes rigid budgets impractical. YNAB's flexibility is appropriate.
- **Credit cards:** Less common in Bangladesh, but credit usage is growing. YNAB's credit card model is worth implementing for the future.

### What Monarch's Features Solve for Bangladesh
- **Recurring expense tracking:** Mobile plan, electricity, internet, subscriptions — the subscription economy is growing in Bangladesh. Auto-detection + reminders are valuable.
- **Goals:** Saving for education, a child's wedding, hajj, or a motorcycle — concrete savings goals are highly relevant culturally.
- **Family finance:** Multi-generational households where finances are partially shared are common. A household view (even simplified) serves this need.
- **Cash flow visibility:** Understanding net cash flow monthly (income − expenses) in a simple visual is valuable for all users.

### Simpler Input Method for Bangladesh

Both YNAB and Monarch have transaction entry that is 5-11 steps. For a mobile-first, cash-heavy market, this is too much friction. The ideal DoinikHishab transaction entry:

**3-tap Quick Add (recommended):**
1. Tap FAB → amount keypad opens instantly
2. Enter amount → tap category from grid (recent categories first)
3. Tap "Save" → transaction recorded

**Under 10 seconds.** Everything else (payee, memo, account) is optional and set after saving, or auto-filled from pattern matching.

**The key insight:** Bangladeshi users entering a ৳50 tea purchase don't want a 10-step form. They want to tap, type ৳50, tap food, done. The payee, memo, and full categorization can be enriched later if desired.

**Voice entry potential (future):** "৳500 খাবার" (500 food) — voice-to-transaction using Bengali speech recognition could leapfrog the entire manual entry problem.

---

## Part 9 — Synthesis: Priorities for DoinikHishab

### Tier 1 — Core Differentiators (Build First)

These are the features/philosophies that create the product's identity:

**1. Zero-Based Budgeting with Bangladeshi Framing**
- Rename "Ready to Assign" to something culturally resonant (e.g., "বরাদ্দ বাকি" — "Remaining to Assign")
- The philosophy: "প্রতিটি টাকার একটি কাজ আছে" ("Every taka has a job")
- Monthly fresh start with rollover
- Category targets (monthly, yearly, by-date savings)
- Credit card handling (YNAB-style automatic fund movement)

**2. 3-Tap Transaction Entry**
- Amount-first keypad (current QuickAdd is close — refine to minimize steps)
- Recent categories grid (show last 6-8 used categories as quick-tap chips)
- Smart account selection (auto-select last used account)
- Optional fields (payee, memo) are hidden by default — collapse/expand

**3. True Expenses (Non-Monthly / Sinking Funds)**
- Named categories with monthly accumulation toward a future target
- "Eid Fund", "School Fees", "Bike Servicing", "Medical Reserve"
- Visual: progress bar showing how much has accumulated vs. target
- This is the single biggest behavior change driver after giving every dollar a job

### Tier 2 — Completeness Features (Build Second)

These features make DoinikHishab comprehensive rather than basic:

**4. Recurring Expense Tracker (Monarch-style)**
- Calendar view of upcoming bills/subscriptions
- List view with filter
- 3-day reminder notification
- Manual add + pattern detection from transaction history
- Payment confirmation (mark as paid)

**5. Goals System (Combined YNAB + Monarch)**
- Save Up goals: target amount + target date + monthly contribution → on-track/behind status
- Pay Down goals: debt balance + interest rate → payoff projection + date
- Both integrated into budget (contribution shows as budget line)

**6. Enhanced Reports**
- All reports available on mobile (fix YNAB's biggest gap)
- Cash flow summary: income − fixed − variable = remaining (simple Monarch cash-flow concept)
- Category trend: spending per category over 3/6/12 months
- Age of Money metric (already calculated in budget engine)

**7. Family/Household Mode (Simplified Monarch-style)**
- One shared budget with multiple members
- Individual transaction views vs. household view
- Basic version: shared view, no separate logins needed (use same device/account for now)

### Tier 3 — Premium Features (Build Third)

These differentiate DoinikHishab in the market once the foundation is solid:

**8. bKash/Nagad Import**
- CSV export from bKash/Nagad statement → import into DoinikHishab
- Semi-automatic categorization of mobile money transactions
- This is the "bank sync" equivalent for Bangladesh

**9. AI-Powered Weekly Recap (Monarch-style)**
- Sunday summary: spent ৳X this week, highest category was Y, you're Z% through your monthly budget
- Delivered as push notification + in-app card
- Uses existing AI infrastructure (Anthropic/OpenAI configured in app)

**10. Receipt Scanning**
- Photograph bKash receipt or physical cash receipt
- AI extracts: amount, merchant, date
- Creates draft transaction for quick review + save
- High value for cash-heavy users

**11. Loan/Debt Planner**
- Enter loan: principal, interest rate, monthly payment
- Show payoff date, total interest, savings from extra payments
- Scenario simulation (YNAB loan planner equivalent)

### What to Skip (for Bangladesh Market)

- **Real estate / Zillow integration:** Not relevant; Bangladeshi property valuation is not automated
- **Cryptocurrency tracking:** Low priority for target demographic
- **Credit score monitoring:** Bangladesh doesn't have consumer credit scores in the US sense
- **Investment portfolio tracking:** Important but complex; defer until v2+
- **Bank sync (Plaid-equivalent):** No Bangladeshi equivalent exists; build excellent manual + CSV import instead
- **Apple Watch app:** Not relevant for primary demographic

### Feature Ideology Anti-Patterns to Avoid

**Avoid Monarch's passive approach for the Bangladesh first launch.** Monarch works because US/EU users connect banks and data flows in automatically. Without bank sync, passive tracking doesn't work. DoinikHishab users must be actively engaged — which means embracing YNAB's "every transaction is intentional" model.

**Avoid YNAB's desktop-first reports.** YNAB's decision to make reports desktop-only is a significant UX failure for mobile-first users. DoinikHishab must be mobile-first in reports, not mobile-last.

**Avoid over-automating categories early.** Monarch's AI categorization works because it has years of merchant data. DoinikHishab's rule-based categorizer should be excellent at common Bangladeshi merchants but not pretend to handle everything. Let users build habits of categorization — this engagement is valuable, not a burden.

---

## Part 10 — UX Implementation Details

### Color System (YNAB/Monarch Synthesis)
```
Budget status colors:
- Available (positive, funded):     Teal/green (#0d9488 — matches current DoinikHishab theme)
- Warning (underfunded, close):     Amber/yellow (#f59e0b)
- Overspent (negative balance):     Red (#ef4444)
- Archived/disabled:                Gray (#6b7280)

Ready to Assign:
- Positive (money available):       Teal (#0d9488)
- Zero (fully assigned):            Neutral white/gray
- Negative (over-assigned):         Red (#ef4444)

Recurring calendar:
- Paid as expected:                 Green (#22c55e)
- Paid, different amount:           Yellow (#f59e0b)
- Upcoming (not yet due):           Blue (#3b82f6)
- Overdue:                          Red (#ef4444)
```

### Navigation Structure (Recommended for DoinikHishab)
Current 6-tab structure is correct. Suggested optimization:

```
Tab 1: Home (Dashboard)     — Net worth card, Ready to Assign, spending summary, quick actions
Tab 2: Budget               — Category groups + categories, Ready to Assign header, targets
Tab 3: Transactions         — All transactions, filter/search, quick add FAB
Tab 4: Accounts             — Account list with balances, add account
Tab 5: Reports              — All reports (mobile-first), charts
Settings: Gear icon in header (not a tab) — simplify navigation
```

Remove AI and Reconcile from primary tabs — surface through Settings or in-context within other screens.

### Budget Screen Layout (YNAB-inspired, Mobile-optimized)
```
┌─────────────────────────────────────┐
│ বরাদ্দ বাকি: ৳2,450  [Assign all]   │  ← Sticky header
├─────────────────────────────────────┤
│ ▼ গৃহস্থালি (Housing)    ৳12,500    │  ← Collapsible group
│   ভাড়া             ৳8,000  [full]   │
│   বিদ্যুৎ           ৳2,000  [67%]   │  ← Progress bar
│   ইন্টারনেট         ৳1,200  [80%]   │
├─────────────────────────────────────┤
│ ▼ খাওয়া-দাওয়া (Food)    ৳8,200     │
│   মুদি-বাজার         ৳5,000  [90%]  │
│   রেস্তোরাঁ           ৳1,500  [50%] │
│   ...                               │
└─────────────────────────────────────┘
```

### Transaction Quick Add (3-tap target)
```
Tap 1: FAB → Bottom sheet opens with keypad
         [Amount display: ৳___]
         [1][2][3]
         [4][5][6]
         [7][8][9]
         [.][0][⌫]
         [Continue →]

Tap 2: After amount entered, tap "Continue" → Category picker
         Recent: [খাবার] [যাতায়াত] [বাজার] [ফান]
         All categories grid below
         (Type to search)

Tap 3: Tap category → Save
         Transaction saved with haptic feedback
         Toast: "৳500 খাবার এ সেভ হয়েছে"
```

Optional refinement (can do inline or on detail screen):
- Account (defaults to last used)
- Payee (autocomplete from history)
- Memo/note
- Date (defaults to today)

---

## Project Constraints (from CLAUDE.md)

- Package manager: Bun (not npm/yarn) — all install/add commands use `bun`
- Backend: Convex with real-time queries and mutations
- Styling: NativeWind v4 (Tailwind classes, no dynamic class strings)
- State management: Zustand (no Context API)
- Navigation: Expo Router (file-based)
- Amounts: Stored in paisa (integer), displayed as BDT
- Multi-tenancy: All Convex tables indexed by `userId`
- TypeScript strict mode
- Dark-first theme: teal primary, saffron accent

---

## Sources

### Primary (HIGH confidence)
- YNAB Official Method: [https://www.ynab.com/ynab-method](https://www.ynab.com/ynab-method)
- YNAB Features page: [https://www.ynab.com/features](https://www.ynab.com/features)
- YNAB Debt Management: [https://www.ynab.com/features/debt-management](https://www.ynab.com/features/debt-management)
- YNAB Reports overview: [https://support.ynab.com/en_us/reports-in-ynab-an-overview-B1GJsrWkj](https://support.ynab.com/en_us/reports-in-ynab-an-overview-B1GJsrWkj)
- YNAB Age of Money: [https://support.ynab.com/en_us/age-of-money-H1ZS84W1s](https://support.ynab.com/en_us/age-of-money-H1ZS84W1s)
- YNAB Targets guide: [https://support.ynab.com/en_us/how-to-use-targets-rk5kkI9ks](https://support.ynab.com/en_us/how-to-use-targets-rk5kkI9ks)
- Monarch Tracking Features: [https://www.monarch.com/features/tracking](https://www.monarch.com/features/tracking)
- Monarch Budgeting Features: [https://www.monarch.com/features/budgeting](https://www.monarch.com/features/budgeting)
- Monarch Goals Features: [https://www.monarch.com/features/goals](https://www.monarch.com/features/goals)
- Monarch Brand Refresh/UX: [https://www.monarch.com/monarch-brand-refresh](https://www.monarch.com/monarch-brand-refresh)
- Monarch Recurring Expenses: [https://www.monarch.com/blog/track-recurring-bills-and-subscriptions](https://www.monarch.com/blog/track-recurring-bills-and-subscriptions)
- Monarch Flex Budgeting: [https://www.monarch.com/blog/flex-budgeting-simplify-your-spending-with-just-one-number](https://www.monarch.com/blog/flex-budgeting-simplify-your-spending-with-just-one-number)
- Monarch AI Features: [https://help.monarch.com/hc/en-us/articles/16116906962452-About-Monarch-s-AI-Features](https://help.monarch.com/hc/en-us/articles/16116906962452-About-Monarch-s-AI-Features)
- Monarch Collaboration: [https://www.monarch.com/for-couples](https://www.monarch.com/for-couples)
- Monarch Cash Flow Sankey: [https://www.monarch.com/blog/visualize-your-cash-flow-like-never-before](https://www.monarch.com/blog/visualize-your-cash-flow-like-never-before)
- Monarch Goals 3.0: [https://help.monarch.com/hc/en-us/articles/44373110771860-Introducing-Goals-3-0](https://help.monarch.com/hc/en-us/articles/44373110771860-Introducing-Goals-3-0)

### Secondary (MEDIUM confidence — cross-verified with multiple sources)
- YNAB 4 Rules explained: [https://www.theexuberantelephant.com/blog/four-rules-for-budgeting](https://www.theexuberantelephant.com/blog/four-rules-for-budgeting)
- YNAB vs Monarch comparison (Rob Berger): [https://robberger.com/ynab-vs-monarch-money/](https://robberger.com/ynab-vs-monarch-money/)
- YNAB Spotlight feature (March 2025): [https://www.ynab.com/blog/the-spotlight](https://www.ynab.com/blog/the-spotlight)
- Age of Money deep dive: [https://medium.com/@penzgil/which-ynab-metric-is-best-a23e4b8aeda9](https://medium.com/@penzgil/which-ynab-metric-is-best-a23e4b8aeda9)
- YNAB Motley Fool review: [https://www.fool.com/money/personal-finance/monarch-money-vs-ynab/](https://www.fool.com/money/personal-finance/monarch-money-vs-ynab/)
- The Penny Hoarder Monarch Review: [https://www.thepennyhoarder.com/budgeting/monarch-money-review/](https://www.thepennyhoarder.com/budgeting/monarch-money-review/)
- YNAB Wikipedia: [https://en.wikipedia.org/wiki/YNAB](https://en.wikipedia.org/wiki/YNAB)
- Bangladesh market context (bKash): [https://www.bkash.com/en](https://www.bkash.com/en)

---

## Metadata

**Confidence breakdown:**
- YNAB ideology (4 rules, methodology): HIGH — direct from official docs + multiple verified secondary sources
- YNAB feature list: HIGH — official features page + support docs
- Monarch feature list: HIGH — official features pages + help center + verified reviews
- Monarch UI/UX patterns: HIGH — official blog posts + brand refresh documentation
- Bangladesh market context: MEDIUM — limited primary sources; bKash data is authoritative but personal finance app landscape is less documented
- Synthesis/recommendations: MEDIUM — derived from research, represents judgment calls

**Research date:** 2026-03-25
**Valid until:** 2026-09-25 (stable domain; re-verify major new YNAB/Monarch features quarterly)
