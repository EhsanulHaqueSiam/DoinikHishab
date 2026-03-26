import React from "react";
import { render } from "@testing-library/react-native";
import { SankeyDiagram } from "./SankeyDiagram";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("../../hooks/use-platform", () => ({
  usePlatform: () => ({
    isMobile: true,
    isWeb: false,
    isIOS: false,
    isAndroid: true,
    OS: "android",
  }),
}));

jest.mock("react-native/Libraries/Utilities/useWindowDimensions", () => ({
  __esModule: true,
  default: () => ({ width: 375, height: 812 }),
}));

// Mock storage for PrivacyToggle
jest.mock("../../services/storage", () => ({
  getSetting: jest.fn().mockReturnValue(undefined),
  setSetting: jest.fn(),
}));

// Mock SVG components
jest.mock("react-native-svg", () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => {
    const { View } = require("react-native");
    return <View {...props}>{children}</View>;
  },
  Rect: (props: any) => {
    const { View } = require("react-native");
    return <View {...props} />;
  },
  Path: (props: any) => {
    const { View } = require("react-native");
    return <View {...props} />;
  },
  Text: (props: any) => {
    const RN = require("react-native");
    return <RN.Text {...props} />;
  },
}));

// Mock lucide icons
jest.mock("lucide-react-native", () => ({
  Eye: (props: any) => {
    const { View } = require("react-native");
    return <View testID="eye-icon" {...props} />;
  },
  EyeOff: (props: any) => {
    const { View } = require("react-native");
    return <View testID="eye-off-icon" {...props} />;
  },
  AlertTriangle: (props: any) => {
    const { View } = require("react-native");
    return <View testID="alert-icon" {...props} />;
  },
  BarChart3: (props: any) => {
    const { View } = require("react-native");
    return <View testID="chart-icon" {...props} />;
  },
  TrendingUp: (props: any) => {
    const { View } = require("react-native");
    return <View testID="trend-icon" {...props} />;
  },
  GitBranch: (props: any) => {
    const { View } = require("react-native");
    return <View testID="branch-icon" {...props} />;
  },
}));

describe("SankeyDiagram", () => {
  const mockSpending = [
    {
      categoryId: "mock_cat_1",
      name: "Groceries",
      color: "#3B82F6",
      total: 150000,
      percentage: 50,
    },
    {
      categoryId: "mock_cat_2",
      name: "Transport",
      color: "#EF4444",
      total: 100000,
      percentage: 33,
    },
  ];

  it("renders without crashing", () => {
    const { toJSON } = render(
      <SankeyDiagram spending={mockSpending} totalIncome={500000} />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it("renders empty state when no spending data", () => {
    const { getByText } = render(
      <SankeyDiagram spending={[]} totalIncome={0} />,
    );
    expect(getByText("reports.noCashFlowTitle")).toBeTruthy();
  });

  it("renders cash flow title", () => {
    const { getByText } = render(
      <SankeyDiagram spending={mockSpending} totalIncome={500000} />,
    );
    expect(getByText("reports.cashFlowTitle")).toBeTruthy();
  });

  it("renders legend with category names", () => {
    const { getByText } = render(
      <SankeyDiagram spending={mockSpending} totalIncome={500000} />,
    );
    expect(getByText("Groceries")).toBeTruthy();
    expect(getByText("Transport")).toBeTruthy();
  });

  it("renders income legend entry", () => {
    const { getByText } = render(
      <SankeyDiagram spending={mockSpending} totalIncome={500000} />,
    );
    expect(getByText("transaction.income")).toBeTruthy();
  });
});
