# Testing Guide: Dashboard Enhancement Features

## Quick Start

### 1. **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Both servers must be running (should already be started)

---

## Testing Order Timeline Feature

### Setup:
1. **Log in as Hospital User**
   - Go to `/login`
   - Use any hospital credentials (or register a new hospital)

2. **Place a Test Order**
   - Navigate to Hospital Dashboard
   - Click "Place Order" on any product
   - Fill in all required fields and submit
   - Note: Order starts with status "Pending"

3. **View Your Order**
   - Go to "My Orders" page
   - Your newly placed order appears at the top
   - You should see the OrderTimeline component

### Timeline Testing Steps:

**Step 1: Visual Timeline Display**
- [ ] Confirm you see 6 status steps in a horizontal line
- [ ] Each step has an icon (📋 Pending, ✅ Accepted, etc.)
- [ ] Current status is highlighted in blue
- [ ] Completed steps are green with checkmarks

**Step 2: Real-Time Updates**
- [ ] In a separate browser/tab, log in as Admin
- [ ] Go to "Admin Orders"
- [ ] Find your test order
- [ ] Click "Change status" dropdown and select "Accepted"
- [ ] Back in your hospital user tab, the timeline should update INSTANTLY
- [ ] The "Accepted" step should now show green checkmark
- [ ] Blue highlight moves to "Packed"

**Step 3: Full Status Progression**
- Repeat status changes: Pending → Accepted → Packed → Shipped → Out for Delivery → Delivered
- Verify timeline updates after each change
- Confirm timestamps appear under each completed step

---

## Testing Cancellation Feature

### Cancel Order Test:

**As Admin:**
1. Go to Admin Orders
2. Find any order (preferably Pending)
3. Click the "Cancel" button
4. Enter a detailed reason (e.g., "Out of stock - will restock in 2 weeks")
5. Confirm cancellation

**As Hospital User:**
1. Go to "My Orders"
2. Find the cancelled order
3. Verify:
   - [ ] Red alert box appears at top of timeline
   - [ ] Emoji ⛔ is visible
   - [ ] Cancellation reason is clearly displayed
   - [ ] Cancellation date/time is shown
   - [ ] Message is easy to read

### Cancellation Display Expectations:
```
⛔ Order Cancelled
Reason: Out of stock - will restock in 2 weeks
Cancelled on: 1/28/2026, 10:30:45 AM
```

---

## Testing Low Stock Warnings

### Setup: Create Low-Stock Scenario

**As Admin (or via database):**
1. Create a product with very low quantity (e.g., 2 units)
2. Or update existing product quantity to < 10 units

### Test in Hospital User Dashboard:

**In Hospital Dashboard (Product Ordering):**
1. [ ] Products with < 10 units show warning banner at top
2. [ ] Summary shows "X Products Low on Stock"
3. [ ] Each low-stock product card shows:
   - [ ] Yellow/Red stock warning component
   - [ ] Stock level indicator (e.g., "Only 2 available")
   - [ ] Progress bar showing stock percentage
4. [ ] Different colors for different thresholds:
   - [ ] Green: 10+ units
   - [ ] Yellow: 3-9 units
   - [ ] Red: 0-2 units

**When Placing Order for Low-Stock Product:**
1. Click "Order" on low-stock product
2. In the modal, warning appears again
3. Warning shows in multiple places (product list, card, modal)
4. User sees stock warning before completing order
5. User can proceed or cancel based on stock level

**Out of Stock Test:**
1. Set product quantity to 0
2. In product list:
   - [ ] Button changes to "Out of Stock" (disabled)
   - [ ] Text shows "❌ Out of Stock"
   - [ ] Cannot click to place order

---

## Testing Real-Time Socket Updates

### Multi-User Scenario:

**Open 2 Browser Tabs:**
- **Tab 1:** Hospital user logged in, viewing "My Orders"
- **Tab 2:** Admin user logged in, in "Admin Orders"

**Execute Changes:**
1. Admin (Tab 2) selects an order from the hospital user
2. Admin clicks dropdown and selects new status (e.g., "Shipped")
3. Immediately check Tab 1 (hospital user)
4. [ ] Order updates without page refresh
5. [ ] Timeline automatically progresses
6. [ ] New status badge appears instantly

**Test Multiple Changes in Quick Succession:**
1. Admin rapidly changes status: Accepted → Packed → Shipped
2. Hospital user should see all changes appear in real-time
3. Timeline should show progression without delay

---

## Testing Dark Mode Integration

All new components should work in dark mode:

**To Test Dark Mode:**
1. Click the theme toggle button (🌙 Dark / ☀️ Light)
2. Verify in both Light and Dark modes:

**MyOrders Page:**
- [ ] Timeline displays correctly
- [ ] Text is readable
- [ ] Colors are appropriate (blue/green for statuses)
- [ ] Cancellation alert is visible and clear
- [ ] Order cards have good contrast

**Hospital Dashboard (Products):**
- [ ] Product cards display properly
- [ ] Stock warnings are visible
- [ ] Colors are correct in dark mode
- [ ] Modal dialog has proper dark styling
- [ ] Form inputs are readable

---

## Common Issues & Troubleshooting

### Issue: Timeline Not Showing
**Solution:**
- Ensure order has `statusHistory` array populated
- Check browser console for errors
- Verify socket connection is established
- Reload page and check again

### Issue: Real-Time Updates Not Working
**Solution:**
- Verify both servers are running (backend on 5000, frontend on 5173)
- Check browser console for socket connection errors
- Ensure users are logged in (socket requires token)
- Try refreshing the page
- Check that JWT token is in localStorage

### Issue: Warnings Not Showing
**Solution:**
- Verify product has quantity field set
- Check if quantity is actually < 10
- Refresh products list
- Check browser console for errors

### Issue: Dark Mode Not Working
**Solution:**
- Verify `darkMode: "class"` is in tailwind.config.js
- Check that theme state is in App.jsx
- Ensure `dark:` classes are in components
- Try clearing browser cache and reloading

---

## Data Validation

### Order Status Values (Must match backend):
✅ "Pending"
✅ "Accepted"
✅ "Packed"
✅ "Shipped"
✅ "Out for Delivery"
✅ "Delivered"
✅ "Cancelled"

### Stock Level Thresholds:
- Green (Safe): quantity >= 10
- Yellow (Low): quantity >= 3 and < 10
- Red (Critical): quantity < 3
- Out of Stock: quantity = 0

---

## Performance Testing

### Expected Behavior:
- [ ] Timeline renders in < 100ms
- [ ] Socket updates appear in < 500ms
- [ ] Page doesn't lag when displaying many orders
- [ ] Modal opens/closes smoothly
- [ ] No console errors

---

## Browser Compatibility

Test in:
- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

---

## Success Criteria

All features are working correctly when:

✅ **Order Timeline**
- Visual progression shown correctly
- Real-time updates without page refresh
- Timestamps accurate
- All 6 statuses displayed in order

✅ **Cancellations**
- Reason clearly displayed in red alert
- Date/time of cancellation shown
- Accessible and readable

✅ **Stock Warnings**
- Low stock identified correctly
- Multiple warning levels working
- Out of stock prevents ordering
- Warnings appear in all relevant locations

✅ **Real-Time Features**
- Socket events received immediately
- Dashboard updates without refresh
- Multi-user scenarios work correctly

✅ **Dark Mode**
- All components render properly
- Text is readable
- Colors are appropriate

---

## Quick Test Commands

If you need to test via API directly:

```bash
# Get all orders (as admin)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/orders/admin

# Get your orders
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/orders/me

# Update order status
curl -X PATCH http://localhost:5000/orders/ORDER_ID/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"Shipped"}'

# Cancel order
curl -X POST http://localhost:5000/orders/ORDER_ID/cancel \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Out of stock"}'
```

---

## Feedback Notes

After testing, document:
- Any UI/UX issues
- Missing functionality
- Performance problems
- Suggestions for improvement
- Browser-specific issues
