export const formatCurrency = (amount, currency = 'USD') => {
  if (Number(amount) === 0) {
    return 'Free';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};
