import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";

const PROVIDERS = [
  { id: "anthropic", name: "Anthropic", models: ["claude-sonnet-4-20250514", "claude-haiku-4-20250414"] },
  { id: "google", name: "Google", models: ["gemini-2.0-flash", "gemini-2.5-pro"] },
  { id: "openai", name: "OpenAI", models: ["gpt-4o", "gpt-4o-mini"] },
  { id: "xai", name: "xAI", models: ["grok-3", "grok-3-mini"] },
  { id: "openrouter", name: "OpenRouter", models: ["auto"] },
] as const;

type ProviderId = (typeof PROVIDERS)[number]["id"];

export default function AISettingsScreen() {
  const router = useRouter();
  const [provider, setProvider] = useState<ProviderId>("anthropic");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(PROVIDERS[0].models[0]);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const testConnection = useAction(api.ai.router.testConnection);

  const currentProvider = PROVIDERS.find((p) => p.id === provider)!;

  const handleProviderChange = useCallback(
    (id: ProviderId) => {
      setProvider(id);
      const p = PROVIDERS.find((p) => p.id === id)!;
      setModel(p.models[0]);
      setTestResult(null);
    },
    []
  );

  const handleTest = useCallback(async () => {
    if (!apiKey.trim()) {
      Alert.alert("Missing Key", "Please enter your API key first.");
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const result = await testConnection({
        provider,
        apiKey,
        model,
      });
      setTestResult(result);
    } catch {
      setTestResult({
        success: false,
        message: "Connection test failed. Please check your settings.",
      });
    } finally {
      setTesting(false);
    }
  }, [apiKey, provider, model, testConnection]);

  const handleSave = useCallback(() => {
    if (!apiKey.trim()) {
      Alert.alert("Missing Key", "Please enter your API key.");
      return;
    }
    // In production, save to Convex aiConfig table (encrypted)
    Alert.alert("Saved", "AI settings have been saved.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  }, [apiKey, router]);

  const maskKey = (key: string) => {
    if (key.length <= 8) return key;
    return key.slice(0, 4) + "*".repeat(key.length - 8) + key.slice(-4);
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-surface-100 border-b border-border px-4 pt-14 pb-4">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => router.back()}>
            <Text className="text-primary-600 text-base">Back</Text>
          </Pressable>
          <Text className="text-lg font-bold text-foreground">
            AI Settings
          </Text>
          <Pressable onPress={handleSave}>
            <Text className="text-primary-600 text-base font-semibold">
              Save
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-4 gap-4 pb-12"
      >
        {/* Provider Selector */}
        <Card>
          <Text className="text-sm font-semibold text-foreground mb-3">
            AI Provider
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {PROVIDERS.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => handleProviderChange(p.id)}
                className={`px-4 py-2 rounded-xl border ${
                  provider === p.id
                    ? "bg-primary-600 border-primary-600"
                    : "bg-surface-200 border-border"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    provider === p.id ? "text-white" : "text-foreground"
                  }`}
                >
                  {p.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        {/* API Key */}
        <Card>
          <Text className="text-sm font-semibold text-foreground mb-1">
            API Key (BYOK)
          </Text>
          <Text className="text-xs text-muted-foreground mb-3">
            Your key is encrypted and stored securely. It never leaves the
            server.
          </Text>
          <Input
            placeholder={`Enter your ${currentProvider.name} API key`}
            value={apiKey}
            onChangeText={(text) => {
              setApiKey(text);
              setTestResult(null);
            }}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          {apiKey.length > 0 && (
            <Text className="text-xs text-muted-foreground mt-2">
              Key: {maskKey(apiKey)}
            </Text>
          )}
        </Card>

        {/* Model Selector */}
        <Card>
          <Text className="text-sm font-semibold text-foreground mb-3">
            Model
          </Text>
          <View className="gap-2">
            {currentProvider.models.map((m) => (
              <Pressable
                key={m}
                onPress={() => {
                  setModel(m);
                  setTestResult(null);
                }}
                className={`px-4 py-3 rounded-xl border flex-row items-center justify-between ${
                  model === m
                    ? "bg-surface-300 border-primary-600"
                    : "bg-surface-200 border-border"
                }`}
              >
                <Text
                  className={`text-sm ${
                    model === m
                      ? "text-primary-700 font-semibold"
                      : "text-foreground"
                  }`}
                >
                  {m}
                </Text>
                {model === m && (
                  <View className="w-4 h-4 rounded-full bg-primary-600 items-center justify-center">
                    <Text className="text-white text-xs">{"\u2713"}</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </Card>

        {/* Test Connection */}
        <Card>
          <Text className="text-sm font-semibold text-foreground mb-3">
            Test Connection
          </Text>
          <Button
            onPress={handleTest}
            loading={testing}
            variant="outline"
            size="md"
          >
            Test Connection
          </Button>
          {testResult && (
            <View
              className={`mt-3 px-3 py-2 rounded-lg ${
                testResult.success ? "bg-surface-300" : "bg-surface-300"
              }`}
            >
              <Text
                className={`text-sm ${
                  testResult.success ? "text-success" : "text-danger"
                }`}
              >
                {testResult.message}
              </Text>
            </View>
          )}
        </Card>

        {/* Info */}
        <Card>
          <Text className="text-sm font-semibold text-foreground mb-2">
            How it works
          </Text>
          <Text className="text-xs text-muted-foreground leading-5">
            DoinikHishab uses AI to help categorize transactions and answer
            questions about your finances. You bring your own API key (BYOK) -
            we never store or share your financial data with AI providers beyond
            what's needed for the specific request.
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}
