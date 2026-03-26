import React from "react";
import { render, screen } from "@testing-library/react-native";
import { ReadyToAssignHero } from "./ReadyToAssignHero";

// Mock react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe("ReadyToAssignHero", () => {
  it("renders positive amount with positive subtitle", () => {
    render(<ReadyToAssignHero amount={500000} />);
    expect(screen.getByText(/5,000/)).toBeTruthy();
    expect(screen.getByText("readyToAssign.positive")).toBeTruthy();
  });

  it("renders zero amount with zero subtitle", () => {
    render(<ReadyToAssignHero amount={0} />);
    expect(screen.getByText("readyToAssign.zero")).toBeTruthy();
  });

  it("renders negative amount with overAssigned subtitle", () => {
    render(<ReadyToAssignHero amount={-200000} />);
    expect(screen.getByText("readyToAssign.overAssigned")).toBeTruthy();
  });

  it("has accessible button role", () => {
    render(<ReadyToAssignHero amount={500000} />);
    expect(screen.getByRole("button")).toBeTruthy();
  });

  it("displays title label", () => {
    render(<ReadyToAssignHero amount={100000} />);
    expect(screen.getByText("readyToAssign.title")).toBeTruthy();
  });
});
