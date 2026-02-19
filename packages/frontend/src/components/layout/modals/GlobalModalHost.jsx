import ConfirmationModal from '@/components/layout/modals/ConfirmationModal.jsx';

export const GlobalModalHost = ({ modalConfig }) => {
  if (!modalConfig) return null;

  const { type, props } = modalConfig;

  switch (type) {
    case 'confirm':
      return (
        <ConfirmationModal
          isOpen
          onClose={props.onCancel}
          yesLabel={props.yesLabel}
          yesVariant={props.yesVariant}
          title={props.title}
          onSave={props.onConfirm}
        >
          {props.body}
        </ConfirmationModal>
      );

    default:
      return null;
  }
};
