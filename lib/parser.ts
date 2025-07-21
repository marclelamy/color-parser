import { Token, ParsedColor, HexColor } from './types'

/**
 * Parse tokens into color objects
 */
export function parseTokens(tokens: Token[]): ParsedColor[] {
    return tokens.map(token => parseToken(token)).filter(Boolean) as ParsedColor[]
}

/**
 * Parse a single token into a ParsedColor object
 */
export function parseToken(token: Token): ParsedColor | null {
    try {
        switch (token.type) {
            case 'hex':
                return parseHexToken(token)
            case 'rgb':
                return parseRgbToken(token)
            case 'hsl':
                return parseHslToken(token)
            case 'cmyk':
                return parseCmykToken(token)
            case 'css-variable':
                return parseCssVariableToken(token)
            default:
                return null
        }
    } catch (error) {
        console.warn(`Failed to parse token: ${token.raw}`, error)
        return null
    }
}

/**
 * Parse hex color tokens
 * Just handles alpha extraction - validation already done in tokenizer
 */
function parseHexToken(token: Token): ParsedColor | null {
    const hex = token.raw.slice(1) // Remove #
    
    if (hex.length === 4 || hex.length === 8) {
        // Extract alpha and return base hex
        const alphaHex = hex.length === 4 ? hex[3] + hex[3] : hex.slice(6, 8)
        const alpha = parseInt(alphaHex, 16) / 255
        const baseHex = hex.length === 4 ? `#${hex.slice(0, 3)}` : `#${hex.slice(0, 6)}`
        
        return {
            colorType: 'hex',
            color: baseHex as HexColor,
            alpha: alpha
        }
    } else {
        // No alpha, just return as-is
        return {
            colorType: 'hex',
            color: token.raw as HexColor,
            alpha: 1
        }
    }
}

/**
 * Parse RGB/RGBA color tokens
 * Supports: rgb(r,g,b), rgba(r,g,b,a) with numbers or percentages
 */
function parseRgbToken(token: Token): ParsedColor | null {
    const match = token.raw.match(/rgba?\(\s*([^)]+)\s*\)/i)
    if (!match) return null

    const values = match[1].split(',').map(v => v.trim())
    if (values.length < 3 || values.length > 4) return null

    let r: number, g: number, b: number, a: number = 1

    // Parse R, G, B values
    for (let i = 0; i < 3; i++) {
        const value = values[i]
        if (value.includes('%')) {
            const percent = parseFloat(value.replace('%', ''))
            const normalized = Math.round((percent / 100) * 255)
            if (i === 0) r = normalized
            else if (i === 1) g = normalized
            else b = normalized
        } else {
            const num = parseInt(value, 10)
            if (i === 0) r = num
            else if (i === 1) g = num
            else b = num
        }
    }

    // Parse alpha if present
    if (values.length === 4) {
        a = parseAlphaValue(values[3])
    }

    return {
        colorType: 'rgb',
        color: { r: r!, g: g!, b: b! },
        alpha: a
    }
}

/**
 * Parse HSL/HSLA color tokens
 * Supports: hsl(h,s,l), hsla(h,s,l,a)
 */
function parseHslToken(token: Token): ParsedColor | null {
    const match = token.raw.match(/hsla?\(\s*([^)]+)\s*\)/i)
    if (!match) return null

    const values = match[1].split(',').map(v => v.trim())
    if (values.length < 3 || values.length > 4) return null

    // Parse hue (can be in degrees or just a number)
    const h = parseFloat(values[0].replace(/deg|turn|rad/i, ''))
    
    // Parse saturation and lightness (should be percentages)
    const s = parseFloat(values[1].replace('%', ''))
    const l = parseFloat(values[2].replace('%', ''))

    // Parse alpha if present
    let a = 1
    if (values.length === 4) {
        a = parseAlphaValue(values[3])
    }

    return {
        colorType: 'hsl',
        color: { h, s, l },
        alpha: a
    }
}

/**
 * Parse CMYK color tokens
 * Supports: cmyk(c,m,y,k) with percentages or decimals
 */
function parseCmykToken(token: Token): ParsedColor | null {
    const match = token.raw.match(/cmyk\(\s*([^)]+)\s*\)/i)
    if (!match) return null

    const values = match[1].split(',').map(v => v.trim())
    if (values.length !== 4) return null

    let c: number, m: number, y: number, k: number

    // Parse CMYK values (can be percentages or decimals)
    for (let i = 0; i < 4; i++) {
        const value = values[i]
        if (value.includes('%')) {
            const percent = parseFloat(value.replace('%', ''))
            if (i === 0) c = percent
            else if (i === 1) m = percent
            else if (i === 2) y = percent
            else k = percent
        } else {
            const num = parseFloat(value)
            // If it's a decimal (0-1), convert to percentage
            const normalized = num <= 1 ? num * 100 : num
            if (i === 0) c = normalized
            else if (i === 1) m = normalized
            else if (i === 2) y = normalized
            else k = normalized
        }
    }

    return {
        colorType: 'cmyk',
        color: { c: c!, m: m!, y: y!, k: k! },
        alpha: 1 // CMYK doesn't typically have alpha
    }
}

/**
 * Parse CSS variable tokens
 * These can contain unwrapped color values like "20 14.3% 4.1%" (HSL without hsl())
 */
function parseCssVariableToken(token: Token): ParsedColor | null {
    // Extract the value part after the colon
    const match = token.raw.match(/--[\w-]+\s*:\s*([^;}\n]+)/)
    if (!match) return null

    const value = match[1].trim()

    // Try to detect what kind of color this is
    // Check for wrapped functions first
    if (value.match(/^#[0-9a-fA-F]{3,8}$/)) {
        return parseToken({ ...token, raw: value, type: 'hex' })
    }
    
    if (value.match(/^rgb/i)) {
        return parseToken({ ...token, raw: value, type: 'rgb' })
    }
    
    if (value.match(/^hsl/i)) {
        return parseToken({ ...token, raw: value, type: 'hsl' })
    }
    
    if (value.match(/^cmyk/i)) {
        return parseToken({ ...token, raw: value, type: 'cmyk' })
    }

    // Check for unwrapped HSL-like values (space or comma separated numbers with %)
    const unwrappedHslMatch = value.match(/^\s*(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%(?:\s*\/\s*(\d+(?:\.\d+)?%?))?\s*$/)
    if (unwrappedHslMatch) {
        const h = parseFloat(unwrappedHslMatch[1])
        const s = parseFloat(unwrappedHslMatch[2])
        const l = parseFloat(unwrappedHslMatch[3])
        const a = unwrappedHslMatch[4] ? parseAlphaValue(unwrappedHslMatch[4]) : 1

        return {
            colorType: 'hsl',
            color: { h, s, l },
            alpha: a
        }
    }

    // Check for unwrapped RGB-like values
    const unwrappedRgbMatch = value.match(/^\s*(\d+(?:\.\d+)?%?)\s+(\d+(?:\.\d+)?%?)\s+(\d+(?:\.\d+)?%?)(?:\s*\/\s*(\d+(?:\.\d+)?%?))?\s*$/)
    if (unwrappedRgbMatch) {
        let r: number, g: number, b: number
        
        // Parse RGB values (could be percentages or numbers)
        for (let i = 1; i <= 3; i++) {
            const val = unwrappedRgbMatch[i]
            if (val.includes('%')) {
                const percent = parseFloat(val.replace('%', ''))
                const normalized = Math.round((percent / 100) * 255)
                if (i === 1) r = normalized
                else if (i === 2) g = normalized
                else b = normalized
            } else {
                const num = parseInt(val, 10)
                if (i === 1) r = num
                else if (i === 2) g = num
                else b = num
            }
        }

        const a = unwrappedRgbMatch[4] ? parseAlphaValue(unwrappedRgbMatch[4]) : 1

        return {
            colorType: 'rgb',
            color: { r: r!, g: g!, b: b! },
            alpha: a
        }
    }

    return null
}

/**
 * Parse alpha value and normalize to 0-1 range
 * Handles both 0-1 and 0-100 ranges automatically
 */
function parseAlphaValue(alphaStr: string): number {
    const trimmed = alphaStr.trim()
    
    if (trimmed.includes('%')) {
        // Percentage alpha (0-100%)
        return Math.max(0, Math.min(1, parseFloat(trimmed.replace('%', '')) / 100))
    } else {
        const alpha = parseFloat(trimmed)
        
        // Auto-detect range: if > 1, assume it's 0-100 range
        if (alpha > 1) {
            return Math.max(0, Math.min(1, alpha / 100))
        } else {
            return Math.max(0, Math.min(1, alpha))
        }
    }
} 