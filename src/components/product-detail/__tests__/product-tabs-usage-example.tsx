/**
 * ProductTabs Usage Example
 * 
 * This file demonstrates how to use the ProductTabs component
 * in the product detail page.
 */

import { ProductTabs } from '../product-tabs';

// Example 1: Basic usage with all props
export function ProductTabsExample1() {
  return (
    <ProductTabs
      description="This exquisite gold necklace features intricate craftsmanship and timeless design. Perfect for special occasions or everyday elegance."
      specifications={{
        'Material': '22K Gold',
        'Weight': '15.5g',
        'Length': '18 inches',
        'Clasp Type': 'Lobster Clasp',
        'Purity': '916 Hallmark',
        'Design': 'Traditional',
      }}
      shippingInfo="Free shipping on orders over ₹5000. Standard delivery takes 3-5 business days. Express delivery available for ₹200."
      returnPolicy="30-day hassle-free returns. Items must be in original condition with tags attached. Refund processed within 7-10 business days."
    />
  );
}

// Example 2: Minimal usage (only description required)
export function ProductTabsExample2() {
  return (
    <ProductTabs
      description="Simple gold ring with elegant design."
    />
  );
}

// Example 3: With specifications but no shipping info
export function ProductTabsExample3() {
  return (
    <ProductTabs
      description="Beautiful diamond earrings with brilliant cut stones."
      specifications={{
        'Metal': 'Platinum',
        'Diamond Weight': '0.5 carats',
        'Clarity': 'VS1',
        'Color': 'D',
      }}
    />
  );
}

// Example 4: Integration in product detail page
export function ProductDetailPageExample() {
  // Assume we have product data from API
  const product = {
    id: '123',
    title: 'Gold Necklace',
    description: 'Elegant 22K gold necklace with traditional design.',
    base_price: 45000,
    specifications: {
      'Material': '22K Gold',
      'Weight': '15.5g',
      'Purity': '916 Hallmark',
    },
    shipping_info: 'Ships within 3-5 business days',
    return_policy: '30-day return policy',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Other product detail sections... */}
      
      {/* Product Tabs Section */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Product Details</h2>
        <ProductTabs
          description={product.description}
          specifications={product.specifications}
          shippingInfo={product.shipping_info}
          returnPolicy={product.return_policy}
        />
      </section>
      
      {/* Other sections like reviews, related products... */}
    </div>
  );
}

/**
 * Key Features:
 * 
 * 1. Desktop View:
 *    - Horizontal tab navigation
 *    - Active tab highlighted with yellow underline
 *    - Smooth fade-in transitions between content
 * 
 * 2. Mobile View (< 768px):
 *    - Accordion layout with expand/collapse
 *    - Multiple sections can be open simultaneously
 *    - Smooth height transitions
 *    - Chevron icon rotates on expand
 * 
 * 3. Specifications:
 *    - Rendered as a table with alternating row colors
 *    - Key-value pairs clearly separated
 *    - Responsive on all screen sizes
 * 
 * 4. Error Handling:
 *    - Shows fallback message if specifications are missing
 *    - Shows fallback message if shipping/return info is missing
 *    - Gracefully handles empty or undefined props
 */
