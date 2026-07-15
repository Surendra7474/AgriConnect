import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
} from '@mui/material';
import {
  Event as EventIcon,
  Cancel as CancelIcon,
  CheckCircle as ApproveIcon,
  Block as RejectIcon,
} from '@mui/icons-material';

import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import StatusChip from '../components/StatusChip';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../contexts/AuthContext';
import { equipmentService } from '../services/equipmentService';
import { BOOKING_STATUS } from '../constants';

const Bookings = () => {
  const navigate = useNavigate();
  const { isFarmer, isEquipmentOwner, isWorker } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      let response;
      const params = { page, size: rowsPerPage };
      if (isFarmer) {
        response = await equipmentService.listMyBookings(params);
      } else if (isEquipmentOwner) {
        response = await equipmentService.listOwnerBookings(params);
      } else {
        setBookings([]);
        setLoading(false);
        return;
      }
      const data = response.data.data;
      setBookings(data.content || []);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, isFarmer, isEquipmentOwner]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // If worker, redirect to hiring
  useEffect(() => {
    if (isWorker) {
      navigate('/hiring', { replace: true });
    }
  }, [isWorker, navigate]);

  const handleUpdateStatus = async (bookingId, status) => {
    setActionLoading(bookingId);
    try {
      await equipmentService.updateBookingStatus(bookingId, { status });
      toast.success(`Booking ${status.toLowerCase()} successfully!`);
      fetchBookings();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update booking');
    } finally {
      setActionLoading(null);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isWorker) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <PageHeader
          title="Bookings"
          subtitle={
            isFarmer
              ? 'Track your equipment booking requests'
              : 'Manage booking requests for your equipment'
          }
          breadcrumbs={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Bookings' },
          ]}
        />

        {loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : bookings.length === 0 ? (
          <EmptyState
            title="No Bookings Found"
            description="You don't have any booking requests yet. Browse equipment to get started!"
            icon={<EventIcon sx={{ fontSize: 80 }} />}
          />
        ) : (
          <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'action.hover' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Equipment Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      {isFarmer ? 'Owner' : 'Farmer'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Start Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>End Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Total Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Payment Proof</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {booking.equipmentName || booking.equipment?.name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {isFarmer
                          ? booking.ownerName || booking.equipment?.owner?.fullName || 'N/A'
                          : booking.farmerName || booking.user?.fullName || booking.farmer?.fullName || 'N/A'}
                      </TableCell>
                      <TableCell>{formatDate(booking.bookingDate)}</TableCell>
                      <TableCell>{formatDate(booking.returnDate)}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        ₹{booking.totalAmount?.toLocaleString?.() || booking.totalAmount || 0}
                      </TableCell>
                      <TableCell>
                        {booking.paymentProofUrl ? (
                          <Box
                            component="img"
                            src={booking.paymentProofUrl}
                            alt="Payment proof"
                            onClick={() => window.open(booking.paymentProofUrl, '_blank')}
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 1,
                              objectFit: 'cover',
                              cursor: 'pointer',
                              border: '1px solid',
                              borderColor: 'divider',
                              '&:hover': { opacity: 0.8 },
                            }}
                          />
                        ) : (
                          <Typography variant="body2" color="text.disabled">
                            —
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusChip status={booking.status} />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          {isFarmer && (booking.status === BOOKING_STATUS.PENDING || booking.status === BOOKING_STATUS.APPROVED) && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<CancelIcon />}
                              onClick={() => handleUpdateStatus(booking.id, BOOKING_STATUS.CANCELLED)}
                              disabled={actionLoading === booking.id}
                            >
                              Cancel
                            </Button>
                          )}
                          {isEquipmentOwner && booking.status === BOOKING_STATUS.PENDING && (
                            <>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<ApproveIcon />}
                                onClick={() => handleUpdateStatus(booking.id, BOOKING_STATUS.APPROVED)}
                                disabled={actionLoading === booking.id}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<RejectIcon />}
                                onClick={() => handleUpdateStatus(booking.id, BOOKING_STATUS.REJECTED)}
                                disabled={actionLoading === booking.id}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={totalElements}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </Paper>
        )}
      </Container>
    </motion.div>
  );
};

export default Bookings;
