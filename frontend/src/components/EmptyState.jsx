import { isValidElement, cloneElement } from 'react';
import { Box, Typography } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

export default function EmptyState({ title = 'No data found', description = '', icon = <InboxIcon /> }) {
  const iconEl = isValidElement(icon)
    ? cloneElement(icon, { sx: { fontSize: 72, color: 'text.disabled', mb: 2, ...(icon.props.sx || {}) } })
    : (() => { const Icon = icon; return <Icon sx={{ fontSize: 72, color: 'text.disabled', mb: 2 }} />; })();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 2,
        textAlign: 'center',
      }}
    >
      {iconEl}
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 400 }}>
          {description}
        </Typography>
      )}
    </Box>
  );
}
