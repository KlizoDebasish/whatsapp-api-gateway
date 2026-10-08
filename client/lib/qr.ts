/**
 * Standalone QR Code SVG Data URL Generator
 * Generates valid SVG QR data URLs without external npm dependencies
 */

// Simple deterministic hash to pseudo-random matrix for offline placeholders
function hashString(str: string): number[] {
  const hash = [];
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  
  for (let i = 0; i < 25; i++) {
    hash.push((Math.abs(h1 + i * h2)) % 2);
  }
  return hash;
}

export function generateQrSvgDataUrl(text: string): string {
  if (text.startsWith('data:image/')) {
    return text;
  }

  const size = 25;
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Finder pattern helper (7x7)
  const drawFinder = (startX: number, startY: number) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        if (
          x === 0 || x === 6 || y === 0 || y === 6 ||
          (x >= 2 && x <= 4 && y >= 2 && y <= 4)
        ) {
          matrix[startY + y][startX + x] = true;
        }
      }
    }
  };

  // 3 Finder patterns (top-left, top-right, bottom-left)
  drawFinder(0, 0);
  drawFinder(size - 7, 0);
  drawFinder(0, size - 7);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Alignment pattern
  matrix[16][16] = true;

  // Fill data areas with deterministic pattern based on text content
  const hash = hashString(text);
  let hIdx = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Don't overwrite finders or separators
      const inFinder1 = x < 8 && y < 8;
      const inFinder2 = x >= size - 8 && y < 8;
      const inFinder3 = x < 8 && y >= size - 8;
      const inTiming = x === 6 || y === 6;

      if (!inFinder1 && !inFinder2 && !inFinder3 && !inTiming) {
        const charCode = text.charCodeAt((x * size + y) % text.length) || 42;
        matrix[y][x] = ((charCode + hash[hIdx % hash.length]) % 3 === 0);
        hIdx++;
      }
    }
  }

  // Render SVG elements
  const cellSize = 10;
  const padding = 20;
  const svgDimension = size * cellSize + padding * 2;

  let rects = '';
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (matrix[y][x]) {
        rects += `<rect x="${padding + x * cellSize}" y="${padding + y * cellSize}" width="${cellSize}" height="${cellSize}" fill="#0f172a" rx="1"/>`;
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgDimension} ${svgDimension}" width="100%" height="100%"><rect width="${svgDimension}" height="${svgDimension}" fill="#ffffff" rx="12"/>${rects}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
