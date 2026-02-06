exports.orderPlaced = (order, user) => {
  return `
    <h2>New Order Placed</h2>
    <p>Order ID: <b>${order.orderId}</b></p>
    <p>Placed by: <b>${user.name}</b> (${user.email})</p>
    <p>Items:</p>
    <ul>
      ${order.items.map(i => `<li>${i.name} x${i.quantity} - ₹${(i.subtotal || 0).toFixed(2)}</li>`).join('')}
    </ul>
    <p>Address: ${order.address}</p>
    <hr>
    <p><b>Order Total:</b> ₹${(order.totalPrice || 0).toFixed(2)}</p>
    ${order.discountPercentage ? `<p style="color: #4CAF50;"><b>Discount Applied:</b> ${order.discountPercentage}% - ₹${(order.discountAmount || 0).toFixed(2)}</p>` : ''}
    ${order.discountPercentage ? `<p style="font-size: 16px; color: #4CAF50;"><b>Final Amount:</b> ₹${(order.finalAmount || 0).toFixed(2)}</p>` : ''}
  `;
};

exports.orderAccepted = (order) => {
  return `
    <h2>Order Accepted</h2>
    <p>Your order <b>${order.orderId}</b> has been accepted by admin.</p>
    <p>Current status: <b>${order.status}</b></p>
    <hr>
    <p><b>Order Total:</b> ₹${(order.totalPrice || 0).toFixed(2)}</p>
    ${order.discountPercentage ? `<p style="color: #4CAF50;"><b>Discount:</b> ${order.discountPercentage}% - ₹${(order.discountAmount || 0).toFixed(2)}</p>` : ''}
    ${order.discountPercentage ? `<p style="font-size: 16px; color: #4CAF50;"><b>Final Amount:</b> ₹${(order.finalAmount || 0).toFixed(2)}</p>` : ''}
  `;
};

exports.orderCancelled = (order, reason) => {
  return `
    <h2>Order Cancelled</h2>
    <p>Your order <b>${order.orderId}</b> was cancelled.</p>
    <p>Reason: ${reason}</p>
  `;
};

exports.lowStock = (product) => {
  return `
    <h2>⚠️ Low Stock Alert</h2>
    <p>Product: <b>${product.name}</b></p>
    <p>Remaining quantity: <b>${product.quantity}</b></p>
  `;
};

exports.aiSuggestion = (product, suggested) => {
  return `
    <h2>AI Reorder Suggestion</h2>
    <p>Product: <b>${product.name}</b></p>
    <p>Suggested quantity to reorder: <b>${suggested}</b></p>
    <p>Based on recent order frequency and current stock.</p>
  `;
};

exports.otp = (otp) => {
  return `
    <h2>Verify Your Email</h2>
    <p>Your verification code is: <b>${otp}</b></p>
    <p>This code expires in 10 minutes.</p>
  `;
};
exports.orderDelivered = (order, user) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4CAF50;">Order Delivered Successfully!</h2>
      <p>Dear <b>${user.name}</b>,</p>
      <p>We're delighted to inform you that your order has been delivered.</p>
      
      <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
        <h3>Order Invoice</h3>
        <p><b>Order ID:</b> ${order.orderId}</p>
        <p><b>Delivery Date:</b> ${new Date().toLocaleDateString()}</p>
        
        <h4>Items:</h4>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background: #ddd; border: 1px solid #ccc;">
            <th style="padding: 8px; text-align: left;">Product</th>
            <th style="padding: 8px; text-align: center;">Qty</th>
            <th style="padding: 8px; text-align: right;">Price</th>
            <th style="padding: 8px; text-align: right;">Subtotal</th>
          </tr>
          ${order.items.map(i => `
            <tr style="border: 1px solid #ddd;">
              <td style="padding: 8px;">${i.name}</td>
              <td style="padding: 8px; text-align: center;">${i.quantity}</td>
              <td style="padding: 8px; text-align: right;">₹${(i.price || 0).toFixed(2)}</td>
              <td style="padding: 8px; text-align: right;">₹${(i.subtotal || 0).toFixed(2)}</td>
            </tr>
          `).join('')}
        </table>
        
        <div style="margin-top: 15px; text-align: right;">
          <p><b>Subtotal:</b> ₹${(order.totalPrice || 0).toFixed(2)}</p>
          ${order.discountPercentage ? `<p style="color: #4CAF50;"><b>Discount (${order.discountPercentage}%):</b> -₹${(order.discountAmount || 0).toFixed(2)}</p>` : ''}
          <p style="font-size: 16px; color: #4CAF50;"><b>Final Amount: ₹${(order.finalAmount || order.totalPrice || 0).toFixed(2)}</b></p>
        </div>
      </div>
      
      <p>Delivery Address: <b>${order.address}</b></p>
      <p>Thank you for your purchase! If you have any questions, please contact us.</p>
      <p>Best regards,<br><b>SupplyChain Insights Hub</b></p>
    </div>
  `;
};

exports.orderEdited = (order, user) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2196F3;">Order Updated</h2>
      <p>Order <b>#${order.orderId}</b> from <b>${user.name}</b> has been edited.</p>
      
      <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
        <h3>Updated Order Details</h3>
        <p><b>Order ID:</b> ${order.orderId}</p>
        <p><b>Status:</b> ${order.status}</p>
        
        <h4>Items:</h4>
        <ul>
          ${order.items.map(i => `<li>${i.name} x${i.quantity} - ₹${(i.subtotal || 0).toFixed(2)}</li>`).join('')}
        </ul>
        
        <p><b>Delivery Address:</b> ${order.address}</p>
        <p><b>Phone:</b> ${order.phone}</p>
        ${order.notes ? `<p><b>Special Instructions:</b> ${order.notes}</p>` : ''}
        
        <p style="margin-top: 15px;"><b>Order Total:</b> ₹${(order.totalPrice || 0).toFixed(2)}</p>
        ${order.discountPercentage ? `<p style="color: #4CAF50;"><b>Discount (${order.discountPercentage}%):</b> -₹${(order.discountAmount || 0).toFixed(2)}</p>` : ''}
        <p style="font-size: 16px; color: #2196F3;"><b>Final Amount: ₹${(order.finalAmount || order.totalPrice || 0).toFixed(2)}</b></p>
      </div>
      
      <p>Please review the updated order details and take necessary action.</p>
    </div>
  `;
};

exports.pendingOrderReminder = (orders, hoursThreshold) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
      <h2 style="color: #FF9800;">⏰ Pending Order Reminder</h2>
      <p>You have <b style="color: #FF9800;">${orders.length}</b> order(s) that have been pending for more than <b>${hoursThreshold} hours</b>.</p>
      <p>Please review and take necessary action.</p>
      
      <div style="margin-top: 20px;">
        <h3>Pending Orders:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background: #FFF3E0; border: 1px solid #FFB74D;">
            <th style="padding: 10px; text-align: left;">Order ID</th>
            <th style="padding: 10px; text-align: left;">Customer</th>
            <th style="padding: 10px; text-align: left;">Placed At</th>
            <th style="padding: 10px; text-align: right;">Amount</th>
          </tr>
          ${orders.map(o => `
            <tr style="border: 1px solid #FFB74D;">
              <td style="padding: 10px;"><b>#${o.orderId}</b></td>
              <td style="padding: 10px;">${o.user ? o.user.name : 'N/A'}</td>
              <td style="padding: 10px;">${new Date(o.createdAt).toLocaleString()}</td>
              <td style="padding: 10px; text-align: right;">₹${(o.finalAmount || o.totalPrice || 0).toFixed(2)}</td>
            </tr>
          `).join('')}
        </table>
      </div>
      
      <div style="margin-top: 20px; padding: 15px; background: #FFF3E0; border-left: 4px solid #FF9800; border-radius: 5px;">
        <p><b>Action Required:</b> Please log in to the admin dashboard to review and accept or reject these pending orders.</p>
      </div>
      
      <p style="margin-top: 20px;">Best regards,<br><b>SupplyChain Insights Hub</b></p>
    </div>
  `;
};