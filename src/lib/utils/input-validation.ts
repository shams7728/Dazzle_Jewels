/**
 * Input Validation Utilities
 * 
 * Comprehensive validation functions for API endpoints to prevent injection attacks
 * and ensure data integrity. Validates and sanitizes all user inputs.
 */

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitized?: any;
}

/**
 * Email validation
 * Validates email format according to RFC 5322 standard
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' };
  }

  const trimmed = email.trim();
  
  if (trimmed.length === 0) {
    return { isValid: false, error: 'Email cannot be empty' };
  }

  if (trimmed.length > 254) {
    return { isValid: false, error: 'Email is too long' };
  }

  // RFC 5322 compliant email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  return { isValid: true, sanitized: trimmed.toLowerCase() };
}

/**
 * Phone number validation (Indian format)
 * Validates 10-digit Indian phone numbers
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Check if it's a valid 10-digit Indian number
  if (digits.length !== 10) {
    return { isValid: false, error: 'Phone number must be 10 digits' };
  }

  // Indian mobile numbers start with 6, 7, 8, or 9
  if (!/^[6-9]/.test(digits)) {
    return { isValid: false, error: 'Invalid phone number format' };
  }

  return { isValid: true, sanitized: digits };
}

/**
 * Pincode validation (Indian format)
 * Validates 6-digit Indian pincodes
 */
export function validatePincode(pincode: string): ValidationResult {
  if (!pincode || typeof pincode !== 'string') {
    return { isValid: false, error: 'Pincode is required' };
  }

  const trimmed = pincode.trim();
  const digits = trimmed.replace(/\D/g, '');

  if (digits.length !== 6) {
    return { isValid: false, error: 'Pincode must be 6 digits' };
  }

  // Indian pincodes don't start with 0
  if (digits[0] === '0') {
    return { isValid: false, error: 'Invalid pincode format' };
  }

  return { isValid: true, sanitized: digits };
}

/**
 * Text field sanitization
 * Removes potentially dangerous characters and HTML tags
 */
export function sanitizeText(text: string, maxLength: number = 500): ValidationResult {
  if (!text || typeof text !== 'string') {
    return { isValid: false, error: 'Text is required' };
  }

  let sanitized = text.trim();

  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  if (sanitized.length === 0) {
    return { isValid: false, error: 'Text cannot be empty' };
  }

  if (sanitized.length > maxLength) {
    return { isValid: false, error: `Text exceeds maximum length of ${maxLength} characters` };
  }

  return { isValid: true, sanitized };
}

/**
 * Address field validation
 * Validates and sanitizes address components
 */
export function validateAddressField(field: string, fieldName: string, minLength: number = 2, maxLength: number = 200): ValidationResult {
  if (!field || typeof field !== 'string') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  const result = sanitizeText(field, maxLength);
  
  if (!result.isValid) {
    return { isValid: false, error: `${fieldName}: ${result.error}` };
  }

  if (result.sanitized!.length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }

  return { isValid: true, sanitized: result.sanitized };
}

/**
 * Shipping address validation
 * Validates complete shipping address object
 */
export interface ShippingAddressInput {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export function validateShippingAddress(address: any): ValidationResult {
  if (!address || typeof address !== 'object') {
    return { isValid: false, error: 'Shipping address is required' };
  }

  const errors: string[] = [];
  const sanitized: any = {};

  // Validate name
  const nameResult = validateAddressField(address.name, 'Name', 1, 100);
  if (!nameResult.isValid) {
    errors.push(nameResult.error!);
  } else {
    sanitized.name = nameResult.sanitized;
  }

  // Validate phone
  const phoneResult = validatePhone(address.phone);
  if (!phoneResult.isValid) {
    errors.push(phoneResult.error!);
  } else {
    sanitized.phone = phoneResult.sanitized;
  }

  // Validate street
  const streetResult = validateAddressField(address.street, 'Street', 5, 200);
  if (!streetResult.isValid) {
    errors.push(streetResult.error!);
  } else {
    sanitized.street = streetResult.sanitized;
  }

  // Validate city
  const cityResult = validateAddressField(address.city, 'City', 2, 50);
  if (!cityResult.isValid) {
    errors.push(cityResult.error!);
  } else {
    sanitized.city = cityResult.sanitized;
  }

  // Validate state
  const stateResult = validateAddressField(address.state, 'State', 2, 50);
  if (!stateResult.isValid) {
    errors.push(stateResult.error!);
  } else {
    sanitized.state = stateResult.sanitized;
  }

  // Validate pincode
  const pincodeResult = validatePincode(address.pincode);
  if (!pincodeResult.isValid) {
    errors.push(pincodeResult.error!);
  } else {
    sanitized.pincode = pincodeResult.sanitized;
  }

  // Country is optional, default to India
  sanitized.country = address.country || 'India';

  // Validate coordinates if provided
  if (address.latitude !== undefined) {
    const lat = parseFloat(address.latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.push('Invalid latitude');
    } else {
      sanitized.latitude = lat;
    }
  }

  if (address.longitude !== undefined) {
    const lng = parseFloat(address.longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.push('Invalid longitude');
    } else {
      sanitized.longitude = lng;
    }
  }

  if (errors.length > 0) {
    return { isValid: false, error: errors.join('; ') };
  }

  return { isValid: true, sanitized };
}

/**
 * Numeric value validation
 * Validates positive numbers with optional min/max constraints
 */
export function validatePositiveNumber(value: any, fieldName: string, min: number = 0, max?: number): ValidationResult {
  if (value === undefined || value === null) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) {
    return { isValid: false, error: `${fieldName} must be a valid number` };
  }

  if (num < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min}` };
  }

  if (max !== undefined && num > max) {
    return { isValid: false, error: `${fieldName} cannot exceed ${max}` };
  }

  return { isValid: true, sanitized: num };
}

/**
 * Coupon code validation
 * Validates coupon code format
 */
export function validateCouponCode(code: string): ValidationResult {
  if (!code || typeof code !== 'string') {
    return { isValid: false, error: 'Coupon code is required' };
  }

  const trimmed = code.trim().toUpperCase();

  if (trimmed.length < 3 || trimmed.length > 20) {
    return { isValid: false, error: 'Coupon code must be between 3 and 20 characters' };
  }

  // Only allow alphanumeric characters and hyphens
  if (!/^[A-Z0-9-]+$/.test(trimmed)) {
    return { isValid: false, error: 'Coupon code can only contain letters, numbers, and hyphens' };
  }

  return { isValid: true, sanitized: trimmed };
}

/**
 * UUID validation
 * Validates UUID v4 format
 */
export function validateUUID(id: string, fieldName: string = 'ID'): ValidationResult {
  if (!id || typeof id !== 'string') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(id)) {
    return { isValid: false, error: `Invalid ${fieldName} format` };
  }

  return { isValid: true, sanitized: id.toLowerCase() };
}

/**
 * Order status validation
 */
const VALID_ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
export type OrderStatus = typeof VALID_ORDER_STATUSES[number];

export function validateOrderStatus(status: string): ValidationResult {
  if (!status || typeof status !== 'string') {
    return { isValid: false, error: 'Order status is required' };
  }

  const trimmed = status.trim().toLowerCase();

  if (!VALID_ORDER_STATUSES.includes(trimmed as any)) {
    return { isValid: false, error: `Invalid order status. Must be one of: ${VALID_ORDER_STATUSES.join(', ')}` };
  }

  return { isValid: true, sanitized: trimmed };
}

/**
 * Payment method validation
 */
const VALID_PAYMENT_METHODS = ['razorpay', 'cod'] as const;
export type PaymentMethod = typeof VALID_PAYMENT_METHODS[number];

export function validatePaymentMethod(method: string): ValidationResult {
  if (!method || typeof method !== 'string') {
    return { isValid: false, error: 'Payment method is required' };
  }

  const trimmed = method.trim().toLowerCase();

  if (!VALID_PAYMENT_METHODS.includes(trimmed as any)) {
    return { isValid: false, error: `Invalid payment method. Must be one of: ${VALID_PAYMENT_METHODS.join(', ')}` };
  }

  return { isValid: true, sanitized: trimmed };
}

/**
 * Date range validation
 */
export function validateDateRange(dateFrom?: string, dateTo?: string): ValidationResult {
  const result: any = {};

  if (dateFrom) {
    const from = new Date(dateFrom);
    if (isNaN(from.getTime())) {
      return { isValid: false, error: 'Invalid dateFrom format' };
    }
    result.dateFrom = from;
  }

  if (dateTo) {
    const to = new Date(dateTo);
    if (isNaN(to.getTime())) {
      return { isValid: false, error: 'Invalid dateTo format' };
    }
    result.dateTo = to;
  }

  if (result.dateFrom && result.dateTo && result.dateFrom > result.dateTo) {
    return { isValid: false, error: 'dateFrom must be before dateTo' };
  }

  return { isValid: true, sanitized: result };
}

/**
 * Pagination parameters validation
 */
export function validatePagination(page?: any, limit?: any): ValidationResult {
  const result: any = {
    page: 1,
    limit: 20,
  };

  if (page !== undefined) {
    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 1) {
      return { isValid: false, error: 'Page must be a positive integer' };
    }
    result.page = pageNum;
  }

  if (limit !== undefined) {
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return { isValid: false, error: 'Limit must be between 1 and 100' };
    }
    result.limit = limitNum;
  }

  return { isValid: true, sanitized: result };
}
