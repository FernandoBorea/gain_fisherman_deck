---
name: html-pdf-deck
description: Guide for creating HTML-based presentation decks that export perfectly to PDF. Use this skill when building or fixing HTML presentations, pitch decks, or slide decks that need to be printed or saved as PDF without layout issues, missing icons, slow PDF load times, or responsive design conflicts.
---

# HTML to PDF Presentation Deck Guide

This skill provides best practices, CSS configurations, and solutions for creating HTML-based presentation decks that export flawlessly to PDF via the browser's print functionality.

## Philosophy: Visual Parity & Performance

When designing HTML for PDF export, the goal is to maintain visual consistency between the web view and the PDF while ensuring the resulting PDF file is lightweight and opens quickly. Browser print engines (especially Chrome) struggle with complex CSS effects, often converting them into heavy raster images or complex clipping paths that bloat the PDF size and drastically slow down rendering in PDF viewers.

**Rule of thumb:** Gracefully degrade heavy CSS effects for print. Strip out shadows, masks, and blurs, and replace them with solid colors or simple borders that approximate the original design.

## Core Print Styles

Always include a dedicated `@media print` section in the CSS to override screen styles, enforce print dimensions, and manage page breaks.

```css
@media print {
  /* Set exact page size (e.g., 16:9 aspect ratio) */
  @page { 
    size: 16in 9in; 
    margin: 0; 
  }
  
  /* Reset body/html to match page size and prevent scrolling/overflow issues */
  html, body { 
    width: 16in; 
    height: 9in; 
    margin: 0; 
    padding: 0; 
    background: white; 
    overflow: visible; 
  }
  
  /* Force exact color printing (prevents browsers from stripping backgrounds) */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  
  /* Slide container constraints */
  .slide {
    width: 16in;
    height: 9in;
    min-height: 0;
    padding: 0;
    margin: 0;
    display: block;
    break-after: page; /* Force page break after each slide */
  }
  
  /* Remove last page break to avoid blank trailing pages */
  .slide:last-child { 
    break-after: auto; 
  }
  
  /* Hide UI elements (navigation, print buttons, progress bars) */
  .no-print { 
    display: none !important; 
  }
}
```

## PDF Performance & Load Time Optimization

To prevent the exported PDF from becoming sluggish or crashing PDF viewers, you must eliminate specific CSS properties during the print process.

### The `pdf-export-mode` Pattern

While `@media print` is powerful, complex decks benefit from a JavaScript-toggled class to handle structural or heavy visual changes right before printing. This ensures the live HTML deck remains beautiful while the PDF export path is materially lighter.

```javascript
// Add to your main script
window.addEventListener("beforeprint", () => {
  document.body.classList.add("pdf-export-mode");
});

window.addEventListener("afterprint", () => {
  document.body.classList.remove("pdf-export-mode");
});
```

### Heavy CSS Properties to Disable

Use the `.pdf-export-mode` class or `@media print` to disable or simplify the following properties:

1. **Box Shadows & Drop Shadows:** Remove entirely. Replace with subtle borders if separation is needed.
2. **Backdrop Filters (Glassmorphism):** Remove blurs. Replace with highly opaque or solid background colors.
3. **Masks & Clipping Paths:** Hide purely decorative elements that use `mask-image`.
4. **Stacked Transparent Gradients:** Flatten multiple radial/linear gradients into a single, simple gradient or solid background.
5. **Gradient Text (`background-clip: text`):** Revert to solid text colors.

```css
/* Example: Optimizing for PDF Performance */
@media print {
  /* 1. Strip shadows and filters */
  * {
    box-shadow: none !important;
    text-shadow: none !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }

  /* 2. Simplify Glassmorphism to solid/opaque colors */
  .glass-card {
    background: rgba(255, 255, 255, 0.95) !important;
    border: 1px solid rgba(0, 0, 0, 0.1) !important;
  }

  /* 3. Revert gradient text to solid color */
  .gradient-text {
    background: none !important;
    -webkit-text-fill-color: initial !important;
    color: #1926FF !important;
  }
}

/* 4. Hide heavy decorative masks/layers using the JS toggle class */
.pdf-export-mode .heavy-decorative-background {
  display: none !important;
}
```

## Common Issues & Fixes

### 1. Missing SVGs or Icons in Print View
**Problem:** Icons or SVGs inside containers with `backdrop-filter` (glassmorphism effects) disappear or render as solid white blocks when printing. WebKit/Chrome print engines rasterize elements with backdrop filters into images, which often destroys or hides the vector children inside them.
**Fix:** Disable backdrop filters globally in the print stylesheet (as shown in the performance section).

### 2. Grid Layouts Collapsing (Tailwind Breakpoints)
**Problem:** CSS Frameworks like Tailwind use screen width to determine breakpoints (e.g., `md:`, `lg:`, `xl:`). The print canvas often falls into a smaller breakpoint (like `md:`), causing multi-column grids to collapse unexpectedly and overlap absolute-positioned elements.
**Fix:** Explicitly define the print layout using `print:` variant classes (in Tailwind) or explicit print CSS to ensure the grid matches the intended desktop view.

```html
<!-- Bad: Will collapse to 2 columns in print if the print width is < xl breakpoint -->
<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4">

<!-- Good: Forces 4 columns when printing -->
<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 print:grid-cols-4">
```

### 3. Dense Slides Overflowing
**Problem:** Even with exact dimensions, browser print engines can sometimes render text or spacing slightly larger than on screen, causing dense slides to overflow their container and create unwanted extra pages.
**Fix:** Apply a slight scale transformation to the inner content of heavy slides during print.

```css
@media print {
  .dense-slide-content {
    transform: scale(0.94);
    transform-origin: top left;
    /* Compensate for the scale so the container still fills the slide */
    width: calc(100% / 0.94);
    height: calc(100% / 0.94);
  }
}
```

### 4. Inline SVGs (e.g., Lucide Icons)
**Problem:** SVGs injected via JS or inline might lose stroke/fill properties during print, or inherit conflicting styles.
**Fix:** Ensure SVGs have explicit print overrides if necessary, and avoid relying on CSS variables that might not resolve in the print context.

```css
@media print {
  svg.icon {
    display: inline-block !important;
    stroke: currentColor !important;
    fill: none !important;
  }
}
```