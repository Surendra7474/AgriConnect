import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tabs,
  Tab,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import { Send, History } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { feedbackService } from '../services/feedbackService';
import { adminService } from '../services/adminService';
import PageHeader from '../components/PageHeader';
import StatusChip from '../components/StatusChip';
import EmptyState from '../components/EmptyState';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { FEEDBACK_TYPE, FEEDBACK_STATUS, STATUS_LABELS } from '../constants';

const FEEDBACK_STATUS_OPTIONS = Object.values(FEEDBACK_STATUS);

export default function FeedbackPage() {
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [adminResolution, setAdminResolution] = useState('');
  const [updating, setUpdating] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      type: '',
      subject: '',
      message: '',
    },
  });

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const params = { page, size: rowsPerPage };
      if (statusFilter) params.status = statusFilter;

      const service = isAdmin ? adminService.listFeedback : feedbackService.listMine;
      const res = await service(params);
      const data = res.data.data;
      setFeedbacks(data.content || []);
      setTotalElements(data.totalElements || 0);
    } catch {
      toast.error('Failed to load feedback history');
    } finally {
      setHistoryLoading(false);
    }
  }, [page, rowsPerPage, statusFilter, isAdmin]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await feedbackService.submit(data);
      toast.success('Feedback submitted successfully!');
      reset();
      setTab(1);
      setPage(0);
      fetchHistory();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit feedback';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_, newValue) => {
    setTab(newValue);
  };

  const handlePageChange = (_, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(0);
  };

  const openUpdateDialog = (feedback) => {
    setSelectedFeedback(feedback);
    setUpdateStatus(feedback.status || '');
    setAdminResolution(feedback.adminResolution || '');
    setUpdateDialogOpen(true);
  };

  const closeUpdateDialog = () => {
    setUpdateDialogOpen(false);
    setSelectedFeedback(null);
    setUpdateStatus('');
    setAdminResolution('');
  };

  const handleUpdateFeedback = async () => {
    if (!selectedFeedback) return;
    setUpdating(true);
    try {
      await adminService.updateFeedback(selectedFeedback.id, {
        status: updateStatus,
        adminResolution,
      });
      toast.success('Feedback updated successfully');
      closeUpdateDialog();
      fetchHistory();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update feedback';
      toast.error(msg);
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box>
      <PageHeader
        title="Feedback"
        subtitle="Share your thoughts or report issues"
        breadcrumbs={[
          { label: 'Home', path: '/dashboard' },
          { label: 'Feedback' },
        ]}
      />

      <Tabs
        value={tab}
        onChange={handleTabChange}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab icon={<Send />} label="Submit Feedback" iconPosition="start" />
        <Tab icon={<History />} label="History" iconPosition="start" />
      </Tabs>

      {tab === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Submit Feedback
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                We value your input. Let us know how we can improve.
              </Typography>

              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={2.5} sx={{ maxWidth: 600 }}>
                  <Controller
                    name="type"
                    control={control}
                    rules={{ required: 'Feedback type is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        label="Feedback Type"
                        fullWidth
                        error={!!errors.type}
                        helperText={errors.type?.message}
                      >
                        {Object.entries(FEEDBACK_TYPE).map(([key, value]) => (
                          <MenuItem key={key} value={value}>
                            {STATUS_LABELS[value] || value}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />

                  <TextField
                    label="Subject"
                    fullWidth
                    {...register('subject', {
                      required: 'Subject is required',
                      minLength: { value: 3, message: 'Subject must be at least 3 characters' },
                      maxLength: { value: 150, message: 'Subject must be under 150 characters' },
                    })}
                    error={!!errors.subject}
                    helperText={errors.subject?.message}
                  />

                  <TextField
                    label="Message"
                    fullWidth
                    multiline
                    rows={5}
                    {...register('message', {
                      required: 'Message is required',
                      minLength: { value: 10, message: 'Message must be at least 10 characters' },
                    })}
                    error={!!errors.message}
                    helperText={errors.message?.message}
                  />

                  <Box>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
                      sx={{ px: 4 }}
                    >
                      {loading ? 'Submitting...' : 'Submit Feedback'}
                    </Button>
                  </Box>
                </Stack>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {tab === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', sm: 'center' }}
                spacing={2}
                sx={{ mb: 2 }}
              >
                <Typography variant="h6" fontWeight={700}>
                  {isAdmin ? 'All Feedback' : 'My Feedback History'}
                </Typography>

                {isAdmin && (
                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel>Status Filter</InputLabel>
                    <Select
                      value={statusFilter}
                      label="Status Filter"
                      onChange={handleStatusFilterChange}
                    >
                      <MenuItem value="">All Statuses</MenuItem>
                      {FEEDBACK_STATUS_OPTIONS.map((s) => (
                        <MenuItem key={s} value={s}>
                          {STATUS_LABELS[s] || s}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Stack>

              {historyLoading ? (
                <TableSkeleton rows={5} />
              ) : feedbacks.length === 0 ? (
                <EmptyState
                  title="No feedback yet"
                  description="Your submitted feedback will appear here."
                />
              ) : (
                <>
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                          {isAdmin && <TableCell sx={{ fontWeight: 700 }}>User</TableCell>}
                          <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Admin Resolution</TableCell>
                          {isAdmin && <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {feedbacks.map((fb) => (
                          <TableRow key={fb.id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {fb.subject}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {fb.message}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <StatusChip status={fb.type} />
                            </TableCell>
                            <TableCell>
                              <StatusChip status={fb.status} />
                            </TableCell>
                            {isAdmin && (
                              <TableCell>
                                <Typography variant="body2">
                                  {fb.userFullName || fb.userId || '-'}
                                </Typography>
                              </TableCell>
                            )}
                            <TableCell>
                              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                                {formatDate(fb.createdAt)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                              >
                                {fb.adminResolution || '-'}
                              </Typography>
                            </TableCell>
                            {isAdmin && (
                              <TableCell align="center">
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => openUpdateDialog(fb)}
                                >
                                  Update
                                </Button>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <TablePagination
                    component="div"
                    count={totalElements}
                    page={page}
                    onPageChange={handlePageChange}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    rowsPerPageOptions={[5, 10, 25]}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Admin Update Dialog */}
      {isAdmin && (
        <Dialog open={updateDialogOpen} onClose={closeUpdateDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>Update Feedback</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Typography variant="body2" fontWeight={600}>
                Subject: {selectedFeedback?.subject}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}
              >
                {selectedFeedback?.message}
              </Typography>

              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={updateStatus}
                  label="Status"
                  onChange={(e) => setUpdateStatus(e.target.value)}
                >
                  {FEEDBACK_STATUS_OPTIONS.map((s) => (
                    <MenuItem key={s} value={s}>
                      {STATUS_LABELS[s] || s}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Admin Resolution"
                fullWidth
                multiline
                rows={3}
                value={adminResolution}
                onChange={(e) => setAdminResolution(e.target.value)}
                placeholder="Add a resolution message..."
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={closeUpdateDialog} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={handleUpdateFeedback}
              variant="contained"
              disabled={updating || !updateStatus}
              startIcon={updating ? <CircularProgress size={18} color="inherit" /> : null}
            >
              {updating ? 'Updating...' : 'Update'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}