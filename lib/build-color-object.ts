'use server'

import { ColorTokenizer } from './tokenizer'
import { parseToken } from './parser'
import { convertToAllFormats } from './converter'
import { ColorObject } from './types'

export async function buildColorObject(value: string): Promise<ColorObject[]> {
    // Tokenize the input
    const tokenizer = new ColorTokenizer(value)
    const tokens = tokenizer.getTokens()

    // Parse and convert each token
    const colorObjects: ColorObject[] = []
    
    for (const token of tokens) {
        const parsedColor = parseToken(token)
        // console.log('parsedColor', parsedColor)

        if (parsedColor) {
            try {
                const convertedColors = convertToAllFormats(parsedColor)
                // console.log('convertedColors', convertedColors)
                
                colorObjects.push({
                    token,
                    parsedColor,
                    convertedColors
                })
            } catch (error) {
                console.warn(`Failed to convert color: ${token.raw}`, error)
                // Skip this color if conversion fails
            }
        }
    }

    console.log('colorObjects', JSON.stringify(colorObjects, null, 2))

    return colorObjects
}





