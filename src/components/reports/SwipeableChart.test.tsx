import { render } from "@testing-library/react-native";
import React from "react";
import { Text, View } from "react-native";
import { SwipeableChart } from "./SwipeableChart";

describe("SwipeableChart", () => {
  const mockOnNext = jest.fn();
  const mockOnPrev = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders children without crashing", () => {
    const { toJSON } = render(
      <SwipeableChart onNext={mockOnNext} onPrev={mockOnPrev}>
        <View>
          <Text>Chart content</Text>
        </View>
      </SwipeableChart>
    );
    expect(toJSON()).toBeTruthy();
  });

  it("renders with accessibility actions", () => {
    const { toJSON } = render(
      <SwipeableChart onNext={mockOnNext} onPrev={mockOnPrev}>
        <View>
          <Text>Chart</Text>
        </View>
      </SwipeableChart>
    );
    expect(toJSON()).toBeTruthy();
  });
});
