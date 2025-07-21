# Color Parser 🎨

Color Parser is a powerful and intuitive color parsing and conversion tool designed for developers, designers, and anyone who works with digital colors. Its core purpose is to simplify and accelerate the workflow of extracting, analyzing, and converting color values from any piece of text. It eliminates the manual effort of isolating and converting colors one by one, especially when dealing with unstructured data like CSS files, logs, or design mockups.

## Key Features

-   **Smart Clipboard Parsing**: On visiting the app, it can automatically read your clipboard and intelligently parse any valid color formats it finds (such as Hex, RGB, HSL), immediately displaying them for you.
-   **Multi-Color Processing**: Paste any block of text—be it CSS code, a URL, or just a list of colors—and the tool will identify every color and create a dedicated, interactive panel for each one.
-   **Comprehensive Color Analysis**: Each color panel provides a detailed breakdown, including a visual swatch and real-time conversions to multiple formats like RGBA, HSLA, and Hex.
-   **Interactive and Dynamic Interface**: Add, edit, or remove color panels on the fly. Editing a color value provides instant feedback and updated conversions. The layout dynamically adjusts to accommodate multiple color panels, making comparison easy.
-   **Effortless Exporting**: With a single click, export all the colors currently on your screen. Choose the desired format (RGBA, HSLA, or Hex) and copy a clean JSON array of the color strings to your clipboard, ready to be pasted directly into your projects.

## Target Audience

This tool is perfect for:

-   **Frontend Developers** who need to quickly extract colors from design specs or existing codebases.
-   **UI/UX Designers** who manage palettes and need a fast way to inspect and convert color values.
-   **Anyone** who frequently works with colors and needs a utility to streamline their workflow.

## Roadmap 
- add support for more formats 
- make mobile responsive (display as flex col rather than row the color panels)
- round-trip color conversion
- add a button for "my string didn't work" with string issue + message or the user - rate limit the form 
- the export needs more output types and maybe ways wher users can write their own custom string with params as `{func_name}({r}-{g}-{b}, {a}) for ex
- add option to change layout to grid of color and on hover block scales 2x with drop shadow and shows more details than on the unscaled
- add more content to the panels like color suggestion and more