const fs = require('fs');
let svg = fs.readFileSync('public/products/logo/she_aura_logo_full.svg', 'utf8');

// replace class="d" with fill="currentColor"
svg = svg.replace(/<defs><style>[\s\S]*?<\/style><\/defs>/, '');
svg = svg.replace(/class="d"/g, 'fill="currentColor"');
svg = svg.replace(/data-name="[^"]*"/g, '');
svg = svg.replace(/id="[^"]*"/g, '');

const start = svg.indexOf('>') + 1;
const end = svg.lastIndexOf('</svg>');
const inner = svg.substring(start, end).trim();

const component = `import React from "react";

interface SheAuraLogoProps {
  className?: string;
  fill?: string;
  height?: number | string;
  width?: number | string;
  style?: React.CSSProperties;
}

export default function SheAuraLogo({
  className = "brand-logo-svg",
  fill = "currentColor",
  height = 28,
  width,
  style,
}: SheAuraLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 359.52 87.59"
      className={className}
      height={height}
      width={width}
      style={{ fill, color: fill !== "currentColor" ? fill : undefined, ...style }}
      aria-label="SHE'AURA - YOUR AURA · YOUR STORY"
    >
      ${inner}
    </svg>
  );
}
`;

fs.writeFileSync('src/SheAuraLogo.tsx', component, 'utf8');
console.log('src/SheAuraLogo.tsx generated successfully!');
