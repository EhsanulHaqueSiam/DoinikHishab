import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children text", () => {
    render(<Button>Save</Button>);
    expect(screen.getByText("Save")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    const onPress = jest.fn();
    render(<Button onPress={onPress}>Save</Button>);
    fireEvent.press(screen.getByText("Save"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress when disabled", () => {
    const onPress = jest.fn();
    render(<Button onPress={onPress} disabled>Save</Button>);
    fireEvent.press(screen.getByText("Save"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("does not call onPress when loading", () => {
    const onPress = jest.fn();
    render(<Button onPress={onPress} loading>Save</Button>);
    fireEvent.press(screen.getByText("Save"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("renders with different variants", () => {
    const { rerender } = render(<Button variant="danger">Delete</Button>);
    expect(screen.getByText("Delete")).toBeTruthy();

    rerender(<Button variant="ghost">Cancel</Button>);
    expect(screen.getByText("Cancel")).toBeTruthy();
  });
});
