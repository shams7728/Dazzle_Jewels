export type Category = {
    id: string;
    name: string;
    slug: string;
    image_url?: string;
    created_at: string;
};

export type Product = {
    id: string;
    title: string;
    description?: string;
    base_price: number;
    discount_price?: number;
    category_id?: string;
    is_featured: boolean;
    is_new_arrival: boolean;
    is_best_seller: boolean;
    is_offer_item: boolean;
    created_at: string;
    category?: Category;
    variants?: ProductVariant[];
};

export type ProductVariant = {
    id: string;
    product_id: string;
    color?: string;
    material?: string;
    price_adjustment: number;
    stock_quantity: number;
    images: string[];
    created_at: string;
};

export type Order = {
    id: string;
    user_id?: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    total_amount: number;
    payment_method: 'razorpay' | 'cod';
    payment_status: 'pending' | 'paid' | 'failed';
    shipping_address?: any;
    created_at: string;
    items?: OrderItem[];
};

export type OrderItem = {
    id: string;
    order_id: string;
    variant_id?: string;
    quantity: number;
    price_at_purchase: number;
    variant?: ProductVariant;
};

export type Coupon = {
    id: string;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_order_value: number;
    is_active: boolean;
    created_at: string;
};

export type Reel = {
    id: string;
    product_id?: string;
    video_url: string;
    thumbnail_url?: string;
    likes_count: number;
    is_approved: boolean;
    created_at: string;
    product?: Product;
};

// Search and Filter Types
export interface SearchFilters {
  query: string;
  priceRange: { min: number; max: number };
  materials: string[];
  colors: string[];
  categories: string[];
  minRating: number | null;
  availability: 'all' | 'in_stock' | 'out_of_stock';
}

export interface SortOption {
  value: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'popular';
  label: string;
}

export interface SearchableProduct extends Product {
  effectivePrice: number;
  averageRating: number;
  reviewCount: number;
  isInStock: boolean;
  availableMaterials: string[];
  availableColors: string[];
  relevanceScore?: number;
}

export interface FilterOption {
  value: string;
  label: string;
  count: number;
  disabled: boolean;
}

export interface SearchSuggestion {
  type: 'product' | 'category' | 'query';
  text: string;
  productId?: string;
  categoryId?: string;
}

export type Review = {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment?: string;
  created_at: string;
};

// Showcase Section Types
export type ShowcaseConfig = {
  title: string;
  subtitle: string;
  badgeText: string;
  badgeIcon: string | React.ComponentType;
  filterKey: 'is_new_arrival' | 'is_best_seller' | 'is_offer_item';
  gradientFrom: string;
  gradientTo: string;
  accentColor: string;
};
