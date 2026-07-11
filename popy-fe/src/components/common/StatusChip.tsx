import { Chip, type ChipProps } from '@mui/material';

type StatusColor = ChipProps['color'];

interface StatusChipProps {
  label: string;
  /** Either pass an explicit color or a boolean active flag. */
  active?: boolean;
  color?: StatusColor;
  size?: ChipProps['size'];
}

const STATUS_COLOR_MAP: Record<string, StatusColor> = {
  active: 'success',
  inactive: 'default',
  pending: 'warning',
  completed: 'success',
  cancelled: 'error',
  draft: 'info',
  paid: 'success',
  unpaid: 'error',
  partial: 'warning',
  low: 'warning',
  out: 'error',
  in: 'success',
};

export const StatusChip = ({
  label,
  active,
  color,
  size = 'small',
}: StatusChipProps) => {
  const resolvedColor: StatusColor =
    color ??
    (active === undefined
      ? (STATUS_COLOR_MAP[label.toLowerCase()] ?? 'default')
      : active
        ? 'success'
        : 'default');

  return (
    <Chip
      label={label}
      color={resolvedColor}
      size={size}
      variant={resolvedColor === 'default' ? 'outlined' : 'filled'}
    />
  );
};
