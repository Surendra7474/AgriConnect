import { useState } from 'react';
import { Link as RouterLink, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography, Link,
  Alert, CircularProgress, InputAdornment, IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, Agriculture } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { authService } from '../../services/authService';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (data) => {
    if (!token) { setError('Missing reset token'); return; }
    setError('');
    setLoading(true);
    try {
      await authService.resetPassword({ token, newPassword: data.newPassword });
      toast.success('Password reset successful. Please log in.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed.');
    } finally { setLoading(false); }
  };

  if (!token) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1b4332, #2d6a4f)', p: 2 }}>
        <Card sx={{ maxWidth: 440, borderRadius: 3 }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" fontWeight={700}>Invalid Reset Link</Typography>
            <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>This link is missing a token.</Typography>
            <Button component={RouterLink} to="/forgot-password" variant="contained">Request New Link</Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 40%, #52b788 100%)', p: 2 }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 440 }}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Agriculture sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" fontWeight={800}>Reset Password</Typography>
              <Typography variant="body2" color="text.secondary">Enter your new password</Typography>
            </Box>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <form onSubmit={handleSubmit(onSubmit)}>
              <TextField label="New Password" type={showPassword ? 'text' : 'password'} fullWidth margin="normal" {...register('newPassword', { required: true, minLength: { value: 6, message: 'Min 6 chars' } })} error={!!errors.newPassword} helperText={errors.newPassword?.message}
                InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }} />
              <TextField label="Confirm New Password" type={showPassword ? 'text' : 'password'} fullWidth margin="normal" {...register('confirmPassword', { required: true, validate: v => v === watch('newPassword') || 'Passwords do not match' })} error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} />
              <Button type="submit" variant="contained" fullWidth size="large" disabled={loading} sx={{ py: 1.5, mt: 2, fontWeight: 700 }}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
              </Button>
            </form>
            <Box sx={{ textAlign: 'center', mt: 2.5 }}>
              <Link component={RouterLink} to="/login" variant="body2" underline="hover" fontWeight={700}>Back to Sign In</Link>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}
