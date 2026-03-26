import { parseBkashText } from "./bkash-parser";

const SAMPLE_BKASH_TEXT = `bKash Statement
SL\tTrx ID\tTransaction Date\tTrx Type\tSender\tReceiver\tReference\tAmount
1\tTXN001\t15/03/2026\tCash Out\t01712345678\t01812345678\tREF001\t500.00
2\tTXN002\t14/03/2026\tCash In\t01812345678\t01712345678\tREF002\t2000.00
3\tTXN003\t13/03/2026\tSend Money\t01712345678\t01612345678\tREF003\t1000.50
4\tTXN004\t12/03/2026\tPayment\t01712345678\tMerchant\tREF004\t350.00
5\tTXN005\t11/03/2026\tAdd Money\tBank\t01712345678\tREF005\t5000.00
6\tTXN006\t10/03/2026\tCashback\tSystem\t01712345678\tREF006\t25.00
7\tTXN007\t09/03/2026\tMobile Recharge\t01712345678\tOperator\tREF007\t100.00`;

const SAMPLE_BKASH_CSV = `bKash Statement
SL,Trx ID,Transaction Date,Trx Type,Sender,Receiver,Reference,Amount
1,TXN001,15/03/2026,Cash Out,01712345678,01812345678,REF001,500.00
2,TXN002,14/03/2026,Cash In,01812345678,01712345678,REF002,2000.00`;

describe("parseBkashText", () => {
  it("parses valid tab-separated text and returns correct transactions", () => {
    const result = parseBkashText(SAMPLE_BKASH_TEXT);
    expect(result).toHaveLength(7);
    expect(result[0]).toEqual({
      date: "2026-03-15",
      description: "Cash Out",
      amount: 50000,
      type: "expense",
      reference: "TXN001",
      provider: "bkash",
      originalType: "Cash Out",
    });
  });

  it("extracts date, trxId, trxType, and amount from each row", () => {
    const result = parseBkashText(SAMPLE_BKASH_TEXT);
    expect(result[1].date).toBe("2026-03-14");
    expect(result[1].reference).toBe("TXN002");
    expect(result[1].originalType).toBe("Cash In");
    expect(result[1].amount).toBe(200000);
  });

  it("handles DD/MM/YYYY date format correctly", () => {
    const result = parseBkashText(SAMPLE_BKASH_TEXT);
    // 15/03/2026 => 2026-03-15
    expect(result[0].date).toBe("2026-03-15");
  });

  it("handles MM/DD/YYYY when month part is > 12", () => {
    const text = `bKash Statement
SL\tTrx ID\tTransaction Date\tTrx Type\tSender\tReceiver\tReference\tAmount
1\tTXN001\t03/25/2026\tCash Out\t01712345678\t01812345678\tREF001\t500.00`;
    const result = parseBkashText(text);
    // 03/25/2026 -> second part 25 > 12, so it's MM/DD/YYYY -> 2026-03-25
    expect(result[0].date).toBe("2026-03-25");
  });

  it("returns empty array for unrecognizable text", () => {
    const result = parseBkashText("Just some random text\nwith no headers");
    expect(result).toEqual([]);
  });

  it("returns empty array for empty string", () => {
    const result = parseBkashText("");
    expect(result).toEqual([]);
  });

  it("maps transaction types correctly via BKASH_TYPE_MAP", () => {
    const result = parseBkashText(SAMPLE_BKASH_TEXT);
    expect(result[0].type).toBe("expense"); // Cash Out
    expect(result[1].type).toBe("income"); // Cash In
    expect(result[2].type).toBe("expense"); // Send Money
    expect(result[3].type).toBe("expense"); // Payment
    expect(result[4].type).toBe("income"); // Add Money
    expect(result[5].type).toBe("income"); // Cashback
    expect(result[6].type).toBe("expense"); // Mobile Recharge
  });

  it("converts amounts to positive integer paisa", () => {
    const result = parseBkashText(SAMPLE_BKASH_TEXT);
    expect(result[0].amount).toBe(50000); // 500.00 -> 50000 paisa
    expect(result[1].amount).toBe(200000); // 2000.00 -> 200000 paisa
    expect(result[2].amount).toBe(100050); // 1000.50 -> 100050 paisa
    expect(result[5].amount).toBe(2500); // 25.00 -> 2500 paisa
  });

  it("parses comma-separated format", () => {
    const result = parseBkashText(SAMPLE_BKASH_CSV);
    expect(result).toHaveLength(2);
    expect(result[0].reference).toBe("TXN001");
    expect(result[0].amount).toBe(50000);
  });

  it("sets provider to bkash for all transactions", () => {
    const result = parseBkashText(SAMPLE_BKASH_TEXT);
    for (const tx of result) {
      expect(tx.provider).toBe("bkash");
    }
  });
});
