import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import {
  Box,
  Container,
  Grid,
  Typography,
  Chip,
  Button,
  Stack,
  Divider,
  Paper,
  TextField,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  CheckCircle as AvailableIcon,
  Cancel as UnavailableIcon,
} from '@mui/icons-material';

import PageHeader from '../../components/PageHeader';
import { DetailSkeleton } from '../../components/LoadingSkeleton';
import { useAuth } from '../../contexts/AuthContext';
import { workerService } from '../../services/workerService';
import { REGIONS } from '../../constants';

const WorkerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isFarmer } = useAuth();

  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hireDialogOpen, setHireDialogOpen] = useState(false);
  const [hireLoading, setHireLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      startDate: '',
      endDate: '',
      notes: '',
    },
  });

  const watchStartDate = watch('startDate');
  const watchEndDate = watch('endDate');

  const fetchWorker = useCallback(async () => {
    setLoading(true);
    try {
      const response = await workerService.getById(id);
      setWorker(response.data.data);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load worker details');
      navigate('/workers');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchWorker();
  }, [fetchWorker]);

  useEffect(() => {
    if (watchStartDate && watchEndDate && worker) {
      const start = new Date(watchStartDate);
      const end = new Date(watchEndDate);
      const diffTime = end - start;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        setTotalAmount(diffDays * worker.dailyRate);
      } else {
        setTotalAmount(0);
      }
    } else {
      setTotalAmount(0);
    }
  }, [watchStartDate, watchEndDate, worker]);

  const handleHireSubmit = async (data) => {
    setHireLoading(true);
    try {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

      await workerService.createHiring({
        workerProfileId: worker.id,
        startDate: data.startDate,
        endDate: data.endDate,
        totalAmount: diffDays * worker.dailyRate,
        notes: data.notes || '',
      });
      toast.success('Hiring request sent successfully!');
      setHireDialogOpen(false);
      reset();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to send hiring request');
    } finally {
      setHireLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <DetailSkeleton />
      </Container>
    );
  }

  if (!worker) {
    return null;
  }

  const workerName = worker.user?.fullName || 'Unknown Worker';
  const skillsList = worker.skills
    ? worker.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : [];
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <PageHeader
          title={workerName}
          subtitle={worker.location || 'Location not specified'}
          breadcrumbs={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Workers', path: '/workers' },
            { label: workerName },
          ]}
          action={
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/workers')}
            >
              Back
            </Button>
          }
        />

        <Grid container spacing={3}>
          {/* Left Column - Profile Info */}
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              {/* Header Card */}
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    sx={{ bgcolor: 'primary.main', width: 64, height: 64, fontSize: '1.8rem' }}
                  >
                    {workerName.charAt(0)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" fontWeight={700}>
                      {workerName}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                      <LocationIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {worker.location || 'N/A'}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Chip
                        icon={worker.available ? <AvailableIcon /> : <UnavailableIcon />}
                        label={worker.available ? 'Available for Hire' : 'Not Available'}
                        color={worker.available ? 'success' : 'default'}
                        variant="filled"
                        size="small"
                      />
                      {worker.averageRating > 0 && (
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Rating
                            value={worker.averageRating}
                            readOnly
                            size="small"
                            precision={0.5}
                          />
                          <Typography variant="body2" color="text.secondary">
                            ({worker.averageRating?.toFixed?.(1) || worker.averageRating})
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
                  </Box>
                </Stack>
              </Paper>

              {/* Bio */}
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  About
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                  {worker.bio || 'No bio provided.'}
                </Typography>
              </Paper>

              {/* Skills */}
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Skills
                </Typography>
                {skillsList.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {skillsList.map((skill, i) => (
                      <Chip
                        key={i}
                        label={skill}
                        variant="filled"
                        color="primary"
                        size="medium"
                        sx={{ fontWeight: 500 }}
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.disabled">
                    No skills listed.
                  </Typography>
                )}
              </Paper>
            </Stack>
          </Grid>

          {/* Right Column - Pricing & Hire */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* Pricing Card */}
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Pricing
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <MoneyIcon color="primary" />
                      <Typography variant="h4" color="primary.main" fontWeight={700}>
                        ₹{worker.dailyRate?.toLocaleString?.() || worker.dailyRate}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      per day
                    </Typography>
                  </Box>
                  <Divider />
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LocationIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Location: {worker.location || 'N/A'}
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>

              {/* Hire Button for Farmers */}
              {isFarmer && (
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Hire This Worker
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<CalendarIcon />}
                    onClick={() => setHireDialogOpen(true)}
                    disabled={!worker.available}
                  >
                    {worker.available ? 'Hire Worker' : 'Currently Unavailable'}
                  </Button>
                </Paper>
              )}
            </Stack>
          </Grid>
        </Grid>

        {/* Hire Dialog */}
        <Dialog
          open={hireDialogOpen}
          onClose={() => setHireDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <Box component="form" onSubmit={handleSubmit(handleHireSubmit)}>
            <DialogTitle>
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarIcon />
                <Typography variant="h6">Hire {workerName}</Typography>
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2.5} sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Daily rate: ₹{worker.dailyRate?.toLocaleString?.() || worker.dailyRate}/day
                </Typography>
                <TextField
                  label="Start Date"
                  type="date"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: todayStr }}
                  {...register('startDate', { required: 'Start date is required' })}
                  error={!!errors.startDate}
                  helperText={errors.startDate?.message}
                />
                <TextField
                  label="End Date"
                  type="date"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: todayStr }}
                  {...register('endDate', {
                    required: 'End date is required',
                    validate: (value) => {
                      if (watchStartDate && value <= watchStartDate) {
                        return 'End date must be after start date';
                      }
                      return true;
                    },
                  })}
                  error={!!errors.endDate}
                  helperText={errors.endDate?.message}
                />
                <TextField
                  label="Notes (optional)"
                  fullWidth
                  size="small"
                  multiline
                  rows={3}
                  placeholder="Describe the work required..."
                  {...register('notes')}
                />
                {totalAmount > 0 && (
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: 'action.hover',
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body1" fontWeight={600}>
                        Estimated Total:
                      </Typography>
                      <Typography variant="h6" color="primary.main" fontWeight={700}>
                        ₹{totalAmount?.toLocaleString?.() || totalAmount}
                      </Typography>
                    </Stack>
                  </Paper>
                )}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={() => setHireDialogOpen(false)}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={hireLoading || totalAmount <= 0}
              >
                {hireLoading ? 'Sending...' : 'Confirm Hiring'}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      </Container>
    </motion.div>
  );
};

export default WorkerDetail;