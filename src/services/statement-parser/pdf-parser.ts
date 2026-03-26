/**
 * PDF Statement Parser
 *
 * Extracts text from PDF files using expo-pdf-text-extract on native platforms,
 * then delegates to bKash/Nagad text parsers.
 * Per IMPT-01, Pitfall 2: Password-protected PDFs throw clear error.
 */

import { extractText } from "expo-pdf-text-extract";
import { Platform } from "react-native";
import { parseBkashText } from "./bkash-parser";
import { parseNagadText } from "./nagad-parser";
import type { ParsedTransaction } from "./types";

/**
 * Detect whether extracted text is bKash or Nagad format.
 */
function detectTextFormat(text: string): "bkash" | "nagad" | "unknown" {
  const lower = text.toLowerCase();
  if (lower.includes("bkash") || lower.includes("trx id")) return "bkash";
  if (lower.includes("nagad")) return "nagad";
  return "unknown";
}

/**
 * Parse a PDF file by extracting text and delegating to the appropriate text parser.
 * - Web platform: throws error (PDF extraction is mobile-only)
 * - Empty extraction: throws password-protected error
 * - Successful extraction: delegates to bKash or Nagad text parser
 */
export async function parsePDF(fileUri: string): Promise<ParsedTransaction[]> {
  if (Platform.OS === "web") {
    throw new Error("PDF import is only available on mobile");
  }

  try {
    const text = await extractText(fileUri);

    if (!text || text.trim().length === 0) {
      throw new Error(
        "This PDF appears to be password-protected. Please unlock it first using your PDF viewer, then try again. Or use the TXT/XLS format instead."
      );
    }

    const format = detectTextFormat(text);
    if (format === "bkash") {
      return parseBkashText(text);
    }
    if (format === "nagad") {
      return parseNagadText(text);
    }

    // Unknown format -- try bKash parser first (more common)
    const result = parseBkashText(text);
    if (result.length > 0) return result;

    return parseNagadText(text);
  } catch (error) {
    if (error instanceof Error) {
      // Re-throw our own errors
      if (
        error.message.includes("password-protected") ||
        error.message.includes("only available on mobile")
      ) {
        throw error;
      }
    }
    // Any other extraction error -- treat as password-protected
    throw new Error(
      "This PDF appears to be password-protected. Please unlock it first using your PDF viewer, then try again. Or use the TXT/XLS format instead."
    );
  }
}
