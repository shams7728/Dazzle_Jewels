/**
 * Email Template Preview Generator
 * 
 * This script generates HTML previews of all email templates
 * for visual inspection and testing.
 * 
 * Run: npx tsx src/lib/services/__tests__/email-template-preview.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  renderOrderConfirmationEmail,
  renderStatusUpdateEmail,
  renderShippingEmail,
  renderDeliveryEmail,
  renderCancellationEmail,
  renderAdminNewOrderEmail,
  renderAdminPriorityEmail,
} from '../email-templates';
import type { Order } from '@/types/order-management';

// Sample order for preview
const sampleOrder: Order = {
  id: 'preview-order-id',
  order_number: 'ORD-2024-000123',
  user_id: 'preview-user-id',
  items: [
    {
      id: 'item-1',
      order_id: 'preview-order-id',
      product_id: 'product-1',
      product_name: 'Elegant Gold Necklace',
      product_image: 'https://example.com/necklace.jpg',
      variant_name: '18K Gold, 16 inches',
      quantity: 1,
      price: 12500,
      subtotal: 12500,
    },
    {
      id: 'item-2',
      order_id: 'preview-order-id',
      product_id: 'product-2',
      product_name: 'Diamond Stud Earrings',
      product_image: 'https://example.com/earrings.jpg',
      variant_name: '0.5 Carat',
      quantity: 2,
      price: 8500,
      subtotal: 17000,
    },
    {
      id: 'item-3',
      order_id: 'preview-order-id',
      product_id: 'product-3',
      product_name: 'Silver Bracelet',
      product_image: 'https://example.com/bracelet.jpg',
      quantity: 1,
      price: 3500,
      subtotal: 3500,
    },
  ],
  subtotal: 33000,
  discount: 3300,
  coupon_code: 'SAVE10',
  delivery_charge: 100,
  tax: 2970,
  total: 32770,
  shipping_address: {
    name: 'Priya Sharma',
    phone: '+91 98765 43210',
    street: '42, MG Road, Andheri West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400058',
    country: 'India',
    latitude: 19.1334,
    longitude: 72.8291,
  },
  delivery_pincode: '400058',
  estimated_delivery_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  payment_method: 'razorpay',
  payment_status: 'completed',
  payment_id: 'pay_MxYz123456789',
  razorpay_order_id: 'order_MxYz987654321',
  status: 'confirmed',
  status_history: [
    {
      status: 'pending',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      updated_by: 'system',
    },
    {
      status: 'confirmed',
      timestamp: new Date().toISOString(),
      updated_by: 'system',
    },
  ],
  tracking_number: 'BLUEDART123456789',
  tracking_url: 'https://www.bluedart.com/tracking?awb=123456789',
  courier_name: 'Blue Dart Express',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Generate previews
function generatePreviews() {
  const outputDir = path.join(process.cwd(), 'email-previews');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('📧 Generating email template previews...\n');

  // 1. Order Confirmation
  const confirmationHtml = renderOrderConfirmationEmail(sampleOrder);
  fs.writeFileSync(
    path.join(outputDir, '1-order-confirmation.html'),
    confirmationHtml
  );
  console.log('✅ Generated: 1-order-confirmation.html');

  // 2. Status Update (Processing)
  const statusUpdateHtml = renderStatusUpdateEmail(sampleOrder, 'processing');
  fs.writeFileSync(
    path.join(outputDir, '2-status-update-processing.html'),
    statusUpdateHtml
  );
  console.log('✅ Generated: 2-status-update-processing.html');

  // 3. Shipping Notification
  const shippingHtml = renderShippingEmail(sampleOrder);
  fs.writeFileSync(
    path.join(outputDir, '3-shipping-notification.html'),
    shippingHtml
  );
  console.log('✅ Generated: 3-shipping-notification.html');

  // 4. Delivery Confirmation
  const deliveryHtml = renderDeliveryEmail(sampleOrder);
  fs.writeFileSync(
    path.join(outputDir, '4-delivery-confirmation.html'),
    deliveryHtml
  );
  console.log('✅ Generated: 4-delivery-confirmation.html');

  // 5. Cancellation Confirmation
  const cancelledOrder = {
    ...sampleOrder,
    status: 'cancelled' as const,
    cancellation_reason: 'Customer requested cancellation due to change in plans',
    cancelled_at: new Date().toISOString(),
  };
  const cancellationHtml = renderCancellationEmail(cancelledOrder);
  fs.writeFileSync(
    path.join(outputDir, '5-cancellation-confirmation.html'),
    cancellationHtml
  );
  console.log('✅ Generated: 5-cancellation-confirmation.html');

  // 6. Admin New Order Alert
  const adminNewOrderHtml = renderAdminNewOrderEmail(sampleOrder);
  fs.writeFileSync(
    path.join(outputDir, '6-admin-new-order-alert.html'),
    adminNewOrderHtml
  );
  console.log('✅ Generated: 6-admin-new-order-alert.html');

  // 7. Admin Priority Notification
  const adminPriorityHtml = renderAdminPriorityEmail(
    sampleOrder,
    'Payment gateway timeout - manual verification required'
  );
  fs.writeFileSync(
    path.join(outputDir, '7-admin-priority-notification.html'),
    adminPriorityHtml
  );
  console.log('✅ Generated: 7-admin-priority-notification.html');

  console.log(`\n✨ All email previews generated in: ${outputDir}`);
  console.log('📂 Open the HTML files in your browser to preview the emails\n');
}

// Run if executed directly
if (require.main === module) {
  generatePreviews();
}

export { generatePreviews };
