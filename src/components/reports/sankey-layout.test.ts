import {
  buildSankeyData,
  computeSankeyLayout,
  generateHorizontalLinkPath,
  generateVerticalLinkPath,
  getLinkColor,
} from "./sankey-layout";

describe("sankey-layout", () => {
  const mockSpending = [
    {
      categoryId: "mock_cat_1",
      name: "Groceries",
      color: "#3B82F6",
      total: 150000,
      percentage: 40,
    },
    {
      categoryId: "mock_cat_2",
      name: "Transport",
      color: "#EF4444",
      total: 100000,
      percentage: 27,
    },
    {
      categoryId: "mock_cat_3",
      name: "Utilities",
      color: "#10B981",
      total: 50000,
      percentage: 13,
    },
  ];

  describe("buildSankeyData", () => {
    it("creates income node at index 0", () => {
      const { nodes } = buildSankeyData(mockSpending, 500000, 8);
      expect(nodes[0].name).toBe("Income");
      expect(nodes[0].type).toBe("income");
    });

    it("creates expense nodes for each category", () => {
      const { nodes } = buildSankeyData(mockSpending, 500000, 8);
      expect(nodes).toHaveLength(4); // 1 income + 3 expense
      expect(nodes[1].name).toBe("Groceries");
      expect(nodes[1].type).toBe("expense");
    });

    it("creates links from income to each expense", () => {
      const { links } = buildSankeyData(mockSpending, 500000, 8);
      expect(links).toHaveLength(3);
      expect(links[0].source).toBe(0);
      expect(links[0].target).toBe(1);
    });

    it("collapses categories beyond maxCategories into Other", () => {
      const { nodes } = buildSankeyData(mockSpending, 500000, 2);
      const otherNode = nodes.find((n) => n.name === "Other");
      expect(otherNode).toBeTruthy();
      expect(otherNode?.type).toBe("other");
    });

    it("sorts categories by total descending", () => {
      const { nodes } = buildSankeyData(mockSpending, 500000, 8);
      // After income node, first should be highest total
      expect(nodes[1].name).toBe("Groceries"); // 150000
      expect(nodes[2].name).toBe("Transport"); // 100000
      expect(nodes[3].name).toBe("Utilities"); // 50000
    });

    it("does not add Other node when all categories fit", () => {
      const { nodes } = buildSankeyData(mockSpending, 500000, 10);
      const otherNode = nodes.find((n) => n.name === "Other");
      expect(otherNode).toBeUndefined();
    });
  });

  describe("computeSankeyLayout", () => {
    it("returns empty result for empty data", () => {
      const result = computeSankeyLayout({ nodes: [], links: [] }, 300, 400, true);
      expect(result.nodes).toHaveLength(0);
      expect(result.links).toHaveLength(0);
    });

    it("computes node positions for valid data (horizontal)", () => {
      const data = buildSankeyData(mockSpending, 500000, 8);
      const result = computeSankeyLayout(data, 300, 400, false);
      expect(result.nodes.length).toBeGreaterThan(0);
      for (const node of result.nodes) {
        expect(node.x0).toBeDefined();
        expect(node.y0).toBeDefined();
        expect(node.x1).toBeDefined();
        expect(node.y1).toBeDefined();
      }
    });

    it("computes node positions for valid data (vertical)", () => {
      const data = buildSankeyData(mockSpending, 500000, 8);
      const result = computeSankeyLayout(data, 300, 400, true);
      expect(result.nodes.length).toBeGreaterThan(0);
      for (const node of result.nodes) {
        expect(node.x0).toBeDefined();
        expect(node.y0).toBeDefined();
      }
    });

    it("does not mutate input data", () => {
      const data = buildSankeyData(mockSpending, 500000, 8);
      const originalNodeCount = data.nodes.length;
      const originalLinkCount = data.links.length;
      computeSankeyLayout(data, 300, 400, false);
      expect(data.nodes).toHaveLength(originalNodeCount);
      expect(data.links).toHaveLength(originalLinkCount);
    });
  });

  describe("generateVerticalLinkPath", () => {
    it("returns SVG path string starting with M", () => {
      const link = {
        source: { x0: 10, x1: 30, y0: 0, y1: 20 },
        target: { x0: 50, x1: 70, y0: 100, y1: 120 },
      };
      const path = generateVerticalLinkPath(link);
      expect(path).toMatch(/^M /);
      expect(path).toContain("C ");
    });
  });

  describe("generateHorizontalLinkPath", () => {
    it("returns SVG path string starting with M", () => {
      const link = {
        source: { x0: 0, x1: 20, y0: 10, y1: 30 },
        target: { x0: 100, x1: 120, y0: 50, y1: 70 },
        y0: 20,
        y1: 60,
      };
      const path = generateHorizontalLinkPath(link);
      expect(path).toMatch(/^M /);
      expect(path).toContain("C ");
    });
  });

  describe("getLinkColor", () => {
    it("returns teal for income source", () => {
      const link = {
        source: { type: "income" },
        target: { color: "#EF4444" },
      };
      const color = getLinkColor(link, 0.2);
      expect(color).toContain("13, 148, 136");
    });

    it("returns target color for expense source", () => {
      const link = {
        source: { type: "expense" },
        target: { color: "#EF4444" },
      };
      const color = getLinkColor(link, 0.5);
      expect(color).toContain("239, 68, 68");
    });

    it("returns gray fallback when no source", () => {
      const link = { source: null, target: { color: "#EF4444" } };
      const color = getLinkColor(link, 0.3);
      expect(color).toContain("78, 99, 129");
    });

    it("returns gray for other type without target color", () => {
      const link = { source: { type: "other" }, target: {} };
      const color = getLinkColor(link, 0.5);
      expect(color).toContain("78, 99, 129");
    });
  });
});
