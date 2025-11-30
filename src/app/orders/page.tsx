"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { orderService } from "@/lib/services/order-service";
import { Button } from "@/components/ui/button";
import { Loader2, Package, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Order } from "@/types/order-management";

const ORDERS_PER_PAGE = 10;

export default function OrdersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (!user) {
        router.push("/login");
        return;
      }
      
      await fetchOrders(user.id, 1);
    };

    checkUser();
  }, [router]);

  const fetchOrders = async (userId: string, page: number) => {
    try {
      setLoading(true);
      const result = await orderService.getOrders(
        { user_id: userId },
        { page, limit: ORDERS_PER_PAGE }
      );
      
      setOrders(result.orders);
      setTotalPages(result.totalPages);
      setTotal(result.total);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (user && newPage >= 1 && newPage <= totalPages) {
      fetchOrders(user.id, newPage);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-500",
      confirmed: "bg-blue-500/10 text-blue-500",
      processing: "bg-purple-500/10 text-purple-500",
      shipped: "bg-indigo-500/10 text-indigo-500",
      delivered: "bg-green-500/10 text-green-500",
      cancelled: "bg-red-500/10 text-red-500",
    };
    return colors[status] || "bg-neutral-500/10 text-neutral-500";
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Order History</h1>
        <p className="text-neutral-400">
          View and track all your orders
        </p>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-6">
          {/* Orders List */}
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 transition-all hover:border-yellow-500/50 hover:bg-neutral-900"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  {/* Order Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <p className="text-sm text-neutral-400">Order Number</p>
                        <p className="font-mono text-lg font-semibold text-white">
                          {order.order_number}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-400">Date</p>
                        <p className="text-white">
                          {new Date(order.created_at).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-400">Status</p>
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Items Preview */}
                    <div className="text-sm text-neutral-400">
                      {order.items && order.items.length > 0 ? (
                        <span>
                          {order.items.length} {order.items.length === 1 ? "item" : "items"}
                        </span>
                      ) : (
                        <span>No items</span>
                      )}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-neutral-400">Total</p>
                      <p className="text-2xl font-bold text-yellow-500">
                        ₹{order.total.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-neutral-600" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
              <div className="text-sm text-neutral-400">
                Showing {(currentPage - 1) * ORDERS_PER_PAGE + 1} to{" "}
                {Math.min(currentPage * ORDERS_PER_PAGE, total)} of {total} orders
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-neutral-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={page === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className={
                            page === currentPage
                              ? "bg-yellow-500 text-black hover:bg-yellow-400"
                              : "border-neutral-700"
                          }
                        >
                          {page}
                        </Button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="px-2 text-neutral-600">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border-neutral-700"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-neutral-800 p-12 text-center">
          <Package className="mx-auto h-16 w-16 text-neutral-600" />
          <h3 className="mt-4 text-xl font-medium text-white">No orders yet</h3>
          <p className="mt-2 text-neutral-400">
            When you place an order, it will appear here.
          </p>
          <Button
            className="mt-6 bg-yellow-500 text-black hover:bg-yellow-400"
            onClick={() => router.push("/products")}
          >
            Start Shopping
          </Button>
        </div>
      )}
    </div>
  );
}
