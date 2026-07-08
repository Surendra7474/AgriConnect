import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Button,
  Stack,
  Paper,
  InputAdornment,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  AddPhotoAlternate as AddPhotoIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

import PageHeader from '../../components/PageHeader';
import { FormSkeleton } from '../../components/LoadingSkeleton';
import { useAuth } from '../../contexts/AuthContext';
import { equipmentService } from '../../services/equipmentService';
import { EQUIPMENT_CATEGORIES, REGIONS } from '../../constants';

const EquipmentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isEquipmentOwner, isAdmin } = useAuth();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      category: '',
      description: '',
      rentalPricePerDay: '',
      securityDeposit: '',
      location: '',
      brand: '',
      model: '',
      yearOfManufacture: '',
      imageUrls: [''],
    },
  });

  const fetchEquipment = useCallback(async () => {
    if (!id) return;
    setFetching(true);
    try {
      const response = await equipmentService.getById(id);
      const eq = response.data.data;
      reset({
        name: eq.name || '',
        category: eq.category || '',
        description: eq.description || '',
        rentalPricePerDay: eq.rentalPricePerDay || '',
        securityDeposit: eq.securityDeposit || '',
        location: eq.location || '',
        brand: eq.brand || '',
        model: eq.model || '',
        yearOfManufacture: eq.yearOfManufacture || '',
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load equipment data');
      navigate('/equipment/mine');
    } finally {
      setFetching(false);
    }
  }, [id, reset, navigate]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  // Redirect non-owners
  useEffect(() => {
    if (!isEquipmentOwner && !isAdmin) {
      toast.error('Only equipment owners can manage equipment listings');
      navigate('/equipment');
    }
  }, [isEquipmentOwner, isAdmin, navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const imageUrls = (data.imageUrls || []).filter(Boolean);
      const payload = {
        ...data,
        rentalPricePerDay: Number(data.rentalPricePerDay),
        securityDeposit: Number(data.securityDeposit),
        yearOfManufacture: data.yearOfManufacture ? String(data.yearOfManufacture) : null,
        imageUrls: imageUrls.length > 0 ? imageUrls : null,
      };

      if (isEditMode) {
        await equipmentService.update(id, payload);
        toast.success('Equipment updated successfully');
      } else {
        await equipmentService.create(payload);
        toast.success('Equipment listed successfully');
      }
      navigate('/equipment/mine');
    } catch (error) {
      toast.error(error?.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} equipment`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <FormSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="md" sx={{ py: 3 }}>
        <PageHeader
          title={isEditMode ? 'Edit Equipment' : 'List New Equipment'}
          subtitle={
            isEditMode
              ? 'Update your equipment details'
              : 'Fill in the details to list your equipment for rent'
          }
          breadcrumbs={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'My Equipment', path: '/equipment/mine' },
            { label: isEditMode ? 'Edit' : 'New' },
          ]}
          action={
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/equipment/mine')}
            >
              Back
            </Button>
          }
        />

        <Paper sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3 }}>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Grid container spacing={2.5}>
              {/* Name */}
              <Grid item xs={12}>
                <TextField
                  label="Equipment Name"
                  fullWidth
                  required
                  {...register('name', {
                    required: 'Equipment name is required',
                    minLength: {
                      value: 3,
                      message: 'Name must be at least 3 characters',
                    },
                  })}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              </Grid>

              {/* Category */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Category"
                  fullWidth
                  required
                  select
                  {...register('category', {
                    required: 'Category is required',
                  })}
                  error={!!errors.category}
                  helperText={errors.category?.message}
                >
                  {EQUIPMENT_CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Location */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Location"
                  fullWidth
                  required
                  select
                  {...register('location', {
                    required: 'Location is required',
                  })}
                  error={!!errors.location}
                  helperText={errors.location?.message}
                >
                  {REGIONS.map((reg) => (
                    <MenuItem key={reg} value={reg}>
                      {reg}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Brand */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Brand"
                  fullWidth
                  {...register('brand')}
                  error={!!errors.brand}
                  helperText={errors.brand?.message}
                />
              </Grid>

              {/* Model */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Model"
                  fullWidth
                  {...register('model')}
                  error={!!errors.model}
                  helperText={errors.model?.message}
                />
              </Grid>

              {/* Year of Manufacture */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Year of Manufacture"
                  fullWidth
                  type="number"
                  {...register('yearOfManufacture', {
                    min: {
                      value: 1950,
                      message: 'Year must be 1950 or later',
                    },
                    max: {
                      value: new Date().getFullYear(),
                      message: `Year must be ${new Date().getFullYear()} or earlier`,
                    },
                  })}
                  error={!!errors.yearOfManufacture}
                  helperText={errors.yearOfManufacture?.message}
                />
              </Grid>

              {/* Rental Price */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Rental Price Per Day"
                  fullWidth
                  required
                  type="number"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                  }}
                  {...register('rentalPricePerDay', {
                    required: 'Rental price is required',
                    min: {
                      value: 1,
                      message: 'Price must be at least ₹1',
                    },
                    valueAsNumber: true,
                  })}
                  error={!!errors.rentalPricePerDay}
                  helperText={errors.rentalPricePerDay?.message}
                />
              </Grid>

              {/* Security Deposit */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Security Deposit"
                  fullWidth
                  required
                  type="number"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                  }}
                  {...register('securityDeposit', {
                    required: 'Security deposit is required',
                    min: {
                      value: 0,
                      message: 'Deposit cannot be negative',
                    },
                    valueAsNumber: true,
                  })}
                  error={!!errors.securityDeposit}
                  helperText={errors.securityDeposit?.message}
                />
              </Grid>

              {/* Image Upload */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Images
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Upload images for your equipment. First image is the primary one. You can also paste image URLs below.
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <input
                    type="file"
                    accept="image/*"
                    id="equipment-image-upload"
                    style={{ display: 'none' }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const res = await equipmentService.uploadFile(file);
                        const url = res.data.data?.url;
                        if (url) {
                          const currentUrls = watch('imageUrls') || [''];
                          const emptyIndex = currentUrls.findIndex(u => !u);
                          if (emptyIndex >= 0) {
                            setValue(`imageUrls.${emptyIndex}`, url);
                          }
                        }
                        toast.success('Image uploaded! Add more or save the form.');
                      } catch (err) {
                        toast.error('Failed to upload image');
                      } finally {
                        e.target.value = '';
                      }
                    }}
                  />
                  <label htmlFor="equipment-image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<AddPhotoIcon />}
                      sx={{ mb: 2 }}
                    >
                      Upload Image
                    </Button>
                  </label>
                </Box>

                {Array.from({ length: 5 }).map((_, idx) => {
                  const url = watch(`imageUrls.${idx}`);
                  return (
                    <Grid container spacing={1} key={idx} sx={{ mb: 1 }} alignItems="center">
                      <Grid item xs={10} sm={11}>
                        <TextField
                          label={`Image URL ${idx + 1}`}
                          fullWidth
                          size="small"
                          placeholder={`https://example.com/image${idx + 1}.jpg`}
                          {...register(`imageUrls.${idx}`)}
                        />
                      </Grid>
                      {url && (
                        <Grid item xs={2} sm={1}>
                          <Box
                            component="img"
                            src={url}
                            sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover' }}
                          />
                        </Grid>
                      )}
                    </Grid>
                  );
                })}
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={4}
                  {...register('description', {
                    maxLength: {
                      value: 2000,
                      message: 'Description must be under 2000 characters',
                    },
                  })}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              </Grid>
            </Grid>

            {/* Submit */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="flex-end"
              sx={{ mt: 4 }}
            >
              <Button
                variant="outlined"
                onClick={() => navigate('/equipment/mine')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<SaveIcon />}
                disabled={loading || isSubmitting}
              >
                {loading
                  ? 'Saving...'
                  : isEditMode
                  ? 'Update Equipment'
                  : 'List Equipment'}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </motion.div>
  );
};

export default EquipmentForm;
