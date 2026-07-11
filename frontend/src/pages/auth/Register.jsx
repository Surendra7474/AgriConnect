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
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Stepper,
  Step,
  StepLabel,
  Paper,
} from '@mui/material';
import { Visibility, VisibilityOff, Agriculture } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const roles = [
  { value: 'FARMER', labelKey: 'auth.farmer', descKey: 'auth.farmerDesc' },
  { value: 'EQUIPMENT_OWNER', labelKey: 'auth.equipmentOwner', descKey: 'auth.equipmentOwnerDesc' },
  { value: 'WORKER', labelKey: 'auth.worker', descKey: 'auth.workerDesc' },
  { value: 'BUYER', labelKey: 'auth.buyer', descKey: 'auth.buyerDesc' },
];

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: '',
    },
  });

  const selectedRole = watch('role');
  const password = watch('password');

  const handleNext = () => {
    if (activeStep === 0 && !selectedRole) {
      setError(t('auth.selectRole'));
      return;
    }
    setError('');
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prev) => prev - 1);
  };

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    try {
      const payload = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role,
      };
      await registerUser(payload);
      toast.success(t('auth.welcomeBack', { name: data.fullName }));
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || t('common.error');
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
                {t('common.appName')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {t('auth.register')}
              </Typography>
            </Box>

            <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
              <Step>
                <StepLabel>{t('auth.roleSelection')}</StepLabel>
              </Step>
              <Step>
                <StepLabel>{t('auth.accountDetails')}</StepLabel>
              </Step>
            </Stepper>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              {activeStep === 0 ? (
                <Box>
                  <FormControl component="fieldset" fullWidth>
                    <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
                      {t('auth.selectRole')}
                    </FormLabel>
                    <RadioGroup
                      value={selectedRole}
                      onChange={(e) => setValue('role', e.target.value)}
                    >
                      {roles.map((role) => (
                        <Paper
                          key={role.value}
                          elevation={selectedRole === role.value ? 3 : 1}
                          sx={{
                            mb: 1.5,
                            border: selectedRole === role.value ? 2 : 1,
                            borderColor: selectedRole === role.value ? 'primary.main' : 'divider',
                            borderRadius: 2,
                            transition: 'all 0.2s',
                          }}
                        >
                          <FormControlLabel
                            value={role.value}
                            control={<Radio />}
                            label={
                              <Box sx={{ py: 0.5 }}>
                                <Typography variant="subtitle2" fontWeight={700}>
                                  {t(role.labelKey)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {t(role.descKey)}
                                </Typography>
                              </Box>
                            }
                            sx={{ mx: 0, px: 2, width: '100%' }}
                          />
                        </Paper>
                      ))}
                    </RadioGroup>
                  </FormControl>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button variant="contained" onClick={handleNext} size="large" sx={{ px: 4 }}>
                      {t('common.next')}
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box>
                  <TextField
                    label={t('auth.fullName')}
                    fullWidth
                    margin="normal"
                    {...register('fullName', { required: t('common.required') })}
                    error={!!errors.fullName}
                    helperText={errors.fullName?.message}
                    autoComplete="name"
                  />

                  <TextField
                    label={t('auth.email')}
                    fullWidth
                    margin="normal"
                    {...register('email', {
                      required: t('common.required'),
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: t('common.required'),
                      },
                    })}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    autoComplete="email"
                  />

                  <TextField
                    label={t('auth.phone')}
                    fullWidth
                    margin="normal"
                    {...register('phone', { required: t('common.required') })}
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                    autoComplete="tel"
                  />

                  <TextField
                    label={t('auth.password')}
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    margin="normal"
                    {...register('password', {
                      required: t('common.required'),
                      minLength: { value: 8, message: 'Password must be at least 8 characters' },
                    })}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    autoComplete="new-password"
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
                    label={t('auth.confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    fullWidth
                    margin="normal"
                    {...register('confirmPassword', {
                      required: t('common.required'),
                      validate: (value) =>
                        value === password || t('auth.passwordsDoNotMatch'),
                    })}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    autoComplete="new-password"
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

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button onClick={handleBack} variant="outlined" size="large">
                      {t('common.back')}
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                      sx={{ px: 4 }}
                    >
                      {loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        t('auth.register')
                      )}
                    </Button>
                  </Box>
                </Box>
              )}
            </form>

            <Box sx={{ textAlign: 'center', mt: 2.5 }}>
              <Typography variant="body2" color="text.secondary">
                {t('auth.alreadyHaveAccount')}{' '}
                <Link component={RouterLink} to="/login" underline="hover" fontWeight={700}>
                  {t('auth.signIn')}
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}
