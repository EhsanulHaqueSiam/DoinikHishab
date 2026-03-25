import { Platform, Pressable, Text } from "react-native";
import { shadow } from "../../lib/platform";

interface FABProps {
  onPress: () => void;
}

export function FAB({ onPress }: FABProps) {
  return (
    <Pressable
      onPress={onPress}
      className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-primary-500 items-center justify-center z-50 active:bg-primary-400"
      style={[
        shadow("#0d9488", 0, 4, 0.5, 20, 12),
        Platform.OS === "web" && {
          position: "fixed" as any,
          width: 56,
          height: 56,
          borderRadius: 28,
        },
      ]}
    >
      <Text className="text-white text-2xl font-light leading-none" style={{ marginTop: -1 }}>
        +
      </Text>
    </Pressable>
  );
}
