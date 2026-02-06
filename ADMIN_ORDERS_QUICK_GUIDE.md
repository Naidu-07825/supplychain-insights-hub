# Admin Orders - Quick Reference Guide

## 🎯 What's New

Admin interface for managing orders with complete transparency:
- ✅ Full customer information visible
- ✅ Complete delivery and contact details
- ✅ Organized table layout with search/filter
- ✅ Detailed modal for order management
- ✅ Real-time status updates

---

## 📊 Orders Table View

### Column Breakdown

| Column | Shows | Details |
|--------|-------|---------|
| **Order ID** | Shortened order ID | First 8 characters |
| **Hospital/Company** | Organization name & email | Name on first line, email below |
| **Phone** | Primary & alternative phone | Phone on first line, alt below |
| **Items** | Item count & preview | Shows first 2 items, "+X more" |
| **Amount** | Final amount & discount | Amount in blue, discount below |
| **Date** | Order placement date | Formatted as DD MMM YYYY |
| **Status** | Current status badge | Color-coded badge |
| **Action** | View Details button | Opens detailed modal |

### Status Colors
```
🟨 Pending       - Yellow badge
🟦 Accepted      - Blue badge
🟪 Packed        - Purple badge
🟦 Shipped       - Indigo badge
🟧 Out for Del.  - Orange badge
🟩 Delivered     - Green badge
🟥 Cancelled     - Red badge
```

---

## 🔍 Search & Filter

### Search (Real-time)
**Search by any of:**
- Hospital/Company name
- Email address
- Phone number
- Product name

**Example searches:**
```
"ABC Hospital"           → Find all orders from ABC Hospital
"abc@hospital.com"       → Find orders from that email
"9876543210"            → Find orders with that phone
"Oxygen"                → Find orders containing Oxygen product
```

### Filter by Status
**Dropdown menu options:**
- All Statuses (default)
- Pending
- Accepted
- Packed
- Shipped
- Out for Delivery
- Delivered
- Cancelled

**Combine with search:**
- Search: "ABC Hospital" + Filter: "Pending" = All pending orders from ABC Hospital

---

## 📋 Order Details Modal

### Information Sections

#### 1. Current Status (Top)
```
Status badge with color coding
E.g.: 🟨 Pending
```

#### 2. Order Metadata
```
📅 Order Date: Jan 15, 2026 10:30 AM
💳 Payment Method: COD
```

#### 3. 🏥 Hospital/Company Information
```
Name:              ABC Medical Center
Email:             contact@abcmedical.com
Phone:             +91-9876543210
Alternative Phone: +91-9876543211
```

#### 4. 📍 Delivery Address
```
Complete address for delivery
Exact address where order will be delivered
Can be multi-line
```

#### 5. 📦 Order Items
```
Item 1: Product Name
        Qty: 5 × ₹100 = ₹500

Item 2: Product Name
        Qty: 3 × ₹150 = ₹450
```

#### 6. 💰 Order Summary
```
Total Price:    ₹2,000.00
Discount:       -₹500.00
─────────────────────────
Final Amount:   ₹1,500.00
```

#### 7. Action Buttons
```
[📊 Update Status] [⛔ Cancel Order] [🗑️ Delete]
```

---

## 🎮 How to Use

### View Order Details
```
1. Find order in table
2. Click [👁️ View Details] button
3. Modal opens with all information
4. Read complete order details
5. Click ✕ to close modal
```

### Update Order Status
```
1. Open order details modal
2. Click [📊 Update Status] button
3. Select new status from dropdown:
   ├─ Accepted
   ├─ Packed
   ├─ Shipped
   ├─ Out for Delivery
   └─ Delivered
4. Click [Update Status] button
5. ✅ Status updated
   └─ Table refreshes
   └─ Customer notified
```

### Cancel an Order
```
1. Open order details modal
2. Click [⛔ Cancel Order] button
3. Enter reason (required):
   ├─ Out of stock
   ├─ Customer request
   ├─ Payment failed
   ├─ Address issue
   └─ Other reason
4. Click [Confirm Cancel] button
5. ✅ Order cancelled
   └─ Status changed to "Cancelled"
   └─ Customer notified with reason
```

### Delete an Order
```
1. Open order details modal
2. Click [🗑️ Delete] button
3. Confirm in popup: "Are you sure?"
4. Click "Yes" to confirm
5. ✅ Order permanently deleted
   └─ Removed from database
   └─ Cannot be recovered
```

---

## 💡 Tips & Tricks

### Search Tips
- **Partial name search:** "ABC" finds "ABC Hospital"
- **Phone search:** "987654" finds "9876543210"
- **Product search:** "Oxygen" finds "Oxygen Cylinder"
- **Case-insensitive:** Search works with any case

### Filter Tips
- **All pending orders:** Filter "Pending" only
- **Recently delivered:** Filter "Delivered" + Sort
- **Need action:** Filter "Pending" or "Accepted"

### Management Tips
- **Batch operations:** Open multiple modals in tabs
- **Quick status:** Update then close modal
- **Document reason:** Always add reason when cancelling
- **Verify before delete:** Confirm order details before deleting

---

## ⚡ Quick Actions Keyboard

| Action | Shortcut |
|--------|----------|
| Search box | Click search field |
| Filter dropdown | Click status dropdown |
| View details | Click button or Enter |
| Close modal | Click ✕ or Esc key |
| Update status | Select + Click button |
| Cancel order | Click button + Reason + Enter |

---

## 📱 Mobile View

### On Mobile Devices
```
┌─────────────────────┐
│ Search box (full)   │
│ Filter dropdown     │
│                     │
│ [Horizontal scroll] │
│ Order 1 | Order 2   │
│ Order 3 | Order 4   │
└─────────────────────┘

Modal: Full screen
       Close via ✕
       Scroll for content
```

### Desktop View
```
┌─────────────────────────────────────────────────────┐
│ Search box          | Filter dropdown              │
│                                                     │
│ [─────────────────────────────────────────────────] │
│ Order ID | Hospital | Phone | Items | Amount | ... │
│ ────────────────────────────────────────────────── │
│ 5d4b     │ ABC     │ 98765 │ 2     │ ₹1500  │ [👁️] │
│ ────────────────────────────────────────────────── │
│ 5d4c     │ XYZ     │ 98766 │ 5     │ ₹3000  │ [👁️] │
└─────────────────────────────────────────────────────┘

Modal: Side panel or centered
       Scrollable content
       All buttons visible
```

---

## 🔔 Notifications

### When Status Updated
```
Customer Receives Email:
Subject: Order {ID} Status Updated
Content: Your order status is now {NEW_STATUS}
```

### When Order Cancelled
```
Customer Receives Email:
Subject: Order {ID} Cancelled
Content: Your order was cancelled.
         Reason: {PROVIDED_REASON}
```

### When Order Delivered
```
Customer Receives Email:
Subject: Invoice - Order {ID}
Content: Your order has been delivered!
         Please find invoice attached.
```

---

## ❓ FAQ

### Q: Can I search for multiple items?
**A:** No, one search at a time. Combine search + filter for better results.

### Q: Will deleted orders be recoverable?
**A:** No, deletion is permanent. Always verify before deleting.

### Q: What if I cancel an order by mistake?
**A:** Place a new order for the customer. Cannot undo cancellation.

### Q: How long does status update take?
**A:** Instant (< 1 second). Customer notified immediately.

### Q: Can I edit customer information?
**A:** No, customer info is read-only. Ask customer to update in their profile.

### Q: What's the difference between Cancel and Delete?
**A:** Cancel = Status changes to "Cancelled" (visible in history)
    Delete = Permanently removes order (cannot recover)

### Q: Can I reorder a cancelled order?
**A:** No. Customer must place new order manually.

### Q: Why is alt phone sometimes empty?
**A:** Customer didn't provide secondary phone during checkout.

---

## 📊 Workflows

### Workflow 1: Accept New Order
```
Order Status: Pending
        ↓
Click [👁️ View Details]
        ↓
Read order info to verify
        ↓
Click [📊 Update Status]
        ↓
Select "Accepted"
        ↓
Click [Update Status]
        ↓
✅ Status → Accepted
✅ Customer notified
✅ Table updates
```

### Workflow 2: Process & Deliver
```
Status: Accepted
   ↓ Click Update
Status: Packed
   ↓ Click Update
Status: Shipped
   ↓ Click Update
Status: Out for Delivery
   ↓ Click Update
Status: Delivered ✅
   ↓
Customer receives invoice email
```

### Workflow 3: Handle Issue
```
Status: Pending
Issue: Customer wants to cancel
        ↓
Click [👁️ View Details]
        ↓
Click [⛔ Cancel Order]
        ↓
Type reason: "Customer Request"
        ↓
Click [Confirm Cancel]
        ↓
✅ Status → Cancelled
✅ Customer notified with reason
```

---

## 🎨 Theme Support

### Light Mode (Default)
- White background
- Dark text
- Blue accents
- Clear contrast

### Dark Mode
- Dark gray background
- Light text
- Blue accents
- Reduced eye strain

**Toggle:** System settings or app theme button

---

## 📈 Analytics Quick View

```
Total Orders: [COUNT]
Showing: [FILTERED COUNT] of [TOTAL COUNT]

Status Breakdown:
🟨 Pending: [COUNT]
🟦 Accepted: [COUNT]
🟪 Packed: [COUNT]
🟦 Shipped: [COUNT]
🟧 Out for Delivery: [COUNT]
🟩 Delivered: [COUNT]
🟥 Cancelled: [COUNT]
```

---

## ✅ Verification Checklist

Before processing orders, verify:

**Customer Information**
- [ ] Hospital/Company name present
- [ ] Email address valid
- [ ] Phone number complete
- [ ] Address readable

**Order Details**
- [ ] All items listed
- [ ] Quantities correct
- [ ] Prices calculated
- [ ] Amount matches

**Payment**
- [ ] Payment method shown (COD)
- [ ] Final amount correct
- [ ] Discount applied if any

**Delivery**
- [ ] Address complete
- [ ] Address in service area
- [ ] Contact info accurate

---

## 🆘 Need Help?

### Common Issues

**Orders not loading?**
→ Refresh page
→ Check internet connection
→ Verify admin access

**Search not working?**
→ Try different search term
→ Check spelling
→ Clear search box

**Modal not opening?**
→ Click View Details again
→ Refresh page
→ Check for errors in console

**Status update failed?**
→ Select valid status
→ Check connection
→ Try again

---

## 📞 Support

For issues:
1. Check this guide
2. Review error messages
3. Try refreshing
4. Contact IT support

**Email:** support@supplychainhub.com
**Hours:** 9 AM - 6 PM IST

---

## 🚀 Getting Started

1. **Login** to Admin Dashboard
2. **Navigate** to Orders page
3. **Search** or **Filter** for orders
4. **Click** View Details to see complete info
5. **Update** status or manage order
6. **Repeat** for next order

**You're ready to manage orders efficiently!** 🎉

---

Last Updated: January 29, 2026
Version: 1.0
