# Prototype Flow

This document defines the interaction flow for the Figma prototype.

## Primary Demo Flow (POS Checkout)

1. **Login → Dashboard**
   - **Trigger:** Click "Sign In" button
   - **Transition:** Instant

2. **Dashboard → POS**
   - **Trigger:** Click "POS" in Sidebar
   - **Transition:** Instant

3. **POS → POS (Add to Cart)**
   - **Trigger:** Click "Add" button on a Product Card
   - **Action:** Update Cart state (Show item in right panel)

4. **POS → Checkout**
   - **Trigger:** Click "Checkout" button
   - **Transition:** Open Overlay (Centered) or Slide in panel

5. **Checkout → Payment Success**
   - **Trigger:** Click "Complete Payment" button
   - **Transition:** Instant

6. **Payment Success → Receipt**
   - **Trigger:** Click "View Receipt" button
   - **Transition:** Instant

## Secondary Flows

### Product Management
1. **Dashboard → Products**
   - **Trigger:** Click "Products" in Sidebar
   - **Transition:** Instant
2. **Products → Add Product**
   - **Trigger:** Click "Add Product" button
   - **Transition:** Open Overlay or Navigate to new screen
3. **Add Product → Products**
   - **Trigger:** Click "Save Product"
   - **Transition:** Navigate back with success toast

### Inventory & Sales
1. **Dashboard → Inventory**
   - **Trigger:** Click "Inventory" in Sidebar
   - **Transition:** Instant
2. **Dashboard → Sales History**
   - **Trigger:** Click "Sales" in Sidebar
   - **Transition:** Instant
3. **Sales History → Receipt**
   - **Trigger:** Click on a Transaction Row
   - **Transition:** Open Overlay (Receipt)
