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
} from '@mui/material';
import { Visibility, VisibilityOff, Agriculture } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    try {
      const user = await login(data);
      toast.success(t('auth.welcomeBack', { name: user.fullName }));
      // Update preferred language on server
      try {
        await axios.put('/api/users/me/language', {
          preferredLanguage: localStorage.getItem('i18nextLng'),
        });
      } catch {
        // Silently ignore language update errors
      }
      navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard');
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
        style={{ width: '100%', maxWidth: 440 }}
      >
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Agriculture sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}>
                {t('common.appName')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {t('auth.signIn')}
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <TextField
                label={t('auth.email')}
                fullWidth
                margin="normal"
                {...register('email', {
                  required: t('common.required'),
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: t('auth.email'),
                  },
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
                autoComplete="email"
              />

              <TextField
                label={t('auth.password')}
                type={showPassword ? 'text' : 'password'}
                fullWidth
                margin="normal"
                {...register('password', { required: t('common.required') })}
                error={!!errors.password}
                helperText={errors.password?.message}
                autoComplete="current-password"
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

              <Box sx={{ textAlign: 'right', mt: 0.5, mb: 2 }}>
                <Link component={RouterLink} to="/forgot-password" variant="body2" underline="hover">
                  {t('auth.forgotPasswordQ')}
                </Link>
              </Box>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{ py: 1.5, fontSize: '1rem', fontWeight: 700 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : t('auth.signIn')}
              </Button>
            </form>

            <Box sx={{ textAlign: 'center', mt: 2.5 }}>
              <Typography variant="body2" color="text.secondary">
                {t('auth.noAccount')}{' '}
                <Link component={RouterLink} to="/register" underline="hover" fontWeight={700}>
                  {t('auth.createOne')}
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}