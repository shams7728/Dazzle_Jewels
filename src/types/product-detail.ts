import { Product, ProductVariant } from './index';

// Extended Product Type for Detail Page
export interface ProductDetailData extends Product {
  effectivePrice: number;
  discountPercentage: number;
  averageRating: number;
  totalReviews: number;
  isInStock: boolean;
  estimatedDelivery: string;
  relatedProducts: Product[];
}

// Gallery State
export interface GalleryState {
  images: string[];
  selectedIndex: number;
  isLightboxOpen: boolean;
  isZoomed: boolean;
  zoomPosition: { x: number; y: number };
}

// Variant Selection State
export interface VariantState {
  selectedVariant: ProductVariant | null;
  availableColors: string[];
  availableMaterials: string[];
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
}

// Component Props Interfaces
export interface ProductGalleryProps {
  images: string[];
  productTitle: string;
  onImageChange?: (index: number) => void;
}

export interface ProductInfoProps {
  product: Product;
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onVariantChange: (variant: ProductVariant) => void;
  onAddToCart: () => void;
  onAddToWishlist: () => void;
}

export interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onSelect: (variant: ProductVariant) => void;
  type: 'color' | 'material' | 'size';
}

export interface ProductTabsProps {
  description: string;
  specifications?: Record<string, string>;
  shippingInfo?: string;
  returnPolicy?: string;
}

export interface ReviewsSectionProps {
  productId: string;
  averageRating: number;
  totalReviews: number;
  onReviewSubmit: () => void;
}

export interface RelatedProductsProps {
  currentProductId: string;
  categoryId?: string;
  limit?: number;
}

export interface TrustBadgesProps {
  badges: Array<{
    icon: React.ReactNode;
    text: string;
    description?: string;
  }>;
}

export interface ShareButtonsProps {
  productUrl: string;
  productTitle: string;
  productImage: string;
  productPrice: number;
}
