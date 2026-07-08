import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Button,
  Stack,
  Avatar,
  Divider,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Person, Email, Phone, Badge, Visibility, VisibilityOff, Lock } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/PageHeader';
import { ROLES } from '../constants';

function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getRoleLabel(role) {
  switch (role) {
    case ROLES.ADMIN:
      return 'Administrator';
    case ROLES.FARMER:
      return 'Farmer';
    case ROLES.WORKER:
      return 'Worker';
    case ROLES.EQUIPMENT_OWNER:
      return 'Equipment Owner';
    default:
      return role || 'User';
  }
}

export default function Profile() {
  const { user } = useAuth();

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPasswordValue = watch('newPassword');

  const onPasswordSubmit = async (data) => {
    setPasswordError('');
    setPasswordLoading(true);
    try {
      // Password change endpoint is not available in current API;
      // This is a placeholder for future implementation.
      toast.error('Password change is not available yet. This feature is coming soon.');
      reset();
    } catch {
      setPasswordError('Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="My Profile"
        subtitle="View and manage your account information"
        breadcrumbs={[
          { label: 'Home', path: '/dashboard' },
          { label: 'Profile' },
        ]}
      />

      <Grid container spacing={3}>
        {/* Profile Info */}
        <Grid item xs={12} md={5} lg={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ textAlign: 'center', height: '100%' }}>
              <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: '2.2rem',
                    fontWeight: 800,
                    fontFamily: '"Outfit", sans-serif',
                  }}
                >
                  {getInitials(user?.fullName)}
                </Avatar>

                <Typography variant="h5" fontWeight={700} gutterBottom>
                  {user?.fullName || 'User'}
                </Typography>

                <Typography variant="body2" color="primary" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {getRoleLabel(user?.role)}
                </Typography>

                <Divider sx={{ my: 2.5 }} />

                <Stack spacing={2} sx={{ textAlign: 'left' }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Email sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {user?.email || '-'}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Phone sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Phone
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {user?.phone || '-'}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Badge sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Role
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {getRoleLabel(user?.role)}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Profile Form + Password */}
        <Grid item xs={12} md={7} lg={8}>
          <Stack spacing={3}>
            {/* Edit Profile Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                    <Person sx={{ color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight={700}>
                      Account Information
                    </Typography>
                  </Stack>

                  <Grid container spacing={2.5}>
                    <Grid item xs={12}>
                      <TextField
                        label="Full Name"
                        fullWidth
                        value={user?.fullName || ''}
                        InputProps={{ readOnly: true }}
                        helperText="Contact support to update your name"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Email"
                        fullWidth
                        value={user?.email || ''}
                        InputProps={{ readOnly: true }}
                        helperText="Contact support to update your email"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Phone"
                        fullWidth
                        value={user?.phone || 'Not provided'}
                        InputProps={{ readOnly: true }}
                        helperText="Contact support to update your phone"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Role"
                        fullWidth
                        value={getRoleLabel(user?.role)}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </motion.div>

            {/* Change Password Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                    <Lock sx={{ color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight={700}>
                      Change Password
                    </Typography>
                  </Stack>

                  {passwordError && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPasswordError('')}>
                      {passwordError}
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit(onPasswordSubmit)}>
                    <Stack spacing={2.5} sx={{ maxWidth: 500 }}>
                      <TextField
                        label="Current Password"
                        type={showOldPassword ? 'text' : 'password'}
                        fullWidth
                        {...register('oldPassword', {
                          required: 'Current password is required',
                        })}
                        error={!!errors.oldPassword}
                        helperText={errors.oldPassword?.message}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowOldPassword(!showOldPassword)}
                                edge="end"
                              >
                                {showOldPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />

                      <TextField
                        label="New Password"
                        type={showNewPassword ? 'text' : 'password'}
                        fullWidth
                        {...register('newPassword', {
                          required: 'New password is required',
                          minLength: {
                            value: 6,
                            message: 'Password must be at least 6 characters',
                          },
                        })}
                        error={!!errors.newPassword}
                        helperText={errors.newPassword?.message}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                edge="end"
                              >
                                {showNewPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />

                      <TextField
                        label="Confirm New Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        fullWidth
                        {...register('confirmPassword', {
                          required: 'Please confirm your new password',
                          validate: (value) =>
                            value === newPasswordValue || 'Passwords do not match',
                        })}
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword?.message}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge="end"
                              >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />

                      <Box>
                        <Button
                          type="submit"
                          variant="contained"
                          size="large"
                          disabled={passwordLoading}
                          startIcon={
                            passwordLoading ? (
                              <CircularProgress size={20} color="inherit" />
                            ) : (
                              <Lock />
                            )
                          }
                          sx={{ px: 4 }}
                        >
                          {passwordLoading ? 'Changing...' : 'Change Password'}
                        </Button>
                      </Box>
                    </Stack>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}