'use client';

import { useEffect } from 'react';
import { initPerformanceOptimizations, reportWebVitals } from '@/lib/utils/performance';

export function PerformanceInit() {
  useEffect(() => {
    // Initialize performance optimizations
    initPerformanceOptimizations();
    
    // Report Web Vitals
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Listen for CLS (Cumulative Layout Shift)
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          reportWebVitals({
            name: entry.name,
            value: entry.startTime,
            id: entry.entryType,
          });
        }
      });
      
      try {
        observer.observe({ entryTypes: ['layout-shift', 'largest-contentful-paint', 'first-input'] });
      } catch (e) {
        // Browser doesn't support these metrics
      }
      
      return () => observer.disconnect();
    }
  }, []);
  
  return null;
}
