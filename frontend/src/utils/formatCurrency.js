export const formatCurrency = (amount, currency = 'USD') => {
  const n = Number(amount);
  const value = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(value);
};
