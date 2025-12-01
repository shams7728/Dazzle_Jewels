"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';

interface OrderStatus {
  status: string;
  count: number;
  color: string;
  bgColor: string;
}

export function OrdersChart() {
  const [data, setData] = useState<OrderStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrdersData();

    const channel = supabase
      .channel('orders-status-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrdersData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrdersData = async () => {
    try {
      const { data: orders } = await supabase
        .from('orders')
        .select('status');

      if (orders) {
        const statusMap = new Map<string, number>();
        orders.forEach(order => {
          const status = order.status || 'pending';
          statusMap.set(status, (statusMap.get(status) || 0) + 1);
        });

        const statusColors: Record<string, { color: string; bgColor: string }> = {
          pending: { color: 'text-yellow-500', bgColor: 'bg-yellow-500' },
          confirmed: { color: 'text-blue-500', bgColor: 'bg-blue-500' },
          processing: { color: 'text-purple-500', bgColor: 'bg-purple-500' },
          shipped: { color: 'text-cyan-500', bgColor: 'bg-cyan-500' },
          delivered: { color: 'text-green-500', bgColor: 'bg-green-500' },
          cancelled: { color: 'text-red-500', bgColor: 'bg-red-500' },
        };

        const chartData = Array.from(statusMap.entries()).map(([status, count]) => ({
          status: status.charAt(0).toUpperCase() + status.slice(1),
          count,
          color: statusColors[status]?.color || 'text-neutral-500',
          bgColor: statusColors[status]?.bgColor || 'bg-neutral-500',
        }));

        setData(chartData);
      }
    } catch (error) {
      console.error('Error fetching orders data:', error);
    } finally {
      setLoading(false);
    }
  };

  const total = data.reduce((sum, item) => sum + item.count, 0);

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
      <div className="flex items-center gap-2 mb-6">
        <Package className="h-5 w-5 text-blue-500" />
        <h2 className="text-xl font-bold text-white">Order Status Distribution</h2>
      </div>

      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = total > 0 ? (item.count / total) * 100 : 0;

          return (
            <motion.div
              key={item.status}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-neutral-300">{item.status}</span>
                <span className={`font-bold ${item.color}`}>{item.count}</span>
              </div>
              <div className="relative h-3 overflow-hidden rounded-full bg-neutral-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ delay: index * 0.1 + 0.2, duration: 0.8 }}
                  className={`h-full ${item.bgColor} rounded-full shadow-lg`}
                  style={{ boxShadow: `0 0 10px ${item.bgColor}` }}
                />
              </div>
              <div className="text-xs text-neutral-500 text-right">
                {percentage.toFixed(1)}%
              </div>
            </motion.div>
          );
        })}
      </div>

      {total === 0 && (
        <div className="flex items-center justify-center h-48 text-neutral-500">
          No orders yet
        </div>
      )}
    </div>
  );
}
