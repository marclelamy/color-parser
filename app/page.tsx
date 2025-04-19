'use client';

import React, { useState, useCallback } from 'react';
import ColorPanel from '@/components/ColorPanel';
import { parseHslString, type HSLColor } from '@/lib/hslParser';
import {
    hslToRgb,
    rgbToHex,
    rgbToHsl,
    parseRgbString,
    parseHexString,
    type RGBColor
} from '@/lib/colorUtils';

interface ColorPanelState {
    id: string;
    rawInput: string;
    hsl: HSLColor | null;
    rgb: RGBColor | null;
    hex: string | null;
}

function calculateColorFormats(rawInput: string): Pick<ColorPanelState, 'hsl' | 'rgb' | 'hex'> {
    let hsl: HSLColor | null = null;
    let rgb: RGBColor | null = null;
    let hex: string | null = null;

    const trimmedInput = rawInput.trim();

    // Try parsing as HSL
    hsl = parseHslString(trimmedInput);
    if (hsl) {
        rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
        hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        return { hsl, rgb, hex };
    }

    // Try parsing as RGB
    rgb = parseRgbString(trimmedInput);
    if (rgb) {
        hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        return { hsl, rgb, hex };
    }

    // Try parsing as Hex
    rgb = parseHexString(trimmedInput);
    if (rgb) {
        hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        hex = rgbToHex(rgb.r, rgb.g, rgb.b); // Or directly from input if needed: parseHexString returns RGB
        return { hsl, rgb, hex };
    }

    // If none match
    return { hsl: null, rgb: null, hex: null };
}

const initialRawInput = '--foreground: 60 9.1% 97.8%;';
const initialFormats = calculateColorFormats(initialRawInput);
const initialPanelState: ColorPanelState = {
    id: crypto.randomUUID(),
    rawInput: initialRawInput,
    ...initialFormats,
};

export default function Home() {
    const [colorPanels, setColorPanels] = useState<ColorPanelState[]>([initialPanelState]);

    const handleInputChange = useCallback((id: string, newValue: string) => {
        const formats = calculateColorFormats(newValue);
        setColorPanels(currentPanels =>
            currentPanels.map(panel =>
                panel.id === id
                    ? { ...panel, rawInput: newValue, ...formats }
                    : panel
            )
        );
    }, []);

    const handleAddPanel = useCallback(() => {
        const newPanel: ColorPanelState = {
            id: crypto.randomUUID(),
            rawInput: '',
            hsl: null,
            rgb: null,
            hex: null,
        };
        setColorPanels(currentPanels => [...currentPanels, newPanel]);
    }, []);

    return (
        <div className="relative min-h-screen w-full">
            <button
                onClick={handleAddPanel}
                className="absolute top-2 right-2 z-10 h-10 w-10 flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-lg"
            >
                +
            </button>
            <div className="flex flex-row w-full min-h-screen">
                {colorPanels.map(panel => (
                    <ColorPanel
                        key={panel.id}
                        id={panel.id}
                        rawInput={panel.rawInput}
                        hsl={panel.hsl}
                        rgb={panel.rgb}
                        hex={panel.hex}
                        onInputChange={handleInputChange}
                    />
                ))}
            </div>
        </div>
    );
}
