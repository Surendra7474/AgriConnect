import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Agriculture } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { authService } from '../../services/authService';
import { motion } from 'framer-motion';

export default function ForgotPassword() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { email: '' } });

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    try {
      await authService.forgotPassword(data);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
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
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ width: '100%', maxWidth: 440 }}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Agriculture sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}>
                Forgot Password
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {submitted ? 'Check your email' : 'Enter your email to reset your password'}
              </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {submitted && <Alert severity="success" sx={{ mb: 2 }}>Password reset instructions sent to your email.</Alert>}

            {!submitted && (
              <form onSubmit={handleSubmit(onSubmit)}>
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
                <Button type="submit" variant="contained" fullWidth size="large" disabled={loading} sx={{ py: 1.5, mt: 2, fontWeight: 700 }}>
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
                </Button>
              </form>
            )}

            <Box sx={{ textAlign: 'center', mt: 2.5 }}>
              <Link component={RouterLink} to="/login" variant="body2" underline="hover" fontWeight={700}>
                Back to Sign In
              </Link>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}
