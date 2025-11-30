"use client";

import { useEffect, useState } from 'react';
import { Sparkles, TrendingUp, Tag } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ShowcaseStats {
  newArrivalsCount: number;
  bestSellersCount: number;
  offerItemsCount: number;
}

interface ShowcaseStatisticsProps {
  refreshTrigger?: number;
}

export function ShowcaseStatistics({ refreshTrigger }: ShowcaseStatisticsProps) {
  const [stats, setStats] = useState<ShowcaseStats>({
    newArrivalsCount: 0,
    bestSellersCount: 0,
    offerItemsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, [refreshTrigger]);

  const fetchStatistics = async () => {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('is_new_arrival, is_best_seller, is_offer_item');

      if (error) throw error;

      if (products) {
        const newArrivalsCount = products.filter(p => p.is_new_arrival === true).length;
        const bestSellersCount = products.filter(p => p.is_best_seller === true).length;
        const offerItemsCount = products.filter(p => p.is_offer_item === true).length;

        setStats({
          newArrivalsCount,
          bestSellersCount,
          offerItemsCount,
        });
      }
    } catch (error) {
      console.error('Error fetching showcase statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const showcaseStats = [
    {
      label: 'New Arrivals',
      value: stats.newArrivalsCount,
      icon: Sparkles,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Best Sellers',
      value: stats.bestSellersCount,
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Offer Items',
      value: stats.offerItemsCount,
      icon: Tag,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-neutral-800 bg-black p-4 animate-pulse">
            <div className="h-20"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {showcaseStats.map((stat) => (
        <div key={stat.label} className="rounded-xl border border-neutral-800 bg-black p-4">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg ${stat.bgColor} p-2 ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-400">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
