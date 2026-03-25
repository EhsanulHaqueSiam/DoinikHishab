import { Platform, type ViewStyle } from "react-native";

export const isWeb = Platform.OS === "web";
export const isIOS = Platform.OS === "ios";
export const isAndroid = Platform.OS === "android";
export const isMobile = isIOS || isAndroid;

/**
 * Cross-platform shadow that uses boxShadow on web (avoids deprecation)
 * and native shadow props on iOS + elevation on Android.
 */
export function shadow(
  color: string,
  offsetX: number,
  offsetY: number,
  opacity: number,
  radius: number,
  elevation: number = 4
): ViewStyle {
  if (isWeb) {
    // Parse hex color to rgba for boxShadow
    const rgba = hexToRgba(color, opacity);
    return {
      boxShadow: `${offsetX}px ${offsetY}px ${radius}px ${rgba}`,
    } as ViewStyle;
  }
  return {
    shadowColor: color,
    shadowOffset: { width: offsetX, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation,
  };
}

function hexToRgba(hex: string, opacity: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
