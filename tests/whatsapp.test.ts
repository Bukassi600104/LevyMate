import { parseWhatsAppText } from '../services/whatsapp/parseWhatsApp';

describe('WhatsApp Parser', () => {
  it('should parse income transactions', () => {
    const text = `
John: I received NGN 50,000 for the contract
Mary: Payment sent 12/15/2023
Ada: Got paid ₦25,000 today
    `;

    const result = parseWhatsAppText(text);
    
    expect(result.length).toBeGreaterThan(0);
    const incomeTransactions = result.filter(r => r.tag === 'income');
    expect(incomeTransactions.length).toBeGreaterThan(0);
  });

  it('should parse expense transactions', () => {
    const text = `
John: Paid ₦15,000 for supplies
Mary: Bought items worth 5,000 naira
Ada: Spent N10,000 on transport
    `;

    const result = parseWhatsAppText(text);
    
    expect(result.length).toBeGreaterThan(0);
    const expenseTransactions = result.filter(r => r.tag === 'expense');
    expect(expenseTransactions.length).toBeGreaterThan(0);
  });

  it('should extract amounts correctly', () => {
    const text = 'John: Received ₦100,000.50 payment';
    
    const result = parseWhatsAppText(text);
    
    expect(result.length).toBe(1);
    expect(result[0].amount).toBe(100000.50);
  });

  it('should parse dates', () => {
    const text = 'John: Payment on 12/15/2023 for ₦50,000';
    
    const result = parseWhatsAppText(text);
    
    expect(result.length).toBe(1);
    expect(result[0].date).toBeTruthy();
  });

  it('should calculate confidence scores', () => {
    const text = 'John: Received ₦50,000 on 12/15/2023';
    
    const result = parseWhatsAppText(text);
    
    expect(result.length).toBe(1);
    expect(result[0].confidence).toBeGreaterThan(0.5);
  });

  it('should deduplicate identical transactions', () => {
    const text = `
John: Received ₦50,000
John: Received ₦50,000
    `;
    
    const result = parseWhatsAppText(text);
    
    expect(result.length).toBe(1);
  });

  it('should handle messages without amounts', () => {
    const text = `
John: Hello there
Mary: How are you?
Ada: Meeting tomorrow
    `;
    
    const result = parseWhatsAppText(text);
    
    expect(result.length).toBe(0);
  });

  it('should handle various currency formats', () => {
    const texts = [
      'NGN 50,000',
      '₦50,000',
      'N 50,000',
      '50,000 naira',
      '50000',
    ];

    texts.forEach(text => {
      const result = parseWhatsAppText(`John: Paid ${text}`);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].amount).toBeTruthy();
    });
  });
});
