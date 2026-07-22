import Modal from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmColor?: string;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Xác nhận',
  confirmColor = 'bg-danger text-white hover:bg-danger/90'
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button
            className="h-10 px-4 rounded-lg border border-divider bg-white text-foreground text-sm font-medium hover:bg-content2 transition-colors cursor-pointer"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            className={`h-10 px-4 rounded-lg text-sm font-medium active:scale-[0.98] transition-all duration-150 cursor-pointer ${confirmColor}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-foreground/70">{message}</p>
    </Modal>
  );
}
