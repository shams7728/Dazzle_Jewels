import Razorpay from 'razorpay';
import crypto from 'crypto';

/**
 * Payment Gateway Interface
 * Defines standard methods for payment processing
 */
export interface PaymentGateway {
  createOrder(amount: number, currency: string, metadata?: any): Promise<PaymentOrder>;
  verifyPayment(paymentId: string, orderId: string, signature: string): Promise<boolean>;
  refundPayment(paymentId: string, amount?: number): Promise<RefundResponse>;
  getPaymentDetails(paymentId: string): Promise<PaymentDetails>;
}

export interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
  receipt?: string;
}

export interface RefundResponse {
  id: string;
  amount: number;
  status: string;
  paymentId: string;
}

export interface PaymentDetails {
  id: string;
  amount: number;
  currency: string;
  status: string;
  method?: string;
  email?: string;
  contact?: string;
  createdAt: Date;
}

/**
 * Razorpay Payment Gateway Implementation
 */
export class RazorpayGateway implements PaymentGateway {
  private razorpay: Razorpay;
  private keySecret: string;
  private isTestMode: boolean;

  constructor(keyId: string, keySecret: string, testMode: boolean = false) {
    if (!keyId || !keySecret) {
      throw new Error('Razorpay key ID and secret are required');
    }

    this.razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    this.keySecret = keySecret;
    this.isTestMode = testMode;
  }

  /**
   * Create a Razorpay order
   */
  async createOrder(
    amount: number,
    currency: string = 'INR',
    metadata?: any
  ): Promise<PaymentOrder> {
    try {
      // Amount should be in paise (smallest currency unit)
      const amountInPaise = Math.round(amount * 100);

      const options = {
        amount: amountInPaise,
        currency,
        receipt: metadata?.receipt || `receipt_${Date.now()}`,
        notes: metadata?.notes || {},
      };

      const order = await this.razorpay.orders.create(options);

      return {
        id: order.id,
        amount: Number(order.amount) / 100, // Convert back to rupees
        currency: order.currency,
        status: order.status,
        receipt: order.receipt,
      };
    } catch (error) {
      throw new Error(`Failed to create Razorpay order: ${(error as Error).message}`);
    }
  }

  /**
   * Verify payment signature
   * This is crucial for security - ensures payment actually came from Razorpay
   */
  verifyPayment(paymentId: string, orderId: string, signature: string): Promise<boolean> {
    try {
      // Create expected signature
      const text = `${orderId}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(text)
        .digest('hex');

      // Compare signatures
      const isValid = expectedSignature === signature;

      return Promise.resolve(isValid);
    } catch (error) {
      console.error('Payment verification error:', error);
      return Promise.resolve(false);
    }
  }

  /**
   * Refund a payment
   */
  async refundPayment(paymentId: string, amount?: number): Promise<RefundResponse> {
    try {
      const refundData: any = {
        payment_id: paymentId,
      };

      // If amount is specified, do partial refund
      if (amount) {
        refundData.amount = Math.round(amount * 100); // Convert to paise
      }

      const refund = await this.razorpay.payments.refund(paymentId, refundData);

      return {
        id: refund.id,
        amount: Number(refund.amount || 0) / 100, // Convert back to rupees
        status: refund.status,
        paymentId: refund.payment_id,
      };
    } catch (error) {
      throw new Error(`Failed to refund payment: ${(error as Error).message}`);
    }
  }

  /**
   * Get payment details
   */
  async getPaymentDetails(paymentId: string): Promise<PaymentDetails> {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);

      return {
        id: payment.id,
        amount: Number(payment.amount) / 100, // Convert to rupees
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        email: payment.email,
        contact: String(payment.contact || ''),
        createdAt: new Date(payment.created_at * 1000), // Convert Unix timestamp
      };
    } catch (error) {
      throw new Error(`Failed to fetch payment details: ${(error as Error).message}`);
    }
  }

  /**
   * Check if gateway is in test mode
   */
  isInTestMode(): boolean {
    return this.isTestMode;
  }
}

/**
 * Payment Gateway Factory
 * Creates appropriate gateway instance based on configuration
 */
export class PaymentGatewayFactory {
  private static instance: PaymentGateway | null = null;
  private static fallbackInstance: PaymentGateway | null = null;

  /**
   * Get payment gateway instance
   */
  static getGateway(gatewayType: 'razorpay' = 'razorpay'): PaymentGateway {
    if (this.instance) {
      return this.instance;
    }

    switch (gatewayType) {
      case 'razorpay':
        const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        const testMode = process.env.RAZORPAY_TEST_MODE === 'true';

        if (!keyId || !keySecret) {
          throw new Error('Razorpay credentials not configured');
        }

        this.instance = new RazorpayGateway(keyId, keySecret, testMode);
        return this.instance;

      default:
        throw new Error(`Unsupported payment gateway: ${gatewayType}`);
    }
  }

  /**
   * Set fallback gateway
   */
  static setFallbackGateway(gateway: PaymentGateway): void {
    this.fallbackInstance = gateway;
  }

  /**
   * Get fallback gateway
   */
  static getFallbackGateway(): PaymentGateway | null {
    return this.fallbackInstance;
  }

  /**
   * Reset instances (useful for testing)
   */
  static reset(): void {
    this.instance = null;
    this.fallbackInstance = null;
  }
}

// Export convenience function
export function getPaymentGateway(): PaymentGateway {
  return PaymentGatewayFactory.getGateway('razorpay');
}
