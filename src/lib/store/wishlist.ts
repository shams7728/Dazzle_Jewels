import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';

interface WishlistState {
    items: Product[];
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
    toggleItem: (product: Product) => void;
    isInWishlist: (productId: string) => boolean;
    clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (product) => {
                const { items } = get();
                if (!items.find((i) => i.id === product.id)) {
                    set({ items: [...items, product] });
                }
            },

            removeItem: (productId) => {
                set((state) => ({
                    items: state.items.filter((i) => i.id !== productId),
                }));
            },

            toggleItem: (product) => {
                const { items, addItem, removeItem } = get();
                const exists = items.find((i) => i.id === product.id);
                if (exists) {
                    removeItem(product.id);
                } else {
                    addItem(product);
                }
            },

            isInWishlist: (productId) => {
                const { items } = get();
                return !!items.find((i) => i.id === productId);
            },

            clearWishlist: () => set({ items: [] }),
        }),
        {
            name: 'dazzle-wishlist-storage',
        }
    )
);
