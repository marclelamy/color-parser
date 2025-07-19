'use client'

import { useState, useCallback, useEffect } from 'react'
import { ColorPanel } from '@/components/ColorPanel'
import { parseColorLine, ParsedColor } from '@/lib/color-parser'
import { ColorTokenizer } from '@/lib/color-tokenizer'
import { ColorToken } from '@/lib/color-patterns'
import { Button } from '@/components/ui/button'
import { Plus, RotateCcw, Layers } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { ResponsiveDialog } from '@/components/ui/responsive-dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface ColorPanelState {
    id: string
    rawInput: string
    originalInput?: string // New: track original input for revert
    tokens?: ColorToken[] // New: tokenizer results
    showMore?: boolean
}

const initialPanel: ColorPanelState = {
    id: uuidv4(),
    rawInput: '#010f1d',
    originalInput: '#010f1d',
    showMore: false,
}

export default function Home() {
    const [colorPanels, setColorPanels] = useState<ColorPanelState[]>([initialPanel])

    useEffect(() => {
        async function readClipboard() {
            try {
                if (navigator.clipboard && navigator.clipboard.readText) {
                    const clipboardText = await navigator.clipboard.readText()
                    if (clipboardText.trim()) {
                        // Use parseAndAddPanels to handle multiple colors
                        parseAndAddPanels(clipboardText.trim(), true) // Replace existing
                    }
                }
            } catch (error) {
                console.log('Could not read clipboard:', error)
            }
        }

        readClipboard()
    }, [])


    const parseAndAddPanels = useCallback((input: string, replaceExisting: boolean = false) => {
        const tokenizer = new ColorTokenizer(input)
        const tokens = tokenizer.tokenize()
        tokenizer.addPositionInfo()

        console.log('parseAndAddPanels - tokens found:', tokens)

        if (tokens.length === 0) {
            // No colors found, create a single panel with the input
            const newPanel: ColorPanelState = {
                id: uuidv4(),
                rawInput: input,
                originalInput: input, // Set original input
                tokens: []
            }

            if (replaceExisting) {
                setColorPanels([newPanel])
            } else {
                setColorPanels(prev => [...prev, newPanel])
            }
            return
        }

        // Create panels for each color token found
        const newPanels: ColorPanelState[] = tokens.map(token => ({
            id: uuidv4(),
            rawInput: token.raw,
            originalInput: token.raw, // Set original input
            tokens: [token] // Each panel gets its specific token
        }))

        console.log('parseAndAddPanels - creating panels:', newPanels)

        if (replaceExisting) {
            setColorPanels(newPanels)
        } else {
            setColorPanels(prev => [...prev, ...newPanels])
        }
    }, [])


    const handleInputChange = useCallback((id: string, newValue: string) => {
        console.log('handleInputChange for panel:', id, 'new value:', newValue)
        
        // Update only the specific panel
        setColorPanels(prev => prev.map(panel => 
            panel.id === id 
                ? { 
                    ...panel, 
                    rawInput: newValue,
                    // Keep originalInput unchanged for revert functionality
                    originalInput: panel.originalInput || panel.rawInput
                  }
                : panel
        ))
    }, [])

    const handleRevertPanel = useCallback((id: string) => {
        setColorPanels(prev => prev.map(panel => 
            panel.id === id 
                ? { 
                    ...panel, 
                    rawInput: panel.originalInput || panel.rawInput
                  }
                : panel
        ))
    }, [])

    const handleAddPanel = useCallback(() => {
        const newPanel: ColorPanelState = {
            id: uuidv4(),
            rawInput: '',
            originalInput: '',
            tokens: []
        }
        setColorPanels((currentPanels) => [...currentPanels, newPanel])
    }, [])
    
    const handleReset = useCallback(() => {
        setColorPanels([initialPanel])
    }, [])

    const handleShowMoreToggle = useCallback((id: string) => {
        setColorPanels(prev => prev.map(panel =>
            panel.id === id ? { ...panel, showMore: !panel.showMore } : panel
        ))
    }, [])

    return (
        <main className="relative min-h-screen w-full">
            <div className="fixed top-4 right-4 z-10 flex flex-col gap-2">
                <Button onClick={handleAddPanel} variant="outline" size="icon" title="Add empty panel">
                    <Plus className="h-4 w-4" />
                </Button>
                <Button onClick={handleReset} variant="outline" size="icon" title="Reset to single panel">
                    <RotateCcw className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex flex-row flex-grow min-h-screen w-full">
                {colorPanels.map((panel) => {
                    const parsedColor = { ...parseColorLine(panel.rawInput), id: panel.id, raw: panel.rawInput }
                    if (!parsedColor.color) return null
                    return (
                        <div
                            key={panel.id}
                            className="flex-grow min-w-[300px]"
                            style={{ width: `${100 / colorPanels.length}%` }}
                        >
                            <ColorPanel
                                id={panel.id}
                                rawInput={panel.rawInput}
                                originalInput={panel.originalInput}
                                parsedColor={parsedColor}
                                tokens={panel.tokens || []} // Pass tokenizer results
                                showMore={panel.showMore || false}
                                onShowMoreToggle={handleShowMoreToggle}
                                onInputChange={handleInputChange}
                                onRevert={handleRevertPanel}
                            />
                        </div>
                    )
                })}
            </div>
            <footer className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10 text-sm text-white mix-blend-difference font-semibold">
                Developed by{' '}
                <a 
                    href="https://marclamy.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline"
                >
                    Marc Lamy
                </a>
                . Help improve it on{' '}
                <a 
                    href="https://github.com/marclelamy/color-parser" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline"
                >
                    GitHub
                </a>
                !
            </footer>
            <div className="fixed bottom-4 right-4 z-10">
                <ExportColorsDialog colorPanels={colorPanels} />
            </div>
        </main>
    )
}
function ExportColorsDialog({ colorPanels }: { colorPanels: ColorPanelState[] }) {
    const [format, setFormat] = useState("rgba")
    const [open, setOpen] = useState(false)

    const handleExport = () => {
        const colors = colorPanels.map(panel => {
            const parsed = parseColorLine(panel.rawInput)
            if (!parsed.color) return null
            
            switch (format) {
                case 'rgba':
                    return parsed.color.toRgbaString()
                case 'hsla':
                    // @ts-ignore
                    return parsed.color.toHslaString()
                case 'hex':
                    return parsed.color.toHex()
                default:
                    return parsed.color.toRgbaString()
            }
        }).filter(Boolean)

        const json = JSON.stringify(colors, null, 2)
        navigator.clipboard.writeText(json)
        // You can also trigger a download here
        setOpen(false)
    }

    const exportOptions = (
        <RadioGroup defaultValue="rgba" onValueChange={setFormat} className="grid gap-4 py-4">
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="rgba" id="r-rgba" />
                <Label htmlFor="r-rgba">RGBA</Label>
            </div>
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="hsla" id="r-hsla" />
                <Label htmlFor="r-hsla">HSLA</Label>
            </div>
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="hex" id="r-hex" />
                <Label htmlFor="r-hex">Hex</Label>
            </div>
        </RadioGroup>
    )

    return (
        <ResponsiveDialog
            open={open}
            setOpen={setOpen}
            title="Export Colors"
            description="Select a format and copy the JSON to your clipboard."
            trigger={<Button variant="outline">Export Colors</Button>}
            footer={<Button onClick={handleExport}>Copy to Clipboard</Button>}
        >
            {exportOptions}
        </ResponsiveDialog>
    )
}

