#ff0000ff rgb(255, 107, 107) oklch(0.7 0.15 180) hsl(0, 100%, 50%) crimson
#00ff0080 rgba(52, 152, 219, 0.6) blue cmyk(85, 15, 100, 5) oklch(0.5 0.1 45)

hsla(300, 80%, 70%, 1.0) lab(50% 20 -30) green oklch(0.9 0.05 120) #0000ff33 device-cmyk(0% 81% 81% 30%) yellow
lch(50% 35 120) oklch(0.6 0.2 300 / 0.8) rgba(52, 152, 219, 60) color(srgb 1 0.5 0) orange hwb(120 20% 30%) oklch(0.4 0.25 60 / 0.5)

purple pink oklch(0.6 0.15 220) lab(70% -45 36) hwb(240deg 10% 40%) brown black
#ff6b6b oklch(0.8 0.1 150) rgba(78, 205, 196, 0.8) white gray grey darkblue lightgreen oklch(0.5 0.3 45 / 0.9)

color(display-p3 0.8 0.4 0.6) lch(70% 45 180) oklch(0.65 0.2 180) hwb(0.33turn 25% 15%) lab(25% 0 0)
cmyk(0%, 100%, 100%, 0%) oklch(1 0 0) device-cmyk(70% 0% 56% 0%) rgb(255, 0, 0) hsl(240, 100%, 50%)

oklch(0.145 0 0) rgba(0, 0, 0, 0.1) color(rec2020 0.7 0.3 0.9) #000000aa oklch(0.3 0.1 0 / 0.2)
lab(90% 5 -10) hsla(0, 0%, 100%, 0.2) lch(90% 10 270) oklch(0.577 0.245 27.325) hsl(210deg 40% 60%)

rgb(calc(255 * 0.8) 107 107) oklch(0.704 0.191 22.216) hsl(calc(360deg / 3) 100% 50%) #RGB #rgba
oklch(calc(0.5 + 0.1) 0.2 45deg) rgba(255, calc(100 + 50), 0, var(--opacity)) #RRGGBB #rrggbbaa

hsl(270 60% 70% / 80%) rgb(255 128 0 / 0.5) oklch(0.7 0.15 180 / 90%) oklch(0.646 0.222 41.116) 


tldr: Free color parsing tool that extracts colors from text and displays them in panels with format conversions



I've always been frustrated converting colors between Photoshop, Figma, CSS and Tailwind. You need the exact format, find the right website, deal with comma placement... it's always been a pain.

So I built colorparser.com over the weekend.

Basically, you paste any messy text with colors in it, and it automatically finds them and creates separate panels for each color. Then you just click on whatever format you need (RGB, HSL, hex, OKLCH, etc.) to copy it.

The nice thing is it handles format variations - so `hsl(200, 100, 50)`, `hsl(200 100 50)` or `hsl(200, 100%, 50%)` all work the same way.

When you visit it, it automatically reads your clipboard and parses any colors it finds, which saves time. Ever.thing runs in the client/

Currently supports hex, RGB, RGBA, HSL, HSLA, CMYK, and OKLCH. Planning to add more formats.

It's free and open source. Thought some of you might find it useful.