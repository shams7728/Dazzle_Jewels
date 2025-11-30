"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { orderService } from "@/lib/services/order-service";
import { Button } from "@/components/ui/button";
import { Loader2, Package, MapPin, CreditCard, Truck, ChevronLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Order } from "@/types/order-management";
import { OrderTracking } from "@/components/orders/order-tracking";

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (!user) {
          router.push("/login");
          return;
        }

        const fetchedOrder = await orderService.getOrderById(orderId, user.id);
        
        if (!fetchedOrder) {
          setError("Order not found");
        } else {
          setOrder(fetchedOrder);
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-xl border border-dashed border-neutral-800 p-12 text-center">
          <Package className="mx-auto h-16 w-16 text-neutral-600" />
          <h3 className="mt-4 text-xl font-medium text-white">{error || "Order not found"}</h3>
          <p className="mt-2 text-neutral-400">
            The order you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button
            className="mt-6 bg-yellow-500 text-black hover:bg-yellow-400"
            onClick={() => router.push("/orders")}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      confirmed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      processing: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      shipped: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
      delivered: "bg-green-500/10 text-green-500 border-green-500/20",
      cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return colors[status] || "bg-neutral-500/10 text-neutral-500 border-neutral-500/20";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/orders"
          className="inline-flex items-center text-sm text-neutral-400 hover:text-white transition-colors mb-4"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Orders
        </Link>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Order Details</h1>
            <p className="text-neutral-400">Order #{order.order_number}</p>
          </div>
          <div
            className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium ${getStatusColor(
              order.status
            )}`}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Tracking */}
          <OrderTracking order={order} onOrderUpdate={setOrder} />

          {/* Order Items */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items && order.items.length > 0 ? (
                order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-lg border border-neutral-800 bg-neutral-900 p-4"
                  >
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-800">
                      {item.product_image ? (
                        <Image
                          src={item.product_image}
                          alt={item.product_name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package className="h-8 w-8 text-neutral-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{item.product_name}</h3>
                      {item.variant_name && (
                        <p className="text-sm text-neutral-400">{item.variant_name}</p>
                      )}
                      <p className="text-sm text-neutral-400">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">₹{item.price.toLocaleString("en-IN")}</p>
                      <p className="text-sm text-neutral-400">
                        Subtotal: ₹{item.subtotal.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-neutral-400">No items in this order</p>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-yellow-500" />
              <h2 className="text-xl font-semibold text-white">Shipping Address</h2>
            </div>
            <div className="space-y-1 text-neutral-300">
              <p className="font-medium text-white">{order.shipping_address.name}</p>
              <p>{order.shipping_address.phone}</p>
              <p>{order.shipping_address.street}</p>
              <p>
                {order.shipping_address.city}, {order.shipping_address.state}{" "}
                {order.shipping_address.pincode}
              </p>
              <p>{order.shipping_address.country}</p>
            </div>
          </div>

          {/* Payment Information */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-yellow-500" />
              <h2 className="text-xl font-semibold text-white">Payment Information</h2>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-400">Payment Method</span>
                <span className="font-medium text-white">
                  {order.payment_method === "razorpay" ? "Razorpay" : "Cash on Delivery"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Payment Status</span>
                <span
                  className={`font-medium ${
                    order.payment_status === "completed"
                      ? "text-green-500"
                      : order.payment_status === "failed"
                      ? "text-red-500"
                      : order.payment_status === "refunded"
                      ? "text-blue-500"
                      : "text-yellow-500"
                  }`}
                >
                  {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                </span>
              </div>
              {order.payment_id && (
                <div className="flex justify-between">
                  <span className="text-neutral-400">Transaction ID</span>
                  <span className="font-mono text-sm text-white">{order.payment_id}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-neutral-300">
                <span>Subtotal</span>
                <span>₹{order.subtotal.toLocaleString("en-IN")}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-500">
                  <span>
                    Discount
                    {order.coupon_code && (
                      <span className="ml-1 text-xs">({order.coupon_code})</span>
                    )}
                  </span>
                  <span>-₹{order.discount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-300">
                <span>Delivery Charges</span>
                <span>
                  {order.delivery_charge === 0 ? (
                    <span className="text-green-500">FREE</span>
                  ) : (
                    `₹${order.delivery_charge.toLocaleString("en-IN")}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span>Tax</span>
                <span>₹{order.tax.toLocaleString("en-IN")}</span>
              </div>
              <div className="border-t border-neutral-800 pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-yellow-500">₹{order.total.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Info */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Order Information</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-neutral-400">Order Date</p>
                <p className="font-medium text-white">
                  {new Date(order.created_at).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {order.estimated_delivery_date && (
                <div>
                  <p className="text-neutral-400">Estimated Delivery</p>
                  <p className="font-medium text-white">
                    {new Date(order.estimated_delivery_date).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
              {order.tracking_number && (
                <div>
                  <p className="text-neutral-400">Tracking Number</p>
                  <p className="font-mono text-sm font-medium text-white">{order.tracking_number}</p>
                </div>
              )}
              {order.courier_name && (
                <div>
                  <p className="text-neutral-400">Courier</p>
                  <p className="font-medium text-white">{order.courier_name}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
