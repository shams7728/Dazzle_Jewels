# Authentication Components

Professional authentication pages with GSAP animations and theme-based styling.

## Components

### AuthLayout
Shared layout component for authentication pages with:
- Animated background gradients and floating orbs
- Responsive card design with backdrop blur
- Trust indicators (Secure, Encrypted, Trusted)
- Animated page entrance with staggered elements
- Respects `prefers-reduced-motion` setting

### AnimatedInput
Enhanced input component with:
- Floating label animation
- Focus/blur animations using GSAP
- Password visibility toggle
- Error state with shake animation
- Theme-aware styling with gold accent colors

### AnimatedButton
Animated button component with:
- Ripple effect on click
- Loading state with scale animation
- Hover and active state transitions
- Primary and secondary variants
- Shine effect overlay

## Animation Utilities

Located in `src/lib/utils/auth-animations.ts`:

- `animatePageEntrance()` - Staggered entrance animation for page elements
- `animateInputFocus()` - Scale animation on input focus
- `animateInputBlur()` - Scale animation on input blur
- `animateError()` - Shake animation for error states
- `animateLoading()` - Scale animation for loading state
- `animateSuccess()` - Success animation before navigation
- `animateFloatingElement()` - Continuous floating animation
- `animateBackgroundGradient()` - Animated gradient background
- `cleanupAnimations()` - Cleanup GSAP instances

## Features

### Login Page
- Email and password inputs with floating labels
- Remember me checkbox
- Forgot password link
- Social login buttons (Google, GitHub)
- Error handling with animations
- Success animation before redirect

### Signup Page
- Full name, email, and password inputs
- Real-time password strength indicator
- Password validation (length, uppercase, lowercase, numbers)
- Terms and conditions checkbox
- Social signup buttons
- Enhanced error handling

## Accessibility

- Respects `prefers-reduced-motion` media query
- Proper ARIA labels and semantic HTML
- Keyboard navigation support
- Focus indicators maintained during animations
- Screen reader friendly error messages

## Theme Support

The components use the application's theme system:
- Gold accent colors (`gold-500`, `gold-400`, `gold-600`)
- Dark background with neutral tones
- Gradient effects with theme colors
- Consistent with the rest of the application

## Usage

```tsx
import { AuthLayout, AnimatedInput, AnimatedButton } from '@/components/auth';

// In your page component
<AuthLayout
  title="Welcome Back"
  subtitle="Sign in to your account"
  footerText="Don't have an account?"
  footerLink="/signup"
  footerLinkText="Sign up"
>
  <form onSubmit={handleSubmit}>
    <AnimatedInput
      id="email"
      name="email"
      type="email"
      label="Email Address"
      value={email}
      onChange={handleChange}
      required
    />
    
    <AnimatedButton type="submit" loading={loading}>
      Sign In
    </AnimatedButton>
  </form>
</AuthLayout>
```

## Performance

- GSAP animations are hardware-accelerated
- Animations are disabled for users with `prefers-reduced-motion`
- Proper cleanup of GSAP instances on unmount
- Optimized re-renders with refs
- Lazy loading of animation utilities

## Browser Support

Works in all modern browsers that support:
- CSS Grid and Flexbox
- CSS Custom Properties
- ES6+ JavaScript
- GSAP 3.x
