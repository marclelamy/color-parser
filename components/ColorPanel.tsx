'use client';

import React, { useState } from 'react';
import type { HSLColor } from '@/lib/hslParser';
import type { RGBColor } from '@/lib/colorUtils';

interface ColorPanelProps {
    id: string;
    rawInput: string;
    hsl: HSLColor | null;
    rgb: RGBColor | null;
    hex: string | null;
    onInputChange: (id: string, value: string) => void;
}

const ColorPanel: React.FC<ColorPanelProps> = ({
    id,
    rawInput,
    hsl,
    rgb,
    hex,
    onInputChange,
}) => {
    const [copySuccess, setCopySuccess] = useState('');

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onInputChange(id, event.target.value);
    };

    const panelStyle: React.CSSProperties = hsl
        ? {
            backgroundColor: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
        }
        : {
            backgroundColor: '#f0f0f0',
        };
    const textColorClass = hsl && hsl.l < 55 ? 'text-white' : 'text-black';

    const formatHslString = (color: HSLColor | null): string =>
        color ? `hsl(${color.h.toFixed(1)}, ${color.s.toFixed(1)}%, ${color.l.toFixed(1)}%)` : '-';
    const formatRgbString = (color: RGBColor | null): string =>
        color ? `rgb(${color.r}, ${color.g}, ${color.b})` : '-';
    const formatHexString = (color: string | null): string => color || '-';

    const handleCopy = async (text: string, format: string) => {
        if (!text || text === '-') return;
        try {
            await navigator.clipboard.writeText(text);
            setCopySuccess(`${format} copied!`);
            setTimeout(() => setCopySuccess(''), 1500);
        } catch (err) {
            console.error('Failed to copy: ', err);
            setCopySuccess('Copy failed');
            setTimeout(() => setCopySuccess(''), 1500);
        }
    };

    const hslString = formatHslString(hsl);
    const rgbString = formatRgbString(rgb);
    const hexString = formatHexString(hex);

    return (
        <div
            className={`flex flex-col w-full h-screen p-4 border-border ${textColorClass}`}
            style={panelStyle}
        >
            <input
                type="text"
                value={rawInput}
                onChange={handleInputChange}
                placeholder="e.g., 60 9.1% 97.8%"
                className={`max-w-[220px] h-8 px-2 py-1 text-sm rounded-md border border-input bg-background/80 mb-4 ${textColorClass} focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2`}
            />

            <div className="space-y-1 font-mono text-xs">
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
                    <div className="mt-2 text-xs p-1 bg-green-500/50 text-white rounded w-auto inline-block">{copySuccess}</div>
                )}
            </div>
        </div>
    );
};

export default ColorPanel; 