import { parseNagadText } from "./nagad-parser";

const SAMPLE_NAGAD_TEXT = `Nagad Statement
Date\tTransaction Type\tDebit\tCredit\tReference\tBalance
15/03/2026\tCash Out\t500.00\t\tNGD001\t9500.00
14/03/2026\tCash In\t\t2000.00\tNGD002\t10000.00
13/03/2026\tSend Money\t1000.00\t\tNGD003\t8000.00
12/03/2026\tAdd Money\t\t5000.00\tNGD004\t13000.00`;

const SAMPLE_NAGAD_CSV = `Nagad Statement
Date,Transaction Type,Debit,Credit,Reference,Balance
15/03/2026,Cash Out,500.00,,NGD001,9500.00
14/03/2026,Cash In,,2000.00,NGD002,10000.00`;

describe("parseNagadText", () => {
  it("parses valid text and returns correct transactions", () => {
    const result = parseNagadText(SAMPLE_NAGAD_TEXT);
    expect(result).toHaveLength(4);
  });

  it("extracts date, reference, type, and amount correctly", () => {
    const result = parseNagadText(SAMPLE_NAGAD_TEXT);
    expect(result[0]).toEqual({
      date: "2026-03-15",
      description: "Cash Out",
      amount: 50000,
      type: "expense",
      reference: "NGD001",
      provider: "nagad",
      originalType: "Cash Out",
    });
  });

  it("determines expense/income from debit/credit columns", () => {
    const result = parseNagadText(SAMPLE_NAGAD_TEXT);
    expect(result[0].type).toBe("expense"); // Debit (Cash Out)
    expect(result[1].type).toBe("income"); // Credit (Cash In)
    expect(result[2].type).toBe("expense"); // Debit (Send Money)
    expect(result[3].type).toBe("income"); // Credit (Add Money)
  });

  it("returns empty array for unrecognizable text", () => {
    const result = parseNagadText("Random text with no structure");
    expect(result).toEqual([]);
  });

  it("returns empty array for empty string", () => {
    const result = parseNagadText("");
    expect(result).toEqual([]);
  });

  it("parses comma-separated format", () => {
    const result = parseNagadText(SAMPLE_NAGAD_CSV);
    expect(result).toHaveLength(2);
    expect(result[0].reference).toBe("NGD001");
  });

  it("sets provider to nagad for all transactions", () => {
    const result = parseNagadText(SAMPLE_NAGAD_TEXT);
    for (const tx of result) {
      expect(tx.provider).toBe("nagad");
    }
  });

  it("converts amounts to positive integer paisa", () => {
    const result = parseNagadText(SAMPLE_NAGAD_TEXT);
    expect(result[0].amount).toBe(50000); // 500.00 -> 50000 paisa
    expect(result[1].amount).toBe(200000); // 2000.00 -> 200000 paisa
  });
});
