'use client'


import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { buildColorObject } from '@/lib/build-color-object'
import { ColorObject } from '@/lib/types'




const test = `
/* Hex Colors - Various lengths */
#ff00ff #000080 #0000ff

/* RGB and RGBA Values */
rgb(255, 107, 107) rgba(52, 152, 219, 0.6) rgba(46, 204, 113, 1.0) rgba(243, 156, 18, 0.4)
rgb(255 255 255) rgb(0 0 0 / 0.5)

/* HSL and HSLA Values */
hsl(0, 100%, 50%) hsla(300, 80%, 70%, 1.0)
hsl(210deg 40% 60%) 
`



export default function TestPage() {
    const [inputValue, setInputValue] = useState<string>(test)
    const [colorObjects, setColorObjects] = useState<ColorObject[]>([])

    const handleInputChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value
        const colorObjects = await buildColorObject(value)
        setColorObjects(colorObjects)
    }

    useEffect(() => {
        handleInputChange({ target: { value: inputValue } } as React.ChangeEvent<HTMLTextAreaElement>)
    }, [inputValue])


    return (
        <div className="w-full h-full">
            <h1 className="text-2xl font-bold text-gray-100">Color Parser Test</h1>
            
            <textarea
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Paste your colors here..."
                className="w-full h-64 p-4 border border-gray-600 rounded-md font-mono text-sm bg-gray-800 text-gray-100 placeholder:text-gray-400"
            />
            <div className="flex flex-row gap-4 text-gray-100">
                <p>Color object count: {colorObjects.length}</p>
                <p>Hex count: {colorObjects.filter(colorObj => colorObj.token.type === 'hex').length}</p>
                <p>RGB count: {colorObjects.filter(colorObj => colorObj.token.type === 'rgb').length}</p>
            </div>
            <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-auto text-sm border border-gray-600">
                {JSON.stringify(colorObjects, null, 2)}
            </pre>
        </div>
    )
}
