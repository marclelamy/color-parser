export interface HSLColor {
  h: number;
  s: number;
  l: number;
}

export function parseHslString(input: string): HSLColor | null {
  if (!input) {
    return null;
  }

  // Regex to find HSL patterns within a string, like:
  // - "60 9.1% 97.8%"
  // - "hsl(60, 9%, 98%)"
  // - "hsl(60.0, 9.0%, 98.0%)"
  // Allows for optional decimal points, optional "hsl(" prefix and ")" suffix,
  // and comma or space separators. It looks for the pattern anywhere in the string.
  const hslRegex = /(?:hsl\(\s*)?(\d{1,3}(?:\.\d+)?)\s*[,\s]\s*(\d{1,3}(?:\.\d+)?)%\s*[,\s]\s*(\d{1,3}(?:\.\d+)?)%\s*(?:\))?/i;
  const match = input.match(hslRegex);

  if (match && match.length === 4) {
    try {
      const h = parseFloat(match[1]);
      const s = parseFloat(match[2]);
      const l = parseFloat(match[3]);

      // Basic validation for HSL ranges
      if (
        !isNaN(h) && h >= 0 && h <= 360 &&
        !isNaN(s) && s >= 0 && s <= 100 &&
        !isNaN(l) && l >= 0 && l <= 100
      ) {
        return { h, s, l };
      }
    } catch (error) {
      console.error("Error parsing HSL values:", error);
      return null;
    }
  }

  return null;
} 