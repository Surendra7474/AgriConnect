import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  Box, Container, Typography, Card, CardContent, Stack, Button,
  Pagination, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Chip, CircularProgress, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import { Receipt as ReceiptIcon } from '@mui/icons-material';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import { productOrderService } from '../../services/productService';
import { useTranslation } from 'react-i18next';

const TRANSITION_OPTIONS = {
  PENDING: [
    { label: 'Order Confirmed', status: 'CONFIRMED' },
    { label: 'Reject Order', status: 'REJECTED' },
  ],
  CONFIRMED: [
    { label: 'Order Packed', status: 'PACKED' },
  ],
  PACKED: [
    { label: 'Order Shipped', status: 'DISPATCHED' },
  ],
  DISPATCHED: [
    { label: 'Mark as Delivered', status: 'DELIVERED' },
  ],
};

const STATUS_COLORS = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PACKED: 'secondary',
  DISPATCHED: 'warning',
  OUT_FOR_DELIVERY: 'warning',
  DELIVERED: 'success',
  CANCELLED: 'error',
  REJECTED: 'error',
};

const STATUS_LABELS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PACKED: 'Packed',
  DISPATCHED: 'Dispatched',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REJECTED: 'Rejected',
};

export default function IncomingOrders() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updating, setUpdating] = useState(null);

  // Cancel/reject reason dialog
  const [cancelDialog, setCancelDialog] = useState({ open: false, order: null, status: null });
  const [cancelReason, setCancelReason] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productOrderService.listIncomingOrders({ page: page - 1, size: 10 });
      const data = res.data.data;
      setOrders(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [page, t]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusUpdate = async (orderId, status, reason) => {
    setUpdating(orderId);
    try {
      console.log(`Updating order ${orderId} to status ${status}, reason:`, reason);
      await productOrderService.updateStatus(orderId, { status, notes: reason || undefined });
      toast.success(`Order ${STATUS_LABELS[status] || status.toLowerCase()} successfully`);
      fetchOrders();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to update order';
      console.error('Status update failed:', err?.response?.status, msg);
      toast.error(msg);
    } finally {
      setUpdating(null);
    }
  };

  const handleDropdownChange = (order, newStatus) => {
    if (newStatus === 'CANCELLED' || newStatus === 'REJECTED') {
      setCancelReason('');
      setCancelDialog({ open: true, order, status: newStatus });
    } else {
      if (window.confirm(`Change status to "${newStatus}"?`)) {
        handleStatusUpdate(order.id, newStatus);
      }
    }
  };

  const handleCancelConfirm = () => {
    if (!cancelDialog.order) return;
    const reason = cancelReason.trim();
    handleStatusUpdate(cancelDialog.order.id, cancelDialog.status, reason || undefined);
    setCancelDialog({ open: false, order: null, status: null });
  };

  const isTerminal = (status) => ['DELIVERED', 'CANCELLED', 'REJECTED'].includes(status);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <PageHeader title={t('order.incomingOrders')} breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: t('order.incomingOrders') }]} />

        {loading ? <CardSkeleton count={3} /> : orders.length === 0 ? (
          <EmptyState title={t('order.noOrders')} description="No incoming orders for your products." icon={<ReceiptIcon sx={{ fontSize: 80 }} />} />
        ) : (
          <Stack spacing={2}>
            {orders.map((order) => {
              const hasActions = TRANSITION_OPTIONS[order.status] && TRANSITION_OPTIONS[order.status].length > 0;
              const isTerminalStatus = isTerminal(order.status);
              return (
                <Card key={order.id} sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" spacing={1}>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>{order.productName}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Buyer: {order.buyer?.fullName || 'Unknown'}
                        </Typography>
                        <Typography variant="body2">
                          Qty: {order.quantity} • ₹{order.pricePerUnitAtOrder}/unit
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color="primary.main">
                          Total: ₹{order.totalAmount}
                        </Typography>
                        {order.deliveryAddress && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Deliver to: {order.deliveryAddress}
                          </Typography>
                        )}
                        {order.cancellationReason && (
                          <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
                            Reason: {order.cancellationReason}
                          </Typography>
                        )}
                        {order.paymentProofUrl && (
                          <Typography variant="body2" color="info.main" sx={{ mt: 0.5 }}>
                            Payment Proof: <a href={order.paymentProofUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>View Image</a>
                          </Typography>
                        )}
                      </Box>
                      <Stack alignItems="flex-end" spacing={1}>
                        <Chip
                          label={STATUS_LABELS[order.status] || order.status}
                          color={STATUS_COLORS[order.status] || 'default'}
                          size="small"
                          sx={{ fontWeight: 600, minWidth: 100 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </Typography>
                        {!isTerminalStatus && hasActions && (
                          <FormControl size="small" sx={{ minWidth: 180 }}>
                            <Select
                              value=""
                              displayEmpty
                              disabled={updating === order.id}
                              renderValue={() => updating === order.id ? 'Updating...' : 'Update Status'}
                              onChange={(e) => handleDropdownChange(order, e.target.value)}
                              sx={{ fontSize: '0.875rem' }}
                            >
                              {TRANSITION_OPTIONS[order.status].map((opt) => (
                                <MenuItem key={opt.status} value={opt.status}>
                                  {opt.label}
                                </MenuItem>
                              ))}
                              {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                                <MenuItem value="CANCELLED" sx={{ color: 'error.main' }}>
                                  Cancel Order
                                </MenuItem>
                              )}
                            </Select>
                          </FormControl>
                        )}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
              </Box>
            )}
          </Stack>
        )}

        {/* Cancel/Reject Reason Dialog */}
        <Dialog open={cancelDialog.open} onClose={() => setCancelDialog({ open: false, order: null, status: null })} maxWidth="sm" fullWidth>
          <DialogTitle>{cancelDialog.status === 'REJECTED' ? 'Reject Order?' : 'Cancel Order?'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Typography variant="body2">
                Are you sure you want to {cancelDialog.status === 'REJECTED' ? 'reject' : 'cancel'} the order for <strong>{cancelDialog.order?.productName}</strong>?
              </Typography>
              <TextField
                label="Reason (optional)"
                fullWidth
                multiline
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder={`Provide a reason for ${cancelDialog.status === 'REJECTED' ? 'rejection' : 'cancellation'}...`}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCancelDialog({ open: false, order: null, status: null })}>{t('common.cancel')}</Button>
            <Button onClick={handleCancelConfirm} color="error" variant="contained" disabled={updating === cancelDialog.order?.id}>
              {updating ? <CircularProgress size={20} /> : 'Confirm'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </motion.div>
  );
}
