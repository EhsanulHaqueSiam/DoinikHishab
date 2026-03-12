import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listGroups = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const groups = await ctx.db
      .query("categoryGroups")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    return groups.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const listCategories = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    return categories.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const listByGroup = query({
  args: { groupId: v.id("categoryGroups") },
  handler: async (ctx, args) => {
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_groupId", (q) => q.eq("groupId", args.groupId))
      .collect();
    return categories.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const getById = query({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createGroup = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("categoryGroups")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    return await ctx.db.insert("categoryGroups", {
      userId: args.userId,
      name: args.name,
      isHidden: false,
      sortOrder: existing.length,
    });
  },
});

export const createCategory = mutation({
  args: {
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
    isSystem: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_groupId", (q) => q.eq("groupId", args.groupId))
      .collect();

    return await ctx.db.insert("categories", {
      userId: args.userId,
      name: args.name,
      nameBn: args.nameBn,
      icon: args.icon,
      color: args.color,
      type: args.type,
      groupId: args.groupId,
      isHidden: false,
      isSystem: args.isSystem ?? false,
      sortOrder: existing.length,
    });
  },
});

export const seedDefaults = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Check if already seeded
    const existing = await ctx.db
      .query("categoryGroups")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) return;

    // Default BD categories
    const groups = [
      {
        name: "Fixed Bills",
        categories: [
          { name: "Rent", nameBn: "বাড়ি ভাড়া", icon: "home", type: "expense" as const },
          { name: "Electricity", nameBn: "বিদ্যুৎ বিল", icon: "zap", type: "expense" as const },
          { name: "Gas", nameBn: "গ্যাস বিল", icon: "flame", type: "expense" as const },
          { name: "Water", nameBn: "পানি বিল", icon: "droplets", type: "expense" as const },
          { name: "Internet", nameBn: "ইন্টারনেট", icon: "wifi", type: "expense" as const },
          { name: "Mobile Recharge", nameBn: "মোবাইল রিচার্জ", icon: "smartphone", type: "expense" as const },
        ],
      },
      {
        name: "Everyday Spending",
        categories: [
          { name: "Food & Groceries", nameBn: "খাবার ও মুদি", icon: "shopping-cart", type: "expense" as const },
          { name: "Eating Out", nameBn: "বাইরে খাওয়া", icon: "utensils", type: "expense" as const },
          { name: "Transport", nameBn: "যাতায়াত", icon: "bus", type: "expense" as const },
          { name: "Rickshaw", nameBn: "রিকশা", icon: "bike", type: "expense" as const },
          { name: "Household", nameBn: "গৃহস্থালি", icon: "lamp", type: "expense" as const },
        ],
      },
      {
        name: "Digital Payments",
        categories: [
          { name: "bKash", nameBn: "বিকাশ", icon: "banknote", type: "expense" as const },
          { name: "Nagad", nameBn: "নগদ", icon: "banknote", type: "expense" as const },
          { name: "Online Shopping", nameBn: "অনলাইন কেনাকাটা", icon: "package", type: "expense" as const },
        ],
      },
      {
        name: "Lifestyle",
        categories: [
          { name: "Entertainment", nameBn: "বিনোদন", icon: "tv", type: "expense" as const },
          { name: "Health & Medical", nameBn: "স্বাস্থ্য ও চিকিৎসা", icon: "stethoscope", type: "expense" as const },
          { name: "Education", nameBn: "শিক্ষা", icon: "graduation-cap", type: "expense" as const },
          { name: "Shopping", nameBn: "কেনাকাটা", icon: "shopping-bag", type: "expense" as const },
        ],
      },
      {
        name: "Savings Goals",
        categories: [
          { name: "Emergency Fund", nameBn: "জরুরি তহবিল", icon: "shield-alert", type: "expense" as const },
          { name: "Vacation", nameBn: "ছুটি", icon: "plane", type: "expense" as const },
          { name: "Eid", nameBn: "ঈদ", icon: "moon", type: "expense" as const },
        ],
      },
      {
        name: "Income",
        categories: [
          { name: "Salary", nameBn: "বেতন", icon: "briefcase", type: "income" as const },
          { name: "Freelance", nameBn: "ফ্রিল্যান্স", icon: "code", type: "income" as const },
          { name: "Business", nameBn: "ব্যবসা", icon: "building", type: "income" as const },
          { name: "Other Income", nameBn: "অন্যান্য আয়", icon: "plus-circle", type: "income" as const },
        ],
      },
    ];

    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      const groupId = await ctx.db.insert("categoryGroups", {
        userId: args.userId,
        name: group.name,
        isHidden: false,
        sortOrder: i,
      });

      for (let j = 0; j < group.categories.length; j++) {
        const cat = group.categories[j];
        await ctx.db.insert("categories", {
          userId: args.userId,
          name: cat.name,
          nameBn: cat.nameBn,
          icon: cat.icon,
          color: undefined,
          type: cat.type,
          groupId,
          isHidden: false,
          isSystem: true,
          sortOrder: j,
        });
      }
    }
  },
});
