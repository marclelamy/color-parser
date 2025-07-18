'use client'

import React, { useState } from 'react'
import type { ParsedColor } from '@/lib/color-parser'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { ColorPicker } from '@/components/ui/color-picker'

interface ColorPanelProps {
    id: string
    rawInput: string
    parsedColor: ParsedColor
    onInputChange: (id: string, value: string) => void
}

export function ColorPanel({
    id,
    rawInput,
    parsedColor,
    onInputChange,
}: ColorPanelProps) {
    const [copySuccess, setCopySuccess] = useState('')
    const [showColorPicker, setShowColorPicker] = useState(false)

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log('handleInputChange', event.target.value)
        onInputChange(id, event.target.value)
    }

    const handleColorPickerChange = (color: string) => {
        onInputChange(id, color)
    }

    const { name, color } = parsedColor

    const panelStyle: React.CSSProperties = color
        ? {
            backgroundColor: `hsl(${color.toHsl().h}, ${color.toHsl().s}%, ${color.toHsl().l
                }%)`,
        }
        : {
            backgroundColor: '#f0f0f0',
        }

        const textColorClass = color && color.isLight() ? 'text-black' : 'text-white'

    const formatHslString = (c: ParsedColor['color']): string => {
        if (!c) return '-'
        const hsl = c.toHsl()
        return `hsl(${hsl.h.toFixed(0)}, ${hsl.s.toFixed(0)}%, ${hsl.l.toFixed(
            0
        )}%)`
    }
    const formatRgbString = (c: ParsedColor['color']): string => {
        if (!c) return '-'
        const rgb = c.toRgb()
        return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
    }
    const formatHexString = (c: ParsedColor['color']): string =>
        c ? c.toHex() : '-'

    const handleCopy = async (text: string, format: string) => {
        if (!text || text === '-') return
        try {
            await navigator.clipboard.writeText(text)
            setCopySuccess(`${format} copied!`)
            setTimeout(() => setCopySuccess(''), 1500)
        } catch (err) {
            console.error('Failed to copy: ', err)
            setCopySuccess('Copy failed')
            setTimeout(() => setCopySuccess(''), 1500)
        }
    }

    const hslString = formatHslString(color)
    const rgbString = formatRgbString(color)
    const hexString = formatHexString(color)

    return (
        <Card
            className="w-full h-full rounded-none border-0 p-4 min-w-[250px] "
            style={panelStyle}
        >
            <div className="relative mb-4 ">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={rawInput}
                        onChange={handleInputChange}
                        placeholder="e.g., 60 9.1% 97.8%"
                        className={`w-full max-w-[200px] h-8 p-2 py-1 text-sm rounded-md border border-input bg-background/80 text-black focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2`}
                    />
                    <button
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className={`w-8 h-8 rounded-md border border-input bg-background/80 flex items-center justify-center hover:bg-background/90 transition-colors ${textColorClass}`}
                        style={{ backgroundColor: color ? color.toHex() : '#ffffff' }}
                    >
                        <div className="w-4 h-4 rounded-sm border border-gray-300" style={{ backgroundColor: color ? color.toHex() : '#ffffff' }} />
                    </button>
                </div>
                {showColorPicker && (
                    <div className="absolute top-10 left-0 z-10 p-2 bg-white rounded-lg shadow-lg border border-gray-300">
                        <ColorPicker
                            value={color ? color.toHex() : '#ffffff'}
                            onChange={handleColorPickerChange}
                        />
                    </div>
                )}
            </div>
            {name && (
                <CardHeader className=''>
                    <CardTitle className={textColorClass}>
                        {name}
                    </CardTitle>
                </CardHeader>
            )}
            <CardContent className='px-0'>
                <div className={`space-y-1 font-mono text-xs ${textColorClass}`}>
                    <div>
                        HSL:{' '}
                        <span
                            onClick={() => handleCopy(hslString, 'HSL')}
                            className="inline-block cursor-pointer p-1 rounded bg-black/10 hover:bg-black/30 transition-colors"
                        >
                            {hslString}
                        </span>
                    </div>
                    <div>
                        RGB:{' '}
                        <span
                            onClick={() => handleCopy(rgbString, 'RGB')}
                            className="inline-block cursor-pointer p-1 rounded bg-black/10 hover:bg-black/30 transition-colors"
                        >
                            {rgbString}
                        </span>
                    </div>
                    <div>
                        Hex:{' '}
                        <span
                            onClick={() => handleCopy(hexString, 'Hex')}
                            className="inline-block cursor-pointer p-1 rounded bg-black/10 hover:bg-black/30 transition-colors"
                        >
                            {hexString}
                        </span>
                    </div>
                    {copySuccess && (
                        <div className="mt-2 text-xs p-1 bg-green-500/50 text-white rounded w-auto inline-block">
                            {copySuccess}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

