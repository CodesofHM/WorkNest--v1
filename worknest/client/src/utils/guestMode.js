export const isGuestUser = (user) => Boolean(user?.isAnonymous);

export const GUEST_LIMITS = {
  clients: 1,
  proposals: 1,
  invoices: 1,
};

export const guestLimitMessage = (resourceName) =>
  `Guest accounts can create only one ${resourceName}. Sign up to unlock unlimited records.`;
