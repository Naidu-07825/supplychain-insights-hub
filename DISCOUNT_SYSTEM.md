# Automatic Percentage-Based Discount System

## Overview
An automatic percentage-based discount system has been implemented that applies a **10% discount** to all orders with a total value exceeding **₹3000**.

## System Components

### 1. Backend Implementation

#### Order Model (`backend/models/Order.js`)
Added new fields to track discount information:
- **`discountPercentage`**: Stores the discount percentage (0-100)
- **`discountAmount`**: Stores the calculated discount amount in currency units
- **`discount`**: Legacy field for compatibility (mirrors discountAmount)

#### Order Controller (`backend/controllers/orderController.js`)
**Discount Calculation Logic in `placeOrder` function:**
```javascript
// Calculate discount: 10% off if order total > 3000
let discountPercentage = 0;
let discountAmount = 0;
let finalAmount = totalPrice;

if (totalPrice > 3000) {
  discountPercentage = 10;
  discountAmount = Math.round((totalPrice * discountPercentage) / 100);
  finalAmount = totalPrice - discountAmount;
}
```

**Key Features:**
- Automatic calculation when order is created
- Applied consistently to all qualifying orders
- Rounded to nearest integer for currency accuracy
- Stored in database for permanent record

### 2. Email Notifications (`backend/utils/emailTemplates.js`)

All order confirmation emails now include discount information:

#### Email Templates Updated:
1. **orderPlaced** - Shows discount when order is first placed
2. **orderAccepted** - Confirms discount in acceptance notification
3. **orderDelivered** - Displays discount in invoice

**Email Format:**
```
Order Total: ₹5000
Discount Applied: 10% - ₹500
Final Amount: ₹4500
```

### 3. Frontend Implementation

#### Product Checkout Modal (`frontend/src/components/ProductsList.jsx`)
**Real-time Discount Display During Checkout:**
- Shows subtotal before discount
- Displays "10% Discount Applied!" message when order > ₹3000
- Shows exact discount amount
- Highlights final amount to pay
- Color-coded green for discounts

#### User Order History (`frontend/src/pages/MyOrders.jsx`)
**Order Summary Section:**
- Subtotal amount
- Discount percentage and amount (when applicable)
- Final payable amount
- Clear visual separation of discount section

#### Admin Order Details Modal (`frontend/src/components/OrderDetailsModal.jsx`)
**Order Summary Display:**
- Total price
- Discount details with percentage
- Final amount to collect
- Green highlighted discount section for visibility

## Discount Rules

### Trigger
- **Order Value Threshold:** ₹3000
- **Discount Percentage:** 10%
- **Application:** Automatic, no code or coupon needed

### Calculation Example
```
Order Items:
  - Product A: 2 × ₹1800 = ₹3600
  
Subtotal: ₹3600
Discount (10%): -₹360
Final Amount: ₹3240
```

### Non-Qualifying Order Example
```
Order Items:
  - Product B: 2 × ₹1400 = ₹2800
  
Subtotal: ₹2800
Discount: None
Final Amount: ₹2800
```

## Data Storage

### Order Document Structure
```javascript
{
  totalPrice: 5000,           // Original total before discount
  discountPercentage: 10,     // Discount percentage applied
  discountAmount: 500,        // Calculated discount in rupees
  discount: 500,              // Legacy field (same as discountAmount)
  finalAmount: 4500,          // Amount to be paid
  status: "Pending",
  items: [...],
  // ... other order fields
}
```

## User Experience

### During Checkout
1. User adds products to order
2. Checkout modal shows real-time price calculation
3. If order > ₹3000, system displays:
   - ✅ "10% Discount Applied!" message
   - Exact discount amount
   - Final amount to pay (in larger, prominent text)
4. User sees savings before confirming order

### After Order Placement
1. User receives order confirmation email with discount details
2. Order history shows discount applied
3. Admin can see full pricing breakdown including discount
4. Discount persists in all order communications

### Admin Management
1. Admin sees all order pricing details
2. Discount amount visible in order modal
3. Invoice includes discount information
4. Clear tracking of discounted vs non-discounted orders

## Verification Points

### Backend Verification
- ✅ Order model includes discount fields
- ✅ Discount calculation logic in placeOrder controller
- ✅ Correct rounding and amount calculation
- ✅ Database storage of discount data

### Email Verification
- ✅ orderPlaced template includes discount
- ✅ orderAccepted template includes discount
- ✅ orderDelivered template includes discount percentage and amount

### Frontend Verification
- ✅ Checkout modal shows discount for qualifying orders
- ✅ MyOrders page displays discount with percentage
- ✅ Admin OrderDetailsModal shows discount information
- ✅ Color-coded visual indicators for discounts

## Configuration

### To Modify Discount Rules
Edit `backend/controllers/orderController.js` in `placeOrder` function:

```javascript
// Change threshold (currently 3000)
if (totalPrice > 3000) {

// Change percentage (currently 10)
  discountPercentage = 10;
```

### Example: 15% discount for orders > ₹5000
```javascript
if (totalPrice > 5000) {
  discountPercentage = 15;
  discountAmount = Math.round((totalPrice * discountPercentage) / 100);
  finalAmount = totalPrice - discountAmount;
}
```

## Testing Checklist

- [ ] Place order for ₹3001 - verify 10% discount applied
- [ ] Place order for ₹2999 - verify no discount
- [ ] Check email confirmation includes discount
- [ ] Verify MyOrders shows discount with percentage
- [ ] Check admin order modal displays discount
- [ ] Verify order summary calculations are correct
- [ ] Test with different product combinations
- [ ] Verify database stores discount data

## Summary

The automatic discount system is fully integrated into the SupplyChain Insights Hub platform, providing:
- ✅ Transparent pricing with clear discount visibility
- ✅ Automatic application with no manual intervention
- ✅ Consistent display across all user interfaces
- ✅ Admin oversight and order tracking
- ✅ Professional email communications
- ✅ Easy configuration for future adjustments
