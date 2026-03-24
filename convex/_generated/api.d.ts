/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as accounts from "../accounts.js";
import type * as ai_categorize from "../ai/categorize.js";
import type * as ai_router from "../ai/router.js";
import type * as budgets from "../budgets.js";
import type * as categories from "../categories.js";
import type * as crons from "../crons.js";
import type * as import_categorizer from "../import/categorizer.js";
import type * as import_csvParser from "../import/csvParser.js";
import type * as payees from "../payees.js";
import type * as reconciliation from "../reconciliation.js";
import type * as reports from "../reports.js";
import type * as scheduled from "../scheduled.js";
import type * as targets from "../targets.js";
import type * as transactions from "../transactions.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  accounts: typeof accounts;
  "ai/categorize": typeof ai_categorize;
  "ai/router": typeof ai_router;
  budgets: typeof budgets;
  categories: typeof categories;
  crons: typeof crons;
  "import/categorizer": typeof import_categorizer;
  "import/csvParser": typeof import_csvParser;
  payees: typeof payees;
  reconciliation: typeof reconciliation;
  reports: typeof reports;
  scheduled: typeof scheduled;
  targets: typeof targets;
  transactions: typeof transactions;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
