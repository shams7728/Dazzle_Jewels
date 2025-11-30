# Advanced Product Card Features

## 🎨 Design Features

### Visual Effects
- **Animated Border Gradient**: Golden shimmer effect on hover
- **Dual Image Display**: Smooth transition between primary and secondary product images
- **Floating Particles**: Animated sparkle effects when hovering
- **Shine Effect**: Light sweep animation across the card
- **Gradient Overlays**: Subtle background gradients for depth

### Badges & Labels
- **Featured Badge**: Golden gradient badge with sparkle icon
- **Discount Badge**: Red gradient badge showing percentage off
- **Out of Stock Badge**: Gray badge for unavailable items
- **Animated Entry**: Badges slide in from the left with staggered delays

### Interactive Elements
- **Wishlist Button**: Top-right heart icon with animation
- **Quick View Button**: Appears on hover at the bottom center
- **Add to Cart Button**: Gradient button with scale animation
- **Hover States**: Smooth transitions and scale effects

## 🎭 Animations

### On Load
- Fade in with upward motion
- Staggered delay based on card index (0.1s per card)

### On Hover
- Border glow effect
- Image zoom (110% scale)
- Overlay gradient appears
- Quick view button slides up
- Floating particle effects
- Shine sweep across the image

### On Click
- Button scale down (0.95) for tactile feedback
- Toast notification with product details

## 📱 Responsive Design

### Mobile (< 640px)
- Single column layout
- Optimized touch targets
- Reduced animation complexity
- Smaller text sizes

### Tablet (640px - 1024px)
- 2 column grid
- Medium-sized elements
- Full animations enabled

### Desktop (> 1024px)
- 4 column grid
- Large elements
- All effects enabled
- Hover interactions

## 🎯 Key Components

### Price Display
- Shows discount price prominently in yellow
- Original price with strikethrough
- Savings amount in green
- Proper number formatting with commas

### Product Info
- Title with hover color change
- Description with 2-line clamp
- Star rating display (placeholder)
- Material/color badges (if available)

## 🚀 Performance Optimizations

- **Framer Motion**: Hardware-accelerated animations
- **Image Optimization**: Next.js Image component with proper sizing
- **Lazy Loading**: Images load on demand
- **Will-change**: CSS property for smooth animations
- **Transform3d**: GPU acceleration for better performance

## 💡 Usage Example

```tsx
import { ProductCard } from "@/components/products/product-card";

<ProductCard 
  product={productData} 
  index={0} 
  featured={true} 
/>
```

## 🎨 Customization

The card supports:
- Featured flag for special styling
- Index for staggered animations
- Automatic stock detection
- Dynamic pricing with discounts
- Multiple product images

## ♿ Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader friendly
- Proper focus states
- Alt text for images

## 🔧 Dependencies

- `framer-motion`: For smooth animations
- `lucide-react`: For icons
- `next/image`: For optimized images
- `sonner`: For toast notifications
- `@/lib/store/cart`: For cart management
