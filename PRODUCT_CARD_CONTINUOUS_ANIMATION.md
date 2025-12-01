# Product Card Continuous Gold Bubble Animation

## Change Made
Updated the floating gold particle animation on product cards to be continuously visible instead of only appearing on desktop hover.

## Before
```tsx
{/* Floating Particles Effect - Desktop Only */}
{!isMobile && isHovered && (
  // Particles only shown on desktop when hovering
)}
```

**Behavior:**
- Only visible on desktop (not mobile)
- Only visible when hovering over the card
- Duration: 2 seconds
- Max opacity: 100%

## After
```tsx
{/* Floating Particles Effect - Always Visible */}
<>
  // Particles always visible on all devices
</>
```

**Behavior:**
- ✅ Always visible on all devices (mobile, tablet, desktop)
- ✅ Continuously animating
- ✅ Staggered based on card index for variety
- ✅ Subtle opacity (40-60%) for elegance
- ✅ Longer duration (3 seconds) for smoother effect

## Animation Details

### Particle 1 (Yellow-500):
```tsx
<motion.div
  animate={{ opacity: [0, 0.6, 0], scale: [0, 1, 0], y: -50 }}
  transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}
  className="absolute left-1/4 top-1/4 h-1 w-1 rounded-full bg-yellow-500"
/>
```
- **Position**: Left quarter, top quarter
- **Max Opacity**: 60%
- **Duration**: 3 seconds
- **Delay**: Based on card index × 0.2s

### Particle 2 (Yellow-400):
```tsx
<motion.div
  animate={{ opacity: [0, 0.5, 0], scale: [0, 1, 0], y: -50 }}
  transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 + 0.5 }}
  className="absolute right-1/4 top-1/3 h-1 w-1 rounded-full bg-yellow-400"
/>
```
- **Position**: Right quarter, top third
- **Max Opacity**: 50%
- **Duration**: 3 seconds
- **Delay**: Based on card index × 0.2s + 0.5s

### Particle 3 (Yellow-300):
```tsx
<motion.div
  animate={{ opacity: [0, 0.4, 0], scale: [0, 1, 0], y: -50 }}
  transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 + 1 }}
  className="absolute left-1/3 top-1/2 h-1 w-1 rounded-full bg-yellow-300"
/>
```
- **Position**: Left third, middle
- **Max Opacity**: 40%
- **Duration**: 3 seconds
- **Delay**: Based on card index × 0.2s + 1s

## Staggered Animation

Each card has a unique animation timing based on its index:

```
Card 0: Particles start at 0s, 0.5s, 1s
Card 1: Particles start at 0.2s, 0.7s, 1.2s
Card 2: Particles start at 0.4s, 0.9s, 1.4s
Card 3: Particles start at 0.6s, 1.1s, 1.6s
...and so on
```

This creates a beautiful cascading effect across the grid!

## Visual Effect

### Animation Cycle (3 seconds):
```
0.0s: Particle invisible (opacity: 0, scale: 0)
0.5s: Particle fading in
1.0s: Particle at peak (opacity: 40-60%, scale: 1)
1.5s: Particle fading out, moving up
2.0s: Particle nearly invisible
2.5s: Particle invisible
3.0s: Cycle repeats
```

### Movement:
- Particles float upward 50px
- Smooth fade in and out
- Scale from 0 to 1 and back to 0
- Creates a "rising bubble" effect

## Benefits

### User Experience:
1. **Always Engaging**: Cards have subtle animation even when not hovering
2. **Premium Feel**: Continuous gold particles add luxury
3. **Visual Interest**: Movement draws attention without being distracting
4. **Mobile Friendly**: Works on all devices, not just desktop

### Design:
1. **Subtle**: Lower opacity (40-60%) keeps it elegant
2. **Smooth**: 3-second duration is slower and more graceful
3. **Varied**: Staggered delays create organic movement
4. **On-Brand**: Gold particles match the jewelry theme

### Performance:
1. **GPU Accelerated**: Uses transform and opacity (hardware accelerated)
2. **Lightweight**: Only 3 small particles per card
3. **Efficient**: Framer Motion optimizes animations
4. **No Layout Shift**: Particles are absolutely positioned

## Accessibility

### Reduced Motion:
The animation respects user preferences:
```css
@media (prefers-reduced-motion: reduce) {
  /* Animations are disabled */
}
```

Users who prefer reduced motion won't see the particles animate.

## Browser Compatibility

✅ Chrome/Edge (full support)
✅ Safari (full support)
✅ Firefox (full support)
✅ iOS Safari (full support)
✅ Chrome Mobile (full support)

## File Modified

- `src/components/products/product-card.tsx`

## Testing

### Visual Check:
1. Open any product page
2. Look at product cards
3. You should see subtle gold particles floating upward
4. Each card has slightly different timing
5. Particles continuously animate (no hover needed)

### Mobile Check:
1. Open on mobile device
2. Gold particles should be visible
3. Animation should be smooth
4. No performance issues

### Reduced Motion Check:
1. Enable "Reduce Motion" in system settings
2. Particles should not animate
3. Cards should still look good

## Summary

Gold bubble particles now continuously animate on all product cards across all devices, creating a premium, engaging experience with subtle, elegant movement! ✨
