import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Container, Grid, Typography, Stack, IconButton,
} from '@mui/material';
import {
  Agriculture, Build, People, Analytics, CheckCircle, Star, Brightness4, Brightness7,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useThemeMode } from '../contexts/ThemeContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

const features = [
  { icon: <Build sx={{ fontSize: 40 }} />, titleKey: 'landing.featureEquipmentRental', descKey: 'landing.featureEquipmentRentalDesc' },
  { icon: <People sx={{ fontSize: 40 }} />, titleKey: 'landing.featureHireWorkers', descKey: 'landing.featureHireWorkersDesc' },
  { icon: <Analytics sx={{ fontSize: 40 }} />, titleKey: 'landing.featureCropPrediction', descKey: 'landing.featureCropPredictionDesc' },
  { icon: <CheckCircle sx={{ fontSize: 40 }} />, titleKey: 'landing.featureTrustedMarketplace', descKey: 'landing.featureTrustedMarketplaceDesc' },
  { icon: <Star sx={{ fontSize: 40 }} />, titleKey: 'landing.featureRatings', descKey: 'landing.featureRatingsDesc' },
  { icon: <Agriculture sx={{ fontSize: 40 }} />, titleKey: 'landing.featureFullControl', descKey: 'landing.featureFullControlDesc' },
];

const roles = [
  { titleKey: 'landing.farmers', descKey: 'landing.farmersDesc' },
  { titleKey: 'landing.equipmentOwners', descKey: 'landing.equipmentOwnersDesc' },
  { titleKey: 'landing.workers', descKey: 'landing.workersDesc' },
  { titleKey: 'landing.admins', descKey: 'landing.adminsDesc' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Landing() {
  const { t } = useTranslation();
  const { darkMode, toggleDarkMode } = useThemeMode();

  return (
    <Box>
      {/* Hero */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 35%, #40916c 70%, #52b788 100%)',
          color: 'white',
          py: { xs: 8, md: 14 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            {/* Language Switcher & Theme Toggle - top right */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 3 }}>
              <IconButton
                onClick={toggleDarkMode}
                sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}
              >
                {darkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
              <LanguageSwitcher />
            </Box>

            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
              <Agriculture sx={{ fontSize: 48 }} />
              <Typography variant="h3" sx={{ fontWeight: 900, fontFamily: '"Outfit", sans-serif', letterSpacing: -1 }}>
                {t('common.appName')}
              </Typography>
            </Stack>
            <Typography variant="h5" sx={{ mb: 1, fontWeight: 600, maxWidth: 650 }}>
              {t('landing.heroSubtitle')}
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, maxWidth: 550, opacity: 0.9, fontSize: '1.1rem' }}>
              {t('landing.heroDesc')}
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button component={RouterLink} to="/register" variant="contained" size="large"
                sx={{ bgcolor: 'white', color: '#1b4332', fontWeight: 800, px: 4, py: 1.5, fontSize: '1rem',
                  '&:hover': { bgcolor: '#e8f5e9' } }}>
                {t('landing.getStarted')}
              </Button>
              <Button component={RouterLink} to="/login" variant="outlined" size="large"
                sx={{ borderColor: 'white', color: 'white', fontWeight: 700, px: 4, py: 1.5, fontSize: '1rem',
                  '&:hover': { borderColor: '#e8f5e9', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                {t('auth.signIn')}
              </Button>
            </Stack>
          </motion.div>
        </Container>
      </Box>

      {/* Who is it for */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants}>
          <Typography variant="h4" align="center" sx={{ fontWeight: 800, mb: 5, fontFamily: '"Outfit", sans-serif' }}>
            {t('landing.whoIsFor')}
          </Typography>
          <Grid container spacing={3}>
            {roles.map((role) => (
              <Grid item xs={12} sm={6} md={3} key={role.titleKey}>
                <motion.div variants={itemVariants}>
                  <Card sx={{ height: '100%', textAlign: 'center', p: 2, border: '2px solid #1b4332', borderRadius: 3, boxShadow: '4px 4px 0 #1b4332' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{t(role.titleKey)}</Typography>
                      <Typography variant="body2" color="text.secondary">{t(role.descKey)}</Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>

      {/* Features */}
      <Box sx={{ bgcolor: '#f0fdf4', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants}>
            <Typography variant="h4" align="center" sx={{ fontWeight: 800, mb: 5, fontFamily: '"Outfit", sans-serif' }}>
              {t('landing.platformFeatures')}
            </Typography>
            <Grid container spacing={3}>
              {features.map((feature) => (
                <Grid item xs={12} sm={6} md={4} key={feature.titleKey}>
                  <motion.div variants={itemVariants}>
                    <Card sx={{ height: '100%', border: '2px solid #1b4332', borderRadius: 3, boxShadow: '4px 4px 0 #1b4332', transition: '0.2s', '&:hover': { transform: 'translate(-2px, -2px)', boxShadow: '6px 6px 0 #1b4332' } }}>
                      <CardContent>
                        <Box sx={{ color: '#2d6a4f', mb: 1.5 }}>{feature.icon}</Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>{t(feature.titleKey)}</Typography>
                        <Typography variant="body2" color="text.secondary">{t(feature.descKey)}</Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* CTA */}
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 }, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, fontFamily: '"Outfit", sans-serif' }}>
          {t('landing.readyToGrow')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
          {t('landing.readyDesc')}
        </Typography>
        <Button component={RouterLink} to="/register" variant="contained" size="large"
          sx={{ bgcolor: '#1b4332', fontWeight: 800, px: 5, py: 1.5, fontSize: '1rem', '&:hover': { bgcolor: '#2d6a4f' } }}>
          {t('landing.createFreeAccount')}
        </Button>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: '#1b4332', color: 'white', py: 3, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          &copy; {new Date().getFullYear()} {t('common.appName')}. {t('landing.builtForAgriculture')}
        </Typography>
      </Box>
    </Box>
  );
}
