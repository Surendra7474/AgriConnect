import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  Card,
  CardContent,
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
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Build as BuildIcon,
} from '@mui/icons-material';

import PageHeader from '../../components/PageHeader';
import StatusChip from '../../components/StatusChip';
import { DetailSkeleton } from '../../components/LoadingSkeleton';
import { useAuth } from '../../contexts/AuthContext';
import { equipmentService } from '../../services/equipmentService';
import { EQUIPMENT_STATUS, STATUS_LABELS, STATUS_COLORS } from '../../constants';

const EquipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isFarmer, isEquipmentOwner, isAdmin } = useAuth();

  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      bookingDate: '',
      endDate: '',
      notes: '',
    },
  });

  const watchBookingDate = watch('bookingDate');
  const watchEndDate = watch('endDate');

  const fetchEquipment = useCallback(async () => {
    setLoading(true);
    try {
      const response = await equipmentService.getById(id);
      setEquipment(response.data.data);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load equipment details');
      navigate('/equipment');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  useEffect(() => {
    if (watchBookingDate && watchEndDate && equipment) {
      const start = new Date(watchBookingDate);
      const end = new Date(watchEndDate);
      const diffTime = end - start;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        setTotalAmount(diffDays * equipment.rentalPricePerDay);
      } else {
        setTotalAmount(0);
      }
    } else {
      setTotalAmount(0);
    }
  }, [watchBookingDate, watchEndDate, equipment]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this equipment?')) return;
    try {
      await equipmentService.delete(id);
      toast.success('Equipment deleted successfully');
      navigate('/equipment/mine');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete equipment');
    }
  };

  const handleBookingSubmit = async (data) => {
    setBookingLoading(true);
    try {
      const start = new Date(data.bookingDate);
      const end = new Date(data.endDate);
      const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

      await equipmentService.createBooking({
        equipmentId: equipment.id,
        bookingDate: data.bookingDate,
        endDate: data.endDate,
        totalAmount: diffDays * equipment.rentalPricePerDay,
        notes: data.notes || '',
      });
      toast.success('Booking request sent successfully!');
      setBookingDialogOpen(false);
      reset();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const isOwner =
    equipment && user && equipment.owner && equipment.owner.id === user.id;

  if (loading) {
    return <DetailSkeleton />;
  }

  if (!equipment) {
    return null;
  }

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <PageHeader
          title={equipment.name}
          subtitle={`${equipment.category} · ${equipment.brand || 'N/A'} ${equipment.model || ''}`}
          breadcrumbs={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Equipment', path: '/equipment' },
            { label: equipment.name },
          ]}
          action={
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/equipment')}
            >
              Back
            </Button>
          }
        />

        <Grid container spacing={3}>
          {/* Left Column - Image & Info */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
              <Box
                sx={{
                  height: 350,
                  backgroundColor: 'action.hover',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                {equipment.imageUrls && equipment.imageUrls.length > 0 ? (
                  <Box
                    component="img"
                    src={equipment.imageUrls[0]}
                    alt={equipment.name}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <Typography variant="h1" color="text.disabled">
                    🚜
                  </Typography>
                )}
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ position: 'absolute', top: 12, right: 12 }}
                >
                  <StatusChip status={equipment.approvalStatus} />
                  <Chip
                    label={equipment.available ? 'Available' : 'Unavailable'}
                    color={equipment.available ? 'success' : 'default'}
                    variant="filled"
                    size="small"
                  />
                </Stack>
              </Box>
            </Paper>

            <Stack spacing={3}>
              {/* Description */}
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Description
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                  {equipment.description || 'No description provided.'}
                </Typography>
              </Paper>

              {/* Specifications */}
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Specifications
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      Brand
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {equipment.brand || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      Model
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {equipment.model || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      Year
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {equipment.yearOfManufacture || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      Category
                    </Typography>
                    <Typography variant="body1" fontWeight={500} sx={{ textTransform: 'capitalize' }}>
                      {equipment.category}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <LocationIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Location
                      </Typography>
                    </Stack>
                    <Typography variant="body1" fontWeight={500}>
                      {equipment.location}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    {equipment.averageRating > 0 && (
                      <>
                        <Typography variant="body2" color="text.secondary">
                          Rating
                        </Typography>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Rating
                            value={equipment.averageRating}
                            readOnly
                            size="small"
                            precision={0.5}
                          />
                          <Typography variant="body2">
                            ({equipment.averageRating?.toFixed?.(1) || equipment.averageRating})
                          </Typography>
                        </Stack>
                      </>
                    )}
                  </Grid>
                </Grid>
              </Paper>

              {/* Image Gallery Placeholder */}
              {equipment.imageUrls && equipment.imageUrls.length > 1 && (
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Gallery ({equipment.imageUrls.length} images)
                  </Typography>
                  <Grid container spacing={1}>
                    {equipment.imageUrls.map((url, idx) => (
                      <Grid item xs={6} sm={4} md={3} key={idx}>
                        <Box
                          component="img"
                          src={url}
                          alt={`${equipment.name} ${idx + 1}`}
                          sx={{
                            width: '100%',
                            height: 120,
                            objectFit: 'cover',
                            borderRadius: 2,
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              )}
            </Stack>
          </Grid>

          {/* Right Column - Pricing, Owner, Actions */}
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
                        ₹{equipment.rentalPricePerDay?.toLocaleString?.() || equipment.rentalPricePerDay}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      per day
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Security Deposit
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      ₹{equipment.securityDeposit?.toLocaleString?.() || equipment.securityDeposit}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              {/* Owner Card */}
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Owner
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                    {equipment.owner?.fullName?.charAt(0) || <PersonIcon />}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      {equipment.owner?.fullName || 'Unknown'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {equipment.owner?.email || ''}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              {/* Actions */}
              {isOwner || isAdmin ? (
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Manage
                  </Typography>
                  <Stack spacing={1.5}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<EditIcon />}
                      component={Link}
                      to={`/equipment/${equipment.id}/edit`}
                    >
                      Edit Equipment
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      fullWidth
                      startIcon={<DeleteIcon />}
                      onClick={handleDelete}
                    >
                      Delete Equipment
                    </Button>
                  </Stack>
                </Paper>
              ) : isFarmer ? (
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Book This Equipment
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<CalendarIcon />}
                    onClick={() => setBookingDialogOpen(true)}
                    disabled={!equipment.available}
                  >
                    {equipment.available ? 'Book Now' : 'Currently Unavailable'}
                  </Button>
                </Paper>
              ) : null}
            </Stack>
          </Grid>
        </Grid>

        {/* Booking Dialog */}
        <Dialog
          open={bookingDialogOpen}
          onClose={() => setBookingDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <Box component="form" onSubmit={handleSubmit(handleBookingSubmit)}>
            <DialogTitle>
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarIcon />
                <Typography variant="h6">Book {equipment.name}</Typography>
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2.5} sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Rental rate: ₹{equipment.rentalPricePerDay?.toLocaleString?.() || equipment.rentalPricePerDay}/day
                </Typography>
                <TextField
                  label="Start Date"
                  type="date"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: todayStr }}
                  {...register('bookingDate', { required: 'Start date is required' })}
                  error={!!errors.bookingDate}
                  helperText={errors.bookingDate?.message}
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
                      if (watchBookingDate && value <= watchBookingDate) {
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
                  placeholder="Any special requirements..."
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
              <Button onClick={() => setBookingDialogOpen(false)}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={bookingLoading || totalAmount <= 0}
              >
                {bookingLoading ? 'Sending...' : 'Confirm Booking'}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      </Container>
    </motion.div>
  );
};

export default EquipmentDetail;
