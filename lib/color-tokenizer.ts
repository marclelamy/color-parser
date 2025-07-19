import { COLOR_PATTERNS, COMPONENT_PATTERNS, ColorToken, TokenType } from './color-patterns';

export class ColorTokenizer {
    private text: string;
    private tokens: ColorToken[] = [];
    private position: number = 0;

    constructor(text: string) {
        this.text = text;
    }

    /**
     * Tokenize the entire text and extract all color tokens
     */
    tokenize(): ColorToken[] {
        this.tokens = [];
        this.position = 0;

        // Extract CSS custom properties first (they have priority)
        this.extractCssVariables();

        // Extract function-based colors (check for overlaps)
        this.extractFunctionColors();

        // Extract hex colors (check for overlaps)
        this.extractHexColors();

        // Extract named colors (check for overlaps)
        this.extractNamedColors();

        // Sort tokens by position
        this.tokens.sort((a, b) => a.start - b.start);

        return this.tokens;
    }

    /**
     * Extract CSS custom properties like --primary: 20 14.3% 4.1%;
     */
    private extractCssVariables(): void {
        const cssVarPattern = /--[\w-]+\s*:\s*([^;}\n]+)/g;
        let match;

        while ((match = cssVarPattern.exec(this.text)) !== null) {
            const variableName = match[0].split(':')[0].trim();
            const value = match[1].trim();
            const start = match.index;
            const end = match.index + match[0].length;

            // Check if the value looks like a color (unwrapped HSL, RGB, etc.)
            if (this.isLikelyColorValue(value)) {
                this.tokens.push({
                    type: 'css-variable',
                    value: value,
                    raw: match[0],
                    start,
                    end,
                    context: {
                        name: variableName
                    }
                });
            }
        }
    }

    /**
     * Extract function-based colors (rgb, hsl, oklch, etc.)
     */
    private extractFunctionColors(): void {
        const patterns: Array<{ pattern: RegExp; type: TokenType }> = [
            { pattern: COLOR_PATTERNS.rgb, type: 'rgb' },
            { pattern: COLOR_PATTERNS.hsl, type: 'hsl' },
            { pattern: COLOR_PATTERNS.oklch, type: 'oklch' },
            { pattern: COLOR_PATTERNS.cmyk, type: 'cmyk' },
            { pattern: COLOR_PATTERNS.lab, type: 'lab' },
            { pattern: COLOR_PATTERNS.lch, type: 'lch' },
            { pattern: COLOR_PATTERNS.hwb, type: 'hwb' },
            { pattern: COLOR_PATTERNS.colorFunction, type: 'color-function' },
            { pattern: COLOR_PATTERNS.calc, type: 'calc' },
            { pattern: COLOR_PATTERNS.cssVar, type: 'css-var' }
        ];

        patterns.forEach(({ pattern, type }) => {
            pattern.lastIndex = 0; // Reset regex
            let match;

            while ((match = pattern.exec(this.text)) !== null) {
                const start = match.index;
                const end = match.index + match[0].length;

                // ✅ Check for overlaps with existing tokens
                if (!this.isPositionCovered(start, end)) {
                    this.tokens.push({
                        type,
                        value: match[1] || match[0], // Use captured group or full match
                        raw: match[0],
                        start,
                        end,
                        context: this.extractContext(start)
                    });
                }
            }
        });
    }

    /**
     * Extract hex colors
     */
    private extractHexColors(): void {
        const pattern = COLOR_PATTERNS.hex;
        pattern.lastIndex = 0;
        let match;

        while ((match = pattern.exec(this.text)) !== null) {
            const start = match.index;
            const end = match.index + match[0].length;

            // ✅ Check for overlaps with existing tokens
            if (!this.isPositionCovered(start, end)) {
                this.tokens.push({
                    type: 'hex',
                    value: match[1], // The hex value without #
                    raw: match[0],
                    start,
                    end,
                    context: this.extractContext(start)
                });
            }
        }
    }

    /**
     * Extract named colors, avoiding conflicts with existing tokens
     */
    private extractNamedColors(): void {
        const pattern = COLOR_PATTERNS.named;
        pattern.lastIndex = 0;
        let match;

        while ((match = pattern.exec(this.text)) !== null) {
            const start = match.index;
            const end = match.index + match[0].length;

            // Check if this position is already covered by another token
            if (!this.isPositionCovered(start, end)) {
                this.tokens.push({
                    type: 'named',
                    value: match[0].toLowerCase(),
                    raw: match[0],
                    start,
                    end,
                    context: this.extractContext(start)
                });
            }
        }
    }

    /**
     * Check if a value looks like a color value for CSS custom properties
     */
    private isLikelyColorValue(value: string): boolean {
        const trimmed = value.trim();

        // Check for unwrapped HSL/RGB values (numbers with optional %)
        const unwrappedPattern = /^\s*((?:\d+(?:\.\d+)?%?\s*){2,4})\s*$/;
        if (unwrappedPattern.test(trimmed)) {
            return true;
        }

        // Check for known color functions or hex values
        return /^(#[0-9a-fA-F]{3,8}|rgb|hsl|oklch|lab|lch|hwb|cmyk|color\()/i.test(trimmed);
    }

    /**
     * Extract context information (CSS property, etc.) for a given position
     */
    private extractContext(position: number): { property?: string; name?: string } {
        const lineStart = this.text.lastIndexOf('\n', position);
        const lineEnd = this.text.indexOf('\n', position);
        const line = this.text.slice(lineStart + 1, lineEnd === -1 ? undefined : lineEnd);

        // Check if we're in a CSS property
        const cssPropertyMatch = line.match(/([a-zA-Z-]+)\s*:/);
        if (cssPropertyMatch) {
            return { property: cssPropertyMatch[1] };
        }

        // Check if we're in a CSS variable
        const cssVarMatch = line.match(/(--[\w-]+)\s*:/);
        if (cssVarMatch) {
            return { name: cssVarMatch[1] };
        }

        return {};
    }

    /**
     * ✅ FIXED: Check if a position range overlaps with ANY existing token
     */
    private isPositionCovered(start: number, end: number): boolean {
        return this.tokens.some(token =>
            // Two ranges overlap if they're NOT completely separate
            !(token.end <= start || end <= token.start)
        );
    }

    /**
     * Get line and column information for a position
     */
    getLineColumn(position: number): { line: number; column: number } {
        const lines = this.text.slice(0, position).split('\n');
        return {
            line: lines.length,
            column: lines[lines.length - 1].length + 1
        };
    }

    /**
     * Add line and column info to all tokens
     */
    addPositionInfo(): void {
        this.tokens.forEach(token => {
            const pos = this.getLineColumn(token.start);
            token.line = pos.line;
            token.column = pos.column;
        });
    }

    /**
     * 🔍 Debug method: Show what positions are covered
     */
    getDebugInfo(): { covered: Array<{ start: number, end: number, type: string }>, gaps: Array<{ start: number, end: number }> } {
        const covered = this.tokens.map(token => ({
            start: token.start,
            end: token.end,
            type: token.type
        })).sort((a, b) => a.start - b.start);

        const gaps: Array<{ start: number, end: number }> = [];
        for (let i = 0; i < covered.length - 1; i++) {
            const current = covered[i];
            const next = covered[i + 1];
            if (current.end < next.start) {
                gaps.push({ start: current.end, end: next.start });
            }
        }

        return { covered, gaps };
    }
} 