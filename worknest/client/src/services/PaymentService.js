// services/PaymentService.js
import { loadScript } from '../utils/loadScript';

export const initializeRazorpay = async () => {
  return await loadScript('https://checkout.razorpay.com/v1/checkout.js');
};

export const createSubscriptionOrder = async (planId, userId) => {
  const response = await fetch('/api/payments/create-subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId, userId })
  });

  return response.json();
};

export const processSubscriptionPayment = (orderData, onSuccess, onFailure) => {
  const options = {
    key: process.env.REACT_APP_RAZORPAY_KEY,
    amount: orderData.amount,
    currency: 'INR',
    name: 'WorkNest',
    description: `${orderData.planName} Subscription`,
    order_id: orderData.orderId,
    handler: function(response) {
      // Verify payment on backend
      verifyPayment(response)
        .then(onSuccess)
        .catch(onFailure);
    },
    prefill: {
      name: orderData.userName,
      email: orderData.userEmail,
      contact: orderData.userPhone
    },
    theme: {
      color: '#3B82F6'
    },
    modal: {
      ondismiss: onFailure
    }
  };

  const razorpay = new window.Razorpay(options);
  razorpay.open();
};

export const verifyPayment = async (paymentResponse) => {
  const response = await fetch('/api/payments/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentResponse)
  });

  if (!response.ok) {
    throw new Error('Payment verification failed');
  }

  return response.json();
};

// Server-side webhook handler
// server/routes/paymentWebhook.js
export const handlePaymentWebhook = async (req, res) => {
  const { event, payload } = req.body;

  switch(event) {
    case 'subscription.activated':
      await activateUserSubscription(payload.subscription.entity);
      break;
    case 'subscription.cancelled':
      await deactivateUserSubscription(payload.subscription.entity);
      break;
    case 'payment.captured':
      await recordPayment(payload.payment.entity);
      break;
  }

  res.status(200).json({ status: 'ok' });
};