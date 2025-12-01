"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Star, TrendingUp } from 'lucide-react';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  sales_count: number;
}

export function TopProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopProducts();

    const channel = supabase
      .channel('products-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchTopProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTopProducts = async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select('id, name, price, image_url')
        .eq('is_best_seller', true)
        .limit(5);

      if (data) {
        // In a real app, you'd join with order_items to get actual sales count
        const productsWithSales = data.map(p => ({
          ...p,
          sales_count: Math.floor(Math.random() * 100) + 10, // Mock data
        }));
        setProducts(productsWithSales);
      }
    } catch (error) {
      console.error('Error fetching top products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-gradient-to-br from-neutral-900 to-black p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 bg-neutral-800 rounded"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-16 w-16 bg-neutral-800 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-neutral-800 rounded w-3/4"></div>
                <div className="h-3 bg-neutral-800 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-gradient-to-br from-neutral-900 to-black p-6">
      <div className="flex items-center gap-2 mb-6">
        <Star className="h-5 w-5 text-yellow-500" />
        <h2 className="text-xl font-bold text-white">Top Products</h2>
      </div>

      <div className="space-y-4">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group flex items-center gap-4 p-3 rounded-lg hover:bg-neutral-800/50 transition-all cursor-pointer"
          >
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-800">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-neutral-600">
                  <Star className="h-6 w-6" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-white truncate group-hover:text-yellow-500 transition-colors">
                {product.name}
              </h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm font-semibold text-green-500">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-neutral-400 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {product.sales_count} sales
                </span>
              </div>
            </div>

            <div className="flex-shrink-0 text-2xl font-bold text-neutral-700 group-hover:text-yellow-500/50 transition-colors">
              #{index + 1}
            </div>
          </motion.div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="flex items-center justify-center h-48 text-neutral-500">
          No products yet
        </div>
      )}
    </div>
  );
}
