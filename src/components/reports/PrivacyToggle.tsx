import React, { useState, useCallback } from "react";
import { Pressable } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { getSetting, setSetting } from "../../services/storage";

const PRIVACY_KEY = "reports_privacy_mode";

export function usePrivacyMode(): [boolean, () => void] {
  const [isPrivacy, setIsPrivacy] = useState(
    () => getSetting(PRIVACY_KEY) === "true",
  );

  const toggle = useCallback(() => {
    const next = !isPrivacy;
    setSetting(PRIVACY_KEY, String(next));
    setIsPrivacy(next);
  }, [isPrivacy]);

  return [isPrivacy, toggle];
}

interface PrivacyToggleProps {
  isPrivacy: boolean;
  onToggle: () => void;
}

export function PrivacyToggle({ isPrivacy, onToggle }: PrivacyToggleProps) {
  const Icon = isPrivacy ? EyeOff : Eye;
  const iconColor = isPrivacy ? "#0d9488" : "#6b83a3"; // primary-600 when active, surface-800 default

  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: isPrivacy }}
      accessibilityLabel="Privacy mode"
      style={{
        width: 36,
        height: 36,
        alignItems: "center",
        justifyContent: "center",
      }}
      className="active:opacity-60"
    >
      <Icon size={20} color={iconColor} />
    </Pressable>
  );
}
