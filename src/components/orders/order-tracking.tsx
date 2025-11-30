"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Circle, ExternalLink, X, Loader2 } from "lucide-react";
import type { Order, OrderStatus } from "@/types/order-management";

interface OrderTrackingProps {
  order: Order;
  onOrderUpdate?: (order: Order) => void;
}

const statusSteps: { status: OrderStatus; label: string }[] = [
  { status: "pending", label: "Order Placed" },
  { status: "confirmed", label: "Confirmed" },
  { status: "processing", label: "Processing" },
  { status: "shipped", label: "Shipped" },
  { status: "delivered", label: "Delivered" },
];

export function OrderTracking({ order, onOrderUpdate }: OrderTrackingProps) {
  const [cancelling, setCancelling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const currentStatusIndex = statusSteps.findIndex((step) => step.status === order.status);
  const isCancelled = order.status === "cancelled";
  const canCancel = ["pending", "confirmed"].includes(order.status);

  const handleCancelOrder = async () => {
    try {
      setCancelling(true);
      
      const response = await fetch(`/api/orders/${order.id}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cancellation_reason: "Cancelled by customer",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel order");
      }

      const updatedOrder = await response.json();
      onOrderUpdate?.(updatedOrder);
      setShowCancelDialog(false);
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Failed to cancel order. Please try again or contact support.");
    } finally {
      setCancelling(false);
    }
  };

  const getStepStatus = (stepIndex: number) => {
    if (isCancelled) {
      return "cancelled";
    }
    if (stepIndex < currentStatusIndex) {
      return "completed";
    }
    if (stepIndex === currentStatusIndex) {
      return "current";
    }
    return "upcoming";
  };

  const getStatusTimestamp = (status: OrderStatus) => {
    const historyEntry = order.status_history.find((entry) => entry.status === status);
    return historyEntry?.timestamp;
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Order Tracking</h2>
        {canCancel && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCancelDialog(true)}
            className="border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-400"
          >
            Cancel Order
          </Button>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && (
        <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/10 p-4">
          <h3 className="font-semibold text-red-500 mb-2">Cancel Order?</h3>
          <p className="text-sm text-neutral-300 mb-4">
            Are you sure you want to cancel this order? This action cannot be undone. If payment was
            completed, a refund will be initiated.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {cancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Yes, Cancel Order"
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              disabled={cancelling}
              className="border-neutral-700"
            >
              No, Keep Order
            </Button>
          </div>
        </div>
      )}

      {/* Cancelled Status */}
      {isCancelled && (
        <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <X className="h-5 w-5 text-red-500" />
            <h3 className="font-semibold text-red-500">Order Cancelled</h3>
          </div>
          {order.cancellation_reason && (
            <p className="text-sm text-neutral-300">Reason: {order.cancellation_reason}</p>
          )}
          {order.cancelled_at && (
            <p className="text-sm text-neutral-400 mt-1">
              Cancelled on{" "}
              {new Date(order.cancelled_at).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
      )}

      {/* Progress Stepper */}
      {!isCancelled && (
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-neutral-800">
            <div
              className="bg-yellow-500 transition-all duration-500"
              style={{
                height: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%`,
              }}
            />
          </div>

          {/* Steps */}
          <div className="relative space-y-8">
            {statusSteps.map((step, index) => {
              const stepStatus = getStepStatus(index);
              const timestamp = getStatusTimestamp(step.status);

              return (
                <div key={step.status} className="flex items-start gap-4">
                  {/* Step Icon */}
                  <div className="relative z-10 flex-shrink-0">
                    {stepStatus === "completed" ? (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500">
                        <Check className="h-6 w-6 text-black" />
                      </div>
                    ) : stepStatus === "current" ? (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-yellow-500 bg-neutral-900">
                        <Circle className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-neutral-700 bg-neutral-900">
                        <Circle className="h-6 w-6 text-neutral-600" />
                      </div>
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 pt-2">
                    <h3
                      className={`font-semibold ${
                        stepStatus === "completed" || stepStatus === "current"
                          ? "text-white"
                          : "text-neutral-500"
                      }`}
                    >
                      {step.label}
                    </h3>
                    {timestamp && (
                      <p className="text-sm text-neutral-400 mt-1">
                        {new Date(timestamp).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                    {step.status === "shipped" && stepStatus === "current" && order.tracking_url && (
                      <a
                        href={order.tracking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-yellow-500 hover:text-yellow-400 mt-2"
                      >
                        Track Shipment
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Estimated Delivery */}
      {!isCancelled && order.estimated_delivery_date && (
        <div className="mt-6 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
          <p className="text-sm text-neutral-400">Estimated Delivery</p>
          <p className="font-semibold text-white">
            {new Date(order.estimated_delivery_date).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      )}
    </div>
  );
}
