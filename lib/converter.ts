import { 
    ParsedColor, 
    RGBColor, 
    RGBAColor, 
    HSLColor, 
    HSLAColor, 
    HexColor, 
    CMYKColor, 
    XYZColor,
    Color,
    ColorType
} from './types'

/**
 * Convert a parsed color to all supported color formats using XYZ as hub
 */
export function convertToAllFormats(parsedColor: ParsedColor): Record<ColorType, Color> {
    const { color, alpha, colorType } = parsedColor
    
    // STEP 1: Convert input color to XYZ (our central hub)
    let xyz: XYZColor
    
    switch (colorType) {
        case 'rgb':
            xyz = rgbToXyz(color as RGBColor)
            break
        case 'hsl':
            xyz = hslToXyz(color as HSLColor)
            break
        case 'hex':
            xyz = hexToXyz(color as HexColor)
            break
        case 'cmyk':
            xyz = cmykToXyz(color as CMYKColor)
            break
        default:
            throw new Error(`Unsupported color type: ${colorType}`)
    }
    
    // STEP 2: Convert XYZ to ALL other formats
    const rgb = xyzToRgb(xyz)
    const hsl = xyzToHsl(xyz)
    const hex = xyzToHex(xyz)
    const cmyk = xyzToCmyk(xyz)
    
    const colors: Record<ColorType, Color> = {
        rgb,
        hsl,
        hex,
        cmyk
    }
    
    // Add alpha versions if alpha < 1
    if (alpha !== null && alpha < 1) {
        colors.rgb = { ...rgb, a: alpha } as RGBAColor
        colors.hsl = { ...hsl, a: alpha } as HSLAColor
    }
    
    return colors
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TO XYZ CONVERTERS (Any format → XYZ hub)
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Convert RGB to XYZ color space
 * Using sRGB D65 illuminant
 */
export function rgbToXyz(rgb: RGBColor): XYZColor {
    // Normalize RGB to 0-1
    let r = rgb.r / 255
    let g = rgb.g / 255
    let b = rgb.b / 255
    
    // Apply gamma correction (sRGB)
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92
    
    // Apply sRGB to XYZ transformation matrix
    const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375
    const y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750
    const z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041
    
    return {
        x: Math.round(x * 100 * 1000) / 1000, // Scale to 0-100 and round
        y: Math.round(y * 100 * 1000) / 1000,
        z: Math.round(z * 100 * 1000) / 1000
    }
}

/**
 * Convert HSL to XYZ via RGB intermediate
 */
export function hslToXyz(hsl: HSLColor): XYZColor {
    // Convert HSL to RGB first, then RGB to XYZ
    const h = hsl.h / 360
    const s = hsl.s / 100
    const l = hsl.l / 100
    
    let r: number, g: number, b: number
    
    if (s === 0) {
        r = g = b = l // achromatic
    } else {
        const hue2rgb = (p: number, q: number, t: number): number => {
            if (t < 0) t += 1
            if (t > 1) t -= 1
            if (t < 1/6) return p + (q - p) * 6 * t
            if (t < 1/2) return q
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
            return p
        }
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s
        const p = 2 * l - q
        
        r = hue2rgb(p, q, h + 1/3)
        g = hue2rgb(p, q, h)
        b = hue2rgb(p, q, h - 1/3)
    }
    
    const rgb: RGBColor = {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    }
    
    return rgbToXyz(rgb)
}

/**
 * Convert hex to XYZ via RGB intermediate
 */
export function hexToXyz(hex: HexColor): XYZColor {
    const cleanHex = hex.replace('#', '')
    
    let r: number, g: number, b: number
    
    if (cleanHex.length === 3) {
        r = parseInt(cleanHex[0] + cleanHex[0], 16)
        g = parseInt(cleanHex[1] + cleanHex[1], 16)
        b = parseInt(cleanHex[2] + cleanHex[2], 16)
    } else {
        r = parseInt(cleanHex.slice(0, 2), 16)
        g = parseInt(cleanHex.slice(2, 4), 16)
        b = parseInt(cleanHex.slice(4, 6), 16)
    }
    
    return rgbToXyz({ r, g, b })
}

/**
 * Convert CMYK to XYZ via RGB intermediate
 */
export function cmykToXyz(cmyk: CMYKColor): XYZColor {
    const c = cmyk.c / 100
    const m = cmyk.m / 100
    const y = cmyk.y / 100
    const k = cmyk.k / 100
    
    const r = 255 * (1 - c) * (1 - k)
    const g = 255 * (1 - m) * (1 - k)
    const b = 255 * (1 - y) * (1 - k)
    
    const rgb: RGBColor = {
        r: Math.round(r),
        g: Math.round(g),
        b: Math.round(b)
    }
    
    return rgbToXyz(rgb)
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FROM XYZ CONVERTERS (XYZ hub → Any format)
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Convert XYZ to RGB color space
 */
export function xyzToRgb(xyz: XYZColor): RGBColor {
    // Normalize XYZ from 0-100 to 0-1
    const x = xyz.x / 100
    const y = xyz.y / 100
    const z = xyz.z / 100
    
    // Apply XYZ to sRGB transformation matrix
    let r = x * 3.2404542 + y * -1.5371385 + z * -0.4985314
    let g = x * -0.9692660 + y * 1.8760108 + z * 0.0415560
    let b = x * 0.0556434 + y * -0.2040259 + z * 1.0572252
    
    // Apply inverse gamma correction (sRGB)
    r = r > 0.0031308 ? 1.055 * Math.pow(r, 1/2.4) - 0.055 : 12.92 * r
    g = g > 0.0031308 ? 1.055 * Math.pow(g, 1/2.4) - 0.055 : 12.92 * g
    b = b > 0.0031308 ? 1.055 * Math.pow(b, 1/2.4) - 0.055 : 12.92 * b
    
    // Clamp and scale to 0-255
    r = Math.max(0, Math.min(1, r)) * 255
    g = Math.max(0, Math.min(1, g)) * 255
    b = Math.max(0, Math.min(1, b)) * 255
    
    return {
        r: Math.round(r),
        g: Math.round(g),
        b: Math.round(b)
    }
}

/**
 * Convert XYZ to HSL via RGB intermediate
 */
export function xyzToHsl(xyz: XYZColor): HSLColor {
    const rgb = xyzToRgb(xyz)
    
    const r = rgb.r / 255
    const g = rgb.g / 255
    const b = rgb.b / 255
    
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const diff = max - min
    
    let h = 0
    let s = 0
    const l = (max + min) / 2
    
    if (diff !== 0) {
        s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min)
        
        switch (max) {
            case r:
                h = (g - b) / diff + (g < b ? 6 : 0)
                break
            case g:
                h = (b - r) / diff + 2
                break
            case b:
                h = (r - g) / diff + 4
                break
        }
        h /= 6
    }
    
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    }
}

/**
 * Convert XYZ to hex via RGB intermediate
 */
export function xyzToHex(xyz: XYZColor): HexColor {
    const rgb = xyzToRgb(xyz)
    
    const toHex = (n: number): string => {
        const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16)
        return hex.length === 1 ? '0' + hex : hex
    }
    
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}` as HexColor
}

/**
 * Convert XYZ to CMYK via RGB intermediate
 */
export function xyzToCmyk(xyz: XYZColor): CMYKColor {
    const rgb = xyzToRgb(xyz)
    
    const r = rgb.r / 255
    const g = rgb.g / 255
    const b = rgb.b / 255
    
    const k = 1 - Math.max(r, g, b)
    
    if (k === 1) {
        return { c: 0, m: 0, y: 0, k: 100 }
    }
    
    const c = (1 - r - k) / (1 - k)
    const m = (1 - g - k) / (1 - k)
    const y = (1 - b - k) / (1 - k)
    
    return {
        c: Math.round(c * 100),
        m: Math.round(m * 100),
        y: Math.round(y * 100),
        k: Math.round(k * 100)
    }
} 