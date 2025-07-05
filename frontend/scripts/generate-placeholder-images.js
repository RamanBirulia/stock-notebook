#!/usr/bin/env node

/**
 * Generate placeholder images for SEO optimization
 * This script creates placeholder images in the required sizes for favicons, social media, and PWA icons
 *
 * Usage: node scripts/generate-placeholder-images.js
 *
 * Note: This generates simple placeholder images. For production, replace with professionally designed icons.
 */

const fs = require('fs');
const path = require('path');

// Image specifications
const imageSpecs = {
  // Favicon sizes
  'favicon-16x16.png': { width: 16, height: 16, type: 'favicon' },
  'favicon-32x32.png': { width: 32, height: 32, type: 'favicon' },
  'favicon-48x48.png': { width: 48, height: 48, type: 'favicon' },
  'favicon-64x64.png': { width: 64, height: 64, type: 'favicon' },
  'favicon-128x128.png': { width: 128, height: 128, type: 'favicon' },
  'favicon-256x256.png': { width: 256, height: 256, type: 'favicon' },

  // Apple Touch Icons
  'apple-touch-icon-57x57.png': { width: 57, height: 57, type: 'apple' },
  'apple-touch-icon-60x60.png': { width: 60, height: 60, type: 'apple' },
  'apple-touch-icon-72x72.png': { width: 72, height: 72, type: 'apple' },
  'apple-touch-icon-76x76.png': { width: 76, height: 76, type: 'apple' },
  'apple-touch-icon-114x114.png': { width: 114, height: 114, type: 'apple' },
  'apple-touch-icon-120x120.png': { width: 120, height: 120, type: 'apple' },
  'apple-touch-icon-144x144.png': { width: 144, height: 144, type: 'apple' },
  'apple-touch-icon-152x152.png': { width: 152, height: 152, type: 'apple' },
  'apple-touch-icon-180x180.png': { width: 180, height: 180, type: 'apple' },

  // Social Media Images
  'og-image-1200x630.png': { width: 1200, height: 630, type: 'social' },
  'twitter-card-1200x600.png': { width: 1200, height: 600, type: 'social' },

  // PWA Icons
  'logo-192x192.png': { width: 192, height: 192, type: 'pwa' },
  'logo-512x512.png': { width: 512, height: 512, type: 'pwa' },

  // Windows Tiles
  'favicon-70x70.png': { width: 70, height: 70, type: 'windows' },
  'favicon-150x150.png': { width: 150, height: 150, type: 'windows' },
  'favicon-310x150.png': { width: 310, height: 150, type: 'windows' },
  'favicon-310x310.png': { width: 310, height: 310, type: 'windows' },

  // Screenshots (placeholders)
  'screenshot-desktop.png': { width: 1280, height: 720, type: 'screenshot' },
  'screenshot-mobile.png': { width: 375, height: 667, type: 'screenshot' },
};

// Color schemes for different types
const colorSchemes = {
  favicon: {
    background: '#1f2937',
    text: '#ffffff',
    accent: '#3b82f6'
  },
  apple: {
    background: '#1f2937',
    text: '#ffffff',
    accent: '#10b981'
  },
  social: {
    background: '#f8fafc',
    text: '#1f2937',
    accent: '#3b82f6'
  },
  pwa: {
    background: '#1f2937',
    text: '#ffffff',
    accent: '#10b981'
  },
  windows: {
    background: '#1f2937',
    text: '#ffffff',
    accent: '#3b82f6'
  },
  screenshot: {
    background: '#f8fafc',
    text: '#1f2937',
    accent: '#e5e7eb'
  }
};

/**
 * Create SVG content for an image
 */
function createSVG(spec, filename) {
  const { width, height, type } = spec;
  const colors = colorSchemes[type];
  const isSquare = width === height;
  const isSmall = width < 100;

  let content = '';

  if (type === 'social') {
    // Social media images with text and branding
    content = `
      <rect width="100%" height="100%" fill="${colors.background}"/>
      <rect x="50" y="50" width="${width - 100}" height="${height - 100}" fill="${colors.accent}" opacity="0.1" rx="20"/>

      <!-- Main Logo Area -->
      <circle cx="${width/2}" cy="${height/2 - 80}" r="60" fill="${colors.accent}"/>
      <text x="${width/2}" y="${height/2 - 70}" text-anchor="middle" fill="${colors.background}" font-family="Arial, sans-serif" font-size="40" font-weight="bold">📈</text>

      <!-- Title -->
      <text x="${width/2}" y="${height/2 + 20}" text-anchor="middle" fill="${colors.text}" font-family="Arial, sans-serif" font-size="48" font-weight="bold">Stock Notebook</text>

      <!-- Subtitle -->
      <text x="${width/2}" y="${height/2 + 60}" text-anchor="middle" fill="${colors.text}" font-family="Arial, sans-serif" font-size="28" opacity="0.8">Track Your Portfolio</text>

      <!-- Features -->
      <text x="${width/2}" y="${height/2 + 100}" text-anchor="middle" fill="${colors.text}" font-family="Arial, sans-serif" font-size="20" opacity="0.6">Real-time Data • Performance Analytics • Commission Tracking</text>
    `;
  } else if (type === 'screenshot') {
    // Screenshot placeholders
    content = `
      <rect width="100%" height="100%" fill="${colors.background}"/>

      <!-- Header -->
      <rect x="0" y="0" width="100%" height="60" fill="${colors.text}"/>
      <text x="20" y="35" fill="${colors.background}" font-family="Arial, sans-serif" font-size="18" font-weight="bold">Stock Notebook</text>

      <!-- Navigation -->
      <rect x="20" y="80" width="150" height="30" fill="${colors.accent}" opacity="0.3" rx="4"/>
      <text x="30" y="100" fill="${colors.text}" font-family="Arial, sans-serif" font-size="14">Dashboard</text>

      <!-- Cards -->
      <rect x="20" y="130" width="${(width-60)/3}" height="100" fill="${colors.accent}" opacity="0.1" rx="8"/>
      <rect x="${30 + (width-60)/3}" y="130" width="${(width-60)/3}" height="100" fill="${colors.accent}" opacity="0.1" rx="8"/>
      <rect x="${40 + 2*(width-60)/3}" y="130" width="${(width-60)/3}" height="100" fill="${colors.accent}" opacity="0.1" rx="8"/>

      <!-- Chart Area -->
      <rect x="20" y="250" width="${width-40}" height="${height-300}" fill="${colors.accent}" opacity="0.1" rx="8"/>
      <text x="${width/2}" y="${height/2 + 50}" text-anchor="middle" fill="${colors.text}" font-family="Arial, sans-serif" font-size="16" opacity="0.5">Portfolio Analytics Chart</text>
    `;
  } else if (isSmall) {
    // Small icons - simple design
    content = `
      <rect width="100%" height="100%" fill="${colors.background}" rx="${width * 0.1}"/>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="${colors.text}" font-family="Arial, sans-serif" font-size="${width * 0.5}" font-weight="bold">📈</text>
    `;
  } else {
    // Larger icons - more detailed
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.3;

    content = `
      <rect width="100%" height="100%" fill="${colors.background}" rx="${width * 0.1}"/>

      <!-- Main Icon -->
      <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="${colors.accent}" opacity="0.2"/>
      <text x="${centerX}" y="${centerY}" text-anchor="middle" dominant-baseline="middle" fill="${colors.text}" font-family="Arial, sans-serif" font-size="${radius * 0.8}" font-weight="bold">📈</text>

      <!-- Corner Elements -->
      <circle cx="${width * 0.8}" cy="${height * 0.2}" r="${width * 0.05}" fill="${colors.accent}" opacity="0.6"/>
      <circle cx="${width * 0.2}" cy="${height * 0.8}" r="${width * 0.05}" fill="${colors.accent}" opacity="0.6"/>
    `;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  ${content}
</svg>`;
}

/**
 * Generate all placeholder images
 */
function generatePlaceholderImages() {
  const publicDir = path.join(__dirname, '..', 'public');

  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    console.error('Public directory not found:', publicDir);
    process.exit(1);
  }

  console.log('🎨 Generating placeholder images...');
  console.log('📁 Output directory:', publicDir);
  console.log('');

  const generatedFiles = [];
  const skippedFiles = [];

  // Generate each image
  Object.entries(imageSpecs).forEach(([filename, spec]) => {
    const filepath = path.join(publicDir, filename);

    // Skip if file already exists
    if (fs.existsSync(filepath)) {
      skippedFiles.push(filename);
      return;
    }

    // Create SVG content
    const svgContent = createSVG(spec, filename);

    // Save as SVG (can be converted to PNG later)
    const svgFilepath = filepath.replace('.png', '.svg');
    fs.writeFileSync(svgFilepath, svgContent);

    generatedFiles.push(filename.replace('.png', '.svg'));
  });

  // Report results
  console.log('✅ Generated files:');
  generatedFiles.forEach(file => console.log(`   - ${file}`));

  if (skippedFiles.length > 0) {
    console.log('');
    console.log('⏭️  Skipped existing files:');
    skippedFiles.forEach(file => console.log(`   - ${file}`));
  }

  console.log('');
  console.log('📝 Next steps:');
  console.log('1. Convert SVG files to PNG using a tool like:');
  console.log('   • Online: https://svgtopng.com/');
  console.log('   • Command line: npm install -g svgtopng && svgtopng *.svg');
  console.log('   • ImageMagick: convert file.svg file.png');
  console.log('2. Replace placeholder images with professionally designed icons');
  console.log('3. Optimize PNG files for web using tools like TinyPNG');
  console.log('4. Test images across different devices and browsers');
  console.log('');
  console.log('💡 Pro tip: Use the existing favicon.ico and preview.png as design inspiration!');
}

/**
 * Create a summary of what needs to be done
 */
function createSummary() {
  const summaryPath = path.join(__dirname, '..', 'docs', 'image-generation-summary.md');

  const summary = `# Image Generation Summary

## Generated Placeholder Images

This script has generated SVG placeholder images for all required SEO assets. These are basic placeholders that should be replaced with professionally designed icons.

### Generated Files (SVG format):
${Object.keys(imageSpecs).map(filename => `- ${filename.replace('.png', '.svg')}`).join('\n')}

## Next Steps

### 1. Convert SVG to PNG
The generated files are in SVG format. Convert them to PNG using:

**Online Tools:**
- https://svgtopng.com/
- https://cloudconvert.com/svg-to-png

**Command Line:**
\`\`\`bash
# Install converter
npm install -g svgtopng

# Convert all SVG files
svgtopng *.svg

# Or using ImageMagick
for file in *.svg; do convert "$file" "\${file%.*}.png"; done
\`\`\`

### 2. Design Professional Icons
Replace the placeholder icons with professionally designed ones:

- Use your existing favicon.ico as a base design
- Maintain consistent branding and colors
- Ensure icons are readable at small sizes
- Test across different devices and browsers

### 3. Optimize for Web
- Use TinyPNG or similar tools to compress PNG files
- Ensure file sizes are reasonable (under 50KB for most icons)
- Test loading speeds

### 4. Validate Implementation
- Use Facebook Debugger for OpenGraph tags
- Use Twitter Card Validator for Twitter cards
- Test PWA installation on mobile devices
- Check favicon display across different browsers

## Image Specifications

${Object.entries(imageSpecs).map(([filename, spec]) =>
  `- **${filename}**: ${spec.width}×${spec.height}px (${spec.type})`
).join('\n')}

## Color Scheme Used

- **Background**: #1f2937 (dark gray)
- **Text**: #ffffff (white)
- **Accent**: #3b82f6 (blue) / #10b981 (green)
- **Social Background**: #f8fafc (light gray)

Generated on: ${new Date().toISOString()}
`;

  fs.writeFileSync(summaryPath, summary);
  console.log('📄 Summary saved to:', summaryPath);
}

// Main execution
if (require.main === module) {
  try {
    generatePlaceholderImages();
    createSummary();
    console.log('🎉 Placeholder image generation complete!');
  } catch (error) {
    console.error('❌ Error generating images:', error.message);
    process.exit(1);
  }
}

module.exports = { generatePlaceholderImages, createSVG, imageSpecs, colorSchemes };
