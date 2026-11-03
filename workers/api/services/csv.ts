// Minimal CSV parser for roster imports — no dependencies.
// Handles CRLF/LF, BOM, quoted fields with "" escapes, and trims cells.

export interface CsvParseResult {
  headers: string[];
  rows: { line: number; cells: string[] }[];
  error?: string;
}

export const CSV_MAX_BYTES = 256 * 1024;
export const CSV_MAX_ROWS = 500;

function parseLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      cells.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  cells.push(current);
  return cells.map((c) => c.trim().replace(/\s+/g, ' '));
}

export function parseCsv(text: string): CsvParseResult {
  const bytes = new TextEncoder().encode(text).length;
  if (bytes > CSV_MAX_BYTES) {
    return { headers: [], rows: [], error: `File exceeds ${CSV_MAX_BYTES / 1024}KB limit` };
  }
  const clean = text.replace(/^﻿/, '');
  const lines = clean.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return { headers: [], rows: [], error: 'CSV must contain a header row and at least one data row' };
  }
  if (lines.length - 1 > CSV_MAX_ROWS) {
    return { headers: [], rows: [], error: `File exceeds ${CSV_MAX_ROWS} row limit` };
  }
  const headers = parseLine(lines[0]).map((h) => h.toLowerCase());
  const rows = lines.slice(1).map((line, i) => ({ line: i + 2, cells: parseLine(line) }));
  return { headers, rows };
}
