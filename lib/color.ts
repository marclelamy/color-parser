const NAMED_COLOR_MAP: Record<string, string> = {
    "aliceblue": "#f0f8ff",
    "antiquewhite": "#faebd7",
    "aqua": "#00ffff",
    "aquamarine": "#7fffd4",
    "azure": "#f0ffff",
    "beige": "#f5f5dc",
    "bisque": "#ffe4c4",
    "black": "#000000",
    "blanchedalmond": "#ffebcd",
    "blue": "#0000ff",
    "blueviolet": "#8a2be2",
    "brown": "#a52a2a",
    "burlywood": "#deb887",
    "cadetblue": "#5f9ea0",
    "chartreuse": "#7fff00",
    "chocolate": "#d2691e",
    "coral": "#ff7f50",
    "cornflowerblue": "#6495ed",
    "cornsilk": "#fff8dc",
    "crimson": "#dc143c",
    "cyan": "#00ffff",
    "darkblue": "#00008b",
    "darkcyan": "#008b8b",
    "darkgoldenrod": "#b8860b",
    "darkgray": "#a9a9a9",
    "darkgreen": "#006400",
    "darkgrey": "#a9a9a9",
    "darkkhaki": "#bdb76b",
    "darkmagenta": "#8b008b",
    "darkolivegreen": "#556b2f",
    "darkorange": "#ff8c00",
    "darkorchid": "#9932cc",
    "darkred": "#8b0000",
    "darksalmon": "#e9967a",
    "darkseagreen": "#8fbc8f",
    "darkslateblue": "#483d8b",
    "darkslategray": "#2f4f4f",
    "darkslategrey": "#2f4f4f",
    "darkturquoise": "#00ced1",
    "darkviolet": "#9400d3",
    "deeppink": "#ff1493",
    "deepskyblue": "#00bfff",
    "dimgray": "#696969",
    "dimgrey": "#696969",
    "dodgerblue": "#1e90ff",
    "firebrick": "#b22222",
    "floralwhite": "#fffaf0",
    "forestgreen": "#228b22",
    "fuchsia": "#ff00ff",
    "gainsboro": "#dcdcdc",
    "ghostwhite": "#f8f8ff",
    "gold": "#ffd700",
    "goldenrod": "#daa520",
    "gray": "#808080",
    "green": "#008000",
    "greenyellow": "#adff2f",
    "grey": "#808080",
    "honeydew": "#f0fff0",
    "hotpink": "#ff69b4",
    "indianred": "#cd5c5c",
    "indigo": "#4b0082",
    "ivory": "#fffff0",
    "khaki": "#f0e68c",
    "lavender": "#e6e6fa",
    "lavenderblush": "#fff0f5",
    "lawngreen": "#7cfc00",
    "lemonchiffon": "#fffacd",
    "lightblue": "#add8e6",
    "lightcoral": "#f08080",
    "lightcyan": "#e0ffff",
    "lightgoldenrodyellow": "#fafad2",
    "lightgray": "#d3d3d3",
    "lightgreen": "#90ee90",
    "lightgrey": "#d3d3d3",
    "lightpink": "#ffb6c1",
    "lightsalmon": "#ffa07a",
    "lightseagreen": "#20b2aa",
    "lightskyblue": "#87cefa",
    "lightslategray": "#778899",
    "lightslategrey": "#778899",
    "lightsteelblue": "#b0c4de",
    "lightyellow": "#ffffe0",
    "lime": "#00ff00",
    "limegreen": "#32cd32",
    "linen": "#faf0e6",
    "magenta": "#ff00ff",
    "maroon": "#800000",
    "mediumaquamarine": "#66cdaa",
    "mediumblue": "#0000cd",
    "mediumorchid": "#ba55d3",
    "mediumpurple": "#9370db",
    "mediumseagreen": "#3cb371",
    "mediumslateblue": "#7b68ee",
    "mediumspringgreen": "#00fa9a",
    "mediumturquoise": "#48d1cc",
    "mediumvioletred": "#c71585",
    "midnightblue": "#191970",
    "mintcream": "#f5fffa",
    "mistyrose": "#ffe4e1",
    "moccasin": "#ffe4b5",
    "navajowhite": "#ffdead",
    "navy": "#000080",
    "oldlace": "#fdf5e6",
    "olive": "#808000",
    "olivedrab": "#6b8e23",
    "orange": "#ffa500",
    "orangered": "#ff4500",
    "orchid": "#da70d6",
    "palegoldenrod": "#eee8aa",
    "palegreen": "#98fb98",
    "paleturquoise": "#afeeee",
    "palevioletred": "#db7093",
    "papayawhip": "#ffefd5",
    "peachpuff": "#ffdab9",
    "peru": "#cd853f",
    "pink": "#ffc0cb",
    "plum": "#dda0dd",
    "powderblue": "#b0e0e6",
    "purple": "#800080",
    "rebeccapurple": "#663399",
    "red": "#ff0000",
    "rosybrown": "#bc8f8f",
    "royalblue": "#4169e1",
    "saddlebrown": "#8b4513",
    "salmon": "#fa8072",
    "sandybrown": "#f4a460",
    "seagreen": "#2e8b57",
    "seashell": "#fff5ee",
    "sienna": "#a0522d",
    "silver": "#c0c0c0",
    "skyblue": "#87ceeb",
    "slateblue": "#6a5acd",
    "slategray": "#708090",
    "slategrey": "#708090",
    "snow": "#fffafa",
    "springgreen": "#00ff7f",
    "steelblue": "#4682b4",
    "tan": "#d2b48c",
    "teal": "#008080",
    "thistle": "#d8bfd8",
    "tomato": "#ff6347",
    "transparent": "#00000000",
    "turquoise": "#40e0d0",
    "violet": "#ee82ee",
    "wheat": "#f5deb3",
    "white": "#ffffff",
    "whitesmoke": "#f5f5f5",
    "yellow": "#ffff00",
    "yellowgreen": "#9acd32"
};

export class Color {
    private _r: number = 0; // 0-255
    private _g: number = 0; // 0-255
    private _b: number = 0; // 0-255
    private _a: number = 1; // 0-1

    constructor(value: string | object) {
        if (typeof value === 'string') {
            this.parseColorString(value);
        } else if (typeof value === 'object' && value !== null) {
            this.parseColorObject(value as Record<string, number>);
        } else {
            throw new Error('Invalid color value');
        }
    }

    private parseColorString(value: string): void {
        const v = value.trim().toLowerCase();

        if (v in NAMED_COLOR_MAP) {
            this.fromHex(NAMED_COLOR_MAP[v]);
            return;
        }

        // Hex
        let match = v.match(/^#?([0-9a-f]{3,8})$/);
        if (match) {
            this.fromHex(match[1]);
            return;
        }

        // rgb / rgba
        match = v.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,?\s*([\d\.]+)?\s*\)/);
        if (match) {
            this._r = parseInt(match[1], 10);
            this._g = parseInt(match[2], 10);
            this._b = parseInt(match[3], 10);
            this._a = match[4] ? parseFloat(match[4]) : 1;
            return;
        }

        // hsl / hsla
        match = v.match(/hsla?\s*\(\s*([\d\.]+)\s*,?\s*([\d\.]+)%?\s*,?\s*([\d\.]+)%?\s*,?\s*([\d\.]+)?\s*\)/);
        if (match) {
            const h = parseFloat(match[1]);
            const s = parseFloat(match[2]);
            const l = parseFloat(match[3]);
            const a = match[4] ? parseFloat(match[4]) : 1;
            this.fromHsl(h, s, l, a);
            return;
        }
    }

    private parseColorObject(obj: Record<string, number>): void {
        if ('r' in obj && 'g' in obj && 'b' in obj) {
            this._r = obj.r;
            this._g = obj.g;
            this._b = obj.b;
            this._a = obj.a ?? 1;
        } else if ('h' in obj && 's' in obj && 'l' in obj) {
            this.fromHsl(obj.h, obj.s, obj.l, obj.a);
        }
    }

    private fromHex(hex: string): void {
        let h = hex.startsWith('#') ? hex.slice(1) : hex;
        if (h.length === 3 || h.length === 4) {
            h = Array.from(h).map(c => c + c).join('');
        }
        this._r = parseInt(h.substring(0, 2), 16);
        this._g = parseInt(h.substring(2, 4), 16);
        this._b = parseInt(h.substring(4, 6), 16);
        this._a = h.length === 8 ? parseInt(h.substring(6, 8), 16) / 255 : 1;
    }

    private fromHsl(h: number, s: number, l: number, a: number = 1): void {
        const sNorm = s / 100;
        const lNorm = l / 100;
        const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = lNorm - c / 2;
        let r = 0, g = 0, b = 0;

        if (h >= 0 && h < 60) { [r, g, b] = [c, x, 0]; }
        else if (h >= 60 && h < 120) { [r, g, b] = [x, c, 0]; }
        else if (h >= 120 && h < 180) { [r, g, b] = [0, c, x]; }
        else if (h >= 180 && h < 240) { [r, g, b] = [0, x, c]; }
        else if (h >= 240 && h < 300) { [r, g, b] = [x, 0, c]; }
        else if (h >= 300 && h < 360) { [r, g, b] = [c, 0, x]; }

        this._r = Math.round((r + m) * 255);
        this._g = Math.round((g + m) * 255);
        this._b = Math.round((b + m) * 255);
        this._a = a;
    }

    toRgb() {
        return { r: this._r, g: this._g, b: this._b };
    }

    toRgba() {
        return { r: this._r, g: this._g, b: this._b, a: this._a };
    }

    toRgbString(): string {
        return `rgb(${this._r}, ${this._g}, ${this._b})`;
    }

    toRgbaString(): string {
        return `rgba(${this._r}, ${this._g}, ${this._b}, ${this._a})`;
    }

    toHex(): string {
        const toHex = (c: number) => c.toString(16).padStart(2, '0');
        return `#${toHex(this._r)}${toHex(this._g)}${toHex(this._b)}`;
    }

    toHsl() {
        const r = this._r / 255;
        const g = this._g / 255;
        const b = this._b / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0, s = 0;
        const l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100),
        };
    }

    toCmyk() {
        const r = this._r / 255;
        const g = this._g / 255;
        const b = this._b / 255;
        const k = 1 - Math.max(r, g, b);
        if (k === 1) {
            return { c: 0, m: 0, y: 0, k: 100 };
        }
        const c = (1 - r - k) / (1 - k);
        const m = (1 - g - k) / (1 - k);
        const y = (1 - b - k) / (1 - k);
        return {
            c: c * 100,
            m: m * 100,
            y: y * 100,
            k: k * 100
        };
    }

    toOklch() {
        const rgb = [this._r / 255, this._g / 255, this._b / 255];
        const [l, c, h] = rgbToOklch(rgb);
        return { l, c, h: h || 0 };
    }

    isLight(): boolean {
        // http://www.w3.org/TR/AERT#color-contrast
        const yiq = ((this._r * 299) + (this._g * 587) + (this._b * 114)) / 1000;
        return yiq >= 128;
    }

    get rgba() { return this.toRgba(); }
    get rgb() { return this.toRgb(); }
    get hsl() { return this.toHsl(); }
    get hex() { return this.toHex(); }
    get cmyk() { return this.toCmyk(); }
    get oklch() { return this.toOklch(); }
}

// OKLCH Conversion functions based on https://gist.github.com/dkaraush/65d19d61396f5f3cd8ba7d1b4b3c9432
const multiplyMatrices = (A: number[], B: number[]) => {
    return [
        A[0] * B[0] + A[1] * B[1] + A[2] * B[2],
        A[3] * B[0] + A[4] * B[1] + A[5] * B[2],
        A[6] * B[0] + A[7] * B[1] + A[8] * B[2]
    ];
}

const rgb2srgbLinear = (rgb: number[]) => rgb.map(c =>
    Math.abs(c) <= 0.04045 ?
    c / 12.92 :
    (c < 0 ? -1 : 1) * (((Math.abs(c) + 0.055) / 1.055) ** 2.4)
)

const rgbLinear2xyz = (rgb: number[]) => {
    return multiplyMatrices([
        0.41239079926595934, 0.357584339383878, 0.1804807884018343,
        0.21263900587151027, 0.715168678767756, 0.07219231536073371,
        0.01933081871559182, 0.11919477979462598, 0.9505321522496607
    ], rgb)
}

const xyz2oklab = (xyz: number[]) => {
    const LMS = multiplyMatrices([
        0.8190224379967030, 0.3619062600528904, -0.1288737815209879,
        0.0329836539323885, 0.9292868615863434, 0.0361446663506424,
        0.0481771893596242, 0.2642395317527308, 0.6335478284694309
    ], xyz);
    const LMSg = LMS.map(val => Math.cbrt(val));
    return multiplyMatrices([
        0.2104542683093140, 0.7936177747023054, -0.0040720430116193,
        1.9779985324311684, -2.4285922420485799, 0.4505937096174110,
        0.0259040424655478, 0.7827717124575296, -0.8086757549230774
    ], LMSg);
}

const oklab2oklch = ([l, a, b]: number[]) => [
    l,
    Math.sqrt(a ** 2 + b ** 2),
    Math.abs(a) < 0.0002 && Math.abs(b) < 0.0002 ? NaN : (((Math.atan2(b, a) * 180) / Math.PI % 360) + 360) % 360
];

const rgbToOklch = (rgb: number[]) => oklab2oklch(xyz2oklab(rgbLinear2xyz(rgb2srgbLinear(rgb)))); 

