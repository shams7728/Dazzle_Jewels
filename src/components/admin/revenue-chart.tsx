"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

interface RevenueData {
  date: string;
  revenue: number;
}

export function RevenueChart() {
  const [data, setData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  useEffect(() => {
    fetchRevenueData();

    const channel = supabase
      .channel('revenue-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchRevenueData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRevenueData = async () => {
    try {
      const { data: orders } = await supabase
        .from('orders')
        .select('total, created_at')
        .order('created_at', { ascending: true });

      if (orders) {
        // Group by date and sum revenue
        const revenueMap = new Map<string, number>();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return date.toISOString().split('T')[0];
        });

        last7Days.forEach(date => revenueMap.set(date, 0));

        orders.forEach(order => {
          const date = new Date(order.created_at).toISOString().split('T')[0];
          if (revenueMap.has(date)) {
            revenueMap.set(date, (revenueMap.get(date) || 0) + (order.total || 0));
          }
        });

        const chartData = Array.from(revenueMap.entries()).map(([date, revenue]) => ({
          date: new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
          revenue,
        }));

        setData(chartData);
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const maxRevenue = Math.max(...data.map(d => d.revenue), 1);

  if (loading) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-gradient-to-br from-neutral-900 to-black p-6">
        <div className="animate-pulse">
          <div className="h-6 w-48 bg-neutral-800 rounded mb-4"></div>
          <div className="h-64 bg-neutral-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-gradient-to-br from-neutral-900 to-black p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Revenue Overview
          </h2>
          <p className="text-sm text-neutral-400 mt-1">Last 7 days performance</p>
        </div>
      </div>

      <div className="relative h-64">
        <div className="absolute inset-0 flex items-end justify-between gap-2">
          {data.map((item, index) => {
            const height = (item.revenue / maxRevenue) * 100;
            const isHovered = hoveredBar === index;

            return (
              <div key={item.date} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  className="relative w-full"
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  onMouseEnter={() => setHoveredBar(index)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  <div
                    className={`w-full rounded-t-lg bg-gradient-to-t from-green-500 to-emerald-400 transition-all cursor-pointer ${
                      isHovered ? 'opacity-100 shadow-lg shadow-green-500/50' : 'opacity-80'
                    }`}
                    style={{ height: '100%' }}
                  >
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -top-12 left-1/2 -translate-x-1/2 bg-neutral-800 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-xl"
                      >
                        ₹{item.revenue.toLocaleString('en-IN')}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
                <span className="text-xs text-neutral-400 font-medium">{item.date}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
