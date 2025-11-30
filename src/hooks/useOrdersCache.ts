import { useState, useEffect, useCallback } from 'react';
import { cache, CacheKeys } from '@/lib/utils/cache';
import type { Order, OrderFilters, PaginationParams } from '@/types/order-management';

interface UseOrdersCacheOptions {
  userId?: string;
  filters?: OrderFilters;
  pagination?: PaginationParams;
  enabled?: boolean;
}

interface UseOrdersCacheResult {
  orders: Order[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  mutate: (orders: Order[]) => void;
}

/**
 * Custom hook for caching and fetching user orders
 * Implements stale-while-revalidate pattern
 */
export function useOrdersCache({
  userId,
  filters = {},
  pagination = { page: 1, limit: 20 },
  enabled = true,
}: UseOrdersCacheOptions): UseOrdersCacheResult {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const cacheKey = userId 
    ? CacheKeys.userOrders(userId, pagination.page)
    : null;

  const fetchOrders = useCallback(async () => {
    if (!enabled || !userId) {
      setLoading(false);
      return;
    }

    try {
      // Check cache first
      if (cacheKey) {
        const cached = cache.get<Order[]>(cacheKey);
        if (cached) {
          setOrders(cached);
          setLoading(false);
          // Continue to revalidate in background
        }
      }

      // Fetch fresh data
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (filters.status && filters.status.length > 0) {
        queryParams.append('status', filters.status.join(','));
      }

      const response = await fetch(`/api/orders?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      const fetchedOrders = data.orders || [];

      setOrders(fetchedOrders);
      setError(null);

      // Update cache
      if (cacheKey) {
        cache.set(cacheKey, fetchedOrders, 30); // 30 seconds TTL
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [userId, enabled, cacheKey, pagination.page, pagination.limit, filters.status]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Manual mutation function
  const mutate = useCallback((newOrders: Order[]) => {
    setOrders(newOrders);
    if (cacheKey) {
      cache.set(cacheKey, newOrders, 30);
    }
  }, [cacheKey]);

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
    mutate,
  };
}

/**
 * Invalidate orders cache for a specific user
 */
export function invalidateOrdersCache(userId: string): void {
  cache.deletePattern(`orders:user:${userId}:.*`);
}

/**
 * Invalidate all orders cache
 */
export function invalidateAllOrdersCache(): void {
  cache.deletePattern('orders:.*');
}
