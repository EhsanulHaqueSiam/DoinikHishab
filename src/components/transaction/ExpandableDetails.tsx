import { useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { ChevronDown, ChevronUp, Flag } from "lucide-react-native";
import { today } from "../../lib/date";
import { useTranslation } from "react-i18next";

export interface DetailsValues {
  payee: string;
  memo: string;
  flag: string;
  accountId: string;
  date: string;
}

interface AccountOption {
  _id: string;
  name: string;
}

interface ExpandableDetailsProps {
  values: DetailsValues;
  onChange: (field: keyof DetailsValues, value: string) => void;
  accounts: AccountOption[];
  defaultAccountId: string;
}

export function ExpandableDetails({
  values,
  onChange,
  accounts,
  defaultAccountId,
}: ExpandableDetailsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useTranslation();

  const handleDateChip = useCallback(
    (dateValue: string) => {
      onChange("date", dateValue);
    },
    [onChange]
  );

  const todayStr = today();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split("T")[0];

  return (
    <View>
      <Pressable
        onPress={() => setIsExpanded(!isExpanded)}
        className="flex-row items-center justify-center py-3"
      >
        <Text className="text-xs text-surface-800 font-medium">
          {isExpanded
            ? t("quickAdd.hideDetails")
            : t("quickAdd.showDetails")}
        </Text>
        {isExpanded ? (
          <ChevronUp size={14} color="#8899aa" style={{ marginLeft: 4 }} />
        ) : (
          <ChevronDown size={14} color="#8899aa" style={{ marginLeft: 4 }} />
        )}
      </Pressable>

      {isExpanded && (
        <View className="gap-3 px-2 pb-3">
          {/* Payee */}
          <BottomSheetTextInput
            placeholder={t("quickAdd.payeePlaceholder")}
            placeholderTextColor="#6b7b8d"
            value={values.payee}
            onChangeText={(text: string) => onChange("payee", text)}
            style={{
              backgroundColor: "#1a2333",
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              color: "#e2e8f0",
              fontSize: 14,
              borderWidth: 1,
              borderColor: "#2a3a4a",
            }}
          />

          {/* Memo */}
          <BottomSheetTextInput
            placeholder={t("quickAdd.memoPlaceholder")}
            placeholderTextColor="#6b7b8d"
            value={values.memo}
            onChangeText={(text: string) => onChange("memo", text)}
            style={{
              backgroundColor: "#1a2333",
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              color: "#e2e8f0",
              fontSize: 14,
              borderWidth: 1,
              borderColor: "#2a3a4a",
            }}
          />

          {/* Flag toggle */}
          <Pressable
            onPress={() => onChange("flag", values.flag ? "" : "red")}
            className="flex-row items-center gap-3 py-2 px-4 rounded-xl bg-surface-200 border border-border/20"
          >
            <Flag
              size={16}
              color={values.flag ? "#f87171" : "#6b7b8d"}
              fill={values.flag ? "#f87171" : "none"}
            />
            <Text
              className={`text-sm ${values.flag ? "text-danger font-medium" : "text-surface-800"}`}
            >
              {t("quickAdd.flagTransaction")}
            </Text>
          </Pressable>

          {/* Account override */}
          <View className="flex-row flex-wrap gap-2">
            {accounts.map((acct) => (
              <Pressable
                key={acct._id}
                onPress={() => onChange("accountId", acct._id)}
                className={`px-4 py-2.5 rounded-xl border ${
                  values.accountId === acct._id
                    ? "bg-primary-500/20 border-primary-500/40"
                    : "bg-surface-200 border-border/20"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    values.accountId === acct._id
                      ? "text-primary-700"
                      : "text-surface-800"
                  }`}
                >
                  {acct.name}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Date chips: Today / Yesterday / Pick date */}
          <View className="flex-row gap-2">
            {[
              { label: t("quickAdd.today"), value: todayStr },
              { label: t("quickAdd.yesterday"), value: yesterdayStr },
            ].map((chip) => (
              <Pressable
                key={chip.value}
                onPress={() => handleDateChip(chip.value)}
                className={`px-4 py-2.5 rounded-xl border ${
                  values.date === chip.value
                    ? "bg-primary-500/20 border-primary-500/40"
                    : "bg-surface-200 border-border/20"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    values.date === chip.value
                      ? "text-primary-700"
                      : "text-surface-800"
                  }`}
                >
                  {chip.label}
                </Text>
              </Pressable>
            ))}
            {/* Custom date input */}
            <BottomSheetTextInput
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#6b7b8d"
              value={
                values.date !== todayStr && values.date !== yesterdayStr
                  ? values.date
                  : ""
              }
              onChangeText={(text: string) => onChange("date", text)}
              style={{
                flex: 1,
                backgroundColor: "#1a2333",
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: "#e2e8f0",
                fontSize: 12,
                borderWidth: 1,
                borderColor: "#2a3a4a",
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
}
