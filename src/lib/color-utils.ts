/**
 * Converts a hex color to RGB values
 */
export function hexToRgb(
  hex: string
): { r: number; g: number; b: number } | null {
  // Remove # if present
  const cleanHex = hex.replace(/^#/, "");

  // Handle shorthand hex (e.g., #fff)
  const fullHex =
    cleanHex.length === 3
      ? cleanHex
          .split("")
          .map((c) => c + c)
          .join("")
      : cleanHex;

  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);

  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculates the relative luminance of a color using WCAG formula
 * https://www.w3.org/TR/WCAG20-TECHS/G17.html
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const { r, g, b } = rgb;

  // Convert to sRGB
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const srgb = c / 255;
    return srgb <= 0.03928
      ? srgb / 12.92
      : Math.pow((srgb + 0.055) / 1.055, 2.4);
  });

  // Calculate luminance using WCAG coefficients
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Determines if a color is dark based on its luminance
 * @param hex - The hex color code (with or without #)
 * @param threshold - Luminance threshold (default 0.5, range 0-1)
 * @returns true if the color is dark, false if light
 */
export function isColorDark(hex: string, threshold = 0.5): boolean {
  return getLuminance(hex) < threshold;
}

/**
 * Returns the appropriate contrast color (black or white) for a given background
 */
export function getContrastColor(hex: string): "dark" | "light" {
  return isColorDark(hex) ? "light" : "dark";
}
