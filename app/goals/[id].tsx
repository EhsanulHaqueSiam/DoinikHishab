import type BottomSheet from "@gorhom/bottom-sheet";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef } from "react";
import { Text, View } from "react-native";
import { GoalDetailView } from "../../src/components/goals/GoalDetailView";
import { GoalForm } from "../../src/components/goals/GoalForm";
import { Button } from "../../src/components/ui/Button";
import { useGoals } from "../../src/hooks/use-goals";
import { useTranslation } from "../../src/lib/i18n";
import type { SaveUpGoal } from "../../src/services/goal-storage/types";

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const editFormRef = useRef<BottomSheet>(null);

  const { saveUpGoals, updateSaveUpGoal, deleteSaveUpGoal } = useGoals();

  const goal = useMemo(() => saveUpGoals.find((g) => g.id === id), [saveUpGoals, id]);

  const handleEdit = useCallback(() => {
    editFormRef.current?.expand();
  }, []);

  const handleSaveEdit = useCallback(
    (updated: SaveUpGoal | Omit<SaveUpGoal, "id">) => {
      if ("id" in updated && goal) {
        updateSaveUpGoal(goal.id, {
          name: updated.name,
          targetAmount: updated.targetAmount,
          targetDate: updated.targetDate,
          linkedAccountId: updated.linkedAccountId,
        });
      }
    },
    [goal, updateSaveUpGoal]
  );

  const handleDelete = useCallback(() => {
    if (goal) {
      deleteSaveUpGoal(goal.id);
      router.back();
    }
  }, [goal, deleteSaveUpGoal, router]);

  if (!goal) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-4">
        <Stack.Screen options={{ title: t("goals.title" as any) }} />
        <Text className="text-sm text-surface-800 mb-4">Goal not found</Text>
        <Button variant="outline" onPress={() => router.back()}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: goal.name }} />
      <GoalDetailView goal={goal} onEdit={handleEdit} onDelete={handleDelete} />

      {/* Edit form bottom sheet */}
      <GoalForm sheetRef={editFormRef} onSave={handleSaveEdit} initialGoal={goal} />
    </View>
  );
}
