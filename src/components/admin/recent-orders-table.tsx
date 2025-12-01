"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Clock, Eye } from 'lucide-react';
import Link from 'next/link';

interface Order {
  id: string;
  created_at: string;
  total: number;
  status: string;
  profiles: {
    full_name: string;
  } | null;
}

export function RecentOrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentOrders();

    const channel = supabase
      .channel('recent-orders-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchRecentOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRecentOrders = async () => {
    try {
      const { data } = await supabase
        .from('orders')
        .select('id, created_at, total, status, profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) {
        setOrders(data as Order[]);
      }
    } catch (error) {
      console.error('Error fetching recent orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      confirmed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      processing: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      shipped: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
      delivered: 'bg-green-500/10 text-green-500 border-green-500/20',
      cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    return colors[status] || 'bg-neutral-500/10 text-neutral-500 border-neutral-500/20';
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-gradient-to-br from-neutral-900 to-black p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 bg-neutral-800 rounded"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-neutral-800 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-gradient-to-br from-neutral-900 to-black p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-purple-500" />
          <h2 className="text-xl font-bold text-white">Recent Orders</h2>
        </div>
        <Link
          href="/admin/orders"
          className="text-sm text-blue-500 hover:text-blue-400 transition-colors"
        >
          View All
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-800">
              <th className="pb-3 text-left text-sm font-medium text-neutral-400">Order ID</th>
              <th className="pb-3 text-left text-sm font-medium text-neutral-400">Customer</th>
              <th className="pb-3 text-left text-sm font-medium text-neutral-400">Amount</th>
              <th className="pb-3 text-left text-sm font-medium text-neutral-400">Status</th>
              <th className="pb-3 text-left text-sm font-medium text-neutral-400">Date</th>
              <th className="pb-3 text-right text-sm font-medium text-neutral-400">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <motion.tr
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors"
              >
                <td className="py-4 text-sm font-mono text-neutral-300">
                  #{order.id.slice(0, 8)}
                </td>
                <td className="py-4 text-sm text-neutral-300">
                  {order.profiles?.full_name || 'Guest'}
                </td>
                <td className="py-4 text-sm font-semibold text-white">
                  ₹{order.total.toLocaleString('en-IN')}
                </td>
                <td className="py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </td>
                <td className="py-4 text-sm text-neutral-400">
                  {new Date(order.created_at).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>
                <td className="py-4 text-right">
                  <Link
                    href={`/admin/orders`}
                    className="inline-flex items-center gap-1 text-sm text-blue-500 hover:text-blue-400 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Link>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && (
          <div className="flex items-center justify-center h-48 text-neutral-500">
            No orders yet
          </div>
        )}
      </div>
    </div>
  );
}
