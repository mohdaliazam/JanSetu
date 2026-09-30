/**
 * Redaction service.
 * Replaces phone numbers, emails, and Aadhaar-like patterns.
 * NOTE: Pattern redaction is incomplete and not a guarantee of anonymisation.
 */
export function redact(text: string): string {
  let result = text;
  // Email patterns
  result = result.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED]');
  // Phone numbers (10+ digits, with optional separators)
  result = result.replace(/(\+?\d[\d\s-]{8,}\d)/g, '[REDACTED]');
  // Aadhaar-like (12 digit sequences)
  result = result.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[REDACTED]');
  return result;
}
