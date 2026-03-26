import { sankey, sankeyJustify } from "d3-sankey";
import type { CategorySpendingData } from "./report-types";
import { DEFAULT_CHART_COLORS } from "./report-types";

export interface CashFlowNode {
  name: string;
  type: "income" | "expense" | "other";
  color: string;
  value?: number;
  // d3-sankey adds: x0, x1, y0, y1
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
}

export interface CashFlowLink {
  source: number;
  target: number;
  value: number;
  // d3-sankey adds: width, y0, y1
  width?: number;
}

export interface SankeyLayoutResult {
  nodes: CashFlowNode[];
  links: CashFlowLink[];
}

/**
 * Build Sankey input data from monthly report data.
 * Aggregates income sources as a single "Income" node (simplified).
 * Top N expense categories become individual nodes; rest collapse into "Other".
 * @param spending - spending by category array
 * @param totalIncome - total income in paisa
 * @param maxCategories - max expense categories to show (rest = "Other")
 */
export function buildSankeyData(
  spending: CategorySpendingData[],
  totalIncome: number,
  maxCategories = 8,
): { nodes: CashFlowNode[]; links: CashFlowLink[] } {
  // Income node at index 0
  const nodes: CashFlowNode[] = [
    { name: "Income", type: "income", color: "#0d9488" },
  ];

  // Sort spending descending, take top maxCategories, rest to "Other"
  const sorted = [...spending].sort((a, b) => b.total - a.total);
  const top = sorted.slice(0, maxCategories);
  const otherTotal = sorted
    .slice(maxCategories)
    .reduce((sum, c) => sum + c.total, 0);

  // Add expense nodes (indices 1..N)
  for (let i = 0; i < top.length; i++) {
    nodes.push({
      name: top[i].name,
      type: "expense",
      color:
        top[i].color ||
        DEFAULT_CHART_COLORS[i % DEFAULT_CHART_COLORS.length],
    });
  }

  // Add "Other" node if applicable
  if (otherTotal > 0) {
    nodes.push({ name: "Other", type: "other", color: "#4e6381" });
  }

  // Links: Income (0) -> each expense node
  const links: CashFlowLink[] = [];
  for (let i = 0; i < top.length; i++) {
    links.push({ source: 0, target: i + 1, value: top[i].total });
  }
  if (otherTotal > 0) {
    links.push({ source: 0, target: nodes.length - 1, value: otherTotal });
  }

  return { nodes, links };
}

/**
 * Compute Sankey layout using d3-sankey.
 * For horizontal layout: standard d3-sankey output.
 * For vertical layout: swap x/y in extent, transform output coordinates.
 */
export function computeSankeyLayout(
  data: { nodes: CashFlowNode[]; links: CashFlowLink[] },
  width: number,
  height: number,
  isVertical: boolean,
): SankeyLayoutResult {
  if (data.nodes.length === 0 || data.links.length === 0) {
    return { nodes: [], links: [] };
  }

  const sankeyGenerator = sankey<CashFlowNode, CashFlowLink>()
    .nodeWidth(isVertical ? 20 : 12)
    .nodePadding(isVertical ? 16 : 8)
    .nodeAlign(sankeyJustify)
    .iterations(6);

  if (isVertical) {
    // For vertical: compute as horizontal with swapped dims, then swap output coords
    sankeyGenerator.extent([
      [0, 0],
      [height, width],
    ]);
  } else {
    sankeyGenerator.extent([
      [0, 0],
      [width, height],
    ]);
  }

  // Clone data to avoid mutation
  const clonedNodes = data.nodes.map((n) => ({ ...n }));
  const clonedLinks = data.links.map((l) => ({ ...l }));

  const result = sankeyGenerator({
    nodes: clonedNodes,
    links: clonedLinks,
  });

  if (isVertical) {
    // Swap x and y coordinates for vertical layout
    for (const node of result.nodes) {
      const tmpX0 = node.x0;
      const tmpX1 = node.x1;
      node.x0 = node.y0;
      node.x1 = node.y1;
      node.y0 = tmpX0;
      node.y1 = tmpX1;
    }
  }

  return {
    nodes: result.nodes as CashFlowNode[],
    links: result.links as CashFlowLink[],
  };
}

/**
 * Generate vertical cubic bezier SVG path for a link.
 * Goes from bottom of source node to top of target node.
 */
export function generateVerticalLinkPath(link: any): string {
  const source = link.source;
  const target = link.target;
  const sourceX = (source.x0 + source.x1) / 2;
  const sourceY = source.y1; // bottom of source
  const targetX = (target.x0 + target.x1) / 2;
  const targetY = target.y0; // top of target
  const midY = (sourceY + targetY) / 2;

  return `M ${sourceX} ${sourceY} C ${sourceX} ${midY}, ${targetX} ${midY}, ${targetX} ${targetY}`;
}

/**
 * Generate horizontal cubic bezier SVG path for a link.
 * Goes from right of source node to left of target node.
 */
export function generateHorizontalLinkPath(link: any): string {
  const source = link.source;
  const target = link.target;
  const sourceX = source.x1; // right of source
  const sourceY0 = link.y0 ?? (source.y0 + source.y1) / 2;
  const targetX = target.x0; // left of target
  const targetY0 = link.y1 ?? (target.y0 + target.y1) / 2;
  const midX = (sourceX + targetX) / 2;

  return `M ${sourceX} ${sourceY0} C ${midX} ${sourceY0}, ${midX} ${targetY0}, ${targetX} ${targetY0}`;
}

/**
 * Get link color based on source node type.
 * Income links: teal. Expense links: category color. Other: gray.
 */
export function getLinkColor(link: any, opacity: number): string {
  const source = link.source;
  if (!source) return `rgba(78, 99, 129, ${opacity})`; // fallback gray
  if (source.type === "income") return `rgba(13, 148, 136, ${opacity})`; // teal
  const target = link.target;
  if (target?.color) {
    // Parse hex to rgba
    const hex = target.color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return `rgba(78, 99, 129, ${opacity})`; // gray for "Other"
}
