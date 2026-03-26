import React, { useMemo, useState } from "react";
import { View } from "react-native";
import Svg, { Rect, Path, Text as SvgText } from "react-native-svg";
import { formatCurrency } from "../../lib/currency";
import {
  computeSankeyLayout,
  buildSankeyData,
  generateHorizontalLinkPath,
  getLinkColor,
} from "./sankey-layout";
import type { CategorySpendingData } from "./report-types";

interface SankeyHorizontalProps {
  spending: CategorySpendingData[];
  totalIncome: number;
  isPrivacy: boolean;
  width: number;
  height: number;
}

export function SankeyHorizontal({
  spending,
  totalIncome,
  isPrivacy,
  width,
  height,
}: SankeyHorizontalProps) {
  const [focusedNodeIndex, setFocusedNodeIndex] = useState<number | null>(
    null,
  );

  const chartWidth = Math.max(width, 600); // Minimum 600px for horizontal layout

  const layout = useMemo(() => {
    const data = buildSankeyData(spending, totalIncome, 15); // Up to 15 categories on web
    return computeSankeyLayout(data, chartWidth, height, false); // isVertical = false
  }, [spending, totalIncome, chartWidth, height]);

  if (layout.nodes.length === 0) return null;

  const totalExpense = spending.reduce((sum, c) => sum + c.total, 0);

  return (
    <View style={{ width: chartWidth, height }}>
      <Svg
        width={chartWidth}
        height={height}
        viewBox={`0 0 ${chartWidth} ${height}`}
      >
        {/* Links: cubic bezier paths */}
        {layout.links.map((link, i) => {
          const isFocused =
            focusedNodeIndex === null ||
            (link as any).source?.index === focusedNodeIndex ||
            (link as any).target?.index === focusedNodeIndex;
          return (
            <Path
              key={`link-${i}`}
              d={generateHorizontalLinkPath(link)}
              fill="none"
              stroke={getLinkColor(link, isFocused ? 0.6 : 0.1)}
              strokeWidth={Math.max((link as any).width || 2, 2)}
              opacity={isFocused ? 1 : 0.3}
            />
          );
        })}
        {/* Nodes: rounded rectangles */}
        {layout.nodes.map((node, i) => {
          const nodeWidth = Math.max(
            (node.x1 ?? 0) - (node.x0 ?? 0),
            12,
          );
          const nodeHeight = Math.max(
            (node.y1 ?? 0) - (node.y0 ?? 0),
            8,
          );
          return (
            <Rect
              key={`node-${i}`}
              x={node.x0}
              y={node.y0}
              width={nodeWidth}
              height={nodeHeight}
              rx={4}
              fill={node.color}
              onPress={() =>
                setFocusedNodeIndex(
                  focusedNodeIndex === i ? null : i,
                )
              }
            />
          );
        })}
        {/* Labels: positioned beside nodes (right for income, left for expense) */}
        {layout.nodes.map((node, i) => {
          const nodeHeight =
            (node.y1 ?? 0) - (node.y0 ?? 0);
          const y = (node.y0 ?? 0) + nodeHeight / 2 + 4;
          const nodeValue = (node as any).value ?? 0;
          const pct =
            totalExpense > 0
              ? ((nodeValue / totalExpense) * 100).toFixed(1)
              : "0";

          // Income labels go to the left of the node, expense labels to the right
          const isIncome = node.type === "income";
          const x = isIncome
            ? (node.x0 ?? 0) - 8
            : (node.x1 ?? 0) + 8;
          const anchor = isIncome ? "end" : "start";

          return (
            <SvgText
              key={`label-${i}`}
              x={x}
              y={y}
              textAnchor={anchor}
              fontSize={11}
              fontWeight="bold"
              fill="#c1d0e0"
            >
              {`${node.name}: ${isPrivacy ? `${pct}%` : formatCurrency(nodeValue)}`}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}
