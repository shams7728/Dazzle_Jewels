import { render, screen } from '@testing-library/react';
import { Breadcrumb } from '../breadcrumb';
import { describe, it, expect } from 'vitest';

describe('Breadcrumb Component', () => {
  it('renders breadcrumb with home link and items', () => {
    const items = [
      { label: 'Electronics', href: '/collections/electronics' },
      { label: 'Smartphone', href: '/products/123' }
    ];

    render(<Breadcrumb items={items} />);

    // Check that home link is present
    const homeLink = screen.getByLabelText('Home');
    expect(homeLink).toBeDefined();
    expect(homeLink.getAttribute('href')).toBe('/');

    // Check that breadcrumb items are present
    expect(screen.getByText('Electronics')).toBeDefined();
    expect(screen.getByText('Smartphone')).toBeDefined();
  });

  it('marks the last item as current page', () => {
    const items = [
      { label: 'Category', href: '/collections/category' },
      { label: 'Product Name', href: '/products/456' }
    ];

    render(<Breadcrumb items={items} />);

    const lastItem = screen.getByText('Product Name');
    expect(lastItem.tagName).toBe('SPAN');
    expect(lastItem.getAttribute('aria-current')).toBe('page');
  });

  it('renders structured data for SEO', () => {
    const items = [
      { label: 'Jewelry', href: '/collections/jewelry' },
      { label: 'Gold Ring', href: '/products/789' }
    ];

    const { container } = render(<Breadcrumb items={items} />);

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeDefined();
    
    if (script?.textContent) {
      const structuredData = JSON.parse(script.textContent);
      expect(structuredData['@type']).toBe('BreadcrumbList');
      expect(structuredData.itemListElement).toHaveLength(3); // Home + 2 items
    }
  });
});
