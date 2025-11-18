import { parseWhatsAppText } from "../services/whatsapp-parser";

describe("WhatsApp Parser", () => {
  it("should extract amounts with naira symbol", () => {
    const text = "I sold items for ₦5000 today";
    const result = parseWhatsAppText(text);

    expect(result).toHaveLength(1);
    expect(result[0].amount).toBe(5000);
    expect(result[0].type).toBe("income");
  });

  it("should parse NGN prefix format", () => {
    const text = "Payment received NGN 45000";
    const result = parseWhatsAppText(text);

    expect(result[0].amount).toBe(45000);
    expect(result[0].confidence).toBeGreaterThan(0.7);
  });

  it("should handle comma-separated amounts", () => {
    const text = "Spent ₦1,500,000 on equipment";
    const result = parseWhatsAppText(text);

    expect(result[0].amount).toBe(1500000);
    expect(result[0].type).toBe("expense");
  });

  it("should extract dates from messages", () => {
    const text = "17/11/2025 sold ₦25000 worth of goods";
    const result = parseWhatsAppText(text);

    expect(result[0].date).toBeDefined();
  });

  it("should handle ambiguous cases with low confidence", () => {
    const text = "maybe ₦5000 or ₦10000";
    const result = parseWhatsAppText(text);

    expect(result.some((r: any) => r.confidence < 0.8)).toBe(true);
  });

  it("should return empty for non-transaction messages", () => {
    const text = "Hello, how are you?";
    const result = parseWhatsAppText(text);

    expect(result).toHaveLength(0);
  });
});
