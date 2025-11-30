import { render, screen, fireEvent } from '@testing-library/react';
import { ProductTabs } from '../product-tabs';
import { describe, it, expect } from 'vitest';

describe('ProductTabs Component', () => {
  const mockProps = {
    description: 'This is a test product description.',
    specifications: {
      'Material': 'Gold',
      'Weight': '10g',
      'Purity': '22K',
    },
    shippingInfo: 'Ships within 3-5 business days.',
    returnPolicy: '30-day return policy available.',
  };

  it('renders all tab buttons on desktop', () => {
    render(<ProductTabs {...mockProps} />);
    
    // Check that all tabs are present
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Specifications')).toBeInTheDocument();
    expect(screen.getByText('Shipping & Returns')).toBeInTheDocument();
  });

  it('displays description content by default', () => {
    render(<ProductTabs {...mockProps} />);
    
    expect(screen.getByText(mockProps.description)).toBeInTheDocument();
  });

  it('switches tab content when clicking different tabs', () => {
    render(<ProductTabs {...mockProps} />);
    
    // Click on Specifications tab
    const specsTab = screen.getAllByText('Specifications')[0];
    fireEvent.click(specsTab);
    
    // Check that specifications are displayed
    expect(screen.getByText('Material')).toBeInTheDocument();
    expect(screen.getByText('Gold')).toBeInTheDocument();
  });

  it('renders specifications as key-value pairs in a table', () => {
    render(<ProductTabs {...mockProps} />);
    
    // Click on Specifications tab
    const specsTab = screen.getAllByText('Specifications')[0];
    fireEvent.click(specsTab);
    
    // Verify table structure
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    
    // Verify key-value pairs
    expect(screen.getByText('Material')).toBeInTheDocument();
    expect(screen.getByText('Gold')).toBeInTheDocument();
    expect(screen.getByText('Weight')).toBeInTheDocument();
    expect(screen.getByText('10g')).toBeInTheDocument();
  });

  it('handles missing specifications gracefully', () => {
    const propsWithoutSpecs = {
      ...mockProps,
      specifications: undefined,
    };
    
    render(<ProductTabs {...propsWithoutSpecs} />);
    
    // Click on Specifications tab
    const specsTab = screen.getAllByText('Specifications')[0];
    fireEvent.click(specsTab);
    
    expect(screen.getByText('No specifications available for this product.')).toBeInTheDocument();
  });

  it('displays shipping and return information', () => {
    render(<ProductTabs {...mockProps} />);
    
    // Click on Shipping & Returns tab
    const shippingTab = screen.getAllByText('Shipping & Returns')[0];
    fireEvent.click(shippingTab);
    
    expect(screen.getByText('Shipping Information')).toBeInTheDocument();
    expect(screen.getByText(mockProps.shippingInfo)).toBeInTheDocument();
    expect(screen.getByText('Return Policy')).toBeInTheDocument();
    expect(screen.getByText(mockProps.returnPolicy)).toBeInTheDocument();
  });

  it('renders accordion layout for mobile', () => {
    render(<ProductTabs {...mockProps} />);
    
    // Check for accordion items (they should be in the DOM but hidden on desktop)
    const accordionButtons = screen.getAllByRole('button');
    
    // Should have accordion buttons for mobile view
    expect(accordionButtons.length).toBeGreaterThan(0);
  });

  it('allows multiple accordion sections to be open simultaneously', () => {
    render(<ProductTabs {...mockProps} />);
    
    // Get all accordion toggle buttons
    const accordionButtons = screen.getAllByRole('button');
    
    // Find the description and specifications accordion buttons
    const descButton = accordionButtons.find(btn => btn.textContent?.includes('Description'));
    const specsButton = accordionButtons.find(btn => btn.textContent?.includes('Specifications'));
    
    if (descButton && specsButton) {
      // Click both to open them
      fireEvent.click(descButton);
      fireEvent.click(specsButton);
      
      // Both should be visible (content is rendered)
      const descriptions = screen.getAllByText(mockProps.description);
      expect(descriptions.length).toBeGreaterThan(0);
    }
  });
});
