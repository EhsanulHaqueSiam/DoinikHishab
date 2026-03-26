import { useMemo, useState } from "react";
import { View } from "react-native";
import Svg, { Path, Rect, Text as SvgText } from "react-native-svg";
import { formatCurrency } from "../../lib/currency";
import type { CategorySpendingData } from "./report-types";
import {
  buildSankeyData,
  computeSankeyLayout,
  generateVerticalLinkPath,
  getLinkColor,
} from "./sankey-layout";

interface SankeyVerticalProps {
  spending: CategorySpendingData[];
  totalIncome: number;
  isPrivacy: boolean;
  width: number;
  height: number;
}

export function SankeyVertical({
  spending,
  totalIncome,
  isPrivacy,
  width,
  height,
}: SankeyVerticalProps) {
  const [focusedNodeIndex, setFocusedNodeIndex] = useState<number | null>(null);

  const layout = useMemo(() => {
    const data = buildSankeyData(spending, totalIncome, 8); // Max 8 categories on mobile
    return computeSankeyLayout(data, width, height, true); // isVertical = true
  }, [spending, totalIncome, width, height]);

  if (layout.nodes.length === 0) return null;

  const totalExpense = spending.reduce((sum, c) => sum + c.total, 0);

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Links: cubic bezier paths */}
        {layout.links.map((link, i) => {
          const isFocused =
            focusedNodeIndex === null ||
            (link.source as unknown as { index: number })?.index === focusedNodeIndex ||
            (link.target as unknown as { index: number })?.index === focusedNodeIndex;
          return (
            <Path
              key={`link-${link.source}-${link.target}`}
              d={generateVerticalLinkPath(link)}
              fill="none"
              stroke={getLinkColor(link, isFocused ? 0.6 : 0.1)}
              strokeWidth={Math.max((link.width as number) || 2, 2)}
              opacity={isFocused ? 1 : 0.3}
            />
          );
        })}
        {/* Nodes: rounded rectangles */}
        {layout.nodes.map((node, i) => {
          const nodeWidth = Math.max((node.x1 ?? 0) - (node.x0 ?? 0), 20);
          const nodeHeight = Math.max((node.y1 ?? 0) - (node.y0 ?? 0), 8);
          return (
            <Rect
              key={`node-${node.name}`}
              x={node.x0}
              y={node.y0}
              width={nodeWidth}
              height={nodeHeight}
              rx={4}
              fill={node.color}
              onPress={() => setFocusedNodeIndex(focusedNodeIndex === i ? null : i)}
            />
          );
        })}
        {/* Labels */}
        {layout.nodes.map((node, i) => {
          const nodeWidth = Math.max((node.x1 ?? 0) - (node.x0 ?? 0), 20);
          const x = ((node.x0 ?? 0) + (node.x1 ?? 0)) / 2;
          const y = node.type === "income" ? (node.y0 ?? 0) - 6 : (node.y1 ?? 0) + 14;
          const nodeValue = (node.value as number) ?? 0;
          const pct = totalExpense > 0 ? ((nodeValue / totalExpense) * 100).toFixed(1) : "0";

          // Truncate label to fit
          const maxChars = Math.floor(nodeWidth / 6);
          const label =
            node.name.length > maxChars ? `${node.name.slice(0, maxChars - 1)}...` : node.name;

          return (
            <SvgText
              key={`label-${node.name}`}
              x={x}
              y={y}
              textAnchor="middle"
              fontSize={10}
              fontWeight="bold"
              fill="#c1d0e0"
            >
              {`${label}: ${isPrivacy ? `${pct}%` : formatCurrency(nodeValue)}`}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}
