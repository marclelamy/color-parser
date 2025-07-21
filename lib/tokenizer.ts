import { Token, TokenType } from "./types"
import { v4 as uuidv4 } from 'uuid'


// Color regex patterns
const HEX_PATTERN = /#?([0-9a-fA-F]{3,8})\b/g
const RGB_PATTERN = /rgba?\(\s*([^)]+)\s*\)/gi
const HSL_PATTERN = /hsla?\(\s*([^)]+)\s*\)/gi
const CMYK_PATTERN = /cmyk\(\s*([^)]+)\s*\)/gi
const OKLCH_PATTERN = /oklch\(\s*([^)]+)\s*\)/gi
const CSS_VAR_PATTERN = /--[\w-]+\s*:\s*((?:\d+(?:\.\d+)?%?\s*){2,4}(?=\s+[a-z#]|[;}\n]|$))/g



export class ColorTokenizer {
    private text: string
    private tokens: Token[] = []

    constructor(text: string) {
        this.text = text
        this.tokens = this.tokenize()
        this.addLineInfo()
    }

    /**
     * Tokenize the entire text and extract all color tokens
     */
    private tokenize(): Token[] {
        const tokens: Token[] = []

        // Extract CSS custom properties first (they have priority)
        this.extractCssVariables(tokens)

        // Extract hex colors
        this.extractHexColors(tokens)

        // Extract rgb/rgba colors
        this.extractRgbColors(tokens)

        // Extract hsl/hsla colors
        this.extractHslColors(tokens)

        // Extract cmyk colors
        this.extractCmykColors(tokens)

        // Extract oklch colors
        this.extractOklchColors(tokens)

        // Sort tokens by position and remove overlaps
        tokens.sort((a, b) => a.startPosition - b.startPosition)

        return this.removeOverlaps(tokens)
    }

    /**
     * Extract CSS custom properties like --primary: 20 14.3% 4.1%
     */
    private extractCssVariables(tokens: Token[]): void {
        CSS_VAR_PATTERN.lastIndex = 0
        let match

        while ((match = CSS_VAR_PATTERN.exec(this.text)) !== null) {
            const value = match[1].trim()

            // Check if the value looks like a color (unwrapped HSL, RGB, etc.)
            if (this.isLikelyColorValue(value)) {
                tokens.push({
                    id: uuidv4(),
                    type: 'css-variable',
                    raw: match[0],
                    startPosition: match.index,
                    endPosition: match.index + match[0].length,
                    line: 0 // Will be set later
                })
            }
        }
    }

    /**
     * Check if a value looks like a color value for CSS custom properties
     */
    private isLikelyColorValue(value: string): boolean {
        const trimmed = value.trim()

        // Check for unwrapped HSL/RGB values (numbers with optional %)
        const unwrappedPattern = /^\s*((?:\d+(?:\.\d+)?%?\s*){2,4})\s*$/
        if (unwrappedPattern.test(trimmed)) {
            return true
        }

        // Check for known color functions or hex values
        return /^(#[0-9a-fA-F]{3,8}|rgb|hsl|oklch|lab|lch|hwb|cmyk|color\()/i.test(trimmed)
    }

    /**
     * Extract hex colors
     */
    private extractHexColors(tokens: Token[]): void {
        HEX_PATTERN.lastIndex = 0
        let match

        while ((match = HEX_PATTERN.exec(this.text)) !== null) {
            tokens.push({
                id: uuidv4(),
                type: 'hex',
                raw: match[0],
                startPosition: match.index,
                endPosition: match.index + match[0].length,
                line: 0 // Will be set later
            })
        }
    }

    /**
     * Extract rgb/rgba colors
     */
    private extractRgbColors(tokens: Token[]): void {
        RGB_PATTERN.lastIndex = 0
        let match

        while ((match = RGB_PATTERN.exec(this.text)) !== null) {
            tokens.push({
                id: uuidv4(),
                type: 'rgb',
                raw: match[0],
                startPosition: match.index,
                endPosition: match.index + match[0].length,
                line: 0 // Will be set later
            })
        }
    }

    /**
     * Extract hsl/hsla colors
     */
    private extractHslColors(tokens: Token[]): void {
        HSL_PATTERN.lastIndex = 0
        let match

        while ((match = HSL_PATTERN.exec(this.text)) !== null) {
            tokens.push({
                id: uuidv4(),
                type: 'hsl',
                raw: match[0],
                startPosition: match.index,
                endPosition: match.index + match[0].length,
                line: 0 // Will be set later
            })
        }
    }

    /**
     * Extract cmyk colors
     */
    private extractCmykColors(tokens: Token[]): void {
        CMYK_PATTERN.lastIndex = 0
        let match

        while ((match = CMYK_PATTERN.exec(this.text)) !== null) {
            tokens.push({
                id: uuidv4(),
                type: 'cmyk',
                raw: match[0],
                startPosition: match.index,
                endPosition: match.index + match[0].length,
                line: 0 // Will be set later
            })
        }
    }

    /**
     * Extract oklch colors
     */
    private extractOklchColors(tokens: Token[]): void {
        OKLCH_PATTERN.lastIndex = 0
        let match

        while ((match = OKLCH_PATTERN.exec(this.text)) !== null) {
            tokens.push({
                id: uuidv4(),
                type: 'oklch',
                raw: match[0],
                startPosition: match.index,
                endPosition: match.index + match[0].length,
                line: 0 // Will be set later
            })
        }
    }

    /**
     * Remove overlapping tokens, keeping the first one found
     */
    private removeOverlaps(tokens: Token[]): Token[] {
        const filteredTokens: Token[] = []

        for (const current of tokens) {
            const hasOverlap = filteredTokens.some(existing => 
                this.tokensOverlap(current, existing)
            )

            if (!hasOverlap) {
                filteredTokens.push(current)
            }
        }

        return filteredTokens
    }

    /**
     * Check if two tokens overlap
     */
    private tokensOverlap(a: Token, b: Token): boolean {
        return !(a.endPosition <= b.startPosition || b.endPosition <= a.startPosition)
    }

    /**
     * Get line number for a position
     */
    private getLineNumber(position: number): number {
        return this.text.slice(0, position).split('\n').length
    }

    /**
     * Add line information to all tokens
     */
    private addLineInfo(): void {
        this.tokens.forEach(token => {
            token.line = this.getLineNumber(token.startPosition)
        })
    }

    /**
     * Get all parsed tokens
     */
    getTokens(): Token[] {
        return [...this.tokens]
    }

    /**
     * Get tokens by type
     */
    getTokensByType(type: TokenType): Token[] {
        return this.tokens.filter(token => token.type === type)
    }

    /**
     * Get the original text
     */
    getText(): string {
        return this.text
    }
}
