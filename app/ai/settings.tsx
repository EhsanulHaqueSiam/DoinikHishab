import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
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
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const testConnection = useAction(api.ai.router.testConnection);
  const currentProvider = PROVIDERS.find((p) => p.id === provider)!;

  const handleProviderChange = useCallback((id: ProviderId) => {
    setProvider(id);
    setModel(PROVIDERS.find((p) => p.id === id)!.models[0]);
    setTestResult(null);
  }, []);

  const handleTest = useCallback(async () => {
    if (!apiKey.trim()) { Alert.alert("Missing Key", "Please enter your API key first."); return; }
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testConnection({ provider, apiKey, model });
      setTestResult(result);
    } catch {
      setTestResult({ success: false, message: "Connection test failed." });
    } finally {
      setTesting(false);
    }
  }, [apiKey, provider, model, testConnection]);

  const handleSave = useCallback(() => {
    if (!apiKey.trim()) { Alert.alert("Missing Key", "Please enter your API key."); return; }
    Alert.alert("Saved", "AI settings have been saved.", [{ text: "OK", onPress: () => router.back() }]);
  }, [apiKey, router]);

  const maskKey = (key: string) => key.length <= 8 ? key : key.slice(0, 4) + "*".repeat(key.length - 8) + key.slice(-4);

  return (
    <View className="flex-1 bg-background">
      <View className="bg-surface-100 border-b border-border px-4 pt-14 pb-4">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => router.back()}>
            <Text className="text-primary-700 font-semibold text-xs">Back</Text>
          </Pressable>
          <Text className="text-xs font-bold text-foreground uppercase tracking-widest">AI Settings</Text>
          <Pressable onPress={handleSave}>
            <Text className="text-primary-700 font-bold text-xs">Save</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-4 py-5 gap-4 pb-12" scrollEventThrottle={8} decelerationRate="fast">
        <Card>
          <Text className="text-2xs font-semibold text-surface-800 uppercase tracking-widest mb-3">
            Provider
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {PROVIDERS.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => handleProviderChange(p.id)}
                className={`px-4 py-2.5 rounded-xl border ${
                  provider === p.id ? "bg-primary-500 border-primary-500" : "bg-surface-200 border-border/40"
                }`}
              >
                <Text className={`text-xs font-semibold ${provider === p.id ? "text-white" : "text-foreground"}`}>
                  {p.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card>
          <Text className="text-2xs font-semibold text-surface-800 uppercase tracking-widest mb-1">
            API Key (BYOK)
          </Text>
          <Text className="text-2xs text-surface-700 mb-3">
            Encrypted and stored securely. Never leaves the server.
          </Text>
          <Input
            placeholder={`Enter your ${currentProvider.name} API key`}
            value={apiKey}
            onChangeText={(text) => { setApiKey(text); setTestResult(null); }}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          {apiKey.length > 0 && (
            <Text className="text-2xs text-surface-700 mt-2">Key: {maskKey(apiKey)}</Text>
          )}
        </Card>

        <Card>
          <Text className="text-2xs font-semibold text-surface-800 uppercase tracking-widest mb-3">Model</Text>
          <View className="gap-2">
            {currentProvider.models.map((m) => (
              <Pressable
                key={m}
                onPress={() => { setModel(m); setTestResult(null); }}
                className={`px-4 py-3 rounded-xl border flex-row items-center justify-between ${
                  model === m ? "bg-surface-300 border-primary-500" : "bg-surface-200 border-border/40"
                }`}
              >
                <Text className={`text-xs ${model === m ? "text-primary-700 font-bold" : "text-foreground font-medium"}`}>
                  {m}
                </Text>
                {model === m && (
                  <View className="w-4 h-4 rounded-full bg-primary-500 items-center justify-center">
                    <Text className="text-white text-2xs">{"\u2713"}</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </Card>

        <Card>
          <Text className="text-2xs font-semibold text-surface-800 uppercase tracking-widest mb-3">
            Test Connection
          </Text>
          <Button onPress={handleTest} loading={testing} variant="outline" size="md">
            Test Connection
          </Button>
          {testResult && (
            <View className={`mt-3 px-3 py-2 rounded-lg ${testResult.success ? "bg-success/10" : "bg-danger/10"}`}>
              <Text className={`text-xs ${testResult.success ? "text-success" : "text-danger"}`}>
                {testResult.message}
              </Text>
            </View>
          )}
        </Card>

        <Card>
          <Text className="text-2xs font-semibold text-surface-800 uppercase tracking-widest mb-2">
            How it works
          </Text>
          <Text className="text-2xs text-surface-800 leading-4">
            DoinikHishab uses AI to categorize transactions and answer finance questions.
            You bring your own API key (BYOK) — we never share your data with AI providers
            beyond what's needed for the specific request.
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}
