import gsap from 'gsap';

/**
 * Animation configuration for authentication pages
 */
export const authAnimationConfig = {
  duration: {
    fast: 0.3,
    normal: 0.6,
    slow: 1.2,
  },
  ease: {
    smooth: 'power2.out',
    bounce: 'back.out(1.7)',
    elastic: 'elastic.out(1, 0.5)',
  },
  stagger: 0.1,
};

/**
 * Animate page entrance with staggered elements
 */
export const animatePageEntrance = (
  containerRef: HTMLElement,
  options?: { delay?: number }
) => {
  const elements = containerRef.querySelectorAll('[data-animate]');
  
  gsap.fromTo(
    containerRef,
    { opacity: 0 },
    { 
      opacity: 1, 
      duration: authAnimationConfig.duration.fast,
      delay: options?.delay || 0,
    }
  );

  gsap.fromTo(
    elements,
    {
      opacity: 0,
      y: 30,
      scale: 0.95,
    },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: authAnimationConfig.duration.normal,
      stagger: authAnimationConfig.stagger,
      ease: authAnimationConfig.ease.smooth,
      delay: (options?.delay || 0) + 0.2,
    }
  );
};

/**
 * Animate form input focus
 */
export const animateInputFocus = (element: HTMLElement) => {
  gsap.to(element, {
    scale: 1.02,
    duration: authAnimationConfig.duration.fast,
    ease: authAnimationConfig.ease.smooth,
  });
};

/**
 * Animate form input blur
 */
export const animateInputBlur = (element: HTMLElement) => {
  gsap.to(element, {
    scale: 1,
    duration: authAnimationConfig.duration.fast,
    ease: authAnimationConfig.ease.smooth,
  });
};

/**
 * Animate error message appearance
 */
export const animateError = (element: HTMLElement) => {
  gsap.fromTo(
    element,
    {
      opacity: 0,
      x: -10,
      scale: 0.9,
    },
    {
      opacity: 1,
      x: 0,
      scale: 1,
      duration: authAnimationConfig.duration.fast,
      ease: authAnimationConfig.ease.bounce,
    }
  );

  // Shake animation
  gsap.to(element.closest('form') || element, {
    x: [-5, 5, -5, 5, 0],
    duration: 0.4,
    ease: 'power2.inOut',
  });
};

/**
 * Animate loading state
 */
export const animateLoading = (button: HTMLElement) => {
  const timeline = gsap.timeline();
  
  timeline.to(button, {
    scale: 0.95,
    duration: authAnimationConfig.duration.fast,
    ease: authAnimationConfig.ease.smooth,
  });

  return timeline;
};

/**
 * Animate success state
 */
export const animateSuccess = (containerRef: HTMLElement) => {
  const timeline = gsap.timeline();

  timeline.to(containerRef, {
    scale: 1.05,
    duration: 0.2,
    ease: 'power2.out',
  });

  timeline.to(containerRef, {
    scale: 1,
    duration: 0.3,
    ease: authAnimationConfig.ease.bounce,
  });

  timeline.to(containerRef, {
    opacity: 0,
    y: -20,
    duration: authAnimationConfig.duration.normal,
    ease: authAnimationConfig.ease.smooth,
    delay: 0.3,
  });

  return timeline;
};

/**
 * Animate background gradient
 */
export const animateBackgroundGradient = (element: HTMLElement) => {
  gsap.to(element, {
    backgroundPosition: '200% center',
    duration: 3,
    ease: 'none',
    repeat: -1,
  });
};

/**
 * Animate floating elements
 */
export const animateFloatingElement = (
  element: HTMLElement,
  options?: { duration?: number; distance?: number }
) => {
  const duration = options?.duration || 3;
  const distance = options?.distance || 20;

  gsap.to(element, {
    y: -distance,
    duration: duration,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true,
  });
};

/**
 * Animate page transition out
 */
export const animatePageExit = (containerRef: HTMLElement) => {
  return gsap.to(containerRef, {
    opacity: 0,
    scale: 0.95,
    duration: authAnimationConfig.duration.fast,
    ease: authAnimationConfig.ease.smooth,
  });
};

/**
 * Clean up all GSAP animations
 */
export const cleanupAnimations = (containerRef: HTMLElement) => {
  gsap.killTweensOf(containerRef);
  gsap.killTweensOf(containerRef.querySelectorAll('*'));
};
