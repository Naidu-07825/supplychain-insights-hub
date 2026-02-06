# Enhancement Features - Quick Reference Guide

## 🎯 Feature Overview

### 1. **Edit Orders Until Accepted** ✏️
- Users can modify pending orders before admin acceptance
- Edit quantity, delivery address, phone, and notes
- Editing disabled once order is accepted
- Admin gets edit notification

**How to Use:**
1. Go to "My Orders"
2. Find Pending order
3. Click "✏️ Edit" button
4. Modify fields as needed
5. Click "Save Changes"

**API:** `PATCH /orders/{orderId}/edit`

---

### 2. **Product Suggestions** 💡
- Automatic suggestions when product is out of stock
- Shows similar products by price range (±20%)
- Up to 5 alternatives displayed
- Helps avoid order failures

**How to Use:**
1. Click "Place Order" for out-of-stock product
2. Look for "Similar Products Available" section
3. See alternatives with price and stock info
4. Choose alternative or wait for restock

**API:** `GET /orders/suggestions/{productId}`

---

### 3. **Order Notes** 📝
- Add special instructions while ordering
- Notes visible to admin and user
- Editable for pending orders
- Examples: delivery instructions, urgent needs, handling requirements

**How to Use:**
1. In order placement modal, scroll to "Special Instructions"
2. Type in delivery notes (optional)
3. Examples:
   - "Deliver between 2-5 PM"
   - "Fragile items - handle with care"
   - "Deliver to lab on 3rd floor"
4. Complete order

**Where Visible:**
- Admin: Order Details Modal → "📝 Special Instructions"
- User: My Orders page → Each order card

---

### 4. **Pending Order Reminders** ⏰
- Automatic email to admins after 24+ hours pending
- Includes order summary in table format
- Runs every hour (background job)
- Prompts timely action

**How It Works:**
- Order stays pending > 24 hours
- Scheduler checks every hour
- If pending → send reminder email
- Email includes order table with details
- Admins can immediately log in and process

**Configuration:**
Edit `backend/utils/pendingOrderReminder.js`:
```javascript
// Line 45: Change hours threshold
checkPendingOrdersAndRemind(24)  // Change to 48 for 48 hours

// Line 67: Change check frequency
60 * 60 * 1000  // Every hour - change to desired ms
```

---

### 5. **Delivery Confirmation Email** 📧
- Sent automatically when order marked "Delivered"
- Professional invoice format
- Complete pricing breakdown
- Includes discount (if applicable)
- Suitable for records

**Contents:**
- Order ID & Delivery Date
- Itemized products (name, qty, price, subtotal)
- Order summary (subtotal, discount, final amount)
- Delivery address
- Thank you message

---

## 📋 Testing Checklist

### Order Editing
- [ ] Pending order shows "Edit" button
- [ ] Accepted order doesn't show "Edit" button
- [ ] Can update quantity in edit modal
- [ ] Can update delivery address
- [ ] Can update phone numbers
- [ ] Can update special notes
- [ ] Discount recalculates correctly
- [ ] Admin gets edit notification email
- [ ] Order details update in real-time

### Product Suggestions
- [ ] Out-of-stock product shows "Similar Products" section
- [ ] In-stock product doesn't show suggestions
- [ ] Suggestions are within price range
- [ ] Max 5 suggestions shown
- [ ] Product info (name, price, qty) displays correctly

### Order Notes
- [ ] Notes field appears in order modal
- [ ] Notes are optional (can be blank)
- [ ] Notes saved with order
- [ ] Admin sees notes in order details
- [ ] User sees notes in My Orders
- [ ] Notes visible in delivery email

### Pending Reminders
- [ ] Scheduler starts on server startup (check logs)
- [ ] Email sent after 24 hours pending (test manually)
- [ ] All admins receive email
- [ ] Table shows all pending order details
- [ ] Email links work and encourage action

### Delivery Email
- [ ] Email sent when status → "Delivered"
- [ ] Email has professional formatting
- [ ] All items listed correctly
- [ ] Pricing breakdown visible
- [ ] Discount shown if applicable
- [ ] Delivery address correct

---

## 🔧 Configuration & Customization

### Change Reminder Threshold
```javascript
// File: backend/utils/pendingOrderReminder.js
// Around line 45
startPendingOrderReminderSchedule(48)  // Change 24 to 48 hours
```

### Change Check Frequency
```javascript
// File: backend/utils/pendingOrderReminder.js
// Around line 67
// Current: every 1 hour
const intervalId = setInterval(() => {
  checkPendingOrdersAndRemind(24);
}, 60 * 60 * 1000);  // Change this value

// Examples:
// 30 * 60 * 1000    = Every 30 minutes
// 2 * 60 * 60 * 1000 = Every 2 hours
```

### Customize Suggestion Algorithm
```javascript
// File: backend/controllers/orderController.js
// Around line 455 in getSuggestedProducts

// Change price range (currently ±20%):
const priceRange = product.price * 0.2;  // Change 0.2 to other value
// 0.1 = ±10%, 0.3 = ±30%, 0.5 = ±50%

// Change max suggestions (currently 5):
.limit(5)  // Change to desired number
```

---

## 📊 Email Templates Reference

### Order Placed
- Recipient: All admins
- Trigger: When order created
- Contents: Order details, items, address, total

### Order Accepted
- Recipient: Customer
- Trigger: Admin accepts order
- Contents: Acceptance confirmation, pricing

### Order Edited
- Recipient: All admins
- Trigger: User edits pending order
- Contents: Updated details, new items, new address

### Pending Reminder
- Recipient: All admins
- Trigger: Order pending > 24 hours
- Contents: Table of pending orders, urgent prompt

### Order Delivered
- Recipient: Customer
- Trigger: Status changed to "Delivered"
- Contents: Invoice, itemized list, final amount

### Order Cancelled
- Recipient: Customer
- Trigger: Admin cancels order
- Contents: Cancellation notice, reason

---

## 🚀 Performance Considerations

### Pending Order Reminder
- Runs every hour (background)
- Won't block server operations
- Database query optimized with lean()
- Consider database indexing on `status` and `createdAt`

### Product Suggestions
- Lightweight API call
- Returns max 5 documents
- Price range filtering optimized
- Cache suggestions in frontend if needed

### Order Editing
- Validates ownership and status
- Recalculates discount instantly
- Updates all connected clients via socket

---

## 🐛 Troubleshooting

### Notes not showing in admin view
- Refresh order details modal
- Check if notes were actually saved with order
- Verify notes field in database exists

### Suggestions not appearing
- Check if product quantity is actually 0
- Verify price range logic (±20%)
- Ensure API endpoint returns results

### Edit button not visible
- Check order status is "Pending"
- Refresh page
- Clear browser cache

### Reminders not sending
- Check server logs for scheduler start
- Verify admin email addresses in database
- Check SMTP credentials in .env
- Manually test: `node utils/pendingOrderReminder.js`

### Delivery email missing invoice
- Verify order has items with pricing
- Check if status actually changed to "Delivered"
- Inspect email template in emailTemplates.js

---

## 📱 API Request Examples

### Edit Order
```bash
curl -X PATCH http://localhost:5000/api/orders/123abc/edit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"product": "prodId", "quantity": 5}],
    "address": "New Address",
    "phone": "9876543210",
    "altPhone": "9876543211",
    "notes": "Special delivery instructions"
  }'
```

### Get Suggestions
```bash
curl http://localhost:5000/api/orders/suggestions/productId \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Place Order with Notes
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"product": "prodId", "quantity": 3}],
    "address": "Delivery Address",
    "phone": "9876543210",
    "contactEmail": "user@example.com",
    "notes": "Handle with care - fragile items"
  }'
```

---

## 📞 Support & Contact

For issues or questions about these features:
1. Check logs: `backend/` for server logs
2. Check browser console for frontend errors
3. Review implementation in files listed in summary
4. Test with sample data

---

**Last Updated:** January 2026
**Version:** 1.0
**Status:** ✅ Production Ready
