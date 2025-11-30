# Requirements Document

## Introduction

This specification addresses a critical bug in the "Buy Now" checkout flow where users are incorrectly redirected to the home page when clicking "Buy Now" directly from a product page without first adding items to their cart. The system currently has a race condition between loading the Buy Now session from sessionStorage and the redirect logic that checks for empty checkout items.

## Glossary

- **Buy Now Flow**: A checkout process where users purchase a single product directly without adding it to their persistent shopping cart
- **Cart Checkout Flow**: A checkout process where users purchase items that have been added to their persistent shopping cart
- **Checkout Session**: A temporary data structure containing items, pricing, and metadata for a checkout transaction
- **sessionStorage**: Browser API for storing temporary session data that persists only for the current browser tab
- **Race Condition**: A timing issue where the order of operations affects the outcome, causing unpredictable behavior

## Requirements

### Requirement 1

**User Story:** As a customer, I want to click "Buy Now" on a product page and proceed directly to checkout, so that I can complete my purchase quickly without adding items to my cart.

#### Acceptance Criteria

1. WHEN a user clicks the "Buy Now" button on a product page THEN the system SHALL navigate to the checkout page with the selected product
2. WHEN the checkout page loads with a Buy Now session THEN the system SHALL display the product from the Buy Now session
3. WHEN the checkout page loads with a Buy Now session THEN the system SHALL NOT redirect the user to the home page
4. WHEN a Buy Now checkout is completed THEN the system SHALL NOT clear the user's shopping cart
5. WHEN a Buy Now session exists in sessionStorage THEN the system SHALL load it before performing any redirect checks

### Requirement 2

**User Story:** As a customer, I want the checkout page to correctly distinguish between cart checkout and Buy Now checkout, so that the appropriate items are displayed and processed.

#### Acceptance Criteria

1. WHEN the checkout page loads THEN the system SHALL check for a Buy Now session in sessionStorage before checking cart items
2. WHEN a Buy Now session is found THEN the system SHALL set the checkout type to "buyNow" and use the session items
3. WHEN no Buy Now session is found THEN the system SHALL set the checkout type to "cart" and use cart items
4. WHEN the checkout type is "buyNow" THEN the system SHALL NOT redirect even if cart items are empty
5. WHEN the checkout type is "cart" and both cart and checkout items are empty THEN the system SHALL redirect to the home page

### Requirement 3

**User Story:** As a developer, I want the Buy Now session loading to be synchronous and complete before any redirect logic executes, so that race conditions are eliminated.

#### Acceptance Criteria

1. WHEN the checkout page component mounts THEN the system SHALL immediately check sessionStorage for a Buy Now session
2. WHEN a Buy Now session is found THEN the system SHALL parse and set the session data synchronously
3. WHEN the redirect check executes THEN the system SHALL have already determined the checkout type
4. WHEN the checkout type is determined THEN the system SHALL use this information to decide whether to redirect
5. WHEN sessionStorage operations complete THEN the system SHALL clean up the Buy Now session data from sessionStorage
