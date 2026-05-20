import React from 'react';
import Badge from '../common/Badge';
import { useLanguage } from '../../context/LanguageContext';

const OrderStatusBadge = ({ status }) => {
  const { t } = useLanguage();
  const mapping = {
    // Service status
    pending: { variant: 'warning', label: t('status.pending') },
    in_progress: { variant: 'primary', label: t('status.in_progress') },
    delivered: { variant: 'success', label: t('status.delivered') },
    completed: { variant: 'success', label: t('status.completed') },
    cancelled: { variant: 'danger', label: t('status.cancelled') },
    // Payment status
    paid: { variant: 'success', label: t('status.paid') },
    failed: { variant: 'danger', label: t('status.failed') },
    refunded: { variant: 'neutral', label: t('status.refunded') },
  };

  const config = mapping[status] || { variant: 'neutral', label: status };

  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default OrderStatusBadge;
