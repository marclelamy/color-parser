import { Color } from 'color-core'

interface HSL {
  h: number
  s: number
  l: number
  a?: number
}

export interface ParsedColor {
  id: string
  name: string | null
  raw: string
  color: Color | null
}

function attemptToParseUnwrappedHsl(value: string): HSL | null {
    const parts = value.trim().replace(/%/g, '').split(/\s+/)
    if (parts.length >= 3) {
        const [h, s, l] = parts.slice(0, 3).map(parseFloat)
        if (!isNaN(h) && !isNaN(s) && !isNaN(l)) {
            return { h, s, l }
        }
    }
    return null
}

export function parseColorLine(line: string): Omit<ParsedColor, 'id'> {
  const cleanedLine = line.replace(/[{}]/g, '').trim()
  const parts = cleanedLine.split(':')
  
  let name: string | null = null
  let value: string

  if (parts.length > 1) {
    name = parts[0].trim()
    value = parts.slice(1).join(':').trim()
  } else {
    value = cleanedLine
  }

  let color: Color | null = null

  if (value) {
    try {
      color = new Color(value)
    } catch (e) {
      const hsl = attemptToParseUnwrappedHsl(value)
      if (hsl) {
        try {
          color = new Color(hsl)
        } catch (e2) {
          console.error('Failed to create color from HSL object:', e2)
        }
      }
    }
  }
  
  return { name, raw: line, color }
}

export function parseColorString(input: string): ParsedColor[] {
  const lines = input.split('\n').filter(line => line.trim() !== '')
  const parsedColors: ParsedColor[] = []

  lines.forEach((line, index) => {
    const parsedLine = parseColorLine(line)
    parsedColors.push({
      ...parsedLine,
      id: `${new Date().getTime()}-${index}`,
    })
  })

  console.log('returning parsed colors', parsedColors)

  return parsedColors
} 