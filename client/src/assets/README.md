# Assets Directory

This directory contains brand assets and visual resources for the Godam Solutions application.

## Structure

- **icons/** - Contains UI icons for the application (leaf, thermometer, warehouse, etc.)
- **logos/** - Contains brand logos and variations

## Icon Requirements

Icons should be:
- SVG format for scalability
- Optimized for web use
- Consistent in style and sizing
- Accessible (include proper aria-labels when used)

### Recommended Icons

- 🌾 Leaf/Agriculture icon
- 🌡️ Thermometer icon
- 📦 Warehouse/Storage icon
- 📊 Analytics/Dashboard icon
- ⚠️ Alert/Warning icon
- ✓ Success/Check icon
- 📈 Growth/Trend icon

## Logo Variations

Include multiple logo variations:
- Full logo with text
- Icon-only version
- Light background version
- Dark background version
- Favicon (16x16, 32x32, 64x64)

## Usage

Import assets in components:

```typescript
import logo from '../assets/logos/logo.svg';
import leafIcon from '../assets/icons/leaf.svg';

// Use in JSX
<img src={logo} alt="Godam Solutions" />
```
