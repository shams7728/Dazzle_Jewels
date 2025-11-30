import { Resend } from 'resend';
import { supabase } from '../supabase';
import type { Order, OrderStatus } from '@/types/order-management';
import {
  renderOrderConfirmationEmail,
  renderStatusUpdateEmail,
  renderShippingEmail,
  renderDeliveryEmail,
  renderCancellationEmail,
  renderAdminNewOrderEmail,
  renderAdminPriorityEmail,
  renderReportReadyEmail,
} from './email-templates';

/**
 * Notification types
 */
export type NotificationType =
  | 'order_confirmation'
  | 'status_update'
  | 'shipping'
  | 'delivery'
  | 'cancellation'
  | 'admin_new_order'
  | 'admin_priority'
  | 'report_ready';

/**
 * Notification log entry
 */
export interface NotificationLog {
  id?: string;
  order_id?: string;
  notification_type: NotificationType;
  recipient_email: string;
  subject: string;
  body?: string;
  status: 'pending' | 'sent' | 'failed';
  error_message?: string;
  retry_count: number;
  sent_at?: string;
  created_at?: string;
}

/**
 * Notification batch for preventing email flooding
 */
interface NotificationBatch {
  notifications: NotificationLog[];
  scheduledTime: number;
}

// Initialize Resend client
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * NotificationService - Handles email notifications
 * 
 * Features:
 * - Email template rendering
 * - Notification sending with retry logic (3 attempts)
 * - Notification logging
 * - Templates for all order events
 * - Batch processing to prevent email flooding
 */
export class NotificationService {
  private readonly MAX_RETRIES = 3;
  private readonly ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
  private readonly FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@dazzlejewelry.com';
  private readonly BATCH_WINDOW_MS = parseInt(process.env.NOTIFICATION_BATCH_WINDOW_MS || '60000', 10);
  private notificationBatches: Map<string, NotificationBatch> = new Map();

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(order: Order): Promise<void> {
    const subject = `Order Confirmation - ${order.order_number}`;
    const body = renderOrderConfirmationEmail(order);

    await this.sendNotification({
      order_id: order.id,
      notification_type: 'order_confirmation',
      recipient_email: this.getCustomerEmail(order),
      subject,
      body,
      status: 'pending',
      retry_count: 0,
    });
  }

  /**
   * Send order status update email
   */
  async sendStatusUpdate(order: Order, newStatus: OrderStatus): Promise<void> {
    const subject = `Order ${order.order_number} - Status Updated`;
    const body = renderStatusUpdateEmail(order, newStatus);

    await this.sendNotification({
      order_id: order.id,
      notification_type: 'status_update',
      recipient_email: this.getCustomerEmail(order),
      subject,
      body,
      status: 'pending',
      retry_count: 0,
    });
  }

  /**
   * Send shipping notification
   */
  async sendShippingNotification(order: Order): Promise<void> {
    const subject = `Order ${order.order_number} - Shipped`;
    const body = renderShippingEmail(order);

    await this.sendNotification({
      order_id: order.id,
      notification_type: 'shipping',
      recipient_email: this.getCustomerEmail(order),
      subject,
      body,
      status: 'pending',
      retry_count: 0,
    });
  }

  /**
   * Send delivery confirmation
   */
  async sendDeliveryConfirmation(order: Order): Promise<void> {
    const subject = `Order ${order.order_number} - Delivered`;
    const body = renderDeliveryEmail(order);

    await this.sendNotification({
      order_id: order.id,
      notification_type: 'delivery',
      recipient_email: this.getCustomerEmail(order),
      subject,
      body,
      status: 'pending',
      retry_count: 0,
    });
  }

  /**
   * Send cancellation confirmation
   */
  async sendCancellationConfirmation(order: Order): Promise<void> {
    const subject = `Order ${order.order_number} - Cancelled`;
    const body = renderCancellationEmail(order);

    await this.sendNotification({
      order_id: order.id,
      notification_type: 'cancellation',
      recipient_email: this.getCustomerEmail(order),
      subject,
      body,
      status: 'pending',
      retry_count: 0,
    });
  }

  /**
   * Send new order alert to admin (with batching)
   */
  async sendAdminNewOrderAlert(order: Order): Promise<void> {
    const subject = `New Order Received - ${order.order_number}`;
    const body = renderAdminNewOrderEmail(order);

    const notification: NotificationLog = {
      order_id: order.id,
      notification_type: 'admin_new_order',
      recipient_email: this.ADMIN_EMAIL,
      subject,
      body,
      status: 'pending',
      retry_count: 0,
    };

    // Add to batch instead of sending immediately
    await this.addToBatch('admin_new_order', notification);
  }

  /**
   * Send priority notification to admin
   */
  async sendAdminPriorityNotification(order: Order, reason: string): Promise<void> {
    const subject = `PRIORITY: Order ${order.order_number} Requires Attention`;
    const body = renderAdminPriorityEmail(order, reason);

    await this.sendNotification({
      order_id: order.id,
      notification_type: 'admin_priority',
      recipient_email: this.ADMIN_EMAIL,
      subject,
      body,
      status: 'pending',
      retry_count: 0,
    });
  }

  /**
   * Send report ready notification to admin
   */
  async sendReportReadyNotification(jobId: string, recipientEmail: string): Promise<void> {
    const subject = 'Your Report is Ready';
    const body = renderReportReadyEmail(jobId);

    await this.sendNotification({
      notification_type: 'report_ready',
      recipient_email: recipientEmail,
      subject,
      body,
      status: 'pending',
      retry_count: 0,
    });
  }

  /**
   * Add notification to batch
   * Batches notifications within a time window to prevent email flooding
   */
  private async addToBatch(batchKey: string, notification: NotificationLog): Promise<void> {
    const existingBatch = this.notificationBatches.get(batchKey);

    if (existingBatch) {
      // Add to existing batch
      existingBatch.notifications.push(notification);
      console.log(`[BATCH] Added notification to existing batch. Total: ${existingBatch.notifications.length}`);
    } else {
      // Create new batch
      const newBatch: NotificationBatch = {
        notifications: [notification],
        scheduledTime: Date.now() + this.BATCH_WINDOW_MS,
      };
      this.notificationBatches.set(batchKey, newBatch);
      console.log(`[BATCH] Created new batch. Scheduled for ${new Date(newBatch.scheduledTime).toISOString()}`);

      // Schedule batch processing
      setTimeout(() => {
        this.processBatch(batchKey);
      }, this.BATCH_WINDOW_MS);
    }
  }

  /**
   * Process a batch of notifications
   * Sends either individual notifications or a combined batch email
   */
  private async processBatch(batchKey: string): Promise<void> {
    const batch = this.notificationBatches.get(batchKey);
    
    if (!batch) {
      console.log(`[BATCH] No batch found for key: ${batchKey}`);
      return;
    }

    // Remove batch from map
    this.notificationBatches.delete(batchKey);

    const notificationCount = batch.notifications.length;
    console.log(`[BATCH] Processing batch with ${notificationCount} notification(s)`);

    if (notificationCount === 0) {
      return;
    }

    if (notificationCount === 1) {
      // Single notification - send normally
      await this.sendNotification(batch.notifications[0]);
    } else {
      // Multiple notifications - send combined batch email
      await this.sendBatchedNotification(batch.notifications);
    }
  }

  /**
   * Send a batched notification email combining multiple orders
   */
  private async sendBatchedNotification(notifications: NotificationLog[]): Promise<void> {
    const orderCount = notifications.length;
    const subject = `${orderCount} New Orders Received`;
    
    // Create combined email body
    const body = this.renderBatchedAdminEmail(notifications);

    // Create a single notification log entry for the batch
    const batchNotification: NotificationLog = {
      notification_type: 'admin_new_order',
      recipient_email: this.ADMIN_EMAIL,
      subject,
      body,
      status: 'pending',
      retry_count: 0,
    };

    // Send the batched notification
    await this.sendNotification(batchNotification);

    // Also log individual notifications for tracking
    for (const notification of notifications) {
      await supabase
        .from('notification_log')
        .insert({
          ...notification,
          status: 'sent',
          sent_at: new Date().toISOString(),
        });
    }
  }

  /**
   * Render batched admin email template
   */
  private renderBatchedAdminEmail(notifications: NotificationLog[]): string {
    const orderCount = notifications.length;
    const BRAND_NAME = 'Dazzle Jewelry';
    const BRAND_COLOR = '#FBBF24';

    // Extract order information from notification bodies
    const orderSummaries = notifications.map((notif, index) => {
      return `
        <div style="background-color: #f9f9f9; border-left: 4px solid ${BRAND_COLOR}; padding: 15px; margin: 10px 0;">
          <p><strong>Order ${index + 1}</strong></p>
          <p style="margin: 5px 0; font-size: 14px; color: #666;">
            ${notif.subject.replace('New Order Received - ', '')}
          </p>
        </div>
      `;
    }).join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${BRAND_NAME}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <div style="text-align: center; border-bottom: 3px solid ${BRAND_COLOR}; padding-bottom: 20px; margin-bottom: 30px;">
      <h1 style="color: ${BRAND_COLOR}; margin: 0; font-size: 28px;">${BRAND_NAME} Admin</h1>
      <p style="margin: 10px 0 0 0; color: #666;">Multiple New Orders Alert</p>
    </div>
    <div style="margin-bottom: 30px;">
      <h2>🔔 ${orderCount} New Orders Received</h2>
      <p>Multiple orders have been placed within a short time period:</p>
      ${orderSummaries}
      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/orders" style="display: inline-block; background-color: ${BRAND_COLOR}; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">View All Orders</a>
      </div>
    </div>
    <div style="text-align: center; color: #666; font-size: 14px; border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;">
      <p>Thank you for managing ${BRAND_NAME}</p>
      <p>&copy; ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Send notification with retry logic
   */
  private async sendNotification(notification: NotificationLog): Promise<void> {
    // Log notification to database
    const { data: logEntry, error: logError } = await supabase
      .from('notification_log')
      .insert(notification)
      .select()
      .single();

    if (logError) {
      console.error('Failed to log notification:', logError);
      return;
    }

    // Attempt to send with retries
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < this.MAX_RETRIES) {
      try {
        await this.sendEmail(
          notification.recipient_email,
          notification.subject,
          notification.body || ''
        );

        // Mark as sent
        await supabase
          .from('notification_log')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
          })
          .eq('id', logEntry.id);

        return; // Success
      } catch (error) {
        lastError = error as Error;
        attempt++;

        // Update retry count
        await supabase
          .from('notification_log')
          .update({
            retry_count: attempt,
            error_message: lastError.message,
          })
          .eq('id', logEntry.id);

        // Wait before retry (exponential backoff)
        if (attempt < this.MAX_RETRIES) {
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }

    // All retries failed
    await supabase
      .from('notification_log')
      .update({
        status: 'failed',
        error_message: lastError?.message || 'Unknown error',
      })
      .eq('id', logEntry.id);

    console.error(`Failed to send notification after ${this.MAX_RETRIES} attempts:`, lastError);
  }

  /**
   * Send email using Resend API
   */
  private async sendEmail(to: string, subject: string, body: string): Promise<void> {
    // Check if Resend is configured
    if (!resend) {
      console.warn('[EMAIL] Resend API key not configured. Email not sent.');
      console.log(`[EMAIL] To: ${to}, Subject: ${subject}`);
      
      // In development mode without Resend, just log and return
      if (process.env.NODE_ENV === 'development') {
        return Promise.resolve();
      }
      
      throw new Error('Resend API key not configured');
    }

    try {
      // Send email using Resend
      const { data, error } = await resend.emails.send({
        from: this.FROM_EMAIL,
        to: [to],
        subject,
        html: body,
      });

      if (error) {
        throw new Error(`Resend API error: ${error.message}`);
      }

      console.log(`[EMAIL] Sent successfully to ${to}. Email ID: ${data?.id}`);
    } catch (error) {
      console.error('[EMAIL] Failed to send email:', error);
      throw error;
    }
  }

  /**
   * Delay helper for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get customer email from order
   */
  private getCustomerEmail(order: Order): string {
    // In production, fetch from user profile
    // For now, use shipping address email or placeholder
    return order.shipping_address?.name?.includes('@')
      ? order.shipping_address.name
      : 'customer@example.com';
  }

  /**
   * Flush all pending batches immediately
   * Useful for testing or graceful shutdown
   */
  async flushBatches(): Promise<void> {
    console.log(`[BATCH] Flushing ${this.notificationBatches.size} pending batch(es)`);
    
    const batchKeys = Array.from(this.notificationBatches.keys());
    
    for (const key of batchKeys) {
      await this.processBatch(key);
    }
  }

  /**
   * Get current batch status (for monitoring/debugging)
   */
  getBatchStatus(): { batchKey: string; count: number; scheduledTime: Date }[] {
    const status: { batchKey: string; count: number; scheduledTime: Date }[] = [];
    
    this.notificationBatches.forEach((batch, key) => {
      status.push({
        batchKey: key,
        count: batch.notifications.length,
        scheduledTime: new Date(batch.scheduledTime),
      });
    });
    
    return status;
  }

}

// Export singleton instance
export const notificationService = new NotificationService();
