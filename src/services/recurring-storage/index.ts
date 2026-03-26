/**
 * MMKV persistence for confirmed subscriptions and dismissed payees.
 * Uses versioned data structures for future migration support.
 */

import type {
  DismissedStore,
  RecurringDataStore,
  Subscription,
} from "../../components/recurring/recurring-types";
import { getJSON, setJSON } from "../storage";

const SUBSCRIPTIONS_KEY = "recurring:subscriptions";
const DISMISSED_KEY = "recurring:dismissed";

/** Get all confirmed subscriptions */
export function getSubscriptions(): Subscription[] {
  const data = getJSON<RecurringDataStore>(SUBSCRIPTIONS_KEY);
  return data?.subscriptions ?? [];
}

/** Save a new subscription (generates unique ID) */
export function saveSubscription(sub: Omit<Subscription, "id">): Subscription {
  const id = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const subscription: Subscription = { ...sub, id };

  const existing = getSubscriptions();
  existing.push(subscription);

  const store: RecurringDataStore = { version: 1, subscriptions: existing };
  setJSON(SUBSCRIPTIONS_KEY, store);

  return subscription;
}

/** Remove a subscription by ID */
export function removeSubscription(id: string): void {
  const existing = getSubscriptions();
  const filtered = existing.filter((s) => s.id !== id);

  const store: RecurringDataStore = { version: 1, subscriptions: filtered };
  setJSON(SUBSCRIPTIONS_KEY, store);
}

/** Get list of dismissed payee names */
export function getDismissedPayees(): string[] {
  const data = getJSON<DismissedStore>(DISMISSED_KEY);
  return data?.payees ?? [];
}

/** Add a payee to the dismissed list */
export function dismissPayee(payee: string): void {
  const existing = getDismissedPayees();
  if (!existing.includes(payee)) {
    existing.push(payee);
  }

  const store: DismissedStore = { version: 1, payees: existing };
  setJSON(DISMISSED_KEY, store);
}
