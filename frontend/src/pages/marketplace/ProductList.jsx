import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  TextField,
  MenuItem,
  Button,
  Fab,
  Pagination,
  Stack,
  Chip,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Clear as ClearIcon,
  ShoppingCart as CartIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { productService } from '../../services/productService';
import { useTranslation } from 'react-i18next';

const PRODUCT_CATEGORIES = ['Vegetables', 'Fruits', 'Grains', 'Pulses', 'Spices', 'Dairy', 'Other'];
const UNIT_OPTIONS = { KG: 'kg', QUINTAL: 'quintal', TON: 'ton', DOZEN: 'dozen', PIECE: 'piece' };

export default function ProductList() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, isFarmer, isAuthenticated } = useAuth();
  const { addItem } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const size = 12;

  // Quantity edit dialog for farmer owners
  const [qtyDialog, setQtyDialog] = useState({ open: false, product: null });
  const [qtyValue, setQtyValue] = useState('');
  const [qtyUpdating, setQtyUpdating] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: page - 1, size };
      if (search.trim()) params.search = search.trim();
      if (category) params.category = category;
      if (location) params.location = location;

      const response = await productService.listApproved(params);
      const data = response.data.data;
      setProducts(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch {
      toast.error(t('common.error'));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, location, t]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setLocation('');
    setPage(1);
  };

  const hasActiveFilters = search || category || location;

  const handleOpenQtyDialog = (product, e) => {
    e.stopPropagation();
    setQtyValue(String(product.quantityAvailable || 0));
    setQtyDialog({ open: true, product });
  };

  const handleSaveQty = async () => {
    const qty = parseFloat(qtyValue);
    if (isNaN(qty) || qty < 0) {
      toast.error('Quantity must be 0 or greater');
      return;
    }
    setQtyUpdating(true);
    try {
      await productService.updateQuantity(qtyDialog.product.id, { quantity: qty });
      toast.success('Quantity updated successfully');
      setQtyDialog({ open: false, product: null });
      fetchProducts();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update quantity');
    } finally {
      setQtyUpdating(false);
    }
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    if (Number(product.quantityAvailable) <= 0) {
      toast.error('This product is out of stock');
      return;
    }
    addItem(product, 1);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <PageHeader
          title={t('product.title')}
          subtitle={`Browse ${totalElements} fresh produce listings`}
          breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: t('product.title') }]}
        />

        <Box component="form" onSubmit={(e) => { e.preventDefault(); setPage(1); fetchProducts(); }} sx={{ mb: 4, p: 3, backgroundColor: 'background.paper', borderRadius: 3, boxShadow: 1 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={5} md={4}>
              <TextField fullWidth size="small" placeholder={t('common.search')} value={search} onChange={(e) => setSearch(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>, endAdornment: search && <InputAdornment position="end"><IconButton size="small" onClick={() => setSearch('')}><ClearIcon fontSize="small" /></IconButton></InputAdornment> }} />
            </Grid>
            <Grid item xs={12} sm={3} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('product.category')}</InputLabel>
                <Select value={category} label={t('product.category')} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
                  <MenuItem value="">{t('common.all')}</MenuItem>
                  {PRODUCT_CATEGORIES.map((cat) => <MenuItem key={cat} value={cat}>{t(`product.categories.${cat}`)}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3} md={2}>
              <TextField fullWidth size="small" placeholder={t('product.location')} value={location} onChange={(e) => { setLocation(e.target.value); setPage(1); }}
                InputProps={{ endAdornment: location && <InputAdornment position="end"><IconButton size="small" onClick={() => setLocation('')}><ClearIcon fontSize="small" /></IconButton></InputAdornment> }} />
            </Grid>
            <Grid item xs={6} sm={1} md={2}>
              <Button type="submit" variant="contained" fullWidth sx={{ height: 40 }}>{t('common.search')}</Button>
            </Grid>
            {hasActiveFilters && (
              <Grid item xs={6} sm={3} md={2}>
                <Button variant="outlined" fullWidth onClick={handleClearFilters} startIcon={<ClearIcon />} sx={{ height: 40 }}>{t('common.reset')}</Button>
              </Grid>
            )}
          </Grid>
        </Box>

        {loading ? (
          <CardSkeleton count={6} />
        ) : products.length === 0 ? (
          <EmptyState title={t('product.noProducts')} description={hasActiveFilters ? 'Try adjusting your filters.' : 'No produce has been listed yet.'} icon={<CartIcon sx={{ fontSize: 80 }} />} />
        ) : (
          <>
            <Grid container spacing={3}>
              {products.map((item, index) => {
                const isOutOfStock = Number(item.quantityAvailable) <= 0;
                const isOwner = isFarmer && item.farmer?.id === user?.id;
                return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.05 }}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6, cursor: 'pointer' }, opacity: isOutOfStock ? 0.7 : 1 }}
                      onClick={() => navigate(`/marketplace/${item.id}`)}>
                      <CardMedia component="div" sx={{ height: 180, backgroundColor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        {item.imageUrls?.length > 0 ? (
                          <Box component="img" src={item.imageUrls[0]} alt={item.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Typography variant="h3">{item.organic ? '🥬' : '🥕'}</Typography>
                        )}
                        {(isOutOfStock || !item.active) && (
                          <Chip label={t('common.outOfStock')} color="error" size="small" sx={{ position: 'absolute', bottom: 8, right: 8, fontWeight: 700 }} />
                        )}
                      </CardMedia>
                      <CardContent sx={{ flexGrow: 1, pb: 0 }}>
                        <Stack spacing={0.5}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="h6" noWrap sx={{ fontSize: '1rem', fontWeight: 600 }}>{item.name}</Typography>
                            {item.organic && <Chip label={t('product.organicYes')} color="success" size="small" variant="outlined" />}
                          </Box>
                          <Typography variant="body2" color="text.secondary">{t(`product.categories.${item.category}`)}</Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <LocationIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">{item.location}</Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <MoneyIcon fontSize="small" color="action" />
                            <Typography variant="body2" fontWeight={600} color="primary.main">
                              ₹{item.pricePerUnit?.toLocaleString?.() || item.pricePerUnit}/{UNIT_OPTIONS[item.unit] || item.unit}
                            </Typography>
                          </Stack>
                          {item.farmerPhone && (
                            <Typography variant="caption" color="text.secondary">
                              Farmer: {item.farmer?.fullName} · 📞 <a href={`tel:${item.farmerPhone}`} style={{ color: 'inherit' }} onClick={(e) => e.stopPropagation()}>{item.farmerPhone}</a>
                            </Typography>
                          )}
                        </Stack>
                      </CardContent>
                      <CardActions sx={{ px: 2, pb: 2, pt: 0, flexWrap: 'wrap', gap: 0.5 }}>
                        <Button size="small" variant="outlined" fullWidth onClick={(e) => { e.stopPropagation(); navigate(`/marketplace/${item.id}`); }}>
                          View Details
                        </Button>
                        {isAuthenticated && !isOwner && !isOutOfStock && (
                          <Button size="small" variant="contained" startIcon={<CartIcon />} onClick={(e) => handleAddToCart(item, e)}>
                            Add to Cart
                          </Button>
                        )}
                        {isOwner && (
                          <>
                            <Button size="small" color="info" variant="outlined" startIcon={<EditIcon />} onClick={(e) => handleOpenQtyDialog(item, e)}>
                              Edit Qty
                            </Button>
                            <Button size="small" color="error" onClick={async (e) => { e.stopPropagation(); if (window.confirm(t('product.deleteConfirm'))) { try { await productService.delete(item.id); toast.success(t('product.productDeleted')); fetchProducts(); } catch (err) { toast.error(err?.response?.data?.message || t('common.error')); } } }}>
                              <DeleteIcon fontSize="small" />
                            </Button>
                          </>
                        )}
                      </CardActions>
                    </Card>
                  </motion.div>
                </Grid>
                );
              })}
            </Grid>
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination count={totalPages} page={page} onChange={(_, v) => { setPage(v); window.scrollTo({ top: 0, behavior: 'smooth' }); }} color="primary" size="large" showFirstButton showLastButton />
              </Box>
            )}
          </>
        )}

        {(isAuthenticated && isFarmer) && (
          <Fab color="primary" aria-label="list produce" sx={{ position: 'fixed', bottom: 24, right: 24, boxShadow: 4 }} onClick={() => navigate('/marketplace/new')}>
            <AddIcon />
          </Fab>
        )}

        {/* Quantity Edit Dialog */}
        <Dialog open={qtyDialog.open} onClose={() => setQtyDialog({ open: false, product: null })} maxWidth="xs" fullWidth>
          <DialogTitle>Edit Available Quantity</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Typography variant="body2">
                Product: <strong>{qtyDialog.product?.name}</strong>
              </Typography>
              <TextField
                label="Available Quantity"
                type="number"
                fullWidth
                value={qtyValue}
                onChange={(e) => setQtyValue(e.target.value)}
                inputProps={{ min: 0, step: 0.01 }}
                helperText={`Unit: ${UNIT_OPTIONS[qtyDialog.product?.unit] || qtyDialog.product?.unit}`}
                autoFocus
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setQtyDialog({ open: false, product: null })}>Cancel</Button>
            <Button onClick={handleSaveQty} variant="contained" disabled={qtyUpdating}>
              {qtyUpdating ? <CircularProgress size={20} /> : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </motion.div>
  );
}
