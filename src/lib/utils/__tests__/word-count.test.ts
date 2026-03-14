import { countWords, MAX_SCRIPT_WORDS } from '../word-count';

describe('MAX_SCRIPT_WORDS', () => {
  it('is 300', () => {
    expect(MAX_SCRIPT_WORDS).toBe(300);
  });
});

describe('countWords', () => {
  it('returns 0 for an empty string', () => {
    expect(countWords('')).toBe(0);
  });

  it('returns 0 for a whitespace-only string', () => {
    expect(countWords('   ')).toBe(0);
    expect(countWords('\t\n  ')).toBe(0);
  });

  it('returns 1 for a single word', () => {
    expect(countWords('hello')).toBe(1);
  });

  it('counts multiple words separated by single spaces', () => {
    expect(countWords('one two three')).toBe(3);
  });

  it('handles multiple consecutive spaces between words', () => {
    expect(countWords('one   two    three')).toBe(3);
  });

  it('handles leading and trailing whitespace', () => {
    expect(countWords('  hello world  ')).toBe(2);
  });

  it('handles newline-separated words', () => {
    expect(countWords('first\nsecond\nthird')).toBe(3);
  });

  it('handles tab-separated words', () => {
    expect(countWords('word1\tword2\tword3')).toBe(3);
  });

  it('counts exactly 300 words correctly', () => {
    const text = Array(MAX_SCRIPT_WORDS).fill('word').join(' ');
    expect(countWords(text)).toBe(MAX_SCRIPT_WORDS);
  });

  it('counts 301 words — one over the limit', () => {
    const text = Array(MAX_SCRIPT_WORDS + 1)
      .fill('word')
      .join(' ');
    expect(countWords(text)).toBe(MAX_SCRIPT_WORDS + 1);
  });
});
