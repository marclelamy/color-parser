export type ColorObject = {
    token: Token
    parsedColor: ParsedColor
    convertedColors: Record<ColorType, Color>
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Color Types
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export type Color = HSLColor | RGBColor | HexColor | CMYKColor | XYZColor | HSLAColor | RGBAColor | OKLCHColor

export type ColorType = 'hsl' | 'rgb' | 'hex' | 'cmyk' | 'oklch'

export type HSLColor = {
    h: number
    s: number
    l: number
}

export type HSLAColor = HSLColor & { a: number }

export type RGBColor = {
    r: number
    g: number
    b: number
}

export type RGBAColor = RGBColor & { a: number }

export type HexColor = `#${string}`

export type CMYKColor = {
    c: number
    m: number
    y: number
    k: number
}

export type XYZColor = {
    x: number
    y: number
    z: number
}

export type OKLCHColor = {
    l: number // Lightness (0-1)
    c: number // Chroma (0-1+)
    h: number // Hue (0-360 degrees)
}




////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TOKENS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export type TokenType = 'hex' | 'rgb' | 'hsl' | 'cmyk' | 'oklch' | 'css-variable'

export interface Token {
    id: string
    type: TokenType
    raw: string
    startPosition: number
    endPosition: number
    line: number
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Parsing
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export type ParsedColor = {
    cssVariable?: string
    colorType: ColorType
    color: Color
    alpha: number | null
}