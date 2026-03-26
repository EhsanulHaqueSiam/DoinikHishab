import { Platform } from "react-native";
import { extractText } from "expo-pdf-text-extract";
import { parsePDF } from "./pdf-parser";

// extractText is already mocked globally in jest.setup.js
const mockExtractText = extractText as jest.MockedFunction<typeof extractText>;

const BKASH_PDF_TEXT = `bKash Statement
SL\tTrx ID\tTransaction Date\tTrx Type\tSender\tReceiver\tReference\tAmount
1\tTXN001\t15/03/2026\tCash Out\t01712345678\t01812345678\tREF001\t500.00
2\tTXN002\t14/03/2026\tCash In\t01812345678\t01712345678\tREF002\t2000.00`;

describe("parsePDF", () => {
  const originalPlatform = Platform.OS;

  afterEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(Platform, "OS", { value: originalPlatform });
  });

  it("extracts text from PDF and parses bKash transactions", async () => {
    Object.defineProperty(Platform, "OS", { value: "android" });
    mockExtractText.mockResolvedValueOnce(BKASH_PDF_TEXT);

    const result = await parsePDF("file:///path/to/statement.pdf");

    expect(mockExtractText).toHaveBeenCalledWith("file:///path/to/statement.pdf");
    expect(result).toHaveLength(2);
    expect(result[0].provider).toBe("bkash");
    expect(result[0].amount).toBe(50000);
  });

  it("throws error for password-protected PDFs (empty extraction)", async () => {
    Object.defineProperty(Platform, "OS", { value: "android" });
    mockExtractText.mockResolvedValueOnce("");

    await expect(parsePDF("file:///path/to/locked.pdf")).rejects.toThrow(
      "password-protected",
    );
  });

  it("throws error for password-protected PDFs (extraction throws)", async () => {
    Object.defineProperty(Platform, "OS", { value: "android" });
    mockExtractText.mockRejectedValueOnce(new Error("Cannot read encrypted PDF"));

    await expect(parsePDF("file:///path/to/locked.pdf")).rejects.toThrow(
      "password-protected",
    );
  });

  it("throws error on web platform", async () => {
    Object.defineProperty(Platform, "OS", { value: "web" });

    await expect(parsePDF("file:///path/to/statement.pdf")).rejects.toThrow(
      "PDF import is only available on mobile",
    );
  });

  it("parses Nagad PDF text correctly", async () => {
    Object.defineProperty(Platform, "OS", { value: "android" });
    const nagadText = `Nagad Statement
Date\tTransaction Type\tDebit\tCredit\tReference\tBalance
15/03/2026\tCash Out\t500.00\t\tNGD001\t9500.00`;
    mockExtractText.mockResolvedValueOnce(nagadText);

    const result = await parsePDF("file:///path/to/nagad.pdf");
    expect(result).toHaveLength(1);
    expect(result[0].provider).toBe("nagad");
  });
});
