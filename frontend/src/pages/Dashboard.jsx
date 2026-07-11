import { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Stack, Chip, IconButton, useTheme,
} from '@mui/material';
import {
  TrendingUp, Build, People, Assessment, Feedback, ArrowForward, Agriculture, AttachMoney,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { equipmentService } from '../services/equipmentService';
import { workerService } from '../services/workerService';
import { predictionService } from '../services/predictionService';
import PageHeader from '../components/PageHeader';
import { CardSkeleton } from '../components/LoadingSkeleton';

export default function Dashboard() {
  const theme = useTheme();
  const { user, isFarmer, isWorker, isEquipmentOwner, isBuyer, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ equipment: { total: 0 }, workers: { total: 0 }, predictions: { total: 0 }, earnings: { total: 0 } });
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentHirings, setRecentHirings] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eqRes, wkRes, predRes] = await Promise.all([
          (isFarmer || isEquipmentOwner || isAdmin)
            ? equipmentService.listApproved({ size: 1 })
            : Promise.resolve({ data: { data: { totalElements: 0 } } }),
          (isFarmer || isWorker)
            ? workerService.listApproved({ size: 1 })
            : Promise.resolve({ data: { data: { totalElements: 0 } } }),
          isFarmer ? predictionService.history({ size: 1 }) : Promise.resolve({ data: { data: { totalElements: 0 } } }),
        ]);
        const baseStats = {
          equipment: { total: eqRes.data.data?.totalElements || 0 },
          workers: { total: wkRes.data.data?.totalElements || 0 },
          predictions: { total: predRes.data.data?.totalElements || 0 },
          earnings: { total: 0 },
        };

        if (isEquipmentOwner) {
          try {
            const earnRes = await equipmentService.getOwnerEarnings();
            baseStats.earnings.total = earnRes.data.data?.earnings || 0;
          } catch {}
        }
        if (isWorker) {
          try {
            const earnRes = await workerService.getWorkerEarnings();
            baseStats.earnings.total = earnRes.data.data?.earnings || 0;
          } catch {}
        }

        setStats(baseStats);

        if (isFarmer) {
          const [bkRes, hrRes] = await Promise.all([
            equipmentService.listMyBookings({ size: 3 }),
            workerService.listFarmerHiringRequests({ size: 3 }),
          ]);
          setRecentBookings(bkRes.data.data?.content || []);
          setRecentHirings(hrRes.data.data?.content || []);
        }
        if (isEquipmentOwner) {
          const bkRes = await equipmentService.listOwnerBookings({ size: 3 });
          setRecentBookings(bkRes.data.data?.content || []);
        }
        if (isWorker) {
          const hrRes = await workerService.listMyHiringRequests({ size: 3 });
          setRecentHirings(hrRes.data.data?.content || []);
        }
      } catch {} finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isFarmer, isWorker, isEquipmentOwner]);

  if (loading) return <CardSkeleton count={6} />;

  const statCards = [];
  if (isFarmer) {
    statCards.push(
      { key: 'equipment', label: 'Total Equipment', icon: Build, color: '#2d6a4f', path: '/equipment' },
      { key: 'workers', label: 'Total Workers', icon: People, color: '#457b9d', path: '/workers' },
      { key: 'predictions', label: 'Total Predictions', icon: Assessment, color: '#d4a373', path: '/predictions' },
    );
  }
  if (isEquipmentOwner) {
    statCards.push(
      { key: 'equipment', label: 'My Equipment', icon: Build, color: '#2d6a4f', path: '/equipment/mine' },
      { key: 'earnings', label: 'Total Earnings', icon: AttachMoney, color: '#1d3557', path: null },
    );
  }
  if (isWorker) {
    statCards.push(
      { key: 'workers', label: 'Available Workers', icon: People, color: '#457b9d', path: '/workers' },
      { key: 'earnings', label: 'Total Earnings', icon: AttachMoney, color: '#1d3557', path: null },
    );
  }
  if (isBuyer) {
    statCards.push(
      { key: 'equipment', label: 'Browse Equipment', icon: Build, color: '#2d6a4f', path: '/equipment' },
    );
  }
  if (isAdmin) {
    statCards.push(
      { key: 'equipment', label: 'Manage Platform', icon: Build, color: '#2d6a4f', path: '/admin' },
    );
  }

  return (
    <Box>
      <PageHeader
        title={`Welcome, ${user?.fullName?.split(' ')[0] || 'User'}!`}
        subtitle="Here's what's happening in AgriConnect today."
      />

      {/* Stats Grid */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {statCards.map(({ key, label, icon: Icon, color, path }, idx) => (
          <Grid item xs={12} sm={6} md={4} key={key + idx}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
              <Card
                sx={path ? { cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: theme.shadows[8] } } : undefined}
                onClick={() => path && navigate(path)}
              >
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="h3" fontWeight={800}>
                        {key === 'earnings'
                          ? `₹${Number(stats[key]?.total || 0).toLocaleString()}`
                          : stats[key]?.total || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">{label}</Typography>
                    </Box>
                    <Box sx={{ width: 48, height: 48, borderRadius: 2, backgroundColor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon sx={{ color }} />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h5" fontWeight={700} gutterBottom>Quick Actions</Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {isFarmer && (
          <>
            <Grid item xs={6} sm={3}><Button variant="contained" fullWidth size="large" startIcon={<Build />} onClick={() => navigate('/equipment')}>Browse Equipment</Button></Grid>
            <Grid item xs={6} sm={3}><Button variant="contained" fullWidth size="large" startIcon={<People />} onClick={() => navigate('/workers')}>Hire Workers</Button></Grid>
            <Grid item xs={6} sm={3}><Button variant="contained" fullWidth size="large" startIcon={<Agriculture />} onClick={() => navigate('/marketplace/new')}>Sell Products</Button></Grid>
            <Grid item xs={6} sm={3}><Button variant="outlined" fullWidth size="large" startIcon={<Assessment />} onClick={() => navigate('/predictions')}>Predict Crop</Button></Grid>
            <Grid item xs={6} sm={3}><Button variant="outlined" fullWidth size="large" startIcon={<Feedback />} onClick={() => navigate('/feedback')}>Submit Feedback</Button></Grid>
          </>
        )}
        {isEquipmentOwner && (
          <>
            <Grid item xs={6} sm={4}><Button variant="contained" fullWidth size="large" startIcon={<Build />} onClick={() => navigate('/equipment/new')}>Add Equipment</Button></Grid>
            <Grid item xs={6} sm={4}><Button variant="contained" fullWidth size="large" startIcon={<Agriculture />} onClick={() => navigate('/equipment/mine')}>My Equipment</Button></Grid>
            <Grid item xs={6} sm={4}><Button variant="outlined" fullWidth size="large" startIcon={<Feedback />} onClick={() => navigate('/feedback')}>Feedback</Button></Grid>
          </>
        )}
        {isWorker && (
          <>
            <Grid item xs={6} sm={4}><Button variant="contained" fullWidth size="large" startIcon={<People />} onClick={() => navigate('/worker-profile')}>My Profile</Button></Grid>
            <Grid item xs={6} sm={4}><Button variant="contained" fullWidth size="large" startIcon={<Agriculture />} onClick={() => navigate('/workers/hiring/worker')}>Hiring Requests</Button></Grid>
            <Grid item xs={6} sm={4}><Button variant="outlined" fullWidth size="large" startIcon={<Feedback />} onClick={() => navigate('/feedback')}>Feedback</Button></Grid>
          </>
        )}
        {isBuyer && (
          <>
            <Grid item xs={6} sm={4}><Button variant="contained" fullWidth size="large" startIcon={<Agriculture />} onClick={() => navigate('/marketplace')}>Browse Marketplace</Button></Grid>
            <Grid item xs={6} sm={4}><Button variant="contained" fullWidth size="large" startIcon={<TrendingUp />} onClick={() => navigate('/orders')}>My Orders</Button></Grid>
            <Grid item xs={6} sm={4}><Button variant="outlined" fullWidth size="large" startIcon={<Feedback />} onClick={() => navigate('/feedback')}>Feedback</Button></Grid>
          </>
        )}
        {isAdmin && (
          <>
            <Grid item xs={6} sm={3}><Button variant="contained" fullWidth size="large" startIcon={<TrendingUp />} onClick={() => navigate('/admin')}>Admin Dashboard</Button></Grid>
            <Grid item xs={6} sm={3}><Button variant="contained" fullWidth size="large" startIcon={<People />} onClick={() => navigate('/admin/users')}>Manage Users</Button></Grid>
            <Grid item xs={6} sm={3}><Button variant="contained" fullWidth size="large" startIcon={<Build />} onClick={() => navigate('/admin/equipment')}>Manage Equipment</Button></Grid>
            <Grid item xs={6} sm={3}><Button variant="outlined" fullWidth size="large" startIcon={<Agriculture />} onClick={() => navigate('/admin/products')}>Manage Products</Button></Grid>
          </>
        )}
      </Grid>

      {/* Recent Activity */}
      {(recentBookings.length > 0 || recentHirings.length > 0) && (
        <Grid container spacing={3}>
          {recentBookings.length > 0 && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight={700}>Recent Bookings</Typography>
                    <IconButton size="small" onClick={() => navigate('/bookings')}><ArrowForward /></IconButton>
                  </Stack>
                  {recentBookings.map((bk) => (
                    <Stack key={bk.id} direction="row" justifyContent="space-between" alignItems="center" py={1} sx={{ borderBottom: 1, borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{bk.equipmentName || 'Equipment'}</Typography>
                        <Typography variant="caption" color="text.secondary">{new Date(bk.bookingDate || bk.createdAt).toLocaleDateString()}</Typography>
                      </Box>
                      <Chip label={bk.status} size="small" color={bk.status === 'CONFIRMED' ? 'success' : bk.status === 'PENDING' ? 'warning' : 'default'} />
                    </Stack>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          )}
          {recentHirings.length > 0 && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight={700}>Recent Hirings</Typography>
                    <IconButton size="small" onClick={() => navigate('/hiring')}><ArrowForward /></IconButton>
                  </Stack>
                  {recentHirings.map((hr) => (
                    <Stack key={hr.id} direction="row" justifyContent="space-between" alignItems="center" py={1} sx={{ borderBottom: 1, borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{hr.workerName || 'Worker'}</Typography>
                        <Typography variant="caption" color="text.secondary">{new Date(hr.createdAt).toLocaleDateString()}</Typography>
                      </Box>
                      <Chip label={hr.status} size="small" color={hr.status === 'ACCEPTED' ? 'success' : hr.status === 'PENDING' ? 'warning' : 'default'} />
                    </Stack>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
}
