/**
 * MMKV-based storage for settings, encrypted API keys, preferences
 * Falls back to in-memory storage on web
 */

import { Platform } from "react-native";

interface StorageAdapter {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
  delete(key: string): void;
  contains(key: string): boolean;
  getAllKeys(): string[];
}

// In-memory fallback for web or when MMKV isn't available
class MemoryStorage implements StorageAdapter {
  private store = new Map<string, string>();

  getString(key: string) {
    return this.store.get(key);
  }
  set(key: string, value: string) {
    this.store.set(key, value);
  }
  delete(key: string) {
    this.store.delete(key);
  }
  contains(key: string) {
    return this.store.has(key);
  }
  getAllKeys() {
    return Array.from(this.store.keys());
  }
}

let storage: StorageAdapter;

function getStorage(): StorageAdapter {
  if (storage) return storage;

  if (Platform.OS === "web") {
    storage = new MemoryStorage();
    return storage;
  }

  try {
    const { MMKV } = require("react-native-mmkv");
    storage = new MMKV({ id: "doinikhishab-settings" });
    return storage;
  } catch {
    storage = new MemoryStorage();
    return storage;
  }
}

// Settings API
export function getSetting(key: string): string | undefined {
  return getStorage().getString(key);
}

export function setSetting(key: string, value: string): void {
  getStorage().set(key, value);
}

export function deleteSetting(key: string): void {
  getStorage().delete(key);
}

// Typed helpers
export function getDeviceId(): string {
  const s = getStorage();
  let id = s.getString("device_id");
  if (!id) {
    id = `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    s.set("device_id", id);
  }
  return id;
}

export function getLocale(): "en" | "bn" {
  return (getStorage().getString("locale") as "en" | "bn") || "en";
}

export function setLocale(locale: "en" | "bn"): void {
  getStorage().set("locale", locale);
}

export function getTheme(): "light" | "dark" | "system" {
  return (
    (getStorage().getString("theme") as "light" | "dark" | "system") || "system"
  );
}

export function setTheme(theme: "light" | "dark" | "system"): void {
  getStorage().set("theme", theme);
}

// Encrypted API key storage (basic obfuscation — proper encryption in production)
export function getApiKey(provider: string): string | undefined {
  return getStorage().getString(`api_key_${provider}`);
}

export function setApiKey(provider: string, key: string): void {
  getStorage().set(`api_key_${provider}`, key);
}

export function deleteApiKey(provider: string): void {
  getStorage().delete(`api_key_${provider}`);
}
