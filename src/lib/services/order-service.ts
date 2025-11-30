import { supabase } from '../supabase';
import type {
  Order,
  OrderItem,
  CreateOrderInput,
  OrderFilters,
  PaginationParams,
  PaginatedOrders,
  UpdateOrderStatusInput,
  CancelOrderInput,
  OrderStatus,
  StatusHistoryEntry,
} from '@/types/order-management';

/**
 * OrderService - Handles all order management operations
 * 
 * Features:
 * - Order creation with validation
 * - Order retrieval with filtering and pagination
 * - Order status updates with audit trail
 * - Order cancellation with refund logic
 */
export class OrderService {
  /**
   * Create a new order
   * Validates input, generates order number, and stores order with items
   */
  async createOrder(input: CreateOrderInput): Promise<Order> {
    // Validate input
    this.validateCreateOrderInput(input);

    // Generate unique order number
    const { data: orderNumberData, error: orderNumberError } = await supabase
      .rpc('generate_order_number');

    if (orderNumberError) {
      throw new Error(`Failed to generate order number: ${orderNumberError.message}`);
    }

    const order_number = orderNumberData as string;

    // Initialize status history
    const status_history: StatusHistoryEntry[] = [{
      status: 'pending',
      timestamp: new Date().toISOString(),
      updated_by: input.user_id,
      notes: 'Order created'
    }];

    // Create order record
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number,
        user_id: input.user_id,
        subtotal: input.subtotal,
        discount: input.discount,
        coupon_code: input.coupon_code,
        delivery_charge: input.delivery_charge,
        tax: input.tax,
        total: input.total,
        shipping_address: input.shipping_address,
        delivery_pincode: input.delivery_pincode,
        estimated_delivery_date: input.estimated_delivery_date,
        payment_method: input.payment_method,
        payment_status: input.payment_id ? 'completed' : 'pending',
        payment_id: input.payment_id,
        razorpay_order_id: input.razorpay_order_id,
        status: input.payment_id ? 'confirmed' : 'pending',
        status_history,
      })
      .select()
      .single();

    if (orderError) {
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    // Create order items
    const orderItems = input.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_image: item.product_image,
      variant_id: item.variant_id,
      variant_name: item.variant_name,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.subtotal,
    }));

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select();

    if (itemsError) {
      // Rollback: delete the order if items creation fails
      await supabase.from('orders').delete().eq('id', order.id);
      throw new Error(`Failed to create order items: ${itemsError.message}`);
    }

    return {
      ...order,
      items,
    };
  }

  /**
   * Get orders with filtering and pagination
   */
  async getOrders(
    filters: OrderFilters = {},
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<PaginatedOrders> {
    let query = supabase
      .from('orders')
      .select('*, order_items(*)', { count: 'exact' });

    // Apply filters
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }

    if (filters.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }

    if (filters.payment_status && filters.payment_status.length > 0) {
      query = query.in('payment_status', filters.payment_status);
    }

    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom.toISOString());
    }

    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo.toISOString());
    }

    if (filters.searchQuery) {
      // Search by order number
      // Note: For customer name/email search, we need to filter client-side
      // since shipping_address is a JSONB field
      query = query.ilike('order_number', `%${filters.searchQuery}%`);
    }

    // Apply pagination
    const from = (pagination.page - 1) * pagination.limit;
    const to = from + pagination.limit - 1;
    query = query.range(from, to);

    // Sort by created_at descending (newest first)
    query = query.order('created_at', { ascending: false });

    const { data: orders, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }

    let filteredOrders = (orders || []).map(order => ({
      ...order,
      items: order.order_items || [],
    }));

    // Client-side filtering for customer name/email search in JSONB field
    if (filters.searchQuery && filteredOrders.length === 0) {
      // If no results from order_number search, try searching in shipping_address
      // We need to fetch without the order_number filter
      let allQuery = supabase
        .from('orders')
        .select('*, order_items(*)', { count: 'exact' });

      // Reapply all filters except searchQuery
      if (filters.user_id) {
        allQuery = allQuery.eq('user_id', filters.user_id);
      }
      if (filters.status && filters.status.length > 0) {
        allQuery = allQuery.in('status', filters.status);
      }
      if (filters.payment_status && filters.payment_status.length > 0) {
        allQuery = allQuery.in('payment_status', filters.payment_status);
      }
      if (filters.dateFrom) {
        allQuery = allQuery.gte('created_at', filters.dateFrom.toISOString());
      }
      if (filters.dateTo) {
        allQuery = allQuery.lte('created_at', filters.dateTo.toISOString());
      }

      allQuery = allQuery.order('created_at', { ascending: false });

      const { data: allOrders, error: allError } = await allQuery;

      if (!allError && allOrders) {
        const searchLower = filters.searchQuery.toLowerCase();
        filteredOrders = allOrders
          .filter(order => {
            const customerName = order.shipping_address?.name?.toLowerCase() || '';
            const customerPhone = order.shipping_address?.phone?.toLowerCase() || '';
            return customerName.includes(searchLower) || customerPhone.includes(searchLower);
          })
          .map(order => ({
            ...order,
            items: order.order_items || [],
          }));

        // Apply pagination to filtered results
        const from = (pagination.page - 1) * pagination.limit;
        const to = from + pagination.limit;
        const paginatedFiltered = filteredOrders.slice(from, to);
        const filteredTotal = filteredOrders.length;
        const filteredTotalPages = Math.ceil(filteredTotal / pagination.limit);

        return {
          orders: paginatedFiltered,
          total: filteredTotal,
          page: pagination.page,
          limit: pagination.limit,
          totalPages: filteredTotalPages,
        };
      }
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / pagination.limit);

    return {
      orders: filteredOrders,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages,
    };
  }

  /**
   * Get a single order by ID
   */
  async getOrderById(orderId: string, userId?: string): Promise<Order | null> {
    let query = supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId);

    // If userId is provided, ensure user can only access their own orders
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: order, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Order not found
      }
      throw new Error(`Failed to fetch order: ${error.message}`);
    }

    return {
      ...order,
      items: order.order_items || [],
    };
  }

  /**
   * Get order by order number
   */
  async getOrderByNumber(orderNumber: string, userId?: string): Promise<Order | null> {
    let query = supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('order_number', orderNumber);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: order, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch order: ${error.message}`);
    }

    return {
      ...order,
      items: order.order_items || [],
    };
  }

  /**
   * Update order status with audit trail and optimistic locking
   */
  async updateOrderStatus(input: UpdateOrderStatusInput): Promise<Order> {
    // Fetch current order with version
    const order = await this.getOrderById(input.order_id);
    if (!order) {
      throw new Error('Order not found');
    }

    // Check for version conflict if version is provided
    if (input.expected_version !== undefined) {
      const currentVersion = (order as any).version || 1;
      if (currentVersion !== input.expected_version) {
        throw new Error(
          `CONFLICT: Order has been modified by another user. Expected version ${input.expected_version}, but current version is ${currentVersion}. Please reload the order and try again.`
        );
      }
    }

    this.validateStatusTransition(order.status, input.new_status);

    // Add to status history
    const newHistoryEntry: StatusHistoryEntry = {
      status: input.new_status,
      timestamp: new Date().toISOString(),
      updated_by: input.updated_by,
      notes: input.notes,
    };

    const updatedHistory = [...order.status_history, newHistoryEntry];

    // Prepare update data
    const updateData: any = {
      status: input.new_status,
      status_history: updatedHistory,
    };

    // If marking as shipped, add tracking info
    if (input.new_status === 'shipped') {
      if (input.tracking_number) {
        updateData.tracking_number = input.tracking_number;
      }
      if (input.tracking_url) {
        updateData.tracking_url = input.tracking_url;
      }
      if (input.courier_name) {
        updateData.courier_name = input.courier_name;
      }
    }

    // Update order with optimistic locking
    let query = supabase
      .from('orders')
      .update(updateData)
      .eq('id', input.order_id);

    // Add version check if provided
    if (input.expected_version !== undefined) {
      query = query.eq('version', input.expected_version);
    }

    const { data: updatedOrder, error } = await query
      .select('*, order_items(*)')
      .single();

    if (error) {
      // Check if it's a version mismatch (no rows updated)
      if (error.code === 'PGRST116') {
        throw new Error(
          'CONFLICT: Order has been modified by another user. Please reload the order and try again.'
        );
      }
      throw new Error(`Failed to update order status: ${error.message}`);
    }

    // If no data returned, it means version mismatch
    if (!updatedOrder) {
      throw new Error(
        'CONFLICT: Order has been modified by another user. Please reload the order and try again.'
      );
    }

    return {
      ...updatedOrder,
      items: updatedOrder.order_items || [],
    };
  }

  /**
   * Cancel an order
   * Only allows cancellation for pending or confirmed orders
   */
  async cancelOrder(input: CancelOrderInput): Promise<Order> {
    const order = await this.getOrderById(input.order_id, input.user_id);
    
    if (!order) {
      throw new Error('Order not found');
    }

    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.status)) {
      throw new Error(`Cannot cancel order with status: ${order.status}`);
    }

    // Add cancellation to status history
    const newHistoryEntry: StatusHistoryEntry = {
      status: 'cancelled',
      timestamp: new Date().toISOString(),
      updated_by: input.user_id,
      notes: input.cancellation_reason || 'Order cancelled by customer',
    };

    const updatedHistory = [...order.status_history, newHistoryEntry];

    // Update order
    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        status_history: updatedHistory,
        cancelled_at: new Date().toISOString(),
        cancellation_reason: input.cancellation_reason,
        // If payment was completed, mark for refund
        payment_status: order.payment_status === 'completed' ? 'refunded' : order.payment_status,
      })
      .eq('id', input.order_id)
      .select('*, order_items(*)')
      .single();

    if (error) {
      throw new Error(`Failed to cancel order: ${error.message}`);
    }

    return {
      ...updatedOrder,
      items: updatedOrder.order_items || [],
    };
  }

  /**
   * Validate create order input
   */
  private validateCreateOrderInput(input: CreateOrderInput): void {
    if (!input.user_id) {
      throw new Error('User ID is required');
    }

    if (!input.items || input.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    if (input.subtotal <= 0) {
      throw new Error('Subtotal must be greater than 0');
    }

    if (input.total <= 0) {
      throw new Error('Total must be greater than 0');
    }

    if (!input.shipping_address) {
      throw new Error('Shipping address is required');
    }

    if (!input.delivery_pincode) {
      throw new Error('Delivery pincode is required');
    }

    if (!input.payment_method) {
      throw new Error('Payment method is required');
    }

    // Validate items
    for (const item of input.items) {
      if (!item.product_id) {
        throw new Error('Product ID is required for all items');
      }
      if (!item.product_name) {
        throw new Error('Product name is required for all items');
      }
      if (item.quantity <= 0) {
        throw new Error('Item quantity must be greater than 0');
      }
      if (item.price < 0) {
        throw new Error('Item price cannot be negative');
      }
      if (item.subtotal !== item.price * item.quantity) {
        throw new Error('Item subtotal must equal price * quantity');
      }
    }

    // Validate shipping address
    const addr = input.shipping_address;
    if (!addr.name || !addr.phone || !addr.street || !addr.city || !addr.state || !addr.pincode) {
      throw new Error('Complete shipping address is required');
    }
  }

  /**
   * Validate status transition
   */
  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: [],
    };

    const allowedStatuses = validTransitions[currentStatus];
    if (!allowedStatuses.includes(newStatus)) {
      throw new Error(
        `Invalid status transition from ${currentStatus} to ${newStatus}`
      );
    }
  }
}

// Export singleton instance
export const orderService = new OrderService();
