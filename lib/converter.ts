import { 
    ParsedColor, 
    RGBColor, 
    RGBAColor, 
    HSLColor, 
    HSLAColor, 
    HexColor, 
    CMYKColor, 
    OKLCHColor,
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
        case 'oklch':
            xyz = oklchToXyz(color as OKLCHColor)
            break
        default:
            throw new Error(`Unsupported color type: ${colorType}`)
    }
    
    // STEP 2: Convert XYZ to ALL other formats
    const rgb = xyzToRgb(xyz)
    const hsl = xyzToHsl(xyz)
    const hex = xyzToHex(xyz)
    const cmyk = xyzToCmyk(xyz)
    const oklch = xyzToOklch(xyz)
    
    const colors: Record<ColorType, Color> = {
        rgb,
        hsl,
        hex,
        cmyk,
        oklch
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// OKLCH CONVERSION HELPERS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Helper for radians/degrees conversion
const DEG2RAD = Math.PI / 180
const RAD2DEG = 180 / Math.PI

// Multiply 3x3 matrix with vector
function multiplyMatrix3x3(m: number[], v: number[]): number[] {
    return [
        m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
        m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
        m[6] * v[0] + m[7] * v[1] + m[8] * v[2]
    ]
}

/**
 * Convert OKLCH to XYZ
 */
export function oklchToXyz(oklch: OKLCHColor): XYZColor {
    const L = oklch.l
    const C = oklch.c
    const h = oklch.h

    // Step 1: OKLCH → Oklab
    const a = C * Math.cos(h * DEG2RAD)
    const b = C * Math.sin(h * DEG2RAD)

    // Step 2: Oklab → LMS'
    const l_ = L + 0.3963377773761749 * a + 0.2158037573099136 * b
    const m_ = L - 0.1055613458156586 * a - 0.0638541728258133 * b
    const s_ = L - 0.0894841775298119 * a - 1.2914855480194092 * b

    // Step 3: Cube each channel
    const l = l_ ** 3
    const m = m_ ** 3
    const s = s_ ** 3

    // Step 4: LMS → XYZ
    const xyz = multiplyMatrix3x3(
        [
            1.2268798758459243, -0.5578149944602171, 0.2813910456659647,
            -0.0405757452148008, 1.1122868032803170, -0.0717110580655164,
            -0.0763729366746601, -0.4214933324022432, 1.5869240198367816
        ],
        [l, m, s]
    )

    return {
        x: Math.round(xyz[0] * 100 * 1000) / 1000, // Scale to 0-100 and round
        y: Math.round(xyz[1] * 100 * 1000) / 1000,
        z: Math.round(xyz[2] * 100 * 1000) / 1000
    }
}

/**
 * Convert XYZ to OKLCH
 */
export function xyzToOklch(xyz: XYZColor): OKLCHColor {
    // Normalize XYZ from 0-100 to 0-1
    const X = xyz.x / 100
    const Y = xyz.y / 100
    const Z = xyz.z / 100

    // Step 1: XYZ → LMS
    const lms = multiplyMatrix3x3(
        [
            0.8190224379967030, 0.3619062600528904, -0.1288737815209879,
            0.0329836539323885, 0.9292868615863434, 0.0361446663506424,
            0.0481771893596242, 0.2642395317527308, 0.6335478284694309
        ],
        [X, Y, Z]
    )

    // Step 2: Cube root each channel
    const l_ = Math.cbrt(lms[0])
    const m_ = Math.cbrt(lms[1])
    const s_ = Math.cbrt(lms[2])

    // Step 3: LMS' → Oklab
    const oklab = multiplyMatrix3x3(
        [
            0.2104542553, 0.7936177850, -0.0040720468,
            1.9779984951, -2.4285922050, 0.4505937099,
            0.0259040371, 0.7827717662, -0.8086757660
        ],
        [l_, m_, s_]
    )

    // Step 4: Oklab → OKLCH
    const L = oklab[0]
    const a = oklab[1]
    const b = oklab[2]
    const C = Math.sqrt(a * a + b * b)
    let h = Math.atan2(b, a) * RAD2DEG
    if (h < 0) h += 360 // Ensure h is [0,360)

    return {
        l: Math.round(L * 1000) / 1000,
        c: Math.round(C * 1000) / 1000,
        h: Math.round(h * 1000) / 1000
    }
} 