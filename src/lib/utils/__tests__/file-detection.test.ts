import { detectSourceType, MAX_FILE_SIZE_BYTES, ACCEPTED_MIME_TYPES } from '../file-detection';

function createFile(name: string, type: string): File {
  return new File(['content'], name, { type });
}

describe('detectSourceType', () => {
  it('detects PDF from MIME type', () => {
    expect(detectSourceType(createFile('doc.pdf', 'application/pdf'))).toBe('PDF');
  });

  it('detects MARKDOWN from text/markdown MIME type', () => {
    expect(detectSourceType(createFile('doc.md', 'text/markdown'))).toBe('MARKDOWN');
  });

  it('detects MARKDOWN from text/plain MIME type', () => {
    expect(detectSourceType(createFile('doc.txt', 'text/plain'))).toBe('MARKDOWN');
  });

  it('detects PDF from extension when MIME type is unknown', () => {
    expect(detectSourceType(createFile('doc.pdf', ''))).toBe('PDF');
  });

  it('detects MARKDOWN from .md extension', () => {
    expect(detectSourceType(createFile('doc.md', ''))).toBe('MARKDOWN');
  });

  it('detects MARKDOWN from .txt extension', () => {
    expect(detectSourceType(createFile('doc.txt', ''))).toBe('MARKDOWN');
  });

  it('returns null for unknown file types', () => {
    expect(detectSourceType(createFile('image.jpg', 'image/jpeg'))).toBeNull();
  });

  it('returns null for unknown extensions', () => {
    expect(detectSourceType(createFile('file.xyz', ''))).toBeNull();
  });
});

describe('constants', () => {
  it('MAX_FILE_SIZE_BYTES is 10 MB', () => {
    expect(MAX_FILE_SIZE_BYTES).toBe(10 * 1024 * 1024);
  });

  it('ACCEPTED_MIME_TYPES includes pdf, md, txt', () => {
    expect(ACCEPTED_MIME_TYPES).toContain('.pdf');
    expect(ACCEPTED_MIME_TYPES).toContain('.md');
    expect(ACCEPTED_MIME_TYPES).toContain('.txt');
  });
});
