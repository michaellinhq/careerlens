/**
 * Client-side file parsing for resumes.
 * Supports: PDF (.pdf), Word (.docx), plain text (.txt)
 * All parsing happens in-browser — no server needed.
 */

/**
 * Extract text from a PDF file using pdfjs-dist.
 */
export async function parsePDF(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');

  // Use the bundled worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    pages.push(text);
  }

  return pages.join('\n\n').trim();
}

/**
 * Extract text from a .docx file using mammoth.
 */
export async function parseDOCX(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}

/**
 * Read a plain text file.
 */
export async function parseTXT(file: File): Promise<string> {
  return await file.text();
}

/**
 * Parse any supported resume file.
 * Returns extracted text, or throws on unsupported format.
 */
export async function parseResumeFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  if (name.endsWith('.pdf')) {
    return parsePDF(file);
  }
  if (name.endsWith('.docx')) {
    return parseDOCX(file);
  }
  if (name.endsWith('.txt') || name.endsWith('.md')) {
    return parseTXT(file);
  }

  throw new Error(`Unsupported file format: ${name.split('.').pop()}`);
}

/** Supported file extensions for the file input accept attribute */
export const SUPPORTED_FORMATS = '.pdf,.docx,.txt,.md';
export const FORMAT_LABEL = 'PDF, Word (.docx), TXT';
