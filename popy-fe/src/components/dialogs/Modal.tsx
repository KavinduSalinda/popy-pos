import type { ReactNode } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  type DialogProps,
} from '@mui/material';
import Close from '@mui/icons-material/Close';

interface ModalProps {
  open: boolean;
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  actions?: ReactNode;
  maxWidth?: DialogProps['maxWidth'];
  fullWidth?: boolean;
}

export const Modal = ({
  open,
  title,
  onClose,
  children,
  actions,
  maxWidth = 'sm',
  fullWidth = true,
}: ModalProps) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth={maxWidth}
    fullWidth={fullWidth}
    aria-labelledby="modal-title"
  >
    <DialogTitle
      id="modal-title"
      sx={{ display: 'flex', alignItems: 'center', pr: 6 }}
    >
      {title}
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{ position: 'absolute', right: 8, top: 8 }}
      >
        <Close />
      </IconButton>
    </DialogTitle>
    <DialogContent dividers>{children}</DialogContent>
    {actions && <DialogActions sx={{ px: 3, py: 2 }}>{actions}</DialogActions>}
  </Dialog>
);
