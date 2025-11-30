"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Package, MapPin, CreditCard, Clock, Printer, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { orderService } from "@/lib/services/order-service";
import type { Order } from "@/types/order-management";
import Image from "next/image";
import OrderStatusUpdate from "@/components/admin/order-status-update";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const orderData = await orderService.getOrderById(orderId);
      
      if (!orderData) {
        setError("Order not found");
        return;
      }
      
      setOrder(orderData);
    } catch (err) {
      console.error("Error fetching order:", err);
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdated = (updatedOrder: Order) => {
    setOrder(updatedOrder);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered": return "text-green-500 bg-green-500/10";
      case "shipped": return "text-blue-500 bg-blue-500/10";
      case "processing": return "text-yellow-500 bg-yellow-500/10";
      case "confirmed": return "text-cyan-500 bg-cyan-500/10";
      case "pending": return "text-orange-500 bg-orange-500/10";
      case "cancelled": return "text-red-500 bg-red-500/10";
      default: return "text-neutral-400 bg-neutral-800";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/orders")}
          className="text-neutral-400 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
        <div className="rounded-xl border border-neutral-800 bg-black p-8 text-center">
          <p className="text-neutral-400">{error || "Order not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/admin/orders")}
            className="text-neutral-400 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Order {order.order_number}</h1>
            <p className="text-sm text-neutral-400">
              Placed on {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handlePrintInvoice}
            className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print Invoice
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - Left Column (2/3) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Items */}
          <div className="rounded-xl border border-neutral-800 bg-black p-6">
            <div className="mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-yellow-500" />
              <h2 className="text-lg font-semibold text-white">Order Items</h2>
            </div>
            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div key={index} className="flex gap-4 border-b border-neutral-800 pb-4 last:border-0 last:pb-0">
                  {item.product_image && (
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-900">
                      <Image
                        src={item.product_image}
                        alt={item.product_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{item.product_name}</h3>
                    {item.variant_name && (
                      <p className="text-sm text-neutral-400">Variant: {item.variant_name}</p>
                    )}
                    <p className="text-sm text-neutral-400">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">₹{item.price.toLocaleString()}</p>
                    <p className="text-sm text-neutral-400">
                      Subtotal: ₹{item.subtotal.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="rounded-xl border border-neutral-800 bg-black p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Pricing Breakdown</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal</span>
                <span>₹{order.subtotal.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-500">
                  <span>
                    Discount {order.coupon_code && `(${order.coupon_code})`}
                  </span>
                  <span>-₹{order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-400">
                <span>Delivery Charges</span>
                <span>₹{order.delivery_charge.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Tax</span>
                <span>₹{order.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-neutral-800 pt-2 text-lg font-semibold text-white">
                <span>Total</span>
                <span>₹{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-xl border border-neutral-800 bg-black p-6">
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-yellow-500" />
              <h2 className="text-lg font-semibold text-white">Shipping Address</h2>
            </div>
            <div className="space-y-1 text-neutral-300">
              <p className="font-medium text-white">{order.shipping_address.name}</p>
              <p>{order.shipping_address.phone}</p>
              <p>{order.shipping_address.street}</p>
              <p>
                {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.pincode}
              </p>
              <p>{order.shipping_address.country}</p>
            </div>
            
            {/* Map placeholder - can be enhanced with actual map integration */}
            {order.shipping_address.latitude && order.shipping_address.longitude && (
              <div className="mt-4 h-48 rounded-lg bg-neutral-900 flex items-center justify-center">
                <p className="text-neutral-500 text-sm">
                  Map: {order.shipping_address.latitude}, {order.shipping_address.longitude}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Right Column (1/3) */}
        <div className="space-y-6">
          {/* Status Update */}
          <div className="rounded-xl border border-neutral-800 bg-black p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Order Status</h2>
            <div className="mb-4">
              <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            <OrderStatusUpdate
              orderId={order.id}
              currentStatus={order.status}
              onStatusUpdated={handleStatusUpdated}
            />
          </div>

          {/* Customer Details */}
          <div className="rounded-xl border border-neutral-800 bg-black p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Customer Details</h2>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-neutral-400">Name</p>
                <p className="text-white">{order.shipping_address.name}</p>
              </div>
              <div>
                <p className="text-neutral-400">Phone</p>
                <p className="text-white">{order.shipping_address.phone}</p>
              </div>
              <div>
                <p className="text-neutral-400">User ID</p>
                <p className="font-mono text-xs text-neutral-500">{order.user_id}</p>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="rounded-xl border border-neutral-800 bg-black p-6">
            <div className="mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-yellow-500" />
              <h2 className="text-lg font-semibold text-white">Payment</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-neutral-400">Method</p>
                <p className="text-white uppercase">{order.payment_method}</p>
              </div>
              <div>
                <p className="text-neutral-400">Status</p>
                <span className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium border ${
                  order.payment_status === 'completed' 
                    ? 'border-green-500/20 text-green-500 bg-green-500/5' 
                    : order.payment_status === 'failed'
                    ? 'border-red-500/20 text-red-500 bg-red-500/5'
                    : order.payment_status === 'refunded'
                    ? 'border-purple-500/20 text-purple-500 bg-purple-500/5'
                    : 'border-yellow-500/20 text-yellow-500 bg-yellow-500/5'
                }`}>
                  {order.payment_status?.toUpperCase()}
                </span>
              </div>
              {order.payment_id && (
                <div>
                  <p className="text-neutral-400">Transaction ID</p>
                  <p className="font-mono text-xs text-neutral-500">{order.payment_id}</p>
                </div>
              )}
              {order.razorpay_order_id && (
                <div>
                  <p className="text-neutral-400">Razorpay Order ID</p>
                  <p className="font-mono text-xs text-neutral-500">{order.razorpay_order_id}</p>
                </div>
              )}
            </div>
          </div>

          {/* Tracking Information */}
          {order.tracking_number && (
            <div className="rounded-xl border border-neutral-800 bg-black p-6">
              <div className="mb-4 flex items-center gap-2">
                <Truck className="h-5 w-5 text-yellow-500" />
                <h2 className="text-lg font-semibold text-white">Tracking</h2>
              </div>
              <div className="space-y-2 text-sm">
                {order.courier_name && (
                  <div>
                    <p className="text-neutral-400">Courier</p>
                    <p className="text-white">{order.courier_name}</p>
                  </div>
                )}
                <div>
                  <p className="text-neutral-400">Tracking Number</p>
                  <p className="font-mono text-white">{order.tracking_number}</p>
                </div>
                {order.tracking_url && (
                  <a
                    href={order.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-yellow-500 hover:text-yellow-400"
                  >
                    Track Shipment →
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Order Timeline */}
          <div className="rounded-xl border border-neutral-800 bg-black p-6">
            <div className="mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <h2 className="text-lg font-semibold text-white">Timeline</h2>
            </div>
            <div className="space-y-4">
              {order.status_history.map((entry, index) => (
                <div key={index} className="relative pl-6">
                  {index !== order.status_history.length - 1 && (
                    <div className="absolute left-2 top-6 h-full w-px bg-neutral-800" />
                  )}
                  <div className="absolute left-0 top-1 h-4 w-4 rounded-full bg-yellow-500" />
                  <div>
                    <p className="font-medium text-white">
                      {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                    {entry.notes && (
                      <p className="mt-1 text-sm text-neutral-500">{entry.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
