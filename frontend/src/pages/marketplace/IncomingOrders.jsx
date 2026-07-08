import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  Box, Container, Typography, Card, CardContent, Stack, Button,
  Pagination, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { Receipt as ReceiptIcon } from '@mui/icons-material';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import { productOrderService } from '../../services/productService';
import { useTranslation } from 'react-i18next';
import StatusChip from '../../components/StatusChip';

const STATUS_ACTIONS = {
  PENDING: [
    { label: 'Confirm', status: 'CONFIRMED', color: 'success' },
    { label: 'Reject', status: 'REJECTED', color: 'error' },
  ],
  CONFIRMED: [
    { label: 'Ship', status: 'OUT_FOR_DELIVERY', color: 'primary' },
  ],
  OUT_FOR_DELIVERY: [
    { label: 'Mark Delivered', status: 'DELIVERED', color: 'success' },
  ],
};

export default function IncomingOrders() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updating, setUpdating] = useState(null);

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

  const handleStatusUpdate = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await productOrderService.updateStatus(orderId, { status });
      toast.success('Order status updated');
      fetchOrders();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update order');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <PageHeader title={t('order.incomingOrders')} breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: t('order.incomingOrders') }]} />

        {loading ? <CardSkeleton count={3} /> : orders.length === 0 ? (
          <EmptyState title={t('order.noOrders')} description="No incoming orders for your products." icon={<ReceiptIcon sx={{ fontSize: 80 }} />} />
        ) : (
          <Stack spacing={2}>
            {orders.map((order) => {
              const actions = STATUS_ACTIONS[order.status];
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
                      </Box>
                      <Stack alignItems="flex-end" spacing={1}>
                        <StatusChip status={order.status} />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </Typography>
                        {actions && (
                          <Stack direction="row" spacing={0.5}>
                            {actions.map((action) => (
                              <Button
                                key={action.status}
                                size="small"
                                variant="contained"
                                color={action.color}
                                disabled={updating === order.id}
                                onClick={() => handleStatusUpdate(order.id, action.status)}
                              >
                                {updating === order.id ? '...' : action.label}
                              </Button>
                            ))}
                          </Stack>
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
      </Container>
    </motion.div>
  );
}
