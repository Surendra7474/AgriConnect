import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
  useTheme,
  Tooltip,
  Switch,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Agriculture,
  Build,
  People,
  Assessment,
  Feedback,
  AdminPanelSettings,
  Logout,
  Person,
  Brightness4,
  Brightness7,
  ChevronLeft,
  Notifications,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/ThemeContext';
import { ROLES } from '../constants';
import LanguageSwitcher from '../components/LanguageSwitcher';

const DRAWER_WIDTH = 260;

export default function MainLayout() {
  const { darkMode, toggleDarkMode } = useThemeMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin, isFarmer, isWorker, isEquipmentOwner, isBuyer } = useAuth();

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate('/login');
  };

  const menuItems = [
    { label: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    ...(isFarmer || isEquipmentOwner || isAdmin
      ? [{ label: 'Equipment', icon: <Build />, path: '/equipment' }]
      : []),
    ...(isFarmer || isWorker
      ? [{ label: 'Workers', icon: <People />, path: '/workers' }]
      : []),
    ...(isBuyer || isEquipmentOwner || isWorker
      ? [{ label: 'Marketplace', icon: <Agriculture />, path: '/marketplace' }]
      : []),
    ...(isFarmer
      ? [{ label: 'My Products', icon: <Agriculture />, path: '/marketplace/my' }]
      : []),
    ...(isFarmer
      ? [{ label: 'Sell Produce', icon: <Agriculture />, path: '/marketplace/new' }]
      : []),
    ...(isFarmer
      ? [{ label: 'Bookings', icon: <Agriculture />, path: '/bookings' }]
      : []),
    ...(isFarmer
      ? [{ label: 'Crop Prediction', icon: <Assessment />, path: '/predictions' }]
      : []),
    ...(isWorker
      ? [{ label: 'My Profile', icon: <People />, path: '/worker-profile' }]
      : []),
    { label: 'Feedback', icon: <Feedback />, path: '/feedback' },
    ...(isAdmin
      ? [
          {
            label: 'Admin Panel',
            icon: <AdminPanelSettings />,
            path: '/admin',
          },
          {
            label: 'Manage Users',
            icon: <People />,
            path: '/admin/users',
          },
        ]
      : []),
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          px: 2.5,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Agriculture sx={{ color: 'primary.main', fontSize: 32 }} />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
            AgriConnect
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Agriculture Platform
          </Typography>
        </Box>
      </Box>

      <List sx={{ flex: 1, px: 1.5, py: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <motion.div key={item.path} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setSidebarOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  backgroundColor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'primary.contrastText' : 'text.primary',
                  '&:hover': {
                    backgroundColor: isActive ? 'primary.dark' : 'action.hover',
                  },
                  transition: 'all 0.2s',
                }}
              >
                <ListItemIcon sx={{ color: isActive ? 'primary.contrastText' : 'text.secondary', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }} />
              </ListItemButton>
            </motion.div>
          );
        })}
      </List>

      <Divider />
      <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {darkMode ? <Brightness4 fontSize="small" /> : <Brightness7 fontSize="small" />}
          <Typography variant="body2">{darkMode ? 'Dark' : 'Light'}</Typography>
        </Box>
        <Switch checked={darkMode} onChange={toggleDarkMode} size="small" />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${sidebarOpen ? DRAWER_WIDTH : 0}px)` },
          ml: { md: sidebarOpen ? `${DRAWER_WIDTH}px` : 0 },
          backgroundColor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          transition: 'all 0.3s',
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            sx={{ mr: 2 }}
          >
            {sidebarOpen ? <ChevronLeft /> : <MenuIcon />}
          </IconButton>

          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            {menuItems.find((m) => location.pathname.startsWith(m.path))?.label || 'AgriConnect'}
          </Typography>

          <LanguageSwitcher />

          <Tooltip title="Notifications">
            <IconButton sx={{ mr: 1 }}>
              <Notifications />
            </IconButton>
          </Tooltip>

          <Tooltip title={user?.fullName || 'User'}>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar
                src={user?.profileImageUrl}
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'primary.main',
                  fontSize: 16,
                  fontWeight: 700,
                }}
              >
                {user?.fullName?.[0]?.toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{ sx: { mt: 1, minWidth: 200 } }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={700}>{user?.fullName}</Typography>
              <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
              <Typography variant="caption" color="primary.main" sx={{ textTransform: 'capitalize' }}>
                {user?.role?.replace('_', ' ')}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }}>
              <ListItemIcon><Person fontSize="small" /></ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      {isMobile ? (
        <Drawer
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
        >
          {drawer}
        </Drawer>
      ) : (
        <Drawer
          variant="persistent"
          open={sidebarOpen}
          sx={{
            width: sidebarOpen ? DRAWER_WIDTH : 0,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: 1,
              borderColor: 'divider',
            },
          }}
        >
          {drawer}
        </Drawer>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { md: sidebarOpen ? `${DRAWER_WIDTH}px` : 0 },
          transition: 'margin 0.3s',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Box sx={{ flex: 1, p: { xs: 2, sm: 3 }, maxWidth: 1400, width: '100%', mx: 'auto' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Box>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            py: 2,
            px: 3,
            borderTop: 1,
            borderColor: 'divider',
            textAlign: 'center',
            mt: 'auto',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            &copy; {new Date().getFullYear()} AgriConnect. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
