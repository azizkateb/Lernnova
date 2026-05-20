import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { useLanguage } from '../../context/LanguageContext';

const ConfirmDialog = ({
  isOpen,
  title,
  description,
  confirmText,
  cancelText,
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
  loading,
}) => {
  const { t } = useLanguage();

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <div className="space-y-6">
        {description ? (
          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            {description}
          </p>
        ) : null}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-3">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            {cancelText || t('common.cancel', 'Cancel')}
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} isLoading={loading} disabled={loading}>
            {confirmText || t('common.confirm', 'Confirm')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;

