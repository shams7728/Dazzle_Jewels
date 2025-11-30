import { render, screen } from '@testing-library/react';
import { BackLink } from '../back-link';
import { describe, it, expect } from 'vitest';

describe('BackLink Component', () => {
  it('renders back link with correct href and label', () => {
    render(<BackLink href="/products" label="Back to Products" />);

    const link = screen.getByText('Back to Products');
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toBe('/products');
  });

  it('renders arrow icon', () => {
    const { container } = render(<BackLink href="/products" label="Back to Products" />);

    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
  });

  it('applies custom className', () => {
    const { container } = render(
      <BackLink href="/products" label="Back to Products" className="custom-class" />
    );

    const link = container.querySelector('a');
    expect(link?.className).toContain('custom-class');
  });
});
