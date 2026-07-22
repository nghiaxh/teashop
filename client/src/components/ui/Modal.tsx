import type { ReactNode } from 'react';
import { Modal as HeroModal } from '@heroui/react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}

export default function Modal({ open, onClose, title, children, footer, maxWidth = 'sm:max-w-md' }: ModalProps) {
  return (
    <HeroModal.Backdrop isOpen={open} onOpenChange={onClose}>
      <HeroModal.Container>
        <HeroModal.Dialog className={maxWidth}>
          <HeroModal.CloseTrigger />
          <HeroModal.Header>
            <HeroModal.Heading>{title}</HeroModal.Heading>
          </HeroModal.Header>
          <HeroModal.Body>{children}</HeroModal.Body>
          {footer && <HeroModal.Footer>{footer}</HeroModal.Footer>}
        </HeroModal.Dialog>
      </HeroModal.Container>
    </HeroModal.Backdrop>
  );
}
