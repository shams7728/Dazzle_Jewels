// Order Management System Types

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 
  | 'pending'
  | 'completed'
  | 'failed'
  | 'refunded';

export type PaymentMethod = 'razorpay' | 'cod';

export interface ShippingAddress {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: string;
  updated_by: string;
  notes?: string;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  variant_id?: string;
  variant_name?: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  
  // Items
  items?: OrderItem[];
  
  // Pricing
  subtotal: number;
  discount: number;
  coupon_code?: string;
  delivery_charge: number;
  tax: number;
  total: number;
  
  // Shipping
  shipping_address: ShippingAddress;
  delivery_pincode: string;
  estimated_delivery_date?: string;
  
  // Payment
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_id?: string;
  razorpay_order_id?: string;
  
  // Status
  status: OrderStatus;
  status_history: StatusHistoryEntry[];
  
  // Tracking
  tracking_number?: string;
  tracking_url?: string;
  courier_name?: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  version?: number; // For optimistic locking
}

export interface CreateOrderInput {
  user_id: string;
  items: Omit<OrderItem, 'id' | 'order_id'>[];
  subtotal: number;
  discount: number;
  coupon_code?: string;
  delivery_charge: number;
  tax: number;
  total: number;
  shipping_address: ShippingAddress;
  delivery_pincode: string;
  payment_method: PaymentMethod;
  payment_id?: string;
  razorpay_order_id?: string;
  estimated_delivery_date?: string;
}

export interface OrderFilters {
  status?: OrderStatus[];
  payment_status?: PaymentStatus[];
  dateFrom?: Date;
  dateTo?: Date;
  searchQuery?: string;
  user_id?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedOrders {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateOrderStatusInput {
  order_id: string;
  new_status: OrderStatus;
  updated_by: string;
  notes?: string;
  tracking_number?: string;
  tracking_url?: string;
  courier_name?: string;
  expected_version?: number; // For optimistic locking
}

export interface CancelOrderInput {
  order_id: string;
  user_id: string;
  cancellation_reason?: string;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value?: number;
  max_discount?: number;
  usage_limit?: number;
  usage_count: number;
  per_user_limit?: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
  created_by?: string;
}

export interface DeliverySettings {
  id: string;
  business_pincode: string;
  business_city: string;
  business_state: string;
  business_latitude: number;
  business_longitude: number;
  local_delivery_charge: number;
  city_delivery_charge: number;
  state_delivery_charge: number;
  national_delivery_charge: number;
  free_shipping_threshold: number;
  free_shipping_enabled: boolean;
  updated_at: string;
  updated_by?: string;
}

export interface ReportFilters {
  dateFrom?: Date;
  dateTo?: Date;
  status?: OrderStatus[];
  product_id?: string;
}

export interface OrderStatusBreakdown {
  status: OrderStatus;
  count: number;
  total_revenue: number;
}

export interface ReportMetrics {
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  status_breakdown: OrderStatusBreakdown[];
}

export type ReportJobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ReportJob {
  id: string;
  user_id: string;
  status: ReportJobStatus;
  filters: ReportFilters;
  result?: ReportMetrics;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}
