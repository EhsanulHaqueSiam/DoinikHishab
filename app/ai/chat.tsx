import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "../../src/components/ui/Button";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: number;
}

const SUGGESTIONS = [
  "How much did I spend on food this month?",
  "What are my top expenses?",
  "How much have I saved this month?",
  "Give me spending advice",
];

export default function AIChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      content:
        "Hi! I can help you understand your finances. Ask me about your spending, categories, or savings. Try one of the suggestions below!",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const routeAI = useAction(api.ai.router.route);

  const sendMessage = useCallback(
    async (text?: string) => {
      const content = text ?? input.trim();
      if (!content || loading) return;

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);

      try {
        const response = await routeAI({
          provider: "stub",
          model: "stub",
          apiKey: "stub",
          prompt: content,
          fn: "nlq",
        });

        const parsed = JSON.parse(response.result);

        const botMsg: Message = {
          id: `bot-${Date.now()}`,
          role: "bot",
          content: parsed.answer || parsed.advice || response.result,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, botMsg]);
      } catch {
        const errorMsg: Message = {
          id: `err-${Date.now()}`,
          role: "bot",
          content: "Sorry, I couldn't process that. Please try again.",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, routeAI]
  );

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    return (
      <View
        className={`mb-3 px-4 ${isUser ? "items-end" : "items-start"}`}
      >
        <View
          className={`max-w-[85%] px-4 py-3 rounded-2xl ${
            isUser
              ? "bg-primary-600 rounded-br-sm"
              : "bg-card border border-border rounded-bl-sm"
          }`}
        >
          <Text
            className={`text-sm leading-5 ${
              isUser ? "text-white" : "text-foreground"
            }`}
          >
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  const showSuggestions = messages.length <= 1;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      {/* Header */}
      <View className="bg-surface-100 border-b border-border px-4 pt-14 pb-4">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => router.back()}>
            <Text className="text-primary-600 text-base">Back</Text>
          </Pressable>
          <Text className="text-lg font-bold text-foreground">
            AI Assistant
          </Text>
          <Pressable onPress={() => router.push("/ai/settings" as any)}>
            <Text className="text-primary-600 text-base">Settings</Text>
          </Pressable>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 16 }}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        removeClippedSubviews
        scrollEventThrottle={8}
        decelerationRate="fast"
        ListFooterComponent={
          <>
            {loading && (
              <View className="items-start px-4 mb-3">
                <View className="bg-card border border-border px-4 py-3 rounded-2xl rounded-bl-sm">
                  <Text className="text-sm text-muted-foreground">
                    Thinking...
                  </Text>
                </View>
              </View>
            )}
            {showSuggestions && (
              <View className="px-4 mt-4 gap-2">
                <Text className="text-xs font-medium text-muted-foreground mb-1">
                  Try asking:
                </Text>
                {SUGGESTIONS.map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => sendMessage(s)}
                    className="bg-card border border-border rounded-xl px-4 py-3"
                  >
                    <Text className="text-sm text-foreground">{s}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </>
        }
      />

      {/* Input */}
      <View className="bg-surface-100 border-t border-border px-4 py-3 pb-8">
        <View className="flex-row items-end gap-2">
          <TextInput
            className="flex-1 bg-surface-200 rounded-xl px-4 py-3 text-base text-foreground max-h-24"
            placeholder="Ask about your finances..."
            placeholderTextColor="#3a5280"
            value={input}
            onChangeText={setInput}
            multiline
            onSubmitEditing={() => sendMessage()}
            returnKeyType="send"
            editable={!loading}
          />
          <Button
            onPress={() => sendMessage()}
            disabled={!input.trim() || loading}
            size="md"
          >
            Send
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
