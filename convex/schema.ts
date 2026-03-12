import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // --- Users & Settings ---
  users: defineTable({
    clerkId: v.optional(v.string()),
    deviceId: v.string(),
    name: v.string(),
    currency: v.string(), // BDT
    locale: v.string(), // bn-BD or en-BD
    familyMembers: v.optional(v.array(v.string())),
  }).index("by_clerkId", ["clerkId"])
    .index("by_deviceId", ["deviceId"]),

  aiConfig: defineTable({
    userId: v.id("users"),
    provider: v.string(), // anthropic, google, openai, xai, openrouter
    encryptedApiKey: v.string(),
    model: v.string(),
    isActive: v.boolean(),
    performanceScore: v.optional(v.number()),
  }).index("by_userId", ["userId"]),

  flagNames: defineTable({
    userId: v.id("users"),
    flag: v.string(), // red, orange, yellow, green, blue, purple
    customName: v.string(),
  }).index("by_userId", ["userId"]),

  // --- Core ---
  accounts: defineTable({
    userId: v.id("users"),
    name: v.string(),
    type: v.union(
      v.literal("checking"),
      v.literal("savings"),
      v.literal("cash"),
      v.literal("credit_card"),
      v.literal("line_of_credit"),
      v.literal("mortgage"),
      v.literal("auto_loan"),
      v.literal("student_loan"),
      v.literal("other_debt"),
      v.literal("other_asset"),
    ),
    balance: v.number(), // paisa (integer)
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    isDefault: v.boolean(),
    isBudget: v.boolean(), // on-budget vs tracking
    isClosed: v.boolean(),
    sortOrder: v.number(),
  }).index("by_userId", ["userId"]),

  categoryGroups: defineTable({
    userId: v.id("users"),
    name: v.string(),
    isHidden: v.boolean(),
    sortOrder: v.number(),
  }).index("by_userId", ["userId"]),

  categories: defineTable({
    userId: v.id("users"),
    name: v.string(),
    nameBn: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    type: v.union(
      v.literal("expense"),
      v.literal("income"),
      v.literal("transfer"),
    ),
    groupId: v.id("categoryGroups"),
    isHidden: v.boolean(),
    isSystem: v.boolean(),
    sortOrder: v.number(),
  }).index("by_userId", ["userId"])
    .index("by_groupId", ["groupId"]),

  // --- Transactions ---
  transactions: defineTable({
    userId: v.id("users"),
    accountId: v.id("accounts"),
    categoryId: v.optional(v.id("categories")),
    amount: v.number(), // paisa, positive = inflow, negative = outflow
    type: v.union(
      v.literal("expense"),
      v.literal("income"),
      v.literal("transfer"),
    ),
    description: v.optional(v.string()),
    memo: v.optional(v.string()),
    date: v.string(), // ISO date string YYYY-MM-DD
    source: v.union(
      v.literal("manual"),
      v.literal("import"),
      v.literal("scheduled"),
      v.literal("reconciliation"),
      v.literal("untracked"),
    ),
    bankRef: v.optional(v.string()),
    payeeId: v.optional(v.id("payees")),
    splitParentId: v.optional(v.id("transactions")),
    isCleared: v.boolean(),
    isReconciled: v.boolean(),
    isApproved: v.boolean(),
    flag: v.optional(v.string()), // red, orange, yellow, green, blue, purple
    transferAccountId: v.optional(v.id("accounts")),
    importId: v.optional(v.string()),
  }).index("by_userId", ["userId"])
    .index("by_accountId", ["accountId"])
    .index("by_date", ["userId", "date"])
    .index("by_categoryId", ["categoryId"]),

  payees: defineTable({
    userId: v.id("users"),
    name: v.string(),
    defaultCategoryId: v.optional(v.id("categories")),
    lastUsed: v.optional(v.string()),
    renameRules: v.optional(v.array(v.object({
      pattern: v.string(),
      replacement: v.string(),
    }))),
  }).index("by_userId", ["userId"]),

  scheduled: defineTable({
    userId: v.id("users"),
    accountId: v.id("accounts"),
    payeeId: v.optional(v.id("payees")),
    categoryId: v.optional(v.id("categories")),
    amount: v.number(),
    memo: v.optional(v.string()),
    flag: v.optional(v.string()),
    rrule: v.string(), // RFC 5545 recurrence rule
    autoEnter: v.boolean(),
    nextDate: v.string(),
    isActive: v.boolean(),
  }).index("by_userId", ["userId"]),

  // --- Budgeting ---
  budgets: defineTable({
    userId: v.id("users"),
    categoryId: v.id("categories"),
    month: v.string(), // YYYYMM
    assigned: v.number(), // paisa
    activity: v.number(), // paisa
    available: v.number(), // paisa
  }).index("by_userId_month", ["userId", "month"])
    .index("by_categoryId", ["categoryId"]),

  targets: defineTable({
    userId: v.id("users"),
    categoryId: v.id("categories"),
    type: v.union(
      v.literal("needed_for_spending"),
      v.literal("weekly_spending"),
      v.literal("spending_by_date"),
      v.literal("savings_balance"),
      v.literal("monthly_savings"),
    ),
    amount: v.number(), // paisa
    targetDate: v.optional(v.string()),
    cadence: v.optional(v.string()),
  }).index("by_userId", ["userId"])
    .index("by_categoryId", ["categoryId"]),

  monthlyNotes: defineTable({
    userId: v.id("users"),
    month: v.string(),
    categoryId: v.id("categories"),
    note: v.string(),
  }).index("by_userId_month", ["userId", "month"]),

  budgetTemplates: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    assignments: v.array(v.object({
      categoryId: v.id("categories"),
      amount: v.number(),
    })),
  }).index("by_userId", ["userId"]),

  // --- Reconciliation ---
  reconciliations: defineTable({
    userId: v.id("users"),
    accountId: v.id("accounts"),
    date: v.string(),
    startingBalance: v.number(),
    endingBalance: v.number(),
    expectedBalance: v.number(),
    gap: v.number(),
    resolution: v.optional(v.string()),
  }).index("by_userId", ["userId"])
    .index("by_accountId", ["accountId"]),

  // --- Loans ---
  loanDetails: defineTable({
    userId: v.id("users"),
    accountId: v.id("accounts"),
    originalBalance: v.number(),
    interestRate: v.number(),
    minimumPayment: v.number(),
    payoffDate: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  // --- Intelligence ---
  categoryRules: defineTable({
    userId: v.id("users"),
    pattern: v.string(),
    categoryId: v.id("categories"),
    confidence: v.number(),
    source: v.union(
      v.literal("system"),
      v.literal("user"),
      v.literal("learned"),
    ),
  }).index("by_userId", ["userId"]),

  // --- History ---
  undoStack: defineTable({
    userId: v.id("users"),
    action: v.string(),
    tableName: v.string(),
    recordId: v.string(),
    previousData: v.string(), // JSON stringified
    timestamp: v.number(),
  }).index("by_userId", ["userId"]),
});
