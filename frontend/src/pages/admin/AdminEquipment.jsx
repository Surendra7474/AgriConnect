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
  InputAdornment,
  TablePagination,
} from '@mui/material';
import { Search, CheckCircle, Cancel, Delete, Refresh } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { adminService } from '../../services/adminService';
import PageHeader from '../../components/PageHeader';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import { EQUIPMENT_STATUS, STATUS_LABELS, STATUS_COLORS } from '../../constants';

export default function AdminEquipment() {
  const [loading, setLoading] = useState(true);
  const [equipment, setEquipment] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchEquipment = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: rowsPerPage };
      if (statusFilter) params.status = statusFilter;

      const res = await adminService.getEquipment(params);
      setEquipment(res.data.data?.content || []);
      setTotalElements(res.data.data?.totalElements || 0);
    } catch {
      toast.error('Failed to load equipment');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, statusFilter]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await adminService.updateEquipmentStatus(id, { status });
      toast.success(`Equipment ${status.toLowerCase()} successfully`);
      fetchEquipment();
    } catch {
      toast.error('Failed to update equipment status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this equipment?')) return;
    try {
      await adminService.deleteEquipment(id);
      toast.success('Equipment deleted successfully');
      fetchEquipment();
    } catch {
      toast.error('Failed to delete equipment');
    }
  };

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      <PageHeader
        title="Equipment Management"
        subtitle="Review and approve equipment listings"
        breadcrumbs={[
          { label: 'Home', path: '/dashboard' },
          { label: 'Admin', path: '/admin' },
          { label: 'Equipment' },
        ]}
        action={
          <Button variant="outlined" startIcon={<Refresh />} onClick={fetchEquipment}>
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
              <MenuItem value={EQUIPMENT_STATUS.PENDING}>Pending</MenuItem>
              <MenuItem value={EQUIPMENT_STATUS.APPROVED}>Approved</MenuItem>
              <MenuItem value={EQUIPMENT_STATUS.REJECTED}>Rejected</MenuItem>
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
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Category</strong></TableCell>
                  <TableCell><strong>Owner</strong></TableCell>
                  <TableCell><strong>Rental Price</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Created</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {equipment.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Typography variant="body1" color="text.secondary">
                        No equipment found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  equipment.map((eq) => (
                    <TableRow key={eq.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {eq.name}
                        </Typography>
                        {eq.description && (
                          <Typography variant="caption" color="text.secondary">
                            {eq.description.slice(0, 50)}...
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip label={eq.category} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{eq.owner?.fullName || eq.ownerName || '-'}</TableCell>
                      <TableCell>
                        {eq.rentalPricePerDay ? `₹${eq.rentalPricePerDay}/day` : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={STATUS_LABELS[eq.approvalStatus] || eq.approvalStatus}
                          size="small"
                          color={STATUS_COLORS[eq.approvalStatus] || 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        {eq.createdAt ? new Date(eq.createdAt).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          {eq.approvalStatus === EQUIPMENT_STATUS.PENDING && (
                            <>
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleUpdateStatus(eq.id, EQUIPMENT_STATUS.APPROVED)}
                                title="Approve"
                              >
                                <CheckCircle fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleUpdateStatus(eq.id, EQUIPMENT_STATUS.REJECTED)}
                                title="Reject"
                              >
                                <Cancel fontSize="small" />
                              </IconButton>
                            </>
                          )}
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(eq.id)}
                            title="Delete"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
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
    </Box>
  );
}
