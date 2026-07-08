import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
  MenuItem,
  FormControlLabel,
  Switch,
  CircularProgress,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';

import PageHeader from '../../components/PageHeader';
import { FormSkeleton } from '../../components/LoadingSkeleton';
import { useAuth } from '../../contexts/AuthContext';
import { workerService } from '../../services/workerService';
import { REGIONS } from '../../constants';

const WorkerProfile = () => {
  const navigate = useNavigate();
  const { isWorker } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      skills: '',
      location: '',
      dailyRate: '',
      bio: '',
      phoneNumber: '',
      available: true,
    },
  });

  const available = watch('available');

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await workerService.getMyProfile();
      const profile = response.data.data;
      if (profile) {
        reset({
          skills: profile.skills || '',
          location: profile.location || '',
          dailyRate: profile.dailyRate || '',
          bio: profile.bio || '',
          phoneNumber: profile.phoneNumber || '',
          available: profile.available !== undefined ? profile.available : true,
        });
      }
    } catch (error) {
      // Profile may not exist yet — that's fine, use defaults
      if (error?.response?.status !== 404) {
        toast.error(error?.response?.data?.message || 'Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await workerService.upsertMyProfile({
        skills: data.skills,
        location: data.location,
        dailyRate: parseFloat(data.dailyRate) || 0,
        bio: data.bio,
        phoneNumber: data.phoneNumber || '',
        available: data.available,
      });
      toast.success('Profile saved successfully!');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (!isWorker) {
    return null;
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 3 }}>
        <FormSkeleton />
      </Container>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="md" sx={{ py: 3 }}>
        <PageHeader
          title="Worker Profile"
          subtitle="Create or update your worker profile to be visible to farmers"
          breadcrumbs={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Worker Profile' },
          ]}
        />

        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              <TextField
                label="Skills"
                fullWidth
                size="small"
                placeholder="e.g., Ploughing, Harvesting, Irrigation"
                helperText="Enter skills separated by commas"
                {...register('skills', { required: 'Skills are required' })}
                error={!!errors.skills}
              />

              <TextField
                label="Location"
                select
                fullWidth
                size="small"
                {...register('location', { required: 'Location is required' })}
                error={!!errors.location}
              >
                {REGIONS.map((region) => (
                  <MenuItem key={region} value={region}>
                    {region}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Daily Rate (₹)"
                type="number"
                fullWidth
                size="small"
                placeholder="Enter your daily rate in rupees"
                InputProps={{ inputProps: { min: 0 } }}
                {...register('dailyRate', {
                  required: 'Daily rate is required',
                  min: { value: 1, message: 'Daily rate must be at least ₹1' },
                })}
                error={!!errors.dailyRate}
                helperText={errors.dailyRate?.message}
              />

              <TextField
                label="Bio"
                multiline
                rows={5}
                fullWidth
                size="small"
                placeholder="Tell farmers about your experience, expertise, and the type of work you do..."
                {...register('bio', { required: 'Bio is required' })}
                error={!!errors.bio}
                helperText={errors.bio?.message}
              />

              <TextField
                label="Phone Number"
                fullWidth
                size="small"
                placeholder="Enter your phone number"
                {...register('phoneNumber')}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber?.message}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={available}
                    {...register('available')}
                    color="primary"
                  />
                }
                label="Available for hire"
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                disabled={saving}
                sx={{ alignSelf: 'flex-start', minWidth: 160 }}
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </motion.div>
  );
};

export default WorkerProfile;
