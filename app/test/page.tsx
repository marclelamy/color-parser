'use client'

import { parseColorInput, ParsedColor } from '@/lib/color-parser'
import { ColorTokenizer } from '@/lib/color-tokenizer'
import { ColorToken } from '@/lib/color-patterns'
import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestPage() {
    const [inputValue, setInputValue] = useState<string>('')
    const [parsedColors, setParsedColors] = useState<ParsedColor[]>([])
    const [tokens, setTokens] = useState<ColorToken[]>([])
    const [showTokens, setShowTokens] = useState(false)
    const [testResults, setTestResults] = useState<any[]>([])
    const [showTestResults, setShowTestResults] = useState(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value
        if (value.trim() === '') return
        setInputValue(value)
        
        // Use the old parser
        setParsedColors(parseColorInput(value))
        
        // Use the new tokenizer
        if (value.trim()) {
            const tokenizer = new ColorTokenizer(value)
            const extractedTokens = tokenizer.tokenize()
            tokenizer.addPositionInfo()
            setTokens(extractedTokens)
        } else {
            setTokens([])
        }
    }

    const loadTestFile = async () => {
        try {
            const response = await fetch('/test-colors.txt')
            const content = await response.text()
            setInputValue(content)
            
            // Parse with both systems
            setParsedColors(parseColorInput(content))
            
            const tokenizer = new ColorTokenizer(content)
            const extractedTokens = tokenizer.tokenize()
            tokenizer.addPositionInfo()
            setTokens(extractedTokens)
        } catch (error) {
            console.error('Error loading test file:', error)
        }
    }

    const loadEdgeCases = async () => {
        try {
            const response = await fetch('/edge-case-test.txt')
            const content = await response.text()
            setInputValue(content)
            
            // Parse with both systems
            setParsedColors(parseColorInput(content))
            
            const tokenizer = new ColorTokenizer(content)
            const extractedTokens = tokenizer.tokenize()
            tokenizer.addPositionInfo()
            setTokens(extractedTokens)
        } catch (error) {
            console.error('Error loading edge cases:', error)
        }
    }

    // Test scenarios
    const testScenarios = [
        {
            name: "🎨 Complex Gradient",
            input: "background: linear-gradient(45deg, #ff6b6b 0%, rgba(78, 205, 196, 0.8) 50%, hsl(210, 40%, 60%) 100%)",
            description: "Multiple colors in gradient"
        },
        {
            name: "🔥 Nested Functions",
            input: "background: rgb(calc(255 * var(--opacity, 0.8)), 107, 107);",
            description: "calc() inside rgb()"
        },
        {
            name: "📝 CSS Variables",
            input: "--primary: 20 14.3% 4.1%;\n--accent: oklch(0.646 0.222 41.116);",
            description: "Unwrapped HSL + OKLCH variables"
        },
        {
            name: "⚠️ Colors in Strings",
            input: 'content: "This has #ff6b6b inside";\nclassName: "bg-red-500";',
            description: "Should NOT match colors in strings"
        },
        {
            name: "💬 Commented Colors",
            input: "/* color: red; */ background: blue;",
            description: "Should ignore colors in comments"
        },
        {
            name: "🆕 Modern CSS Syntax",
            input: "color: rgb(255 107 107 / 0.5);\nbackground: hsl(0deg 100% 50% / 80%);",
            description: "Space-separated modern syntax"
        },
        {
            name: "🌈 Multiple Same Line",
            input: "#ff6b6b #4ecdc4 rgb(255, 107, 107) hsl(0, 100%, 50%) red blue",
            description: "6 colors on one line"
        },
        {
            name: "🔧 Color Functions",
            input: "background: color-mix(in srgb, red 50%, blue 50%);\ncolor: light-dark(#ffffff, #000000);",
            description: "Modern CSS color functions"
        },
        {
            name: "📐 Complex Calculations",
            input: "filter: hue-rotate(calc(var(--rotation, 0deg) + 45deg));\nbackground: rgb(calc(255 * 0.8) 107 107);",
            description: "Complex calc expressions"
        },
        {
            name: "🎯 Edge Case Mix",
            input: `--primary: rgb(255, 107, 107);
.component {
  background: var(--primary);
  border: 2px solid #ff6b6b80;
  color: rgba(78, 205, 196, 0.8);
}`,
            description: "Variables, alpha, context"
        }
    ]

    const runTestScenario = (scenario: any) => {
        setInputValue(scenario.input)
        
        // Parse with tokenizer
        const tokenizer = new ColorTokenizer(scenario.input)
        const extractedTokens = tokenizer.tokenize()
        tokenizer.addPositionInfo()
        setTokens(extractedTokens)
        
        // Parse with old parser
        setParsedColors(parseColorInput(scenario.input))
    }

    const runAllTests = () => {
        const results = testScenarios.map(scenario => {
            const tokenizer = new ColorTokenizer(scenario.input)
            const tokens = tokenizer.tokenize()
            tokenizer.addPositionInfo()
            
            // Check for potential issues
            const issues = []
            
            // Check for colors in strings
            const stringsWithColors = scenario.input.match(/"[^"]*#[0-9a-fA-F]{3,6}[^"]*"/g) || []
            if (stringsWithColors.length > 0) {
                const foundInString = tokens.some(t => stringsWithColors.some(s => s.includes(t.raw)))
                if (foundInString) issues.push("❌ False positive: color in string")
            }
            
            // Check for colors in comments
            const comments = scenario.input.match(/\/\*[^*]*\*\//g) || []
            if (comments.length > 0) {
                const foundInComment = tokens.some(t => comments.some(c => c.includes(t.raw)))
                if (foundInComment) issues.push("❌ False positive: color in comment")
            }
            
            // Check for missed nested functions
            const hasCalc = scenario.input.includes('calc(')
            const foundCalc = tokens.some(t => t.type === 'calc')
            if (hasCalc && !foundCalc) issues.push("⚠️ Missed nested calc()")
            
            return {
                ...scenario,
                tokenCount: tokens.length,
                tokens: tokens,
                issues: issues
            }
        })
        
        setTestResults(results)
        setShowTestResults(true)
    }

    // Group tokens by type for better visualization
    const tokensByType = tokens.reduce((acc, token) => {
        if (!acc[token.type]) acc[token.type] = []
        acc[token.type].push(token)
        return acc
    }, {} as Record<string, ColorToken[]>)

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex gap-4 items-center flex-wrap">
                <h1 className="text-2xl font-bold">🎨 Color Parser Test Lab</h1>
                <Button onClick={loadTestFile} variant="outline">
                    Load Basic Colors
                </Button>
                <Button onClick={loadEdgeCases} variant="outline">
                    Load Edge Cases
                </Button>
                <Button onClick={runAllTests} variant="default">
                    🔬 Run All Tests
                </Button>
                <Button 
                    onClick={() => setShowTokens(!showTokens)} 
                    variant={showTokens ? "default" : "outline"}
                >
                    {showTokens ? "Hide" : "Show"} Details
                </Button>
            </div>

            {/* Test Scenarios */}
            <Card>
                <CardHeader>
                    <CardTitle>🧪 Quick Test Scenarios</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {testScenarios.map((scenario, index) => (
                            <Button
                                key={index}
                                onClick={() => runTestScenario(scenario)}
                                variant="outline"
                                className="h-auto p-3 text-left flex flex-col items-start"
                            >
                                <span className="font-semibold">{scenario.name}</span>
                                <span className="text-xs text-muted-foreground mt-1">
                                    {scenario.description}
                                </span>
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Input</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea  
                            value={inputValue} 
                            onChange={handleInputChange}
                            placeholder="Paste your colors here or click a test scenario above..."
                            className="min-h-[300px] font-mono text-sm"
                        />
                    </CardContent>
                </Card>

                {/* Results Comparison */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Results Summary
                            <span className="text-sm font-normal text-muted-foreground ml-2">
                                Old: {parsedColors.length} | New: {tokens.length}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-sm mb-2">📊 Tokenizer Summary</h3>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    {Object.entries(tokensByType).map(([type, typeTokens]) => (
                                        <div key={type} className="flex justify-between p-2 bg-muted rounded">
                                            <span className="capitalize">{type}:</span>
                                            <span className="font-mono">{typeTokens.length}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-sm mb-2">🎯 Features Detected</h3>
                                <div className="space-y-1 text-xs">
                                    {tokens.some(t => t.type === 'css-variable') && (
                                        <div className="text-green-600">✅ CSS Custom Properties</div>
                                    )}
                                    {tokens.some(t => t.type === 'calc') && (
                                        <div className="text-green-600">✅ Calculations (calc)</div>
                                    )}
                                    {tokens.some(t => t.raw.includes(' / ')) && (
                                        <div className="text-green-600">✅ Modern CSS Syntax</div>
                                    )}
                                    {tokens.some(t => t.context?.property) && (
                                        <div className="text-green-600">✅ CSS Context Detection</div>
                                    )}
                                    {tokens.some(t => t.raw.includes('var(')) && (
                                        <div className="text-blue-600">🔗 CSS Variables Usage</div>
                                    )}
                                    {tokens.some(t => t.type === 'hex' && t.raw.length > 7) && (
                                        <div className="text-purple-600">🎭 Alpha Channel Support</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Test Results */}
            {showTestResults && testResults.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>🔬 Test Results Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {testResults.map((result, index) => (
                                <div key={index} className="border rounded p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold">{result.name}</h3>
                                        <span className="text-sm bg-muted px-2 py-1 rounded">
                                            {result.tokenCount} tokens
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">{result.description}</p>
                                    
                                    {result.issues.length > 0 && (
                                        <div className="mb-2">
                                            {result.issues.map((issue: string, i: number) => (
                                                <div key={i} className="text-sm text-red-600">{issue}</div>
                                            ))}
                                        </div>
                                    )}
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                        {result.tokens.map((token: any, i: number) => (
                                            <div key={i} className="bg-muted p-2 rounded">
                                                <span className="font-mono">[{token.type}] {token.raw}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Detailed Token View */}
            {showTokens && tokens.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>🔍 Tokenizer Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(tokensByType).map(([type, typeTokens]) => (
                                <div key={type}>
                                    <h3 className="font-semibold mb-2 capitalize">
                                        {type} ({typeTokens.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {typeTokens.map((token, index) => (
                                            <div key={index} className="bg-muted p-3 rounded text-sm font-mono">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-bold">{token.raw}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        Line {token.line}, Col {token.column}
                                                    </span>
                                                </div>
                                                {token.value !== token.raw && (
                                                    <div className="text-muted-foreground">
                                                        Value: {token.value}
                                                    </div>
                                                )}
                                                {token.context?.name && (
                                                    <div className="text-blue-600">
                                                        Variable: {token.context.name}
                                                    </div>
                                                )}
                                                {token.context?.property && (
                                                    <div className="text-green-600">
                                                        Property: {token.context.property}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Old Parser Results (for comparison) */}
            <Card>
                <CardHeader>
                    <CardTitle>📝 Old Parser Results (JSON)</CardTitle>
                </CardHeader>
                <CardContent>
                    <pre className='text-xs bg-muted p-4 rounded overflow-auto max-h-96'>
                        {JSON.stringify(parsedColors, null, 2)}
                    </pre>
                </CardContent>
            </Card>
        </div>
    )
}

