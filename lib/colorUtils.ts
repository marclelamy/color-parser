export interface RGBColor {
    r: number;
    g: number;
    b: number;
}

/**
 * Converts an HSL color value to RGB.
 * Assumes h, s, and l are contained in the set [0, 360], [0, 100], [0, 100] respectively.
 * Returns r, g, and b in the set [0, 255].
 */
export function hslToRgb(h: number, s: number, l: number): RGBColor {
    s /= 100;
    l /= 100;

    let c = (1 - Math.abs(2 * l - 1)) * s;
    let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    let m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) {
        r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
        r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
        r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
        r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
        r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
        r = c; g = 0; b = x;
    }
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return { r, g, b };
}

/**
 * Converts an RGB color value to Hex. 
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns a string in the format #rrggbb.
 */
export function rgbToHex(r: number, g: number, b: number): string {
    const toHex = (c: number): string => {
        const hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Converts an RGB color value to HSL.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 360], [0, 100], [0, 100].
 */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return { h, s, l };
}

/**
 * Converts a Hex color string to RGB.
 * Assumes hex is a string in the format #rrggbb or rrggbb.
 * Returns r, g, and b in the set [0, 255] or null if invalid.
 */
export function hexToRgb(hex: string): RGBColor | null {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => {
        return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * Parses an RGB color string (e.g., "rgb(255, 99, 71)", "255, 99, 71", "255 99 71").
 * Returns r, g, and b in the set [0, 255] or null if invalid.
 */
export function parseRgbString(rgbString: string): RGBColor | null {
    const match = rgbString.match(/^\s*rgb\(\s*(\d{1,3})\s*[,\s]+\s*(\d{1,3})\s*[,\s]+\s*(\d{1,3})\s*\)\s*$|^\s*(\d{1,3})\s*[,\s]+\s*(\d{1,3})\s*[,\s]+\s*(\d{1,3})\s*$/i);
    if (match) {
        const r = parseInt(match[1] ?? match[4], 10);
        const g = parseInt(match[2] ?? match[5], 10);
        const b = parseInt(match[3] ?? match[6], 10);

        if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
            return { r, g, b };
        }
    }
    return null;
}

/**
 * Parses a Hex color string (e.g., "#ff6347", "ff6347").
 * Returns r, g, and b in the set [0, 255] or null if invalid.
 */
export function parseHexString(hexString: string): RGBColor | null {
    // Reuse hexToRgb for parsing logic
    return hexToRgb(hexString.trim());
} 