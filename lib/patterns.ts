// Regex patterns for color tokenization
export const COLOR_PATTERNS = {
    // Hex colors: #fff, #ffffff, #ffffffff (with optional alpha)
    hex: /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g,

    // RGB/RGBA patterns - multiple syntaxes
    rgb: /rgba?\s*\(\s*([^)]+)\s*\)/gi,

    // HSL/HSLA patterns - multiple syntaxes  
    hsl: /hsla?\s*\(\s*([^)]+)\s*\)/gi,

    // OKLCH patterns
    oklch: /oklch\s*\(\s*([^)]+)\s*\)/gi,

    // CMYK patterns (including device-cmyk)
    cmyk: /(device-)?cmyk\s*\(\s*([^)]+)\s*\)/gi,

    // LAB patterns
    lab: /lab\s*\(\s*([^)]+)\s*\)/gi,

    // LCH patterns
    lch: /lch\s*\(\s*([^)]+)\s*\)/gi,

    // HWB patterns
    hwb: /hwb\s*\(\s*([^)]+)\s*\)/gi,

    // Color function patterns
    colorFunction: /color\s*\(\s*([^)]+)\s*\)/gi,

    // CSS custom properties (--variable: value)
    cssVariable: /--[\w-]+\s*:\s*([^}\n]+)/gi,

    // Named colors (comprehensive list)
    named: /\b(red|blue|green|yellow|orange|purple|pink|brown|black|white|gray|grey|crimson|darkblue|lightgreen|gold|magenta|cyan|lime|navy|maroon|teal|transparent|currentColor|inherit|initial|unset|aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|blanchedalmond|blueviolet|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|darkgoldenrod|darkcyan|darkgray|darkgreen|darkgrey|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkslategrey|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dimgrey|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|goldenrod|greenyellow|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgrey|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightslategrey|lightsteelblue|lightyellow|limegreen|linen|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|oldlace|olive|olivedrab|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|plum|powderblue|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silver|skyblue|slateblue|slategray|slategrey|snow|springgreen|steelblue|tan|thistle|tomato|turquoise|violet|wheat|whitesmoke|yellowgreen)\b/gi,

    // Calc expressions
    calc: /calc\s*\(\s*([^)]+)\s*\)/gi,

    // CSS variables usage
    cssVar: /var\s*\(\s*([^)]+)\s*\)/gi,

    // Unwrapped values (for CSS custom properties) - numbers with optional % and units
    unwrapped: /^\s*((?:\d+(?:\.\d+)?%?\s*){2,4})\s*$/,

    // Angle units
    angleUnits: /(deg|rad|turn)/gi,

    // Percentage values
    percentage: /(\d+(?:\.\d+)?)%/g,

    // Number values
    number: /(\d+(?:\.\d+)?)/g
} as const

// Helper patterns for parsing components
export const COMPONENT_PATTERNS = {
    // Split RGB/HSL values - handles both comma and space syntax
    splitValues: /[,\s/]+/,

    // Extract alpha channel (after / or as last component)
    alpha: /\/\s*([^)]+)$|,\s*([^,)]+)$/,

    // Extract hue with units
    hueWithUnit: /^([+-]?\d+(?:\.\d+)?)(deg|rad|turn)?$/,

    // Extract percentage values
    percentageValue: /^([+-]?\d+(?:\.\d+)?)%$/,

    // Extract number values
    numberValue: /^([+-]?\d+(?:\.\d+)?)$/,

    // CSS property extraction
    cssProperty: /([a-zA-Z-]+)\s*:\s*([^{}]+)/g,

    // Color stop in gradients
    colorStop: /(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)|oklch\([^)]+\)|[a-zA-Z]+)\s*(\d+%?)?/gi
} as const

// Color space identifiers for color() function
export const COLOR_SPACES = [
    'srgb', 'srgb-linear', 'display-p3', 'a98-rgb', 'prophoto-rgb', 'rec2020',
    'xyz', 'xyz-d50', 'xyz-d65'
] as const





// Named color list for validation
export const NAMED_COLORS = new Set([
    'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque',
    'black', 'blanchedalmond', 'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue',
    'chartreuse', 'chocolate', 'coral', 'cornflowerblue', 'cornsilk', 'crimson', 'cyan',
    'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgrey', 'darkgreen',
    'darkkhaki', 'darkmagenta', 'darkolivegreen', 'darkorange', 'darkorchid', 'darkred',
    'darksalmon', 'darkseagreen', 'darkslateblue', 'darkslategray', 'darkslategrey',
    'darkturquoise', 'darkviolet', 'deeppink', 'deepskyblue', 'dimgray', 'dimgrey',
    'dodgerblue', 'firebrick', 'floralwhite', 'forestgreen', 'fuchsia', 'gainsboro',
    'ghostwhite', 'gold', 'goldenrod', 'gray', 'grey', 'green', 'greenyellow', 'honeydew',
    'hotpink', 'indianred', 'indigo', 'ivory', 'khaki', 'lavender', 'lavenderblush',
    'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral', 'lightcyan',
    'lightgoldenrodyellow', 'lightgray', 'lightgrey', 'lightgreen', 'lightpink',
    'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightslategray', 'lightslategrey',
    'lightsteelblue', 'lightyellow', 'lime', 'limegreen', 'linen', 'magenta',
    'maroon', 'mediumaquamarine', 'mediumblue', 'mediumorchid', 'mediumpurple',
    'mediumseagreen', 'mediumslateblue', 'mediumspringgreen', 'mediumturquoise',
    'mediumvioletred', 'midnightblue', 'mintcream', 'mistyrose', 'moccasin',
    'navajowhite', 'navy', 'oldlace', 'olive', 'olivedrab', 'orange', 'orangered',
    'orchid', 'palegoldenrod', 'palegreen', 'paleturquoise', 'palevioletred',
    'papayawhip', 'peachpuff', 'peru', 'pink', 'plum', 'powderblue', 'purple',
    'red', 'rosybrown', 'royalblue', 'saddlebrown', 'salmon', 'sandybrown', 'seagreen',
    'seashell', 'sienna', 'silver', 'skyblue', 'slateblue', 'slategray', 'slategrey',
    'snow', 'springgreen', 'steelblue', 'tan', 'teal', 'thistle', 'tomato', 'turquoise',
    'violet', 'wheat', 'white', 'whitesmoke', 'yellow', 'yellowgreen',
    // CSS keywords
    'transparent', 'currentcolor', 'inherit', 'initial', 'unset'
])
