'use client'

import React, { useState, useEffect, useRef } from 'react'
import type { ColorType, Color, RGBColor, HSLColor, CMYKColor, OKLCHColor, ParsedColor, Token } from '@/lib/types'
import {
    Card,
    CardContent,
} from '@/components/ui/card'
import { ColorPicker } from '@/components/ui/color-picker'
import { Button } from './ui/button'
import { ChevronDown } from 'lucide-react'

interface ColorPanelProps {
    id: string
    rawInput: string
    originalInput?: string
    parsedColor?: ParsedColor
    tokens?: Token[]
    convertedColors?: Record<ColorType, Color>
    showMore: boolean
    onShowMoreToggle: (id: string) => void
    onInputChange: (id: string, value: string) => void
    onRevert?: (id: string) => void
}

export function ColorPanel({
    id,
    rawInput,
    originalInput,
    parsedColor,
    tokens = [],
    convertedColors,
    showMore,
    onShowMoreToggle,
    onInputChange,
    onRevert,
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

    // Create color methods interface for the new system
    interface ColorMethods {
        toRgbString: () => string
        toRgbaString: () => string
        toHex: () => string
        toHsl: () => HSLColor
        toRgb: () => RGBColor
        toCmyk: () => CMYKColor
        toOklch: () => OKLCHColor
        isLight: () => boolean
    }

    // Default to a dark blue color when no color data is available
    const alpha = parsedColor?.alpha || 1
    const isTransparent = alpha < 1
    const rgb = convertedColors?.rgb as RGBColor || { r: 1, g: 15, b: 29 } // #010f1d
    const hsl = convertedColors?.hsl as HSLColor || { h: 208, s: 93, l: 6 }
    const cmyk = convertedColors?.cmyk as CMYKColor || { c: 97, m: 48, y: 0, k: 89 }
    const oklch = convertedColors?.oklch as OKLCHColor || { l: 0.06, c: 0.05, h: 208 }
    const hex = convertedColors?.hex as string || '#010f1d'
    
    // Create a color object with proper methods
    const color: ColorMethods = {
        toRgbString: () => `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
        toRgbaString: () => `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`,
        toHex: () => hex,
        toHsl: () => hsl,
        toRgb: () => rgb,
        toCmyk: () => cmyk,
        toOklch: () => oklch,
        isLight: () => {
            // Calculate perceived brightness using standard formula
            const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
            return brightness > 128
        }
    }
    
    const textColorClass = color.isLight() ? 'text-black' : 'text-white'

    // Panel styling
    const panelStyle: React.CSSProperties = !isTransparent
        ? { backgroundColor: color.toRgbString() }
        : {
              backgroundImage: `url('/transparent-bg.svg')`,
              backgroundSize: '20px 20px',
              backgroundRepeat: 'repeat',
          }

    const formatHslString = (c: ColorMethods | null): string => {
        if (!c) return '-'
        const hsl = c.toHsl()
        if (isTransparent) {
            return `hsla(${hsl.h.toFixed(0)}, ${hsl.s.toFixed(0)}%, ${hsl.l.toFixed(0)}%, ${alpha})`
        }
        return `hsl(${hsl.h.toFixed(0)}, ${hsl.s.toFixed(0)}%, ${hsl.l.toFixed(
            0
        )}%)`
    }
    const formatRgbString = (c: ColorMethods | null): string => {
        if (!c) return '-'
        const rgb = c.toRgb()
        if (isTransparent) {
            return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
        }
        return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
    }
    const formatHexString = (c: ColorMethods | null): string =>
        c ? c.toHex() : '-'
    
    const formatCmykString = (c: ColorMethods | null): string => {
        if (!c) return '-'
        const cmyk = c.toCmyk()
        return `cmyk(${cmyk.c.toFixed(0)}%, ${cmyk.m.toFixed(0)}%, ${cmyk.y.toFixed(0)}%, ${cmyk.k.toFixed(0)}%)`
    }

    const formatOklchString = (c: ColorMethods | null): string => {
        if (!c) return '-'
        const oklch = c.toOklch()
        if (isTransparent) {
            return `oklch(${oklch.l.toFixed(3)} ${oklch.c.toFixed(3)} ${oklch.h.toFixed(1)} / ${alpha})`
        }
        return `oklch(${oklch.l.toFixed(3)} ${oklch.c.toFixed(3)} ${oklch.h.toFixed(1)})`
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
            className="w-full h-full rounded-none border-0 p-4 min-w-[300px] relative"
            style={panelStyle}
        >
            {isTransparent && (
                <div
                    className="absolute inset-0"
                    style={{ backgroundColor: color.toRgbaString() }}
                />
            )}
            {/* Using a wrapper to ensure content appears above the overlay */}
            <div className="relative">
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

            <CardContent className='px-0'>
                <div className={`space-y-1 font-mono text-xs ${textColorClass}`}>

                    <h3 className='text-lg font-bold mb-2 h-10'>
                        {parsedColor && parsedColor.cssVariable}
                    </h3>
                    <div>
                        {isTransparent ? 'HSLA' : 'HSL'}:{' '}
                        <span
                            onClick={() => handleCopy(hslString, isTransparent ? 'HSLA' : 'HSL')}
                            className="inline-block cursor-pointer p-1 rounded bg-black/10 hover:bg-black/30 transition-colors"
                        >
                            {hslString}
                        </span>
                    </div>
                    <div>
                        {isTransparent ? 'RGBA' : 'RGB'}:{' '}
                        <span
                            onClick={() => handleCopy(rgbString, isTransparent ? 'RGBA' : 'RGB')}
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
                    <button 
                        onClick={() => onShowMoreToggle(id)} 
                        className={`p-0 m-0 h-auto text-xs flex items-center gap-1 underline-offset-4 hover:underline ${textColorClass}`}
                    >
                        {showMore ? 'Show Less' : 'Show More'}
                        <ChevronDown className={`w-3 h-3 transition-transform ${showMore ? 'rotate-180' : ''}`} />
                    </button>
                    {copySuccess && (
                        <div className="mt-2 text-xs p-1 bg-green-500/50 text-white rounded w-auto inline-block">
                            {copySuccess}
                        </div>
                    )}
                    
                    {/* Display tokenizer results */}
                    {tokens && tokens.length > 0 && (
                        <div className="mt-4 pt-2 border-t border-current/20">
                            <div className="text-xs font-bold mb-2">
                                🔍 Tokenizer ({tokens.length})
                            </div>
                            {tokens.map((token, index) => (
                                <div key={token.id || index} className="text-xs mb-1">
                                    <span className="opacity-70">
                                        [{token.type}]
                                    </span>{' '}
                                    {token.raw}
                                    <div className="ml-2 opacity-60">
                                        Position: {token.startPosition}-{token.endPosition}
                                    </div>
                                    <div className="ml-2 opacity-60">
                                        Line: {token.line}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </div>
        </Card>
    )
}

