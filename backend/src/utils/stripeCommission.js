const getPlatformCommissionPercent = () => {
  const rawValue = Number(process.env.PLATFORM_COMMISSION_PERCENT ?? 0);

  if (!Number.isFinite(rawValue) || rawValue < 0) {
    return 0;
  }

  return Math.min(rawValue, 100);
};

const getApplicationFeeAmount = (unitAmount) => {
  const commissionPercent = getPlatformCommissionPercent();

  if (!Number.isFinite(unitAmount) || unitAmount <= 0 || commissionPercent <= 0) {
    return null;
  }

  return Math.round(unitAmount * (commissionPercent / 100));
};

module.exports = {
  getPlatformCommissionPercent,
  getApplicationFeeAmount,
};
