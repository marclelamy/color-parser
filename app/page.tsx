'use client'

import { useState, useCallback, useEffect } from 'react'
import { ColorPanel } from '@/components/ColorPanel'
import { buildColorObject } from '@/lib/build-color-object'
import { ColorObject, RGBColor, HSLColor } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Plus, RotateCcw } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { ResponsiveDialog } from '@/components/ui/responsive-dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface ColorPanelState {
    id: string
    rawInput: string
    originalInput?: string
    colorObjects?: ColorObject[]
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

    const parseAndAddPanels = useCallback(async (input: string, replaceExisting: boolean = false) => {
        try {
            const colorObjects = await buildColorObject(input)
            
            console.log('parseAndAddPanels - color objects found:', colorObjects)

            if (colorObjects.length === 0) {
                // No colors found, create a single panel with the input
                const newPanel: ColorPanelState = {
                    id: uuidv4(),
                    rawInput: input,
                    originalInput: input,
                    colorObjects: []
                }

                if (replaceExisting) {
                    setColorPanels([newPanel])
                } else {
                    setColorPanels(prev => [...prev, newPanel])
                }
                return
            }

            // Create panels for each color object found
            const newPanels: ColorPanelState[] = colorObjects.map(colorObj => ({
                id: uuidv4(),
                rawInput: colorObj.token.raw,
                originalInput: colorObj.token.raw,
                colorObjects: [colorObj]
            }))

            console.log('parseAndAddPanels - creating panels:', newPanels)

            if (replaceExisting) {
                setColorPanels(newPanels)
            } else {
                setColorPanels(prev => [...prev, ...newPanels])
            }
        } catch (error) {
            console.error('Failed to parse colors:', error)
            // On error, create a panel with the input but no color objects
            const errorPanel: ColorPanelState = {
                id: uuidv4(),
                rawInput: input,
                originalInput: input,
                colorObjects: []
            }

            if (replaceExisting) {
                setColorPanels([errorPanel])
            } else {
                setColorPanels(prev => [...prev, errorPanel])
            }
        }
    }, [])

    useEffect(() => {
        async function readClipboard() {
            try {
                if (navigator.clipboard && navigator.clipboard.readText) {
                    const clipboardText = await navigator.clipboard.readText()
                    if (clipboardText.trim()) {
                        await parseAndAddPanels(clipboardText.trim(), true)
                    }
                }
            } catch (error) {
                console.log('Could not read clipboard:', error)
            }
        }

        readClipboard()
    }, [parseAndAddPanels])

    const handleInputChange = useCallback((id: string, newValue: string) => {
        // First, immediately update the raw input
        setColorPanels(prev =>
            prev.map(panel => 
                panel.id === id 
                    ? {
                        ...panel,
                        rawInput: newValue,
                        originalInput: panel.originalInput || panel.rawInput,
                        colorObjects: newValue.trim() === '' ? [] : panel.colorObjects
                    }
                    : panel
            )
        )

        // Then handle async parsing separately
        if (newValue.trim() !== '') {
            buildColorObject(newValue).then(colorObjects => {
                setColorPanels(currentPanels =>
                    currentPanels.map(currentPanel =>
                        currentPanel.id === id
                            ? { ...currentPanel, colorObjects }
                            : currentPanel
                    )
                )
            }).catch(error => {
                console.error('Failed to parse color:', error)
                setColorPanels(currentPanels =>
                    currentPanels.map(currentPanel =>
                        currentPanel.id === id
                            ? { ...currentPanel, colorObjects: [] }
                            : currentPanel
                    )
                )
            })
        }
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
            colorObjects: []
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
                    // Use the first color object if available
                    const colorObject = panel.colorObjects?.[0]
                    
                    if (!colorObject && !panel.originalInput) {
                        return null
                    }

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
                                    parsedColor={colorObject?.parsedColor}
                                    tokens={colorObject ? [colorObject.token] : []}
                                    convertedColors={colorObject?.convertedColors}
                                    showMore={panel.showMore || false}
                                    onShowMoreToggle={handleShowMoreToggle}
                                    onInputChange={handleInputChange}
                                    onRevert={handleRevertPanel}
                                />
                        </div>
                    )
                })}
            </div>
            <footer className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10 text-sm text-white mix-blend-difference">
                Developed by{' '}
                <a 
                    href="https://marclamy.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline"
                >
                    Marc
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
                .
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
            const colorObject = panel.colorObjects?.[0]
            if (!colorObject) return null
            
            const convertedColors = colorObject.convertedColors
            
            switch (format) {
                case 'rgba':
                    const rgb = convertedColors.rgb as RGBColor
                    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${colorObject.parsedColor.alpha || 1})`
                case 'hsla':
                    const hsl = convertedColors.hsl as HSLColor
                    return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${colorObject.parsedColor.alpha || 1})`
                case 'hex':
                    return convertedColors.hex
                default:
                    const defaultRgb = convertedColors.rgb as RGBColor
                    return `rgba(${defaultRgb.r}, ${defaultRgb.g}, ${defaultRgb.b}, ${colorObject.parsedColor.alpha || 1})`
            }
        }).filter(Boolean)

        const json = JSON.stringify(colors, null, 2)
        navigator.clipboard.writeText(json)
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

