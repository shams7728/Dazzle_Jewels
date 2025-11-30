"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Check, X } from "lucide-react";
import { orderService } from "@/lib/services/order-service";
import type { Order, OrderStatus } from "@/types/order-management";

interface OrderStatusUpdateProps {
  orderId: string;
  currentStatus: OrderStatus;
  currentVersion?: number;
  onStatusUpdated: (updatedOrder: Order) => void;
  onConflict?: () => void; // Callback when version conflict occurs
}

// Define valid status transitions
const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

export default function OrderStatusUpdate({
  orderId,
  currentStatus,
  currentVersion,
  onStatusUpdated,
  onConflict,
}: OrderStatusUpdateProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  
  // Tracking info for shipped status
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [courierName, setCourierName] = useState('');
  const [notes, setNotes] = useState('');

  const availableStatuses = STATUS_TRANSITIONS[currentStatus] || [];

  const handleStatusChange = (newStatus: OrderStatus) => {
    setSelectedStatus(newStatus);
    setShowConfirmation(true);
    setError(null);
    setSuccess(false);
  };

  const handleConfirm = async () => {
    if (!selectedStatus) return;

    setLoading(true);
    setError(null);
    setShowConflictDialog(false);

    try {
      // Get current user ID (in a real app, this would come from auth context)
      const userId = 'admin'; // TODO: Replace with actual admin user ID from auth

      const updateData: any = {
        order_id: orderId,
        new_status: selectedStatus,
        updated_by: userId,
        notes: notes || undefined,
        expected_version: currentVersion, // Include version for optimistic locking
      };

      // Add tracking info if status is shipped
      if (selectedStatus === 'shipped') {
        if (!trackingNumber) {
          setError('Tracking number is required when marking as shipped');
          setLoading(false);
          return;
        }
        updateData.tracking_number = trackingNumber;
        updateData.tracking_url = trackingUrl || undefined;
        updateData.courier_name = courierName || undefined;
      }

      const updatedOrder = await orderService.updateOrderStatus(updateData);
      
      setSuccess(true);
      setShowConfirmation(false);
      setSelectedStatus('');
      setTrackingNumber('');
      setTrackingUrl('');
      setCourierName('');
      setNotes('');
      
      onStatusUpdated(updatedOrder);

      // Show success message briefly
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error updating status:', err);
      
      // Check if it's a version conflict error
      if (err.message && err.message.startsWith('CONFLICT:')) {
        setShowConflictDialog(true);
        setError(null); // Clear regular error
      } else {
        setError(err.message || 'Failed to update order status');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReloadOrder = () => {
    setShowConflictDialog(false);
    setShowConfirmation(false);
    setSelectedStatus('');
    setTrackingNumber('');
    setTrackingUrl('');
    setCourierName('');
    setNotes('');
    
    // Notify parent to reload order
    if (onConflict) {
      onConflict();
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setSelectedStatus('');
    setTrackingNumber('');
    setTrackingUrl('');
    setCourierName('');
    setNotes('');
    setError(null);
  };

  if (availableStatuses.length === 0) {
    return (
      <div className="text-sm text-neutral-500">
        No status updates available for {currentStatus} orders.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Selection */}
      {!showConfirmation && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-300">
            Update Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
            className="w-full rounded-lg bg-neutral-900 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            disabled={loading}
          >
            <option value="">Select new status...</option>
            {availableStatuses.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="space-y-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
          <div>
            <h3 className="font-medium text-white">
              Confirm Status Update
            </h3>
            <p className="text-sm text-neutral-400">
              Change status from <span className="font-medium text-white">{currentStatus}</span> to{' '}
              <span className="font-medium text-white">{selectedStatus}</span>?
            </p>
          </div>

          {/* Tracking Info for Shipped Status */}
          {selectedStatus === 'shipped' && (
            <div className="space-y-3 border-t border-neutral-800 pt-3">
              <div>
                <label className="text-sm font-medium text-neutral-300">
                  Tracking Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  className="mt-1 w-full rounded-lg bg-neutral-900 px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-300">
                  Courier Name
                </label>
                <input
                  type="text"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder="e.g., FedEx, DHL, Blue Dart"
                  className="mt-1 w-full rounded-lg bg-neutral-900 px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-300">
                  Tracking URL
                </label>
                <input
                  type="url"
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  placeholder="https://..."
                  className="mt-1 w-full rounded-lg bg-neutral-900 px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-neutral-300">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this status change..."
              rows={3}
              className="mt-1 w-full rounded-lg bg-neutral-900 px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
              <X className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 bg-yellow-500 text-black hover:bg-yellow-400"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Confirm
                </>
              )}
            </Button>
            <Button
              onClick={handleCancel}
              disabled={loading}
              variant="outline"
              className="flex-1 border-neutral-700 text-neutral-300 hover:bg-neutral-800"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-3 text-sm text-green-500">
          <Check className="h-4 w-4" />
          Status updated successfully!
        </div>
      )}

      {/* Conflict Dialog */}
      {showConflictDialog && (
        <div className="space-y-4 rounded-lg border border-orange-500/20 bg-orange-500/5 p-4">
          <div>
            <h3 className="font-medium text-orange-500">
              ⚠️ Order Modified by Another User
            </h3>
            <p className="mt-2 text-sm text-neutral-400">
              This order has been modified by another administrator while you were making changes. 
              Your update was not applied to prevent overwriting their changes.
            </p>
            <p className="mt-2 text-sm text-neutral-300">
              Please reload the order to see the latest changes, then try your update again.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleReloadOrder}
              className="flex-1 bg-orange-500 text-black hover:bg-orange-400"
            >
              Reload Order
            </Button>
            <Button
              onClick={() => setShowConflictDialog(false)}
              variant="outline"
              className="flex-1 border-neutral-700 text-neutral-300 hover:bg-neutral-800"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
