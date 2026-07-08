import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  TextField,
  MenuItem,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
} from '@mui/material';
import { CheckCircle, Refresh, Visibility } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { adminService } from '../../services/adminService';
import PageHeader from '../../components/PageHeader';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import { FEEDBACK_STATUS, FEEDBACK_TYPE, STATUS_LABELS, STATUS_COLORS } from '../../constants';

export default function AdminFeedback() {
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: rowsPerPage };
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;

      const res = await adminService.getFeedbacks(params);
      setFeedbacks(res.data.data?.content || []);
      setTotalElements(res.data.data?.totalElements || 0);
    } catch {
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, statusFilter, typeFilter]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await adminService.updateFeedbackStatus(id, { status });
      toast.success(`Feedback marked as ${status.toLowerCase()}`);
      fetchFeedbacks();
    } catch {
      toast.error('Failed to update feedback status');
    }
  };

  const handleViewDetail = (feedback) => {
    setSelectedFeedback(feedback);
    setDetailOpen(true);
  };

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      <PageHeader
        title="Feedback Management"
        subtitle="Review and manage user feedback"
        breadcrumbs={[
          { label: 'Home', path: '/dashboard' },
          { label: 'Admin', path: '/admin' },
          { label: 'Feedback' },
        ]}
        action={
          <Button variant="outlined" startIcon={<Refresh />} onClick={fetchFeedbacks}>
            Refresh
          </Button>
        }
      />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select
              label="Status"
              size="small"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value={FEEDBACK_STATUS.OPEN}>Open</MenuItem>
              <MenuItem value={FEEDBACK_STATUS.IN_PROGRESS}>In Progress</MenuItem>
              <MenuItem value={FEEDBACK_STATUS.RESOLVED}>Resolved</MenuItem>
            </TextField>
            <TextField
              select
              label="Type"
              size="small"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(0);
              }}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value={FEEDBACK_TYPE.BUG}>Bug Report</MenuItem>
              <MenuItem value={FEEDBACK_TYPE.SUGGESTION}>Suggestion</MenuItem>
              <MenuItem value={FEEDBACK_TYPE.GENERAL}>General</MenuItem>
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      {loading ? (
        <CardSkeleton count={6} />
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell><strong>Message</strong></TableCell>
                  <TableCell><strong>From</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {feedbacks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography variant="body1" color="text.secondary">
                        No feedback found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  feedbacks.map((fb) => (
                    <TableRow key={fb.id} hover>
                      <TableCell>
                        <Chip
                          label={STATUS_LABELS[fb.type] || fb.type}
                          size="small"
                          color={
                            fb.type === FEEDBACK_TYPE.BUG
                              ? 'error'
                              : fb.type === FEEDBACK_TYPE.SUGGESTION
                              ? 'info'
                              : 'primary'
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {fb.message?.length > 80 ? fb.message.slice(0, 80) + '...' : fb.message}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {fb.userName || fb.userFullName || 'Anonymous'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={STATUS_LABELS[fb.status] || fb.status}
                          size="small"
                          color={STATUS_COLORS[fb.status] || 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        {fb.createdAt ? new Date(fb.createdAt).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewDetail(fb)}
                            title="View Details"
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                          {fb.status === FEEDBACK_STATUS.OPEN && (
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() =>
                                handleUpdateStatus(fb.id, FEEDBACK_STATUS.IN_PROGRESS)
                              }
                              title="Mark In Progress"
                            >
                              <CheckCircle fontSize="small" />
                            </IconButton>
                          )}
                          {fb.status === FEEDBACK_STATUS.IN_PROGRESS && (
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() =>
                                handleUpdateStatus(fb.id, FEEDBACK_STATUS.RESOLVED)
                              }
                              title="Mark Resolved"
                            >
                              <CheckCircle fontSize="small" />
                            </IconButton>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={totalElements}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </TableContainer>
        </motion.div>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Feedback Details</DialogTitle>
        <DialogContent dividers>
          {selectedFeedback && (
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="caption" color="text.secondary">Type</Typography>
                <Chip
                  label={STATUS_LABELS[selectedFeedback.type] || selectedFeedback.type}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Status</Typography>
                <Chip
                  label={STATUS_LABELS[selectedFeedback.status] || selectedFeedback.status}
                  size="small"
                  color={STATUS_COLORS[selectedFeedback.status] || 'default'}
                  sx={{ ml: 1 }}
                />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Submitted By</Typography>
                <Typography variant="body2">
                  {selectedFeedback.userName || selectedFeedback.userFullName || 'Anonymous'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Date</Typography>
                <Typography variant="body2">
                  {selectedFeedback.createdAt
                    ? new Date(selectedFeedback.createdAt).toLocaleString()
                    : '-'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Message</Typography>
                <Paper variant="outlined" sx={{ p: 2, mt: 0.5, minHeight: 100, bgcolor: 'background.default' }}>
                  <Typography variant="body2">{selectedFeedback.message}</Typography>
                </Paper>
              </Box>
              {selectedFeedback.adminNotes && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Admin Notes</Typography>
                  <Paper variant="outlined" sx={{ p: 2, mt: 0.5, bgcolor: 'background.default' }}>
                    <Typography variant="body2">{selectedFeedback.adminNotes}</Typography>
                  </Paper>
                </Box>
              )}
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
