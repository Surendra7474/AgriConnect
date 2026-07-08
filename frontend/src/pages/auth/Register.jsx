import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  MenuItem,
  Grid,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { Visibility, VisibilityOff, Agriculture } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../constants';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const steps = ['Account Details', 'Role Selection'];
const roleOptions = [
  { value: ROLES.FARMER, label: 'Farmer', description: 'Rent equipment, hire workers, predict crop profits' },
  { value: ROLES.EQUIPMENT_OWNER, label: 'Equipment Owner', description: 'List equipment for rental and manage bookings' },
  { value: ROLES.WORKER, label: 'Agricultural Worker', description: 'Create worker profile and receive hiring requests' },
];

export default function Register() {
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      role: '',
    },
  });

  const password = watch('password');

  const handleNext = () => {
    if (activeStep === 0) {
      if (!watch('fullName') || !watch('email') || !watch('password') || !watch('confirmPassword')) {
        setError('Please fill all required fields');
        return;
      }
      if (watch('password') !== watch('confirmPassword')) {
        setError('Passwords do not match');
        return;
      }
      setError('');
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const onSubmit = async (data) => {
    if (!data.role) {
      setError('Please select a role');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = data;
      await registerUser(payload);
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 40%, #52b788 100%)',
        p: 2,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 520 }}
      >
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Agriculture sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}>
                Create Account
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Join AgriConnect today
              </Typography>
            </Box>

            <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              {activeStep === 0 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <TextField
                    label="Full Name"
                    fullWidth
                    margin="normal"
                    {...register('fullName', { required: 'Full name is required', minLength: { value: 3, message: 'Min 3 characters' } })}
                    error={!!errors.fullName}
                    helperText={errors.fullName?.message}
                  />
                  <TextField
                    label="Email"
                    fullWidth
                    margin="normal"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                    })}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                  <TextField
                    label="Phone"
                    fullWidth
                    margin="normal"
                    {...register('phone', { pattern: { value: /^[0-9]{10}$/, message: 'Enter valid 10-digit number' } })}
                    error={!!errors.phone}
                    helperText={errors.phone?.message || '(optional)'}
                  />
                  <TextField
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    margin="normal"
                    {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })}
                    error={!!errors.password}
                    helperText={errors.password?.message || '(min 8 characters)'}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Confirm Password"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    margin="normal"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) => value === password || 'Passwords do not match',
                    })}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                  />
                </motion.div>
              )}

              {activeStep === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Select your role
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    This determines what features you can access.
                  </Typography>
                  <Controller
                    name="role"
                    control={control}
                    rules={{ required: 'Please select a role' }}
                    render={({ field }) => (
                      <Grid container spacing={1.5}>
                        {roleOptions.map((opt) => (
                          <Grid item xs={12} key={opt.value}>
                            <Card
                              onClick={() => field.onChange(opt.value)}
                              sx={{
                                cursor: 'pointer',
                                border: 2,
                                borderColor: field.value === opt.value ? 'primary.main' : 'divider',
                                backgroundColor: field.value === opt.value ? 'primary.light' : 'background.paper',
                                transition: 'all 0.2s',
                                '&:hover': { borderColor: 'primary.main' },
                              }}
                            >
                              <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                                <Typography variant="subtitle2" fontWeight={700}>
                                  {opt.label}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {opt.description}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  />
                  {errors.role && (
                    <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                      {errors.role.message}
                    </Typography>
                  )}
                </motion.div>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                {activeStep > 0 ? (
                  <Button onClick={handleBack} variant="outlined" disabled={loading}>
                    Back
                  </Button>
                ) : (
                  <Box />
                )}
                {activeStep < steps.length - 1 ? (
                  <Button onClick={handleNext} variant="contained">
                    Next
                  </Button>
                ) : (
                  <Button type="submit" variant="contained" disabled={loading} sx={{ fontWeight: 700 }}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                  </Button>
                )}
              </Box>
            </form>

            <Box sx={{ textAlign: 'center', mt: 2.5 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link component={RouterLink} to="/login" underline="hover" fontWeight={700}>
                  Sign in
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}
