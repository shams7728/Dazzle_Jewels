import type { Order, OrderStatus } from '@/types/order-management';

/**
 * Email template utilities
 */

const BRAND_NAME = 'Dazzle Jewelry';
const BRAND_COLOR = '#FBBF24'; // Yellow accent
const SUPPORT_EMAIL = 'support@dazzlejewelry.com';

/**
 * Base email template wrapper
 */
function wrapTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${BRAND_NAME}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 3px solid ${BRAND_COLOR};
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: ${BRAND_COLOR};
      margin: 0;
      font-size: 28px;
    }
    .content {
      margin-bottom: 30px;
    }
    .order-details {
      background-color: #f9f9f9;
      border-left: 4px solid ${BRAND_COLOR};
      padding: 15px;
      margin: 20px 0;
    }
    .order-details p {
      margin: 8px 0;
    }
    .button {
      display: inline-block;
      background-color: ${BRAND_COLOR};
      color: #000;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      color: #666;
      font-size: 14px;
      border-top: 1px solid #ddd;
      padding-top: 20px;
      margin-top: 30px;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .items-table th,
    .items-table td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    .items-table th {
      background-color: #f5f5f5;
      font-weight: bold;
    }
    .total-row {
      font-weight: bold;
      font-size: 18px;
      color: ${BRAND_COLOR};
    }
  </style>
</head>
<body>
  <div class="container">
    ${content}
    <div class="footer">
      <p>Thank you for shopping with ${BRAND_NAME}</p>
      <p>If you have any questions, contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
      <p>&copy; ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Format currency
 */
function formatCurrency(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

/**
 * Format date
 */
function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Order confirmation email template
 */
export function renderOrderConfirmationEmail(order: Order): string {
  const itemsHtml = order.items?.map(item => `
    <tr>
      <td>${item.product_name}${item.variant_name ? ` (${item.variant_name})` : ''}</td>
      <td>${item.quantity}</td>
      <td>${formatCurrency(item.price)}</td>
      <td>${formatCurrency(item.subtotal)}</td>
    </tr>
  `).join('') || '';

  const content = `
    <div class="header">
      <h1>${BRAND_NAME}</h1>
      <p style="margin: 10px 0 0 0; color: #666;">Order Confirmation</p>
    </div>
    <div class="content">
      <h2>Thank you for your order!</h2>
      <p>We've received your order and will process it shortly.</p>
      
      <div class="order-details">
        <p><strong>Order Number:</strong> ${order.order_number}</p>
        <p><strong>Order Date:</strong> ${formatDate(order.created_at)}</p>
        <p><strong>Payment Status:</strong> ${order.payment_status}</p>
      </div>

      <h3>Order Items</h3>
      <table class="items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="order-details">
        <p>Subtotal: ${formatCurrency(order.subtotal)}</p>
        ${order.discount > 0 ? `<p>Discount${order.coupon_code ? ` (${order.coupon_code})` : ''}: -${formatCurrency(order.discount)}</p>` : ''}
        <p>Delivery Charges: ${formatCurrency(order.delivery_charge)}</p>
        <p>Tax: ${formatCurrency(order.tax)}</p>
        <p class="total-row">Total: ${formatCurrency(order.total)}</p>
      </div>

      <h3>Shipping Address</h3>
      <div class="order-details">
        <p>${order.shipping_address.name}</p>
        <p>${order.shipping_address.phone}</p>
        <p>${order.shipping_address.street}</p>
        <p>${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.pincode}</p>
      </div>

      <p>We'll send you updates as your order progresses.</p>
    </div>
  `;

  return wrapTemplate(content);
}

/**
 * Status update email template
 */
export function renderStatusUpdateEmail(order: Order, newStatus: OrderStatus): string {
  const statusMessages: Record<OrderStatus, string> = {
    pending: 'Your order is pending confirmation.',
    confirmed: 'Your order has been confirmed and will be processed soon.',
    processing: 'Your order is being prepared for shipment.',
    shipped: 'Your order has been shipped!',
    delivered: 'Your order has been delivered.',
    cancelled: 'Your order has been cancelled.',
  };

  const content = `
    <div class="header">
      <h1>${BRAND_NAME}</h1>
      <p style="margin: 10px 0 0 0; color: #666;">Order Status Update</p>
    </div>
    <div class="content">
      <h2>Order Status: ${newStatus.toUpperCase()}</h2>
      <p>${statusMessages[newStatus]}</p>
      
      <div class="order-details">
        <p><strong>Order Number:</strong> ${order.order_number}</p>
        <p><strong>Order Date:</strong> ${formatDate(order.created_at)}</p>
        <p><strong>Total:</strong> ${formatCurrency(order.total)}</p>
      </div>

      <p>You can track your order status anytime by visiting your order history.</p>
    </div>
  `;

  return wrapTemplate(content);
}

/**
 * Shipping notification email template
 */
export function renderShippingEmail(order: Order): string {
  const content = `
    <div class="header">
      <h1>${BRAND_NAME}</h1>
      <p style="margin: 10px 0 0 0; color: #666;">Order Shipped</p>
    </div>
    <div class="content">
      <h2>Your order is on its way! 🚚</h2>
      <p>Great news! Your order has been shipped and is on its way to you.</p>
      
      <div class="order-details">
        <p><strong>Order Number:</strong> ${order.order_number}</p>
        <p><strong>Total:</strong> ${formatCurrency(order.total)}</p>
        ${order.tracking_number ? `<p><strong>Tracking Number:</strong> ${order.tracking_number}</p>` : ''}
        ${order.courier_name ? `<p><strong>Courier:</strong> ${order.courier_name}</p>` : ''}
        ${order.estimated_delivery_date ? `<p><strong>Estimated Delivery:</strong> ${formatDate(order.estimated_delivery_date)}</p>` : ''}
      </div>

      ${order.tracking_url ? `
        <div style="text-align: center;">
          <a href="${order.tracking_url}" class="button">Track Your Order</a>
        </div>
      ` : ''}

      <p>You'll receive another email once your order is delivered.</p>
    </div>
  `;

  return wrapTemplate(content);
}

/**
 * Delivery confirmation email template
 */
export function renderDeliveryEmail(order: Order): string {
  const content = `
    <div class="header">
      <h1>${BRAND_NAME}</h1>
      <p style="margin: 10px 0 0 0; color: #666;">Order Delivered</p>
    </div>
    <div class="content">
      <h2>Your order has been delivered! 🎉</h2>
      <p>We hope you love your purchase!</p>
      
      <div class="order-details">
        <p><strong>Order Number:</strong> ${order.order_number}</p>
        <p><strong>Total:</strong> ${formatCurrency(order.total)}</p>
      </div>

      <p>If you have any issues with your order, please don't hesitate to contact us.</p>
      <p>We'd love to hear your feedback about your shopping experience!</p>
    </div>
  `;

  return wrapTemplate(content);
}

/**
 * Cancellation confirmation email template
 */
export function renderCancellationEmail(order: Order): string {
  const content = `
    <div class="header">
      <h1>${BRAND_NAME}</h1>
      <p style="margin: 10px 0 0 0; color: #666;">Order Cancelled</p>
    </div>
    <div class="content">
      <h2>Order Cancellation Confirmed</h2>
      <p>Your order has been successfully cancelled.</p>
      
      <div class="order-details">
        <p><strong>Order Number:</strong> ${order.order_number}</p>
        <p><strong>Total:</strong> ${formatCurrency(order.total)}</p>
        ${order.cancellation_reason ? `<p><strong>Reason:</strong> ${order.cancellation_reason}</p>` : ''}
      </div>

      ${order.payment_status === 'completed' ? `
        <p>A refund of ${formatCurrency(order.total)} will be processed to your original payment method within 5-7 business days.</p>
      ` : ''}

      <p>If you have any questions about this cancellation, please contact our support team.</p>
    </div>
  `;

  return wrapTemplate(content);
}

/**
 * Admin new order alert email template
 */
export function renderAdminNewOrderEmail(order: Order): string {
  const itemsHtml = order.items?.map(item => `
    <tr>
      <td>${item.product_name}${item.variant_name ? ` (${item.variant_name})` : ''}</td>
      <td>${item.quantity}</td>
      <td>${formatCurrency(item.subtotal)}</td>
    </tr>
  `).join('') || '';

  const content = `
    <div class="header">
      <h1>${BRAND_NAME} Admin</h1>
      <p style="margin: 10px 0 0 0; color: #666;">New Order Alert</p>
    </div>
    <div class="content">
      <h2>🔔 New Order Received</h2>
      
      <div class="order-details">
        <p><strong>Order Number:</strong> ${order.order_number}</p>
        <p><strong>Order Date:</strong> ${formatDate(order.created_at)}</p>
        <p><strong>Customer:</strong> ${order.shipping_address.name}</p>
        <p><strong>Phone:</strong> ${order.shipping_address.phone}</p>
        <p><strong>Total:</strong> ${formatCurrency(order.total)}</p>
        <p><strong>Payment Status:</strong> ${order.payment_status}</p>
      </div>

      <h3>Order Items (${order.items?.length || 0} items)</h3>
      <table class="items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <h3>Shipping Address</h3>
      <div class="order-details">
        <p>${order.shipping_address.street}</p>
        <p>${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.pincode}</p>
      </div>

      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/orders/${order.id}" class="button">View Order Details</a>
      </div>
    </div>
  `;

  return wrapTemplate(content);
}

/**
 * Admin priority notification email template
 */
export function renderAdminPriorityEmail(order: Order, reason: string): string {
  const content = `
    <div class="header" style="border-bottom-color: #EF4444;">
      <h1 style="color: #EF4444;">${BRAND_NAME} Admin</h1>
      <p style="margin: 10px 0 0 0; color: #EF4444; font-weight: bold;">⚠️ PRIORITY ALERT</p>
    </div>
    <div class="content">
      <h2 style="color: #EF4444;">Order Requires Immediate Attention</h2>
      
      <div class="order-details" style="border-left-color: #EF4444; background-color: #FEE2E2;">
        <p><strong>Reason:</strong> ${reason}</p>
      </div>

      <div class="order-details">
        <p><strong>Order Number:</strong> ${order.order_number}</p>
        <p><strong>Customer:</strong> ${order.shipping_address.name}</p>
        <p><strong>Phone:</strong> ${order.shipping_address.phone}</p>
        <p><strong>Total:</strong> ${formatCurrency(order.total)}</p>
        <p><strong>Status:</strong> ${order.status}</p>
      </div>

      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/orders/${order.id}" class="button" style="background-color: #EF4444; color: white;">View Order Now</a>
      </div>

      <p style="color: #EF4444; font-weight: bold;">Please address this issue as soon as possible.</p>
    </div>
  `;

  return wrapTemplate(content);
}

/**
 * Report ready notification email template
 */
export function renderReportReadyEmail(jobId: string): string {
  const content = `
    <div class="header">
      <h1>${BRAND_NAME} Admin</h1>
      <p style="margin: 10px 0 0 0; color: #666;">Report Ready</p>
    </div>
    <div class="content">
      <h2>📊 Your Report is Ready</h2>
      <p>The report you requested has been generated and is ready to view.</p>
      
      <div class="order-details">
        <p><strong>Job ID:</strong> ${jobId}</p>
        <p><strong>Generated:</strong> ${formatDate(new Date())}</p>
      </div>

      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/reports?jobId=${jobId}" class="button">View Report</a>
      </div>

      <p>The report will be available for 30 days before being automatically deleted.</p>
    </div>
  `;

  return wrapTemplate(content);
}
