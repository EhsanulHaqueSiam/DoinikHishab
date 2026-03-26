/**
 * Import Screen Route
 *
 * Per D-15: Import as nested route from Settings > Import Statement.
 * Renders ImportScreen component with "Import Statement" header.
 */

import React from "react";
import { Stack } from "expo-router";
import { ImportScreen } from "../../src/components/import/ImportScreen";

export default function ImportScreenRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Import Statement",
          headerStyle: { backgroundColor: "#070b16" },
          headerTintColor: "#e2e8f0",
          headerTitleStyle: { fontFamily: "SpaceMono" },
        }}
      />
      <ImportScreen />
    </>
  );
}
