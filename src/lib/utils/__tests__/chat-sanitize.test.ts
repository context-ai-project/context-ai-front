import {
  normalizeLine,
  isInternalTypeLine,
  isTypeInfoOnlyLine,
  sanitizeContent,
} from '../chat-sanitize';

describe('normalizeLine', () => {
  it('trims, collapses spaces, and lowercases', () => {
    expect(normalizeLine('  Hello   World  ')).toBe('hello world');
  });

  it('handles empty string', () => {
    expect(normalizeLine('')).toBe('');
  });
});

describe('isInternalTypeLine', () => {
  it('returns true for "type: info"', () => {
    expect(isInternalTypeLine('type: info')).toBe(true);
  });

  it('returns true for "type: info" with whitespace', () => {
    expect(isInternalTypeLine('  Type: Info  ')).toBe(true);
  });

  it('returns true for JSON variant', () => {
    expect(isInternalTypeLine('"type":"info"')).toBe(true);
  });

  it('returns false for other text', () => {
    expect(isInternalTypeLine('some other text')).toBe(false);
  });
});

describe('isTypeInfoOnlyLine', () => {
  it('returns true for plain type info', () => {
    expect(isTypeInfoOnlyLine('type: info')).toBe(true);
  });

  it('returns true for bulleted type info with dash', () => {
    expect(isTypeInfoOnlyLine('- type: info')).toBe(true);
  });

  it('returns true for bulleted type info with bullet', () => {
    expect(isTypeInfoOnlyLine('• type: info')).toBe(true);
  });

  it('returns true for bulleted type info with asterisk', () => {
    expect(isTypeInfoOnlyLine('* type: info')).toBe(true);
  });

  it('returns false for non-type-info', () => {
    expect(isTypeInfoOnlyLine('- some normal item')).toBe(false);
  });
});

describe('sanitizeContent', () => {
  it('removes type info lines', () => {
    const input = 'Hello\ntype: info\nWorld';
    expect(sanitizeContent(input)).toBe('Hello\nWorld');
  });

  it('removes bulleted type info lines', () => {
    const input = 'Hello\n- type: info\nWorld';
    expect(sanitizeContent(input)).toBe('Hello\nWorld');
  });

  it('returns empty/null text as-is', () => {
    expect(sanitizeContent('')).toBe('');
    expect(sanitizeContent('   ')).toBe('   ');
  });

  it('preserves normal content', () => {
    const input = 'Line 1\nLine 2\nLine 3';
    expect(sanitizeContent(input)).toBe(input);
  });
});
