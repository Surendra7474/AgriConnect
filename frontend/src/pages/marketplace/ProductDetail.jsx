import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  Box, Container, Grid, Card, CardMedia, Typography, Button, Stack, Chip,
  TextField, Divider, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableRow, TableCell,
} from '@mui/material';
import {
  LocationOn, CalendarToday, AttachMoney, Scale, Spa, ShoppingCart,
  ArrowBack,
} from '@mui/icons-material';
import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../contexts/AuthContext';
import { productService, productOrderService } from '../../services/productService';
import { useTranslation } from 'react-i18next';
import StatusChip from '../../components/StatusChip';

const UNIT_LABELS = { KG: 'kg', QUINTAL: 'quintal', TON: 'ton', DOZEN: 'dozen', PIECE: 'piece' };

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated, isFarmer, isBuyer, isAdmin, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderOpen, setOrderOpen] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productService.getById(id);
        setProduct(response.data.data);
      } catch {
        toast.error(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, t]);

  const handleOrder = async () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }
    if (!deliveryAddress.trim()) {
      toast.error('Please enter your delivery address');
      return;
    }
    setOrdering(true);
    try {
      await productOrderService.placeOrder({
        productId: product.id,
        quantity: parseFloat(quantity),
        deliveryAddress: deliveryAddress.trim(),
        notes: notes.trim() || undefined,
      });
      toast.success(t('order.title') + ' placed successfully!');
      setOrderOpen(false);
      navigate('/orders');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to place order');
    } finally {
      setOrdering(false);
    }
  };

  if (loading) return <Container maxWidth="lg" sx={{ py: 4 }}><Box sx={{ py: 8, textAlign: 'center' }}><Typography>{t('common.loading')}</Typography></Box></Container>;
  if (!product) return <Container maxWidth="lg" sx={{ py: 4 }}><Typography>Product not found</Typography></Container>;

  const canOrder = isAuthenticated && (isBuyer || isFarmer || isAdmin) && product.farmer?.id !== user?.id;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>Back</Button>

        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
              {product.imageUrls?.length > 0 ? (
                <Box component="img" src={product.imageUrls[0]} alt={product.name} sx={{ width: '100%', maxHeight: 450, objectFit: 'cover' }} />
              ) : (
                <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'action.hover' }}>
                  <Typography variant="h2">{product.organic ? '🥬' : '🥕'}</Typography>
                </Box>
              )}
            </Card>
          </Grid>
          <Grid item xs={12} md={5}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h4" fontWeight={700}>{product.name}</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                  {t(`product.categories.${product.category}`)} • {product.farmer?.fullName || 'Farmer'}
                </Typography>
                <StatusChip status={product.approvalStatus} />
              </Box>

              <Typography variant="h5" color="primary.main" fontWeight={700}>
                ₹{product.pricePerUnit}/{UNIT_LABELS[product.unit] || product.unit}
              </Typography>

              <Stack direction="row" spacing={1} alignItems="center">
                <Scale fontSize="small" color="action" />
                <Typography variant="body1">
                  {product.quantityAvailable} {UNIT_LABELS[product.unit] || product.unit} available
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <LocationOn fontSize="small" color="action" />
                <Typography variant="body1">{product.location}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarToday fontSize="small" color="action" />
                <Typography variant="body1">Harvested: {product.harvestDate}</Typography>
              </Stack>
              {product.organic && (
                <Chip icon={<Spa />} label={t('product.organicYes')} color="success" variant="outlined" sx={{ alignSelf: 'flex-start' }} />
              )}

              {product.description && (
                <>
                  <Divider />
                  <Typography variant="body1" color="text.secondary">{product.description}</Typography>
                </>
              )}

              <Divider />
              <Typography variant="body2" color="text.secondary">
                Listed {new Date(product.createdAt).toLocaleDateString()}
                {product.averageRating > 0 && ` • Rating: ${product.averageRating}/5`}
              </Typography>

              {canOrder && (
                <Button variant="contained" size="large" startIcon={<ShoppingCart />} onClick={() => setOrderOpen(true)}
                  sx={{ fontWeight: 700, py: 1.5, borderRadius: 2 }}>
                  {t('order.orderNow')}
                </Button>
              )}
            </Stack>
          </Grid>
        </Grid>

        <Dialog open={orderOpen} onClose={() => setOrderOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{t('order.title')} - {product.name}</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ pt: 1 }}>
              <TextField label={t('order.quantity')} type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)}
                helperText={`Available: ${product.quantityAvailable} ${UNIT_LABELS[product.unit] || product.unit}`}
                inputProps={{ min: 0.01, step: 0.01, max: product.quantityAvailable }} />
              <TextField label={t('order.deliveryAddress')} value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} multiline rows={2} />
              <TextField label={t('order.notes')} value={notes} onChange={(e) => setNotes(e.target.value)} multiline rows={2} />
              {quantity && parseFloat(quantity) > 0 && (
                <Typography variant="h6" color="primary.main">
                  {t('order.totalAmount')}: ₹{((parseFloat(quantity) || 0) * product.pricePerUnit).toFixed(2)}
                </Typography>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOrderOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleOrder} variant="contained" disabled={ordering}>{ordering ? 'Placing...' : t('order.orderNow')}</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </motion.div>
  );
}
