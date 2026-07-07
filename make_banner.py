import re
import os

def create_banner():
    logo_path = 'logo.svg'
    banner_path = 'docs/assets/banner.svg'
    
    with open(logo_path, 'r', encoding='utf-8') as f:
        logo_content = f.read()
        
    # Extract everything inside the SVG tag
    match = re.search(r'<svg[^>]*>(.*?)</svg>', logo_content, re.DOTALL | re.IGNORECASE)
    if match:
        inner_svg = match.group(1)
    else:
        inner_svg = ""
        
    banner_svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 450" width="100%" height="100%">
    <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#030014"/>
            <stop offset="50%" stop-color="#090926"/>
            <stop offset="100%" stop-color="#050510"/>
        </linearGradient>
        <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#3b82f6"/>
            <stop offset="100%" stop-color="#8b5cf6"/>
        </linearGradient>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" stroke-width="0.5" stroke-opacity="0.05"/>
            <circle cx="40" cy="40" r="1" fill="#ffffff" fill-opacity="0.1"/>
        </pattern>
        <filter id="glow">
            <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
        <filter id="shadow">
            <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.6"/>
        </filter>
    </defs>
    
    <!-- Background -->
    <rect width="1200" height="450" fill="url(#bg)"/>
    <rect width="1200" height="450" fill="url(#grid)"/>
    
    <!-- Decorative Orbs -->
    <circle cx="150" cy="100" r="150" fill="#3b82f6" fill-opacity="0.1" filter="blur(60px)"/>
    <circle cx="1050" cy="350" r="200" fill="#8b5cf6" fill-opacity="0.1" filter="blur(80px)"/>
    
    <!-- Connections -->
    <g stroke="#4c6ef5" stroke-opacity="0.3" stroke-width="1.5">
        <path d="M 100 225 Q 300 50, 600 225 T 1100 225" fill="none" stroke-dasharray="4,4"/>
        <path d="M 200 400 Q 400 300, 600 225 T 1000 50" fill="none" stroke-dasharray="2,6"/>
    </g>

    <!-- Insert Logo -->
    <g transform="translate(600, 160) scale(0.18) translate(-512, -512)" filter="url(#shadow)">
        {inner_svg}
    </g>
    
    <!-- Text -->
    <g transform="translate(600, 310)">
        <text x="0" y="0" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="900" font-size="72" fill="#ffffff" text-anchor="middle" letter-spacing="12" filter="url(#shadow)">KAUTILYA</text>
        <text x="0" y="45" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="600" font-size="22" fill="#94a3b8" text-anchor="middle" letter-spacing="6">ENTERPRISE DECISION INTELLIGENCE</text>
    </g>
    
    <!-- Badge -->
    <g transform="translate(500, 380)">
        <rect width="200" height="34" rx="17" fill="#1e293b" fill-opacity="0.8" stroke="#334155" stroke-width="1.5" filter="url(#shadow)"/>
        <text x="100" y="22" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="13" font-weight="bold" fill="#38bdf8" text-anchor="middle" letter-spacing="2">INTEGRATED WITH YONO</text>
    </g>
</svg>"""

    os.makedirs(os.path.dirname(banner_path), exist_ok=True)
    with open(banner_path, 'w', encoding='utf-8') as f:
        f.write(banner_svg)
    print("Banner generated successfully.")

if __name__ == "__main__":
    create_banner()
