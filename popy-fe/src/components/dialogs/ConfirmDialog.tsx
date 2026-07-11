import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => (
  <Dialog
    open={open}
    onClose={onCancel}
    aria-labelledby="confirm-title"
    aria-describedby="confirm-description"
    maxWidth="xs"
    fullWidth
  >
    <DialogTitle id="confirm-title">{title}</DialogTitle>
    <DialogContent>
      <DialogContentText id="confirm-description">{message}</DialogContentText>
    </DialogContent>
    <DialogActions sx={{ px: 3, py: 2 }}>
      <Button onClick={onCancel} disabled={loading} color="inherit">
        {cancelText}
      </Button>
      <Button
        onClick={onConfirm}
        disabled={loading}
        variant="contained"
        color={destructive ? 'error' : 'primary'}
        autoFocus
      >
        {confirmText}
      </Button>
    </DialogActions>
  </Dialog>
);
