import { useState, useCallback } from 'react';
import { GalleryState } from '@/types/product-detail';

interface UseGalleryStateReturn extends GalleryState {
  selectImage: (index: number) => void;
  nextImage: () => void;
  previousImage: () => void;
  openLightbox: () => void;
  closeLightbox: () => void;
  toggleZoom: () => void;
  setZoomPosition: (x: number, y: number) => void;
}

/**
 * Custom hook for managing gallery state
 * @param images - Array of image URLs
 * @returns Gallery state and handlers
 */
export function useGalleryState(images: string[]): UseGalleryStateReturn {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPositionState] = useState({ x: 0, y: 0 });

  const selectImage = useCallback((index: number) => {
    if (index >= 0 && index < images.length) {
      setSelectedIndex(index);
    }
  }, [images.length]);

  const nextImage = useCallback(() => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const previousImage = useCallback(() => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const openLightbox = useCallback(() => {
    setIsLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
  }, []);

  const toggleZoom = useCallback(() => {
    setIsZoomed((prev) => !prev);
  }, []);

  const setZoomPosition = useCallback((x: number, y: number) => {
    setZoomPositionState({ x, y });
  }, []);

  return {
    images,
    selectedIndex,
    isLightboxOpen,
    isZoomed,
    zoomPosition,
    selectImage,
    nextImage,
    previousImage,
    openLightbox,
    closeLightbox,
    toggleZoom,
    setZoomPosition,
  };
}
