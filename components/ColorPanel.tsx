'use client'

import React, { useState, useEffect, useRef } from 'react'
import type { ParsedColor } from '@/lib/color-parser'
import type { ColorToken } from '@/lib/color-patterns'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { ColorPicker } from '@/components/ui/color-picker'
import { Button } from './ui/button'

interface ColorPanelProps {
    id: string
    rawInput: string
    originalInput?: string // New: original input for revert
    parsedColor: ParsedColor
    tokens?: ColorToken[] // New: tokenizer results
    showMore: boolean
    onShowMoreToggle: (id: string) => void
    onInputChange: (id: string, value: string) => void
    onRevert?: (id: string) => void // New: revert callback
}

export function ColorPanel({
    id,
    rawInput,
    originalInput, // New: original input
    parsedColor,
    tokens = [], // New: tokenizer results with default
    showMore,
    onShowMoreToggle,
    onInputChange,
    onRevert, // New: revert callback
}: ColorPanelProps) {
    const [copySuccess, setCopySuccess] = useState('')
    const [showColorPicker, setShowColorPicker] = useState(false)
    const colorPickerRef = useRef<HTMLDivElement>(null)

    // Close color picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
                setShowColorPicker(false)
            }
        }

        if (showColorPicker) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showColorPicker])

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log('handleInputChange', event.target.value)
        onInputChange(id, event.target.value)
    }

    const handleColorPickerChange = (color: string) => {
        onInputChange(id, color)
    }

    const handleRevert = () => {
        if (onRevert && originalInput) {
            onRevert(id)
        }
    }

    const { name, color } = parsedColor

    const panelStyle: React.CSSProperties = color
        ? {
            backgroundColor: color.toRgbaString(),
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
    const formatHslaString = (c: ParsedColor['color']): string => {
        if (!c) return '-'
        const hsl = c.toHsl()
        const a = c.rgba.a;
        return `hsla(${hsl.h.toFixed(0)}, ${hsl.s.toFixed(0)}%, ${hsl.l.toFixed(0)}, ${a.toFixed(2)})`
    }
    const formatRgbString = (c: ParsedColor['color']): string => {
        if (!c) return '-'
        const rgb = c.toRgb()
        return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
    }
    const formatRgbaString = (c: ParsedColor['color']): string => {
        if (!c) return '-'
        return c.toRgbaString();
    }
    const formatHexString = (c: ParsedColor['color']): string =>
        c ? c.toHex() : '-'
    
    const formatCmykString = (c: ParsedColor['color']): string => {
        if (!c) return '-'
        // @ts-ignore
        const cmyk = c.toCmyk()
        return `cmyk(${cmyk.c.toFixed(0)}%, ${cmyk.m.toFixed(0)}%, ${cmyk.y.toFixed(0)}%, ${cmyk.k.toFixed(0)}%)`
    }

    const formatOklchString = (c: ParsedColor['color']): string => {
        if (!c) return '-'
        // @ts-ignore
        const oklch = c.toOklch()
        return `oklch(${oklch.l.toFixed(2)}, ${oklch.c.toFixed(2)}, ${oklch.h.toFixed(2)})`
    }

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
    const cmykString = formatCmykString(color)
    const oklchString = formatOklchString(color)

    return (
        <Card
            className="w-full h-full rounded-none border-0 p-4 min-w-[250px] "
            style={panelStyle}
        >
            {color && color.rgba.a < 1 && (
                <div className="absolute inset-0 w-full h-full bg-[url('/transparent-bg.svg')] bg-repeat" />
            )}
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
                    {/* New: Revert button */}
                    {onRevert && originalInput && rawInput !== originalInput && (
                        <button
                            onClick={handleRevert}
                            className={`w-8 h-8 rounded-md border border-input bg-background/80 flex items-center justify-center hover:bg-background/90 transition-colors ${textColorClass}`}
                            title="Revert to original color"
                        >
                            ↻
                        </button>
                    )}
                </div>
                {showColorPicker && (
                    <div 
                        ref={colorPickerRef}
                        className="absolute top-10 left-0 z-10 p-2 bg-white rounded-lg shadow-lg border border-gray-300"
                    >
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
                    {showMore && color && (
                        <>
                            <div>
                                CMYK:{' '}
                                <span
                                    onClick={() => handleCopy(cmykString, 'CMYK')}
                                    className="inline-block cursor-pointer p-1 rounded bg-black/10 hover:bg-black/30 transition-colors"
                                >
                                    {cmykString}
                                </span>
                            </div>
                            <div>
                                OKLCH:{' '}
                                <span
                                    onClick={() => handleCopy(oklchString, 'OKLCH')}
                                    className="inline-block cursor-pointer p-1 rounded bg-black/10 hover:bg-black/30 transition-colors"
                                >
                                    {oklchString}
                                </span>
                            </div>
                        </>
                    )}
                    <Button onClick={() => onShowMoreToggle(id)} variant="link" className={`p-0 h-auto ${textColorClass}`}>
                        {showMore ? 'Show Less' : 'Show More'}
                    </Button>
                    {copySuccess && (
                        <div className="mt-2 text-xs p-1 bg-green-500/50 text-white rounded w-auto inline-block">
                            {copySuccess}
                        </div>
                    )}
                    
                    {/* New: Display tokenizer results */}
                    {tokens && tokens.length > 0 && (
                        <div className="mt-4 pt-2 border-t border-current/20">
                            <div className="text-xs font-bold mb-2">🔍 Tokenizer ({tokens.length})</div>
                            {tokens.map((token, index) => (
                                <div key={index} className="text-xs mb-1">
                                    <span className="opacity-70">[{token.type}]</span> {token.raw}
                                    {token.context?.name && (
                                        <div className="ml-2 opacity-60">→ {token.context.name}</div>
                                    )}
                                    {token.context?.property && (
                                        <div className="ml-2 opacity-60">in {token.context.property}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

