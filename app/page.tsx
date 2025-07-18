'use client'

import { useState, useCallback } from 'react'
import { ColorPanel } from '@/components/ColorPanel'
import { parseColorLine, parseColorString, ParsedColor } from '@/lib/color-parser'
import { Button } from '@/components/ui/button'
import { Plus, RotateCcw } from 'lucide-react'

interface ColorPanelState {
    id: string
    rawInput: string
}

const initialPanel: ColorPanelState = {
    id: crypto.randomUUID(),
    rawInput: '#010f1d',
}

export default function Home() {
    const [colorPanels, setColorPanels] = useState<ColorPanelState[]>([
        initialPanel,
    ])

    const handleInputChange = useCallback((id: string, newValue: string) => {
        console.log(id, newValue)
        // Check if the new value contains multiple lines (potential multiple colors)
        const lines = newValue.split(/(?=\bhsl\()|(?=\brgb\()|(?=#[0-9a-fA-F])|(?=--[\w-]+)|(?=#)|[\n;]/).filter(line => line.trim() !== '')

        console.log('lines', lines.length)
        if (lines.length > 1) {
            const newPanels: ColorPanelState[] = []
            
            for (const line of lines) {
                newPanels.push({
                    id: crypto.randomUUID(),
                    rawInput: line.trim(),
                })
            }

            setColorPanels(newPanels)
            return
        }

        console.log('lines', lines)

        // Single color or no valid colors, update the specific panel
        setColorPanels((currentPanels) =>
            currentPanels.map((panel) =>
                panel.id === id ? { ...panel, rawInput: newValue } : panel
            )
        )
    }, [])

    const handleAddPanel = useCallback(() => {
        const newPanel: ColorPanelState = {
            id: crypto.randomUUID(),
            rawInput: '',
        }
        setColorPanels((currentPanels) => [...currentPanels, newPanel])
    }, [])
    const handleReset = useCallback(() => {
        setColorPanels([initialPanel])
    }, [])

    return (
        <main className="relative min-h-screen w-full">
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <Button onClick={handleAddPanel} variant="outline" size="icon">
                    <Plus className="h-4 w-4" />
                </Button>
                <Button onClick={handleReset} variant="outline" size="icon">
                    <RotateCcw className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex flex-row flex-grow min-h-screen w-full">
                {colorPanels.map((panel) => {
                    const parsedColor = { ...parseColorLine(panel.rawInput), id: panel.id, raw: panel.rawInput }
                    return (
                        <div
                            key={panel.id}
                            className="flex-grow min-w-[250px]"
                            style={{ width: `${100 / colorPanels.length}%` }}
                        >
                            <ColorPanel
                                id={panel.id}
                                rawInput={panel.rawInput}
                                parsedColor={parsedColor}
                                onInputChange={handleInputChange}
                            />
                        </div>
                    )
                })}
            </div>
            <footer className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 text-sm text-gray-600">
                Developed by{' '}
                <a 
                    href="https://marclamy.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:text-gray-800"
                >
                    Marc Lamy
                </a>
                . Help improve it on{' '}
                <a 
                    href="https://github.com/marclelamy/color-parser" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:text-gray-800"
                >
                    GitHub
                </a>
                !
            </footer>
        </main>
    )
}
