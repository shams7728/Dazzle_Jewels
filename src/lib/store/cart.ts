import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, ProductVariant } from '@/types';

// Debounce helper for quantity updates
let debounceTimer: NodeJS.Timeout | null = null;
const debounce = (fn: () => void, delay: number) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(fn, delay);
};

export interface CartItem {
    product: Product;
    variant?: ProductVariant;
    quantity: number;
}

export interface CheckoutSession {
    items: CartItem[];
    subtotal: number;
    tax: number;
    total: number;
    sessionId: string;
    createdAt: Date;
}

interface CartState {
    items: CartItem[];
    isOpen: boolean;
    coupon: { code: string; discount_value: number; discount_type: 'percentage' | 'fixed' } | null;
    addItem: (product: Product, variant?: ProductVariant) => void;
    removeItem: (productId: string, variantId?: string) => void;
    updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
    updateQuantityDebounced: (productId: string, variantId: string | undefined, quantity: number) => void;
    clearCart: () => void;
    setIsOpen: (isOpen: boolean) => void;
    applyCoupon: (coupon: CartState['coupon']) => void;
    removeCoupon: () => void;
    getCartTotal: () => number;
    // New methods for enhanced checkout flow
    isProductInCart: (productId: string, variantId?: string) => boolean;
    getItemQuantity: (productId: string, variantId?: string) => number;
    createCheckoutSession: (items: CartItem[]) => CheckoutSession;
    // Memoized calculation helpers
    calculateSubtotal: () => number;
    calculateDiscount: (subtotal: number) => number;
    calculateTax: (subtotalAfterDiscount: number) => number;
    getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            coupon: null,

            addItem: (product, variant) => {
                const { items } = get();
                const existingItemIndex = items.findIndex(
                    (item) =>
                        item.product.id === product.id &&
                        item.variant?.id === variant?.id
                );

                if (existingItemIndex > -1) {
                    const newItems = [...items];
                    newItems[existingItemIndex].quantity += 1;
                    set({ items: newItems });
                } else {
                    set({ items: [...items, { product, variant, quantity: 1 }] });
                }
            },

            removeItem: (productId, variantId) => {
                set((state) => ({
                    items: state.items.filter(
                        (item) => !(item.product.id === productId && item.variant?.id === variantId)
                    ),
                }));
            },

            updateQuantity: (productId, variantId, quantity) => {
                if (quantity < 1) return;
                set((state) => ({
                    items: state.items.map((item) =>
                        item.product.id === productId && item.variant?.id === variantId
                            ? { ...item, quantity }
                            : item
                    ),
                }));
            },

            updateQuantityDebounced: (productId, variantId, quantity) => {
                if (quantity < 1) return;
                debounce(() => {
                    get().updateQuantity(productId, variantId, quantity);
                }, 300);
            },

            clearCart: () => set({ items: [], coupon: null }),

            setIsOpen: (isOpen) => set({ isOpen }),

            applyCoupon: (coupon) => set({ coupon }),

            removeCoupon: () => set({ coupon: null }),

            getCartTotal: () => {
                const { items, coupon } = get();
                
                // Memoized calculation helper
                const calculateItemPrice = (item: CartItem): number => {
                    let basePrice = item.product.base_price;
                    if (item.product.discount_price && item.product.discount_price < basePrice) {
                        basePrice = item.product.discount_price;
                    }

                    const price = item.variant
                        ? basePrice + item.variant.price_adjustment
                        : basePrice;
                    return price * item.quantity;
                };

                const subtotal = items.reduce((total, item) => total + calculateItemPrice(item), 0);

                if (!coupon) return subtotal;

                if (coupon.discount_type === 'percentage') {
                    return subtotal * (1 - coupon.discount_value / 100);
                } else {
                    return Math.max(0, subtotal - coupon.discount_value);
                }
            },

            // New methods for enhanced checkout flow
            isProductInCart: (productId, variantId) => {
                const { items } = get();
                return items.some(
                    (item) =>
                        item.product.id === productId &&
                        item.variant?.id === variantId
                );
            },

            getItemQuantity: (productId, variantId) => {
                const { items } = get();
                const item = items.find(
                    (item) =>
                        item.product.id === productId &&
                        item.variant?.id === variantId
                );
                return item?.quantity || 0;
            },

            createCheckoutSession: (items) => {
                // Calculate subtotal
                const subtotal = items.reduce((total, item) => {
                    let basePrice = item.product.base_price;
                    if (item.product.discount_price && item.product.discount_price < basePrice) {
                        basePrice = item.product.discount_price;
                    }

                    const price = item.variant
                        ? basePrice + item.variant.price_adjustment
                        : basePrice;
                    return total + price * item.quantity;
                }, 0);

                // Calculate tax (assuming 10% tax rate - can be made configurable)
                const tax = subtotal * 0.1;
                const total = subtotal + tax;

                // Generate unique session ID
                const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

                return {
                    items,
                    subtotal,
                    tax,
                    total,
                    sessionId,
                    createdAt: new Date(),
                };
            },

            // Memoized calculation helpers
            calculateSubtotal: () => {
                const { items } = get();
                return items.reduce((total, item) => {
                    let basePrice = item.product.base_price;
                    if (item.product.discount_price && item.product.discount_price < basePrice) {
                        basePrice = item.product.discount_price;
                    }

                    const price = item.variant
                        ? basePrice + item.variant.price_adjustment
                        : basePrice;
                    return total + price * item.quantity;
                }, 0);
            },

            calculateDiscount: (subtotal) => {
                const { coupon } = get();
                if (!coupon) return 0;

                if (coupon.discount_type === 'percentage') {
                    return subtotal * (coupon.discount_value / 100);
                } else {
                    return Math.min(coupon.discount_value, subtotal);
                }
            },

            calculateTax: (subtotalAfterDiscount) => {
                return subtotalAfterDiscount * 0.1;
            },

            getItemCount: () => {
                const { items } = get();
                return items.reduce((count, item) => count + item.quantity, 0);
            },
        }),
        {
            name: 'dazzle-cart-storage',
            partialize: (state) => ({ items: state.items, coupon: state.coupon }),
        }
    )
);
