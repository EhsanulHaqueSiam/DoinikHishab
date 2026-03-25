import {
  previousMonth,
  nextMonth,
  getMonthLabel,
  groupByDate,
  formatDate,
} from "./date";

describe("date utilities", () => {
  describe("previousMonth", () => {
    it("decrements month", () => {
      expect(previousMonth("202603")).toBe("202602");
      expect(previousMonth("202610")).toBe("202609");
    });

    it("wraps around year boundary", () => {
      expect(previousMonth("202601")).toBe("202512");
    });
  });

  describe("nextMonth", () => {
    it("increments month", () => {
      expect(nextMonth("202603")).toBe("202604");
      expect(nextMonth("202609")).toBe("202610");
    });

    it("wraps around year boundary", () => {
      expect(nextMonth("202612")).toBe("202701");
    });
  });

  describe("getMonthLabel", () => {
    it("returns human-readable month and year", () => {
      const label = getMonthLabel("202603");
      expect(label).toContain("March");
      expect(label).toContain("2026");
    });

    it("handles January", () => {
      const label = getMonthLabel("202601");
      expect(label).toContain("January");
    });

    it("handles December", () => {
      const label = getMonthLabel("202612");
      expect(label).toContain("December");
    });
  });

  describe("formatDate", () => {
    it("formats ISO date string", () => {
      const formatted = formatDate("2026-03-15");
      expect(formatted).toContain("15");
      expect(formatted).toContain("2026");
    });
  });

  describe("groupByDate", () => {
    it("groups items by date field", () => {
      const items = [
        { date: "2026-03-15", id: 1 },
        { date: "2026-03-15", id: 2 },
        { date: "2026-03-14", id: 3 },
      ];
      const groups = groupByDate(items);
      expect(groups).toHaveLength(2);
      expect(groups[0].date).toBe("2026-03-15");
      expect(groups[0].items).toHaveLength(2);
      expect(groups[1].date).toBe("2026-03-14");
    });

    it("sorts groups by date descending", () => {
      const items = [
        { date: "2026-03-10", id: 1 },
        { date: "2026-03-20", id: 2 },
      ];
      const groups = groupByDate(items);
      expect(groups[0].date).toBe("2026-03-20");
      expect(groups[1].date).toBe("2026-03-10");
    });

    it("returns empty array for empty input", () => {
      expect(groupByDate([])).toEqual([]);
    });
  });
});
