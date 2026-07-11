import { Box, Grid, Card, CardContent, Typography, Stack } from '@mui/material';
import {
  Build, People, Feedback, AdminPanelSettings, ArrowForward,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';

const NAV_CARDS = [
  {
    label: 'Equipment',
    description: 'Review and approve equipment listings',
    icon: Build,
    color: '#457b9d',
    path: '/admin/equipment',
  },
  {
    label: 'Manage Users',
    description: 'Manage all platform users',
    icon: People,
    color: '#2d6a4f',
    path: '/admin/users',
  },
  {
    label: 'Feedback',
    description: 'Review and manage user feedback',
    icon: Feedback,
    color: '#e9c46a',
    path: '/admin/feedback',
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <Box>
      <PageHeader
        title="Main Admin Dashboard"
        subtitle="Navigate to manage the AgriConnect platform"
        breadcrumbs={[{ label: 'Home', path: '/dashboard' }, { label: 'Admin' }]}
      />

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {NAV_CARDS.map(({ label, description, icon: Icon, color, path }, idx) => (
          <Grid item xs={12} sm={6} md={4} key={label}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 8 },
                }}
                onClick={() => navigate(path)}
              >
                <CardContent sx={{ p: 4 }}>
                  <Stack spacing={2} alignItems="center" textAlign="center">
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 3,
                        backgroundColor: `${color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon sx={{ fontSize: 36, color }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        {label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {description}
                      </Typography>
                    </Box>
                    <ArrowForward color="action" />
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 6, textAlign: 'center' }}>
        Use the navigation above or the sidebar to manage different sections of the platform.
      </Typography>
    </Box>
  );
}
