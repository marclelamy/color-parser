# Color Parser

A powerful color parsing tool that helps you instantly analyze, convert, and manage colors from any text source. Paste any text containing color codes, and the app will automatically detect and display them in an intuitive interface.

## Features

- **Multi-format Parsing**: Automatically detects and parses a wide range of color formats, including hex, RGB(A), HSL(A), and color names.
- **Interactive Color Panels**: Each detected color is displayed in its own interactive panel, showing detailed information and visual representations.
- **Dynamic Editing**: Edit color values on the fly and see the changes instantly.
- **Clipboard Integration**: Automatically pastes and parses content from your clipboard on page load.
- **Exporting**: Convert and export colors to your desired format (e.g., RGBA, Hex).

## Usage

Simply paste any block of text (like a list of Hex/rgb/hsl/..., CSS, Tailwind config, or just a list of colors) into the input. The tool will parse it and display all found colors. You can then inspect, modify, and export them.

## Roadmap 
- Support for oklch and other formats missing
- make mobile responsive (display as flex col rather than row the color panels)
- round-trip color conversion
- add a button for "my string didn't work" with string issue + message or the user - rate limit the form 
- the export needs more output types
- [idea] - add option to change layout to grid of color and on hover block scales 2x with drop shadow and shows more details than on the unscaled