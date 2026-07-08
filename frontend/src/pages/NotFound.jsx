import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import { Home, SentimentDissatisfied } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function NotFound() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGoHome = () => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/login', { replace: true });
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
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: 480 }}
      >
        <Card sx={{ borderRadius: 3, textAlign: 'center' }}>
          <CardContent sx={{ p: { xs: 4, sm: 5 } }}>
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <SentimentDissatisfied
                sx={{
                  fontSize: 100,
                  color: 'text.disabled',
                  mb: 2,
                }}
              />
            </motion.div>

            <Typography
              variant="h1"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '4rem', sm: '5rem' },
                color: 'primary.main',
                fontFamily: '"Outfit", sans-serif',
                lineHeight: 1,
                mb: 1,
              }}
            >
              404
            </Typography>

            <Typography variant="h5" fontWeight={700} gutterBottom>
              Page Not Found
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 360, mx: 'auto' }}>
              The page you're looking for doesn't exist or has been moved.
            </Typography>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<Home />}
                onClick={handleGoHome}
                sx={{ px: 5, py: 1.5, fontSize: '1rem', fontWeight: 700 }}
              >
                Go to Dashboard
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}