/* eslint-disable */
/**
 * Generated API types — run `npx convex dev` to regenerate.
 * Stub file for development without a Convex deployment.
 */
import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

import type * as accounts from "../accounts";
import type * as budgets from "../budgets";
import type * as categories from "../categories";
import type * as scheduled from "../scheduled";
import type * as targets from "../targets";
import type * as transactions from "../transactions";
import type * as users from "../users";

declare const fullApi: ApiFromModules<{
  accounts: typeof accounts;
  budgets: typeof budgets;
  categories: typeof categories;
  scheduled: typeof scheduled;
  targets: typeof targets;
  transactions: typeof transactions;
  users: typeof users;
}>;

export declare const api: FilterApi<typeof fullApi, FunctionReference<any, "public">>;
export declare const internal: FilterApi<typeof fullApi, FunctionReference<any, "internal">>;
