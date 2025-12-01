"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShoppingBag, User, Package } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'order' | 'user' | 'product';
  message: string;
  timestamp: Date;
}

export function LiveActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    // Subscribe to orders
    const ordersChannel = supabase
      .channel('live-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        addActivity({
          id: `order-${payload.new.id}`,
          type: 'order',
          message: `New order #${payload.new.id.slice(0, 8)} placed`,
          timestamp: new Date(),
        });
      })
      .subscribe();

    // Subscribe to profiles
    const profilesChannel = supabase
      .channel('live-profiles')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, (payload) => {
        addActivity({
          id: `user-${payload.new.id}`,
          type: 'user',
          message: `New customer registered: ${payload.new.full_name || 'Guest'}`,
          timestamp: new Date(),
        });
      })
      .subscribe();

    // Subscribe to products
    const productsChannel = supabase
      .channel('live-products')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'products' }, (payload) => {
        addActivity({
          id: `product-${payload.new.id}`,
          type: 'product',
          message: `New product added: ${payload.new.name}`,
          timestamp: new Date(),
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(productsChannel);
    };
  }, []);

  const addActivity = (activity: ActivityItem) => {
    setActivities(prev => [activity, ...prev].slice(0, 10)); // Keep only last 10
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingBag className="h-4 w-4" />;
      case 'user':
        return <User className="h-4 w-4" />;
      case 'product':
        return <Package className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'user':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'product':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default:
        return 'bg-neutral-500/10 text-neutral-500 border-neutral-500/20';
    }
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-gradient-to-br from-neutral-900 to-black p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="relative">
          <Activity className="h-5 w-5 text-red-500" />
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-ping"></span>
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </div>
        <h2 className="text-xl font-bold text-white">Live Activity</h2>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {activities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              className={`flex items-start gap-3 p-3 rounded-lg border ${getColor(activity.type)}`}
            >
              <div className={`mt-0.5 rounded-lg p-2 ${getColor(activity.type)}`}>
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-neutral-300">{activity.message}</p>
                <p className="text-xs text-neutral-500 mt-1">
                  {activity.timestamp.toLocaleTimeString('en-IN')}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {activities.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-neutral-500">
            <Activity className="h-12 w-12 mb-2 opacity-50" />
            <p className="text-sm">Waiting for activity...</p>
          </div>
        )}
      </div>
    </div>
  );
}
