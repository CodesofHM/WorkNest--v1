
// services/SubscriptionService.js
import { doc, updateDoc, getDoc, collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';

export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    limits: {
      clients: 5,
      proposals: 3,
      invoices: 5,
      aiCredits: 0,
      customBranding: false,
      prioritySupport: false
    }
  },
  PRO: {
    id: 'pro', 
    name: 'Pro',
    price: 199,
    limits: {
      clients: 50,
      proposals: 25,
      invoices: 100,
      aiCredits: 100,
      customBranding: true,
      prioritySupport: false
    }
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium', 
    price: 499,
    limits: {
      clients: 'unlimited',
      proposals: 'unlimited',
      invoices: 'unlimited',
      aiCredits: 500,
      customBranding: true,
      prioritySupport: true
    }
  }
};

export const getUserSubscription = async (userId) => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  return userDoc.data()?.subscription || SUBSCRIPTION_PLANS.FREE;
};

export const upgradeSubscription = async (userId, planId) => {
  const subscription = {
    ...SUBSCRIPTION_PLANS[planId.toUpperCase()],
    status: 'active',
    startDate: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  };

  await updateDoc(doc(db, 'users', userId), {
    subscription: subscription
  });

  return subscription;
};

export const checkFeatureAccess = (userSubscription, feature, currentUsage = 0) => {
  const limit = userSubscription.limits[feature];
  if (limit === 'unlimited') return true;
  if (typeof limit === 'number') return currentUsage < limit;
  return limit === true;
};