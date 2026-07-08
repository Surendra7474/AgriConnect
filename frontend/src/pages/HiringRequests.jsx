import React, { useState, useEffect, useCallback } from 'react';
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
} from '@mui/material';
import {
  WorkOutline as WorkIcon,
  Cancel as CancelIcon,
  CheckCircle as AcceptIcon,
  Block as RejectIcon,
} from '@mui/icons-material';

import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import StatusChip from '../components/StatusChip';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../contexts/AuthContext';
import { workerService } from '../services/workerService';
import { HIRING_STATUS } from '../constants';

const HiringRequests = () => {
  const { isFarmer, isWorker } = useAuth();

  const [hirings, setHirings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  const fetchHirings = useCallback(async () => {
    setLoading(true);
    try {
      let response;
      const params = { page, size: rowsPerPage };
      if (isWorker) {
        response = await workerService.listMyHiringRequests(params);
      } else if (isFarmer) {
        response = await workerService.listFarmerHiringRequests(params);
      } else {
        setHirings([]);
        setLoading(false);
        return;
      }
      const data = response.data.data;
      setHirings(data.content || []);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load hiring requests');
      setHirings([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, isFarmer, isWorker]);

  useEffect(() => {
    fetchHirings();
  }, [fetchHirings]);

  const handleUpdateStatus = async (hiringId, status) => {
    setActionLoading(hiringId);
    try {
      await workerService.updateHiringStatus(hiringId, { status });
      toast.success(`Hiring request ${status.toLowerCase()} successfully!`);
      fetchHirings();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update hiring request');
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <PageHeader
          title="Hiring Requests"
          subtitle={
            isWorker
              ? 'Manage hiring requests from farmers'
              : 'Track your worker hiring requests'
          }
          breadcrumbs={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Hiring Requests' },
          ]}
        />

        {loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : hirings.length === 0 ? (
          <EmptyState
            title="No Hiring Requests"
            description={
              isWorker
                ? 'You have not received any hiring requests yet. Complete your profile to attract farmers!'
                : 'You have not made any hiring requests yet. Browse workers to find the right help!'
            }
            icon={<WorkIcon sx={{ fontSize: 80 }} />}
          />
        ) : (
          <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'action.hover' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Worker Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Farmer Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Start Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>End Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Total Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {hirings.map((hiring) => (
                    <TableRow key={hiring.id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {hiring.workerName || hiring.worker?.user?.fullName || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {hiring.farmerName || hiring.farmer?.fullName || 'Unknown'}
                      </TableCell>
                      <TableCell>{formatDate(hiring.startDate)}</TableCell>
                      <TableCell>{formatDate(hiring.endDate)}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        ₹{hiring.totalAmount?.toLocaleString?.() || hiring.totalAmount || 0}
                      </TableCell>
                      <TableCell>
                        <StatusChip status={hiring.status} />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          {isWorker && hiring.status === HIRING_STATUS.PENDING && (
                            <>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<AcceptIcon />}
                                onClick={() => handleUpdateStatus(hiring.id, HIRING_STATUS.ACCEPTED)}
                                disabled={actionLoading === hiring.id}
                              >
                                Accept
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<RejectIcon />}
                                onClick={() => handleUpdateStatus(hiring.id, HIRING_STATUS.REJECTED)}
                                disabled={actionLoading === hiring.id}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {isFarmer &&
                            (hiring.status === HIRING_STATUS.PENDING ||
                              hiring.status === HIRING_STATUS.ACCEPTED) && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<CancelIcon />}
                                onClick={() =>
                                  handleUpdateStatus(hiring.id, HIRING_STATUS.CANCELLED)
                                }
                                disabled={actionLoading === hiring.id}
                              >
                                Cancel
                              </Button>
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

export default HiringRequests;