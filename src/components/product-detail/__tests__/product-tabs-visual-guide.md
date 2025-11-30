# ProductTabs Component - Visual Guide

## Desktop View (≥768px)

```
┌─────────────────────────────────────────────────────────────┐
│  Description    Specifications    Shipping & Returns         │
│  ──────────                                                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  This exquisite gold necklace features intricate             │
│  craftsmanship and timeless design. Perfect for special      │
│  occasions or everyday elegance.                             │
│                                                               │
│  Made with 22K gold and featuring traditional patterns,      │
│  this piece represents the finest in jewelry craftsmanship.  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

When clicking "Specifications" tab:

```
┌─────────────────────────────────────────────────────────────┐
│  Description    Specifications    Shipping & Returns         │
│                 ──────────────                               │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Material      │ 22K Gold                              │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ Weight        │ 15.5g                                 │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ Length        │ 18 inches                             │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ Clasp Type    │ Lobster Clasp                         │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ Purity        │ 916 Hallmark                          │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Mobile View (<768px)

```
┌─────────────────────────────────────────┐
│  Description                         ▼  │
├─────────────────────────────────────────┤
│  This exquisite gold necklace           │
│  features intricate craftsmanship       │
│  and timeless design.                   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Specifications                      ▶  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Shipping & Returns                  ▶  │
└─────────────────────────────────────────┘
```

When "Specifications" is expanded:

```
┌─────────────────────────────────────────┐
│  Description                         ▼  │
├─────────────────────────────────────────┤
│  This exquisite gold necklace           │
│  features intricate craftsmanship       │
│  and timeless design.                   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Specifications                      ▼  │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐  │
│  │ Material  │ 22K Gold             │  │
│  ├───────────────────────────────────┤  │
│  │ Weight    │ 15.5g                │  │
│  ├───────────────────────────────────┤  │
│  │ Length    │ 18 inches            │  │
│  ├───────────────────────────────────┤  │
│  │ Purity    │ 916 Hallmark         │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Shipping & Returns                  ▶  │
└─────────────────────────────────────────┘
```

## Color Scheme

- **Active Tab (Desktop)**: Yellow (#EAB308 - yellow-500)
- **Inactive Tab**: Gray (#A3A3A3 - neutral-400)
- **Tab Hover**: Light Gray (#E5E5E5 - neutral-200)
- **Border**: Dark Gray (#262626 - neutral-800)
- **Background**: Black/Dark (#000000, #171717)
- **Text**: White (#FFFFFF) for headings, Light Gray (#D4D4D4) for body

## Animations

### Desktop Tab Switching
- **Duration**: 300ms
- **Effect**: Fade-in
- **Easing**: Default (ease)

### Mobile Accordion
- **Duration**: 300ms
- **Effect**: Height transition + Opacity
- **Easing**: ease-in-out
- **Chevron Rotation**: 180° when expanded

## Interaction States

### Desktop Tabs
1. **Default**: Gray text, no underline
2. **Hover**: Light gray text
3. **Active**: Yellow text with yellow underline (2px height)
4. **Click**: Switches active tab, fades in new content

### Mobile Accordion
1. **Collapsed**: Chevron pointing right (▶)
2. **Expanded**: Chevron pointing down (▼)
3. **Hover**: Background darkens slightly
4. **Click**: Toggles expansion with smooth height transition

## Responsive Breakpoints

- **Mobile**: 0px - 767px (Accordion layout)
- **Desktop**: 768px+ (Tab layout)

## Accessibility Features

1. **Semantic HTML**: Uses proper `<button>`, `<table>`, and heading elements
2. **Keyboard Navigation**: All interactive elements are keyboard accessible
3. **Focus States**: Visible focus indicators on all buttons
4. **ARIA**: Proper roles and labels (implicit through semantic HTML)
5. **Screen Reader Friendly**: Clear content structure and labels

## Edge Cases Handled

1. **No Specifications**: Shows "No specifications available for this product."
2. **No Shipping Info**: Shows "No shipping or return information available."
3. **Empty Specifications Object**: Treated same as undefined
4. **Long Content**: Scrollable within accordion/tab panel
5. **Multiple Accordions Open**: Supported on mobile (not mutually exclusive)

## Performance Considerations

1. **CSS Transitions**: Hardware-accelerated (transform, opacity)
2. **Conditional Rendering**: Only active tab content rendered on desktop
3. **Lazy Evaluation**: Accordion content rendered but hidden with CSS
4. **No Heavy Dependencies**: Pure React with Tailwind CSS
5. **Optimized Re-renders**: State updates only affect necessary components

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ✅ Responsive design works on all screen sizes

## Testing Checklist

- [x] Desktop tab navigation works
- [x] Active tab indicator displays correctly
- [x] Tab content switches on click
- [x] Smooth transitions between tabs
- [x] Mobile accordion expands/collapses
- [x] Multiple accordions can be open
- [x] Chevron rotates on expand
- [x] Specifications render as table
- [x] Key-value pairs display correctly
- [x] Missing data shows fallback messages
- [x] Responsive breakpoint works (768px)
- [x] Keyboard navigation functional
- [x] No TypeScript errors
- [x] Component exports correctly
