import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  Box, Container, Typography, Card, CardContent, Stack, Button,
  Pagination, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  MenuItem, Select, FormControl, InputLabel,
} from '@mui/material';
import { ShoppingCart, Receipt as ReceiptIcon } from '@mui/icons-material';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import { productOrderService } from '../../services/productService';
import { useTranslation } from 'react-i18next';
import StatusChip from '../../components/StatusChip';

export default function MyOrders() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cancelDialog, setCancelDialog] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productOrderService.listMyOrders({ page: page - 1, size: 10 });
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

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await productOrderService.updateStatus(cancelDialog, { status: 'CANCELLED' });
      toast.success('Order cancelled');
      setCancelDialog(null);
      fetchOrders();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <PageHeader title={t('order.myOrders')} breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: t('order.myOrders') }]} />

        {loading ? <CardSkeleton count={3} /> : orders.length === 0 ? (
          <EmptyState title={t('order.noOrders')} description="You haven't placed any orders yet." icon={<ShoppingCart sx={{ fontSize: 80 }} />} />
        ) : (
          <Stack spacing={2}>
            {orders.map((order) => (
              <Card key={order.id} sx={{ borderRadius: 3, cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
                onClick={() => navigate(`/orders/${order.id}`)}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" spacing={1}>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>{order.productName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Farmer: {order.farmer?.fullName || 'Unknown'}
                      </Typography>
                      <Typography variant="body2">
                        Qty: {order.quantity} • ₹{order.pricePerUnitAtOrder}/unit
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color="primary.main">
                        Total: ₹{order.totalAmount}
                      </Typography>
                    </Box>
                    <Stack alignItems="flex-end" spacing={0.5}>
                      <StatusChip status={order.status} />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </Typography>
                      {order.status === 'PENDING' && (
                        <Button size="small" color="error" variant="outlined"
                          onClick={(e) => { e.stopPropagation(); setCancelDialog(order.id); }}>
                          Cancel
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
              </Box>
            )}
          </Stack>
        )}

        <Dialog open={Boolean(cancelDialog)} onClose={() => setCancelDialog(null)}>
          <DialogTitle>Cancel Order?</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to cancel this order? This action cannot be undone.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCancelDialog(null)}>{t('common.cancel')}</Button>
            <Button onClick={handleCancel} color="error" variant="contained" disabled={cancelling}>
              {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </motion.div>
  );
}
