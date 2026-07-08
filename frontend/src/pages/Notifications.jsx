import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
  Divider,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  DoneAll,
  Refresh,
  Visibility,
  NotificationsActive,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { notificationService } from '../services/notificationService';
import PageHeader from '../components/PageHeader';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { STATUS_LABELS, STATUS_COLORS } from '../constants';

export default function Notifications() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: rowsPerPage, sort: 'createdAt,desc' };
      const res = await notificationService.getMyNotifications(params);
      setNotifications(res.data.data?.content || []);
      setTotalElements(res.data.data?.totalElements || 0);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      toast.success('Notification marked as read');
      fetchNotifications();
    } catch {
      toast.error('Failed to update notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      toast.success('All notifications marked as read');
      fetchNotifications();
    } catch {
      toast.error('Failed to update notifications');
    }
  };

  const handleViewDetail = (notification) => {
    setSelectedNotification(notification);
    setDetailOpen(true);
    if (notification.status === 'UNREAD') {
      handleMarkAsRead(notification.id);
    }
  };

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'BOOKING':
        return '📅';
      case 'HIRING':
        return '👷';
      case 'APPROVAL':
        return '✅';
      case 'SYSTEM':
        return '🔔';
      default:
        return '📌';
    }
  };

  const unreadCount = notifications.filter((n) => n.status === 'UNREAD').length;

  return (
    <Box>
      <PageHeader
        title="Notifications"
        subtitle="Stay updated with your activities"
        breadcrumbs={[{ label: 'Home', path: '/dashboard' }, { label: 'Notifications' }]}
        action={
          <Stack direction="row" spacing={1}>
            {unreadCount > 0 && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<DoneAll />}
                onClick={handleMarkAllAsRead}
              >
                Mark All Read
              </Button>
            )}
            <Button variant="outlined" size="small" startIcon={<Refresh />} onClick={fetchNotifications}>
              Refresh
            </Button>
          </Stack>
        }
      />

      {loading ? (
        <CardSkeleton count={4} />
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <NotificationsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Notifications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You're all caught up! New notifications will appear here.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          {unreadCount > 0 && (
            <Typography variant="body2" color="primary.main" sx={{ mb: 2, fontWeight: 600 }}>
              <NotificationsActive sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
              {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
            </Typography>
          )}

          <Stack spacing={1.5} sx={{ mb: 3 }}>
            {notifications.map((n, idx) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card
                  sx={{
                    borderLeft: 4,
                    borderColor: n.status === 'UNREAD' ? 'primary.main' : 'divider',
                    cursor: 'pointer',
                    bgcolor: n.status === 'UNREAD' ? 'action.hover' : 'background.paper',
                    transition: 'all 0.2s',
                    '&:hover': { boxShadow: 4 },
                  }}
                  onClick={() => handleViewDetail(n)}
                >
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between"
                      alignItems={{ sm: 'center' }}
                      spacing={1}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Typography variant="h6" sx={{ fontSize: '1.3rem' }}>
                          {getTypeIcon(n.type)}
                        </Typography>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {n.title || n.type?.replace('_', ' ')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {n.message?.length > 100
                              ? n.message.slice(0, 100) + '...'
                              : n.message}
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {n.status === 'UNREAD' && (
                          <Chip label="New" size="small" color="primary" />
                        )}
                        <Typography variant="caption" color="text.secondary">
                          {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ''}
                        </Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </Stack>

          <TablePagination
            component="div"
            count={totalElements}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6" sx={{ fontSize: '1.3rem' }}>
              {getTypeIcon(selectedNotification?.type)}
            </Typography>
            <Typography variant="h6">Notification Details</Typography>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          {selectedNotification && (
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Type
                </Typography>
                <Chip
                  label={selectedNotification.type?.replace('_', ' ') || 'General'}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={STATUS_LABELS[selectedNotification.status] || selectedNotification.status}
                  size="small"
                  color={STATUS_COLORS[selectedNotification.status] || 'default'}
                  sx={{ ml: 1 }}
                />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Title
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {selectedNotification.title || 'Notification'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Message
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5, lineHeight: 1.7 }}>
                  {selectedNotification.message}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Received
                </Typography>
                <Typography variant="body2">
                  {selectedNotification.createdAt
                    ? new Date(selectedNotification.createdAt).toLocaleString()
                    : '-'}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
