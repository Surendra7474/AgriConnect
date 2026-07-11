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
  TablePagination,
} from '@mui/material';
import { CheckCircle, Cancel, Refresh, Star } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { adminService } from '../../services/adminService';
import PageHeader from '../../components/PageHeader';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import { WORKER_APPROVAL_STATUS, STATUS_LABELS, STATUS_COLORS } from '../../constants';

export default function AdminWorkers() {
  const [loading, setLoading] = useState(true);
  const [workers, setWorkers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchWorkers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: rowsPerPage };
      if (statusFilter) params.approvalStatus = statusFilter;

      const res = await adminService.getWorkers(params);
      setWorkers(res.data.data?.content || []);
      setTotalElements(res.data.data?.totalElements || 0);
    } catch {
      toast.error('Failed to load workers');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, statusFilter]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  const handleUpdateApproval = async (id, approvalStatus) => {
    try {
      await adminService.updateWorkerApprovalStatus(id, { approvalStatus });
      toast.success(`Worker ${approvalStatus.toLowerCase()} successfully`);
      fetchWorkers();
    } catch {
      toast.error('Failed to update worker status');
    }
  };

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const renderStars = (rating) => {
    if (!rating) return <Typography variant="caption">N/A</Typography>;
    return (
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <Star sx={{ fontSize: 16, color: '#e9c46a' }} />
        <Typography variant="body2">{Number(rating).toFixed(1)}</Typography>
      </Stack>
    );
  };

  return (
    <Box>
      <PageHeader
        title="Worker Management"
        subtitle="Review and approve worker profiles"
        breadcrumbs={[
          { label: 'Home', path: '/dashboard' },
          { label: 'Admin', path: '/admin' },
          { label: 'Workers' },
        ]}
        action={
          <Button variant="outlined" startIcon={<Refresh />} onClick={fetchWorkers}>
            Refresh
          </Button>
        }
      />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2}>
            <TextField
              select
              label="Status"
              size="small"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">All Status</MenuItem>
                    <MenuItem value={WORKER_APPROVAL_STATUS.PENDING}>Pending</MenuItem>
              <MenuItem value={WORKER_APPROVAL_STATUS.APPROVED}>Approved</MenuItem>
              <MenuItem value={WORKER_APPROVAL_STATUS.REJECTED}>Rejected</MenuItem>
              <MenuItem value={WORKER_APPROVAL_STATUS.SUSPENDED}>Suspended</MenuItem>
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
                  <TableCell><strong>Worker</strong></TableCell>
                  <TableCell><strong>Skills</strong></TableCell>
                  <TableCell><strong>Location</strong></TableCell>
                  <TableCell><strong>Daily Rate</strong></TableCell>
                  <TableCell><strong>Rating</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {workers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Typography variant="body1" color="text.secondary">
                        No workers found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  workers.map((w) => (
                    <TableRow key={w.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {w.fullName || w.user?.fullName || 'Unknown'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {w.skills ? (
                          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                            {w.skills.split(',').slice(0, 2).map((s) => (
                              <Chip key={s.trim()} label={s.trim()} size="small" variant="outlined" />
                            ))}
                            {w.skills.split(',').length > 2 && (
                              <Chip label={`+${w.skills.split(',').length - 2}`} size="small" />
                            )}
                          </Stack>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>{w.location || '-'}</TableCell>
                      <TableCell>{w.dailyRate ? `₹${w.dailyRate}` : '-'}</TableCell>
                      <TableCell>{renderStars(w.averageRating)}</TableCell>
                      <TableCell>
                        <Chip
                          label={STATUS_LABELS[w.approvalStatus] || w.approvalStatus}
                          size="small"
                          color={STATUS_COLORS[w.approvalStatus] || 'default'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {w.approvalStatus === WORKER_APPROVAL_STATUS.PENDING && (
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleUpdateApproval(w.id, WORKER_APPROVAL_STATUS.APPROVED)}
                              title="Approve"
                            >
                              <CheckCircle fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleUpdateApproval(w.id, WORKER_APPROVAL_STATUS.REJECTED)}
                              title="Reject"
                            >
                              <Cancel fontSize="small" />
                            </IconButton>
                          </Stack>
                        )}
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
    </Box>
  );
}
