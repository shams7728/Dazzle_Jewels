"use client";

import { useEffect, useState } from 'react';
import { DollarSign, Package, ShoppingBag, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  activeOrders: number;
  ordersChange: number;
  totalProducts: number;
  productsChange: number;
  totalCustomers: number;
  customersChange: number;
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    revenueChange: 0,
    activeOrders: 0,
    ordersChange: 0,
    totalProducts: 0,
    productsChange: 0,
    totalCustomers: 0,
    customersChange: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    
    // Set up real-time subscriptions
    const ordersChannel = supabase
      .channel('orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchStats();
      })
      .subscribe();

    const productsChannel = supabase
      .channel('products-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchStats();
      })
      .subscribe();

    const profilesChannel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch orders data
      const { data: orders } = await supabase
        .from('orders')
        .select('total, status, created_at');

      // Fetch products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Fetch customers count
      const { count: customersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (orders) {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        
        // Calculate total revenue
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        
        // Calculate active orders
        const activeOrders = orders.filter(o => 
          o.status === 'pending' || o.status === 'processing' || o.status === 'confirmed'
        ).length;
        
        // Calculate changes from last month
        const lastMonthOrders = orders.filter(o => new Date(o.created_at) < lastMonth);
        const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        const revenueChange = lastMonthRevenue > 0 
          ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
          : 0;

        setStats({
          totalRevenue,
          revenueChange,
          activeOrders,
          ordersChange: orders.length - lastMonthOrders.length,
          totalProducts: productsCount || 0,
          productsChange: 0, // Can be calculated with historical data
          totalCustomers: customersCount || 0,
          customersChange: 0, // Can be calculated with historical data
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      change: stats.revenueChange,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
    },
    {
      label: 'Active Orders',
      value: stats.activeOrders.toString(),
      icon: ShoppingBag,
      change: stats.ordersChange,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      label: 'Total Products',
      value: stats.totalProducts.toString(),
      icon: Package,
      change: stats.productsChange,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
    {
      label: 'Total Customers',
      value: stats.totalCustomers.toLocaleString('en-IN'),
      icon: Users,
      change: stats.customersChange,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 animate-pulse">
            <div className="h-24"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`group relative overflow-hidden rounded-xl border ${stat.borderColor} bg-gradient-to-br from-neutral-900 to-black p-6 transition-all hover:scale-105 hover:shadow-lg hover:shadow-${stat.color}/20`}
        >
          <div className="flex items-start justify-between">
            <div className={`rounded-lg ${stat.bgColor} p-3 ${stat.color} transition-transform group-hover:scale-110`}>
              <stat.icon className="h-6 w-6" />
            </div>
            {stat.change !== 0 && (
              <div className={`flex items-center gap-1 text-sm font-medium ${stat.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stat.change > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span>{stat.change > 0 ? '+' : ''}{stat.change.toFixed(1)}%</span>
              </div>
            )}
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-neutral-400">{stat.label}</p>
            <h3 className="mt-1 text-3xl font-bold text-white">{stat.value}</h3>
          </div>
          
          {/* Animated background gradient */}
          <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full ${stat.bgColor} opacity-20 blur-3xl transition-all group-hover:scale-150`}></div>
        </motion.div>
      ))}
    </div>
  );
}
