import { Link, Stack } from "expo-router";
import { View, Text } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View className="flex-1 items-center justify-center p-5 bg-background">
        <Text className="text-4xl mb-4">🔍</Text>
        <Text className="text-lg font-bold text-foreground tracking-wide">
          Page not found
        </Text>
        <Text className="text-xs text-surface-800 mt-2 text-center">
          The screen you're looking for doesn't exist.
        </Text>
        <Link href="/" className="mt-6 py-3 px-6">
          <Text className="text-xs font-bold text-primary-700 uppercase tracking-widest">
            Go Home
          </Text>
        </Link>
      </View>
    </>
  );
}
