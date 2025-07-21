'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'

interface ColorPickerProps {
    value?: string
    onChange?: (color: string) => void
    className?: string
}

interface HSL {
    h: number
    s: number
    l: number
}

export function ColorPicker({ value, onChange, className = '' }: ColorPickerProps) {
    const [hue, setHue] = useState(0)
    const [saturation, setSaturation] = useState(100)
    const [lightness, setLightness] = useState(50)
    const [isDragging, setIsDragging] = useState(false)
    const [isHueDragging, setIsHueDragging] = useState(false)
    const [isInitialized, setIsInitialized] = useState(false)

    const colorAreaRef = useRef<HTMLDivElement>(null)
    const hueSliderRef = useRef<HTMLDivElement>(null)

    // Convert HSL to hex
    const hslToHex = useCallback((h: number, s: number, l: number): string => {
        const hDecimal = h / 360
        const sDecimal = s / 100
        const lDecimal = l / 100

        const c = (1 - Math.abs(2 * lDecimal - 1)) * sDecimal
        const x = c * (1 - Math.abs(((hDecimal * 6) % 2) - 1))
        const m = lDecimal - c / 2

        let r, g, b
        if (hDecimal < 1 / 6) {
            r = c; g = x; b = 0
        } else if (hDecimal < 2 / 6) {
            r = x; g = c; b = 0
        } else if (hDecimal < 3 / 6) {
            r = 0; g = c; b = x
        } else if (hDecimal < 4 / 6) {
            r = 0; g = x; b = c
        } else if (hDecimal < 5 / 6) {
            r = x; g = 0; b = c
        } else {
            r = c; g = 0; b = x
        }

        r = Math.round((r + m) * 255)
        g = Math.round((g + m) * 255)
        b = Math.round((b + m) * 255)

        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    }, [])

    // Parse hex to HSL
    const hexToHsl = useCallback((hex: string): HSL => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        if (!result) return { h: 0, s: 100, l: 50 }

        const r = parseInt(result[1], 16) / 255
        const g = parseInt(result[2], 16) / 255
        const b = parseInt(result[3], 16) / 255

        const max = Math.max(r, g, b)
        const min = Math.min(r, g, b)
        const diff = max - min

        let h = 0
        const l = (max + min) / 2
        const s = diff === 0 ? 0 : l > 0.5 ? diff / (2 - max - min) : diff / (max + min)

        if (diff !== 0) {
            switch (max) {
                case r: h = (g - b) / diff + (g < b ? 6 : 0); break
                case g: h = (b - r) / diff + 2; break
                case b: h = (r - g) / diff + 4; break
            }
            h /= 6
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        }
    }, [])

    // Initialize from value prop only once
    useEffect(() => {
        if (value && !isInitialized) {
            const hsl = hexToHsl(value)
            setHue(hsl.h)
            setSaturation(hsl.s)
            setLightness(hsl.l)
            setIsInitialized(true)
        }
    }, [value, hexToHsl, isInitialized])

    // Notify parent of color changes only when user interacts
    const notifyChange = useCallback(() => {
        if (isInitialized) {
            const hex = hslToHex(hue, saturation, lightness)
            onChange?.(hex)
        }
    }, [hue, saturation, lightness, hslToHex, onChange, isInitialized])

    const handleColorAreaClick = useCallback((e: React.MouseEvent) => {
        if (!colorAreaRef.current) return

        const rect = colorAreaRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const newSaturation = Math.round((x / rect.width) * 100)
        const newLightness = Math.round(100 - (y / rect.height) * 100)

        setSaturation(Math.max(0, Math.min(100, newSaturation)))
        setLightness(Math.max(0, Math.min(100, newLightness)))

        // Notify parent immediately after user interaction
        setTimeout(() => notifyChange(), 0)
    }, [notifyChange])

    const handleColorAreaMouseDown = useCallback((e: React.MouseEvent) => {
        setIsDragging(true)
        handleColorAreaClick(e)
    }, [handleColorAreaClick])

    const handleHueClick = useCallback((e: React.MouseEvent) => {
        if (!hueSliderRef.current) return

        const rect = hueSliderRef.current.getBoundingClientRect()
        const y = e.clientY - rect.top
        const newHue = Math.round((y / rect.height) * 360)

        setHue(Math.max(0, Math.min(360, newHue)))

        // Notify parent immediately after user interaction
        setTimeout(() => notifyChange(), 0)
    }, [notifyChange])

    const handleHueMouseDown = useCallback((e: React.MouseEvent) => {
        setIsHueDragging(true)
        handleHueClick(e)
    }, [handleHueClick])

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging && colorAreaRef.current) {
                const rect = colorAreaRef.current.getBoundingClientRect()
                const x = e.clientX - rect.left
                const y = e.clientY - rect.top

                const newSaturation = Math.round((x / rect.width) * 100)
                const newLightness = Math.round(100 - (y / rect.height) * 100)

                setSaturation(Math.max(0, Math.min(100, newSaturation)))
                setLightness(Math.max(0, Math.min(100, newLightness)))

                // Update parent in real-time while dragging
                const hex = hslToHex(hue, Math.max(0, Math.min(100, newSaturation)), Math.max(0, Math.min(100, newLightness)))
                onChange?.(hex)
            }

            if (isHueDragging && hueSliderRef.current) {
                const rect = hueSliderRef.current.getBoundingClientRect()
                const y = e.clientY - rect.top
                const newHue = Math.round((y / rect.height) * 360)

                setHue(Math.max(0, Math.min(360, newHue)))

                // Update parent in real-time while dragging
                const hex = hslToHex(Math.max(0, Math.min(360, newHue)), saturation, lightness)
                onChange?.(hex)
            }
        }

        const handleMouseUp = () => {
            if (isDragging || isHueDragging) {
                // Final update when drag ends
                setTimeout(() => notifyChange(), 0)
            }
            setIsDragging(false)
            setIsHueDragging(false)
        }

        if (isDragging || isHueDragging) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDragging, isHueDragging, notifyChange, hue, saturation, lightness, hslToHex, onChange])

    const colorAreaStyle: React.CSSProperties = {
        background: `
      linear-gradient(to top, black, transparent),
      linear-gradient(to right, white, hsl(${hue}, 100%, 50%))
    `
    }

    const hueSliderStyle: React.CSSProperties = {
        background: `
      linear-gradient(to bottom, 
        hsl(0, 100%, 50%) 0%,
        hsl(60, 100%, 50%) 16.66%,
        hsl(120, 100%, 50%) 33.33%,
        hsl(180, 100%, 50%) 50%,
        hsl(240, 100%, 50%) 66.66%,
        hsl(300, 100%, 50%) 83.33%,
        hsl(360, 100%, 50%) 100%
      )
    `
    }

    return (
        <div className={`flex gap-2 ${className}`}>
            {/* Color Area */}
            <div
                ref={colorAreaRef}
                className="relative w-48 h-48 rounded-lg cursor-crosshair border border-gray-300"
                style={colorAreaStyle}
                onMouseDown={handleColorAreaMouseDown}
            >
                {/* Color picker dot */}
                <div
                    className="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{
                        left: `${saturation}%`,
                        top: `${100 - lightness}%`,
                        backgroundColor: hslToHex(hue, saturation, lightness)
                    }}
                />
            </div>

            {/* Hue Slider */}
            <div
                ref={hueSliderRef}
                className="relative w-6 h-48 rounded-lg cursor-pointer border border-gray-300"
                style={hueSliderStyle}
                onMouseDown={handleHueMouseDown}
            >
                {/* Hue slider handle */}
                <div
                    className="absolute w-8 h-2 bg-white border border-gray-400 rounded-sm shadow-lg transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{
                        left: '50%',
                        top: `${(hue / 360) * 100}%`
                    }}
                />
            </div>
        </div>
    )
} 