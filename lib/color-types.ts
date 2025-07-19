// Base interfaces for all color types
export interface ColorBase {
    type: string;
    raw: string;
    alpha?: number;
}

// Hex colors (#fff, #ffffff, #ffffffff)
export interface HexColor extends ColorBase {
    type: 'hex';
    value: string;
    short: boolean; // true for 3-digit hex
}

// RGB colors (rgb, rgba)
export interface RgbColor extends ColorBase {
    type: 'rgb';
    r: number;
    g: number;
    b: number;
    syntax: 'legacy' | 'modern'; // rgb(255, 0, 0) vs rgb(255 0 0)
}

// HSL colors (hsl, hsla)
export interface HslColor extends ColorBase {
    type: 'hsl';
    h: number;
    s: number;
    l: number;
    hueUnit: 'deg' | 'rad' | 'turn' | 'none';
}

// OKLCH colors
export interface OklchColor extends ColorBase {
    type: 'oklch';
    l: number; // lightness
    c: number; // chroma
    h: number; // hue
}

// CMYK colors
export interface CmykColor extends ColorBase {
    type: 'cmyk';
    c: number;
    m: number;
    y: number;
    k: number;
    device?: boolean; // true for device-cmyk
}

// LAB colors
export interface LabColor extends ColorBase {
    type: 'lab';
    l: number;
    a: number;
    b: number;
}

// LCH colors
export interface LchColor extends ColorBase {
    type: 'lch';
    l: number;
    c: number;
    h: number;
}

// HWB colors
export interface HwbColor extends ColorBase {
    type: 'hwb';
    h: number;
    w: number; // whiteness
    b: number; // blackness
    hueUnit: 'deg' | 'rad' | 'turn' | 'none';
}

// Color() function colors
export interface ColorFunctionColor extends ColorBase {
    type: 'color-function';
    colorSpace: 'srgb' | 'display-p3' | 'rec2020' | string;
    values: number[];
}

// Named colors
export interface NamedColor extends ColorBase {
    type: 'named';
    name: string;
}

// CSS Custom Property (unwrapped values like "20 14.3% 4.1%")
export interface UnwrappedColor extends ColorBase {
    type: 'unwrapped';
    values: number[];
    units: string[];
    inferredType?: 'hsl' | 'rgb' | 'oklch' | 'lab' | 'unknown';
}

// Calculated expressions
export interface CalculatedColor extends ColorBase {
    type: 'calculated';
    expression: string;
    variables: string[]; // CSS variables found in expression
    calculatedValue?: any; // result after evaluation
}

// Union type for all color types
export type ParsedColorValue =
    | HexColor
    | RgbColor
    | HslColor
    | OklchColor
    | CmykColor
    | LabColor
    | LchColor
    | HwbColor
    | ColorFunctionColor
    | NamedColor
    | UnwrappedColor
    | CalculatedColor;

// Enhanced parsed color with context
export interface ParsedColor {
    id: string;
    name?: string; // CSS property name or variable name
    value: ParsedColorValue;
    context?: {
        property?: string; // CSS property it belongs to
        position?: number; // position in gradient stops, etc.
        line?: number;
        column?: number;
    };
}

// Color extraction result
export interface ColorExtractionResult {
    colors: ParsedColor[];
    errors: string[];
    metadata: {
        totalColors: number;
        colorsByType: Record<string, number>;
        hasCalculations: boolean;
        hasVariables: boolean;
    };
}

// Configuration for the parser
export interface ParserConfig {
    resolveCalculations: boolean;
    cssVariables?: Record<string, string>;
    preserveContext: boolean;
    strictMode: boolean; // whether to reject invalid colors
} 