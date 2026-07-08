import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function PageHeader({ title, subtitle, breadcrumbs = [], action }) {
  return (
    <Box sx={{ mb: 4 }}>
      {breadcrumbs.length > 0 && (
        <Breadcrumbs sx={{ mb: 1 }}>
          {breadcrumbs.map((crumb, i) =>
            i < breadcrumbs.length - 1 ? (
              <Link
                key={crumb.label}
                component={RouterLink}
                to={crumb.path}
                underline="hover"
                color="inherit"
                sx={{ fontSize: '0.85rem' }}
              >
                {crumb.label}
              </Link>
            ) : (
              <Typography key={crumb.label} color="text.primary" sx={{ fontSize: '0.85rem' }}>
                {crumb.label}
              </Typography>
            )
          )}
        </Breadcrumbs>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && <Box>{action}</Box>}
      </Box>
    </Box>
  );
}
