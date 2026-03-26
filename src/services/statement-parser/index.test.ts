import { detectFormat, detectDuplicates, parseStatement } from "./index";
import { mapTransactionType } from "./type-mapping";
import type { ParsedTransaction } from "./types";

// Mock the PDF parser to avoid Platform issues in index tests
jest.mock("./pdf-parser", () => ({
  parsePDF: jest.fn(),
}));

// Import after mock setup
const { parsePDF } = require("./pdf-parser");

describe("mapTransactionType", () => {
  it('maps "Cash Out" for bkash to expense', () => {
    expect(mapTransactionType("Cash Out", "bkash")).toBe("expense");
  });

  it('maps "Cash In" for bkash to income', () => {
    expect(mapTransactionType("Cash In", "bkash")).toBe("income");
  });

  it('maps "Send Money" for bkash to expense', () => {
    expect(mapTransactionType("Send Money", "bkash")).toBe("expense");
  });

  it('maps "Payment" for bkash to expense', () => {
    expect(mapTransactionType("Payment", "bkash")).toBe("expense");
  });

  it('maps "Add Money" for bkash to income', () => {
    expect(mapTransactionType("Add Money", "bkash")).toBe("income");
  });

  it('maps "Cashback" for bkash to income', () => {
    expect(mapTransactionType("Cashback", "bkash")).toBe("income");
  });

  it('maps "Mobile Recharge" for bkash to expense', () => {
    expect(mapTransactionType("Mobile Recharge", "bkash")).toBe("expense");
  });

  it('maps unknown type to expense as default', () => {
    expect(mapTransactionType("Unknown Type", "bkash")).toBe("expense");
  });
});

describe("detectFormat", () => {
  it('returns "bkash" when text contains bKash identifiers', () => {
    expect(detectFormat("bKash Statement Report\nSome data")).toBe("bkash");
  });

  it('returns "bkash" when text contains "Trx ID"', () => {
    expect(detectFormat("SL\tTrx ID\tDate\tType\tAmount")).toBe("bkash");
  });

  it('returns "nagad" when text contains Nagad identifiers', () => {
    expect(detectFormat("Nagad Transaction History\nSome data")).toBe("nagad");
  });

  it('returns "unknown" for unrecognizable content', () => {
    expect(detectFormat("Some random financial data")).toBe("unknown");
  });
});

describe("detectDuplicates", () => {
  const existing: ParsedTransaction[] = [
    {
      date: "2026-03-15",
      description: "Cash Out",
      amount: 50000,
      type: "expense",
      reference: "TXN001",
      provider: "bkash",
      originalType: "Cash Out",
    },
    {
      date: "2026-03-14",
      description: "Cash In",
      amount: 200000,
      type: "income",
      reference: "TXN002",
      provider: "bkash",
      originalType: "Cash In",
    },
  ];

  it("flags transactions matching existing by date+amount+reference hash", () => {
    const parsed: ParsedTransaction[] = [
      {
        date: "2026-03-15",
        description: "Cash Out",
        amount: 50000,
        type: "expense",
        reference: "TXN001",
        provider: "bkash",
        originalType: "Cash Out",
      },
    ];

    const duplicates = detectDuplicates(parsed, existing);
    expect(duplicates.get(0)).toBe(true);
  });

  it("does not flag non-matching transactions", () => {
    const parsed: ParsedTransaction[] = [
      {
        date: "2026-03-16",
        description: "Cash Out",
        amount: 30000,
        type: "expense",
        reference: "TXN099",
        provider: "bkash",
        originalType: "Cash Out",
      },
    ];

    const duplicates = detectDuplicates(parsed, existing);
    expect(duplicates.get(0)).toBe(false);
  });

  it("handles mixed results correctly", () => {
    const parsed: ParsedTransaction[] = [
      {
        date: "2026-03-15",
        description: "Cash Out",
        amount: 50000,
        type: "expense",
        reference: "TXN001",
        provider: "bkash",
        originalType: "Cash Out",
      },
      {
        date: "2026-03-16",
        description: "Payment",
        amount: 10000,
        type: "expense",
        reference: "TXN099",
        provider: "bkash",
        originalType: "Payment",
      },
    ];

    const duplicates = detectDuplicates(parsed, existing);
    expect(duplicates.get(0)).toBe(true);
    expect(duplicates.get(1)).toBe(false);
  });

  it("handles empty existing list", () => {
    const parsed: ParsedTransaction[] = [
      {
        date: "2026-03-15",
        description: "Cash Out",
        amount: 50000,
        type: "expense",
        reference: "TXN001",
        provider: "bkash",
        originalType: "Cash Out",
      },
    ];

    const duplicates = detectDuplicates(parsed, []);
    expect(duplicates.get(0)).toBe(false);
  });
});

describe("parseStatement", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("dispatches to correct parser for bKash text", async () => {
    const bkashText = `bKash Statement
SL\tTrx ID\tTransaction Date\tTrx Type\tSender\tReceiver\tReference\tAmount
1\tTXN001\t15/03/2026\tCash Out\t01712345678\t01812345678\tREF001\t500.00`;

    const result = await parseStatement(bkashText, false, "statement.txt");
    expect(result.provider).toBe("bkash");
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0].amount).toBe(50000);
  });

  it("dispatches to correct parser for Nagad text", async () => {
    const nagadText = `Nagad Statement
Date\tTransaction Type\tDebit\tCredit\tReference\tBalance
15/03/2026\tCash Out\t500.00\t\tNGD001\t9500.00`;

    const result = await parseStatement(nagadText, false, "statement.txt");
    expect(result.provider).toBe("nagad");
    expect(result.transactions).toHaveLength(1);
  });

  it('dispatches to parsePDF when mimeType is "application/pdf"', async () => {
    const mockTransactions: ParsedTransaction[] = [
      {
        date: "2026-03-15",
        description: "Cash Out",
        amount: 50000,
        type: "expense",
        reference: "TXN001",
        provider: "bkash",
        originalType: "Cash Out",
      },
    ];
    parsePDF.mockResolvedValueOnce(mockTransactions);

    const result = await parseStatement(
      "",
      false,
      "statement.pdf",
      "application/pdf",
      "file:///path/to/statement.pdf",
    );

    expect(parsePDF).toHaveBeenCalledWith("file:///path/to/statement.pdf");
    expect(result.transactions).toHaveLength(1);
    expect(result.provider).toBe("bkash");
  });

  it("dispatches to parseXLS when mimeType is excel/spreadsheet", async () => {
    // xlsx is globally mocked with jest.fn() returning undefined, which will cause
    // parseXLS to throw. parseStatement catches this and returns error.
    const result = await parseStatement(
      "base64data",
      true,
      "statement.xls",
      "application/vnd.ms-excel",
    );

    // Since xlsx.read mock returns undefined, parsing will error
    expect(result.provider).toBe("unknown");
    expect(result.errors).toHaveLength(1);
  });

  it("handles PDF parse errors gracefully", async () => {
    parsePDF.mockRejectedValueOnce(new Error("PDF import is only available on mobile"));

    const result = await parseStatement(
      "",
      false,
      "statement.pdf",
      "application/pdf",
      "file:///path/to/statement.pdf",
    );

    expect(result.transactions).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain("mobile");
  });

  it("returns error for unknown text format", async () => {
    const result = await parseStatement(
      "This is not a statement",
      false,
      "random.txt",
    );

    expect(result.transactions).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
  });
});
