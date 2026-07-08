import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  LinearProgress,
  useTheme,
} from '@mui/material';
import {
  People,
  HowToReg,
  Build,
  Engineering,
  Feedback,
  Pending,
  CheckCircle,
  ShoppingCart,
  Agriculture,
  AttachMoney,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { adminService } from '../../services/adminService';
import PageHeader from '../../components/PageHeader';
import { CardSkeleton } from '../../components/LoadingSkeleton';

const FALLBACK = {
  totalUsers: 0,
  activeUsers: 0,
  pendingEquipment: 0,
  approvedEquipment: 0,
  pendingWorkers: 0,
  approvedWorkers: 0,
  openFeedback: 0,
  pendingBookings: 0,
  pendingHirings: 0,
  pendingProducts: 0,
  approvedProducts: 0,
  pendingOrders: 0,
  totalOrders: 0,
  totalGmv: 0,
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(FALLBACK);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await adminService.getDashboard();
        setData({ ...FALLBACK, ...res.data.data });
      } catch {
        setData(FALLBACK);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <CardSkeleton count={6} />;

  const d = data;

  const statCards = [
    { label: 'Total Users', value: d.totalUsers, icon: People, color: '#2d6a4f' },
    { label: 'Active Users', value: d.activeUsers, icon: HowToReg, color: '#40916c' },
    { label: 'Pending Equipment', value: d.pendingEquipment, icon: Pending, color: '#e9c46a' },
    { label: 'Approved Equipment', value: d.approvedEquipment, icon: Build, color: '#457b9d' },
    { label: 'Pending Workers', value: d.pendingWorkers, icon: Pending, color: '#f4a261' },
    { label: 'Approved Workers', value: d.approvedWorkers, icon: Engineering, color: '#d4a373' },
    { label: 'Open Feedback', value: d.openFeedback, icon: Feedback, color: '#d62828' },
    { label: 'Pending Bookings', value: d.pendingBookings, icon: Pending, color: '#e76f51' },
    { label: 'Pending Hirings', value: d.pendingHirings, icon: Pending, color: '#e07a5f' },
    { label: 'Pending Products', value: d.pendingProducts, icon: Agriculture, color: '#f4a261' },
    { label: 'Approved Products', value: d.approvedProducts, icon: Agriculture, color: '#2a9d8f' },
    { label: 'Total Orders', value: d.totalOrders, icon: ShoppingCart, color: '#457b9d' },
    { label: 'Total GMV', value: `₹${(Number(d.totalGmv) || 0).toLocaleString()}`, icon: AttachMoney, color: '#1d3557' },
  ];

  const equipTotal = d.pendingEquipment + d.approvedEquipment;
  const workerTotal = d.pendingWorkers + d.approvedWorkers;
  const productTotal = d.pendingProducts + d.approvedProducts;

  return (
    <Box>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Manage and monitor the AgriConnect platform"
        breadcrumbs={[{ label: 'Home', path: '/dashboard' }, { label: 'Admin' }]}
      />

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {statCards.map(({ label, value, icon: Icon, color }, idx) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={label}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
            >
              <Card>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="h4" fontWeight={800}>{value}</Typography>
                      <Typography variant="body2" color="text.secondary">{label}</Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 2,
                        backgroundColor: `${color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon sx={{ color }} />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Approval Progress */}
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        Approval Progress
      </Typography>
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {/* Equipment */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Equipment
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={equipTotal > 0 ? (d.approvedEquipment / equipTotal) * 100 : 100}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {equipTotal > 0 ? Math.round((d.approvedEquipment / equipTotal) * 100) : 100}%
                </Typography>
              </Box>
              <Stack direction="row" spacing={2} mt={1.5}>
                <Typography variant="body2" color="success.main">
                  <CheckCircle sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                  Approved: {d.approvedEquipment}
                </Typography>
                <Typography variant="body2" color="warning.main">
                  <Pending sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                  Pending: {d.pendingEquipment}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Workers */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Workers
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={workerTotal > 0 ? (d.approvedWorkers / workerTotal) * 100 : 100}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {workerTotal > 0 ? Math.round((d.approvedWorkers / workerTotal) * 100) : 100}%
                </Typography>
              </Box>
              <Stack direction="row" spacing={2} mt={1.5}>
                <Typography variant="body2" color="success.main">
                  <CheckCircle sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                  Approved: {d.approvedWorkers}
                </Typography>
                <Typography variant="body2" color="warning.main">
                  <Pending sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                  Pending: {d.pendingWorkers}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Products */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Products
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={productTotal > 0 ? (d.approvedProducts / productTotal) * 100 : 100}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {productTotal > 0 ? Math.round((d.approvedProducts / productTotal) * 100) : 100}%
                </Typography>
              </Box>
              <Stack direction="row" spacing={2} mt={1.5}>
                <Typography variant="body2" color="success.main">
                  <CheckCircle sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                  Approved: {d.approvedProducts}
                </Typography>
                <Typography variant="body2" color="warning.main">
                  <Pending sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                  Pending: {d.pendingProducts}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
