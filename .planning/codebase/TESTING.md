# Testing Patterns

**Analysis Date:** 2026-03-25

## Test Framework

**Status:** Not Detected

**Runner:** No test runner configured
- No `jest.config.js`, `vitest.config.ts`, or test config files found
- No Jest, Vitest, Mocha, or testing dependencies in `package.json`
- No `.test.ts`, `.test.tsx`, `.spec.ts`, or `.spec.tsx` files in project (excluding node_modules)

**Assertion Library:** Not applicable

**Run Commands:** None configured

```bash
# No test commands available
```

## Test File Organization

**Current Status:**
- Zero test files detected in codebase
- No test directories (`__tests__/`, `tests/`, `test/`)
- No test fixtures or factories
- No mocking setup (Jest, Sinon, Vitest mocks)

## Testing Approach

**Manual Testing Only:**
- Developers run `bun run start` / `bun run android` / `bun run ios` / `bun run web` to test manually
- UI interactions tested through Expo dev client
- Backend mutations tested through app UI or Convex dashboard
- No automated test coverage

## Code Patterns That Enable Testing (If Implemented)

The codebase structure would support testing with minimal refactoring:

**Testable Patterns:**

1. **Pure utility functions** (easily unit-testable):
   - `src/lib/currency.ts` — `paisaToTaka()`, `takaToPaisa()`, `formatCurrency()`, `toBengaliNumerals()`
   - `src/lib/date.ts` — Date formatting functions
   - `src/lib/platform.ts` — `shadow()`, platform detection helpers
   - `src/services/budget-engine/index.ts` — `calculateReadyToAssign()`, `calculateAvailable()`, `calculateAgeOfMoney()`

   ```typescript
   // Example: Easy to unit test
   export function paisaToTaka(paisa: number): number {
     return paisa / 100;
   }
   ```

2. **Zustand stores** (mockable and testable):
   - `src/stores/app-store.ts` — Create/read/update actions
   - `src/stores/ui-store.ts` — Modal/sheet state

   ```typescript
   export const useAppStore = create<AppState>((set) => ({
     userId: null,
     setUserId: (id) => set({ userId: id }),
   }));
   ```

3. **Custom hooks** (require React Testing Library):
   - `src/hooks/use-transactions.ts` — Filter and search logic
   - `src/hooks/use-budget.ts` — Budget calculation and memoization
   - `src/hooks/use-platform.ts` — Platform detection

4. **Convex functions** (require Convex test harness or mocking):
   - `convex/transactions.ts` — Query and mutation logic
   - `convex/accounts.ts` — Account operations
   - `convex/budgets.ts` — Budget calculations

   ```typescript
   export const list = query({
     args: { userId: v.id("users"), limit: v.optional(v.number()) },
     handler: async (ctx, args) => {
       // Testable logic
     }
   });
   ```

## Mocking Opportunities

**What could be mocked:**
- Convex API: `useQuery()` and `useMutation()` return mocked data
- Zustand stores: Pre-populate with test state
- React Native modules: Mock Haptics, Document Picker, etc.
- Platform detection: Mock `Platform.OS` to test iOS/Android/Web branches

**Current mocking pattern (minimal):**
- `src/components/transaction/QuickAdd.tsx` silently catches Haptics load failures:
  ```typescript
  try {
    const Haptics = require("expo-haptics");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {}
  ```

## Test Coverage Gaps

**Critical untested areas:**
1. **Budget calculations** — `src/services/budget-engine/` logic not verified
2. **Transaction filtering** — `src/hooks/use-transactions.ts` filter logic untested
3. **Data persistence** — All Convex queries/mutations run untested
4. **UI interactions** — All button clicks, form submissions manual-only
5. **Cross-platform logic** — Platform-specific code untested (Haptics, shadows, layouts)
6. **I18n** — Translation logic not verified
7. **CSV import** — `convex/import/csvParser.ts` completely untested
8. **Reconciliation** — `convex/reconciliation.ts` complex logic untested

## What Tests Would Look Like (If Implemented)

**Unit test example (currency utilities):**
```typescript
// src/lib/currency.test.ts
import { paisaToTaka, takaToPaisa, formatCurrency } from './currency';

describe('Currency utilities', () => {
  describe('paisaToTaka', () => {
    it('converts paisa to taka correctly', () => {
      expect(paisaToTaka(10000)).toBe(100);
      expect(paisaToTaka(0)).toBe(0);
    });
  });

  describe('formatCurrency', () => {
    it('formats positive amounts', () => {
      expect(formatCurrency(50000)).toBe('৳500.00');
    });

    it('formats negative amounts with minus sign', () => {
      expect(formatCurrency(-50000)).toBe('-৳500.00');
    });
  });
});
```

**Hook test example (useFilteredTransactions):**
```typescript
// src/hooks/use-transactions.test.ts
import { renderHook } from '@testing-library/react-native';
import { useFilteredTransactions, type TransactionFilters } from './use-transactions';

describe('useFilteredTransactions', () => {
  it('filters by category', () => {
    const mockTransactions = [
      { _id: 't1', categoryId: 'cat1', amount: 100, ... },
      { _id: 't2', categoryId: 'cat2', amount: 200, ... },
    ];

    const filters: TransactionFilters = { categoryId: 'cat1' };
    const result = /* ... hook usage ... */;

    expect(result).toHaveLength(1);
    expect(result[0]._id).toBe('t1');
  });
});
```

**Component test example (Button):**
```typescript
// src/components/ui/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Button } from './Button';

describe('Button component', () => {
  it('renders with text', () => {
    const { getByText } = render(<Button>Click me</Button>);
    expect(getByText('Click me')).toBeTruthy();
  });

  it('calls onPress callback', () => {
    const mockPress = jest.fn();
    const { getByRole } = render(
      <Button onPress={mockPress}>Test</Button>
    );

    fireEvent.press(getByRole('button'));
    expect(mockPress).toHaveBeenCalled();
  });

  it('respects variant styles', () => {
    const { getByText } = render(<Button variant="danger">Delete</Button>);
    const button = getByText('Delete').parent;
    expect(button).toHaveClass('bg-danger/90');
  });
});
```

**Convex function test example:**
```typescript
// convex/transactions.test.ts (using Convex test harness)
import { describe, it, expect } from 'vitest';
import { createTransaction, listTransactions } from './transactions';

describe('Transactions API', () => {
  it('creates and lists transactions', async () => {
    // Mock Convex context
    const mockTx = await createTransaction({
      userId: 'user1',
      accountId: 'acc1',
      amount: 5000,
      type: 'expense',
      date: '2026-03-25',
      source: 'manual',
    });

    const list = await listTransactions({ userId: 'user1' });
    expect(list).toContainEqual(expect.objectContaining({ amount: 5000 }));
  });
});
```

## Recommendation

**To implement testing:**

1. **Add Jest/Vitest configuration:**
   ```json
   // package.json
   {
     "devDependencies": {
       "jest": "^29",
       "@testing-library/react-native": "^12",
       "@testing-library/jest-native": "^5"
     }
   }
   ```

2. **Start with utility functions:**
   - Create `src/lib/currency.test.ts`
   - Create `src/lib/date.test.ts`
   - Create `src/services/budget-engine/index.test.ts`

3. **Add hook tests:**
   - Mock Convex: `jest.mock("convex/react")`
   - Test filter/search logic in isolation

4. **Add component snapshot tests:**
   - Low effort, medium value for UI regressions

5. **Integration tests:**
   - Use Convex test harness for backend functions
   - Mock Convex in React components

---

*Testing analysis: 2026-03-25*
