import { useCallback } from "react";
import { useAppStore } from "../../stores/app-store";
import { en, type TranslationKeys } from "./en";
import { bn } from "./bn";

const translations: Record<string, TranslationKeys> = {
  en,
  bn,
};

type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? `${K}.${NestedKeyOf<T[K]>}`
        : K;
    }[keyof T & string]
  : never;

export type TranslationKey = NestedKeyOf<TranslationKeys>;

function getNestedValue(obj: unknown, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== "object") {
      return path;
    }
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" ? current : path;
}

export function useTranslation() {
  const locale = useAppStore((s) => s.locale);

  const t = useCallback(
    (key: TranslationKey): string => {
      const dict = translations[locale] ?? en;
      const value = getNestedValue(dict, key);
      // Fallback to English if key not found in current locale
      if (value === key && locale !== "en") {
        return getNestedValue(en, key);
      }
      return value;
    },
    [locale]
  );

  return { t, locale };
}
