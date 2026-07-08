import { Chip } from '@mui/material';
import { STATUS_LABELS, STATUS_COLORS } from '../constants';

export default function StatusChip({ status }) {
  const label = STATUS_LABELS[status] || status;
  const color = STATUS_COLORS[status] || 'default';

  return (
    <Chip
      label={label}
      color={color}
      size="small"
      variant="filled"
      sx={{ fontWeight: 600, minWidth: 80 }}
    />
  );
}
