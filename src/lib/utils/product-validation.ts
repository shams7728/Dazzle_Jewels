/**
 * Product form validation utilities
 */

export interface ProductFormData {
  title: string;
  description: string;
  base_price: string | number;
  discount_price: string | number;
  category_id: string;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  is_offer_item: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface OfferItemValidationResult {
  shouldShowWarning: boolean;
  warningMessage?: string;
}

/**
 * Validates offer item configuration
 * Returns warning if product is marked as offer item without discount price
 */
export function validateOfferItem(
  isOfferItem: boolean,
  discountPrice: string | number | null | undefined
): OfferItemValidationResult {
  // Convert string to number if needed
  const numericDiscount = typeof discountPrice === 'string' 
    ? (discountPrice.trim() === '' ? null : parseFloat(discountPrice))
    : discountPrice;
  
  // Check if discount_price is null or undefined (not just falsy, since 0 is a valid discount)
  const shouldShowWarning = isOfferItem && (numericDiscount === null || numericDiscount === undefined || isNaN(numericDiscount));
  
  return {
    shouldShowWarning,
    warningMessage: shouldShowWarning 
      ? '⚠️ This product is marked as an offer item but has no discount price set.'
      : undefined,
  };
}

/**
 * Validates the complete product form
 * Returns validation result with errors for each field
 */
export function validateProductForm(formData: ProductFormData): ValidationResult {
  const errors: Record<string, string> = {};
  
  // Required field validations
  if (!formData.title || formData.title.trim() === '') {
    errors.title = 'Product title is required';
  }
  
  const basePrice = typeof formData.base_price === 'string' 
    ? parseFloat(formData.base_price) 
    : formData.base_price;
  
  if (isNaN(basePrice) || basePrice <= 0) {
    errors.base_price = 'Base price is required and must be greater than 0';
  }
  
  // Showcase-specific validations
  const hasShowcaseAttribute = formData.is_new_arrival || formData.is_best_seller || formData.is_offer_item;
  
  if (hasShowcaseAttribute) {
    // Title must be meaningful (not just whitespace)
    if (formData.title && formData.title.trim().length < 3) {
      errors.title = 'Product title must be at least 3 characters when using showcase attributes';
    }
    
    // Description should be present for showcase items
    if (!formData.description || formData.description.trim() === '') {
      errors.description = 'Description is required for showcase products';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Real-time validation for a single field
 */
export function validateField(
  fieldName: keyof ProductFormData,
  value: any,
  formData: ProductFormData
): string | null {
  const result = validateProductForm({ ...formData, [fieldName]: value });
  return result.errors[fieldName] || null;
}
