# User Profile Management Feature

## Overview

A complete user profile management system has been integrated into the Dashboard, allowing users to view and update their personal and contact information with a clear, intuitive interface.

## ✨ Features

### 1. **View Profile Information**
Users can see their profile details at a glance:
- Hospital/Organization Name
- Email Address
- Primary Phone Number
- Delivery Address Status

### 2. **Edit Profile**
Inline editing capability with form validation:
- Update hospital/organization name
- Manage primary phone number
- View email (read-only for security)
- Real-time validation and error messages

### 3. **Profile Completion Tracking**
Visual indicator showing profile completion:
- Progress bar (0-100%)
- Completed/Total fields display
- List of missing fields
- Motivational messaging

### 4. **Auto-Sync with Order Placement**
Profile information automatically used during checkout:
- Hospital name in order details
- Phone number for delivery contact
- Default delivery address if saved
- No need to re-enter information

## 📁 Implementation

### Backend

#### API Endpoints

**GET /api/auth/me** - Get current user profile
```json
{
  "user": {
    "_id": "userId",
    "name": "Hospital Name",
    "email": "hospital@example.com",
    "phone": "+919876543210",
    "deliveryAddresses": [],
    "preferredAddressId": null,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-29T00:00:00Z"
  },
  "profileCompletion": {
    "percentage": 75,
    "completedFields": 3,
    "totalFields": 4,
    "missingFields": ["phone"]
  }
}
```

**GET /api/addresses/profile/completion** - Get profile completion details
```json
{
  "completion": {
    "percentage": 75,
    "completedFields": 3,
    "totalFields": 4,
    "missingFields": ["phone"]
  },
  "user": {
    "name": "Hospital Name",
    "email": "hospital@example.com",
    "phone": "+919876543210",
    "hasAddress": true
  }
}
```

**PATCH /api/addresses/profile/update** - Update profile information
```json
{
  "name": "Updated Hospital Name",
  "phone": "+919876543210"
}
```

Response:
```json
{
  "msg": "Profile updated successfully",
  "completion": {
    "percentage": 100,
    "completedFields": 4,
    "totalFields": 4,
    "missingFields": []
  },
  "user": {
    "name": "Updated Hospital Name",
    "email": "hospital@example.com",
    "phone": "+919876543210",
    "hasAddress": true
  }
}
```

### User Model Enhancement

Updated `User.js` with profile completion method:

```javascript
userSchema.methods.getProfileCompletion = function () {
  const fields = {
    name: Boolean(this.name),
    email: Boolean(this.email),
    phone: Boolean(this.phone),
    deliveryAddress: this.deliveryAddresses && this.deliveryAddresses.length > 0,
  };

  const completedFields = Object.values(fields).filter(Boolean).length;
  const totalFields = Object.keys(fields).length;

  return {
    percentage: Math.round((completedFields / totalFields) * 100),
    completedFields,
    totalFields,
    missingFields: Object.keys(fields).filter((key) => !fields[key]),
  };
};
```

### Frontend

#### UserProfile Component

Located at: `frontend/src/components/UserProfile.jsx`

**Features:**
- Dual mode: View and Edit
- Real-time form validation
- Error and success messaging
- Loading states
- Responsive design
- Dark mode support

**State Management:**
- `profileData` - Current user profile
- `isEditing` - Toggle edit mode
- `formData` - Form input values
- `saving` - Save operation state
- `successMessage` - Success notifications
- `errorMessage` - Error notifications

**Key Functions:**
- `fetchProfileData()` - Fetch user profile
- `handleInputChange()` - Handle form input
- `handleSave()` - Save profile changes
- `handleCancel()` - Cancel editing

#### Dashboard Integration

UserProfile component is placed at the top of Dashboard in the following order:

1. **UserProfile** - Personal information
2. **ProfileCompletionIndicator** - Quick completion overview
3. **AddressManager** - Delivery addresses
4. **InventoryTable** - Inventory management

## 🎯 User Experience

### Normal Flow

```
Dashboard
  ↓
View My Profile (UserProfile component shows)
  ↓
Click "Edit Profile"
  ↓
Fill in missing information
  ↓
Click "Save Changes"
  ↓
Profile updated successfully
  ↓
Information available during checkout
```

### Profile Completion Journey

```
0% → Missing: name, email, phone, address
  ↓
25% → Name added
  ↓
50% → Name + Email added
  ↓
75% → Name + Email + Phone added
  ↓
100% → All fields complete ✅
```

### Order Placement Integration

When placing an order:
```
1. Click "Place Order" on product
2. Order modal appears
3. If saved addresses exist:
   - Dropdown shows saved addresses
   - Preferred address auto-selected
   - Fields auto-populate from profile
4. User confirms and places order
5. Hospital name from profile used in order details
```

## 📊 Profile Completion Fields

### Required Fields

1. **Hospital/Organization Name** (name field)
   - Text input
   - Display name for organization
   - Used in order headers and communications

2. **Email Address** (email field)
   - Read-only field
   - Set during registration
   - Cannot be changed
   - Used for communications and notifications

3. **Phone Number** (phone field)
   - Telephone input
   - Primary contact number
   - Used for order delivery contact
   - Can be updated anytime

4. **Delivery Address** (from AddressManager)
   - At least one address should be saved
   - Managed in separate AddressManager component
   - Can have multiple addresses with preferred selection

## 🔒 Security

### Data Protection
- ✅ Authentication required to access profile
- ✅ Users can only edit their own profile
- ✅ Email is read-only (set at registration)
- ✅ Phone number can be updated
- ✅ All changes are logged in database

### Privacy
- ✅ Profile data not shared with other users
- ✅ Only admin can view user profiles (for admin only)
- ✅ Sensitive data excluded from API responses

## 📱 Responsive Design

### Desktop (>1024px)
- Two-column layout for forms
- Full-width info cards
- Side-by-side action buttons

### Tablet (768px-1024px)
- Single column layout
- Stacked form fields
- Full-width buttons

### Mobile (<768px)
- Single column
- Touch-friendly buttons (44px+ height)
- Optimized spacing
- Scrollable content

## 🌙 Dark Mode Support

All profile components support dark mode:
- Background colors adapt
- Text colors maintain contrast
- Borders and accents adjust
- Form inputs have dark variants

## ⚙️ Configuration

### Environment Variables
None specific to profile feature. Uses existing:
- `VITE_API_BASE_URL` - API base URL
- JWT authentication tokens

### Dependencies
- React hooks (useState, useEffect)
- API service from `services/api.js`
- Tailwind CSS for styling

## 🧪 Testing

### Manual Testing Checklist

- [ ] Load dashboard and see profile component
- [ ] View profile in read mode
- [ ] Click "Edit Profile" button
- [ ] Fill in hospital name field
- [ ] Verify phone number input accepts digits
- [ ] Try to edit email (should be disabled)
- [ ] Click "Save Changes"
- [ ] Verify success message appears
- [ ] Refresh page and verify changes persisted
- [ ] Verify profile completion percentage updated
- [ ] Test dark mode toggle
- [ ] Test mobile responsive view
- [ ] Test error handling (empty required fields)
- [ ] Verify profile data used during checkout

## 🐛 Common Issues

### Issue: Profile not loading
**Solution:**
1. Clear browser cache
2. Check network tab for API errors
3. Verify authentication token exists
4. Check console for JavaScript errors

### Issue: Changes not saving
**Solution:**
1. Verify internet connection
2. Check form validation (required fields)
3. Look for validation errors in form
4. Try refreshing and saving again

### Issue: Profile completion stuck at 75%
**Solution:**
1. Add a delivery address in AddressManager
2. This will complete the profile to 100%

### Issue: Email field shows "Not provided"
**Solution:**
1. Email comes from registration
2. Contact admin if email is incorrect
3. Cannot be changed through profile

## 🚀 Performance

### Optimization
- ✅ Lazy loading of profile data
- ✅ Debounced form input
- ✅ Memoized components
- ✅ Conditional rendering for edit mode
- ✅ Efficient re-renders

### API Calls
- Single API call on component mount
- Fallback to `/auth/me` if `/addresses/profile/completion` fails
- Updates triggered only on save action

## 📈 Future Enhancements

- [ ] Profile picture upload
- [ ] Additional contact persons
- [ ] Organization details (GST, license)
- [ ] Billing address separate from delivery
- [ ] Email change with verification
- [ ] Phone number change with OTP verification
- [ ] Activity log of profile changes
- [ ] Bulk address import from CSV

## 📚 Related Components

- **AddressManager** - Manages delivery addresses
- **ProfileCompletionIndicator** - Quick completion overview
- **ProductsList** - Uses profile during checkout
- **Dashboard** - Parent component containing UserProfile

## 🔗 API Routes

### Auth Routes
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `GET /api/auth/hospitals` - Get all hospitals (admin)

### Address Routes
- `GET /api/addresses` - Get all addresses
- `POST /api/addresses` - Add new address
- `PATCH /api/addresses/:id` - Update address
- `DELETE /api/addresses/:id` - Delete address
- `PATCH /api/addresses/:id/set-preferred` - Set preferred address
- `GET /api/addresses/profile/completion` - Get profile completion
- `PATCH /api/addresses/profile/update` - Update profile

## 📝 Summary

The User Profile Management feature provides:
- ✅ Complete profile information management
- ✅ Real-time profile completion tracking
- ✅ Auto-sync with order placement
- ✅ Intuitive, user-friendly interface
- ✅ Secure and validated operations
- ✅ Full responsive and dark mode support
- ✅ Production-ready implementation

Users can now maintain accurate contact and delivery information while enjoying a smooth, efficient checkout experience.
