import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  Box, Container, Typography, Card, CardContent, Stack, Button,
  Pagination, TextField, MenuItem, FormControl, InputLabel, Select,
  InputAdornment, IconButton,
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon, Delete as DeleteIcon, Agriculture as AgriIcon } from '@mui/icons-material';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import { adminService } from '../../services/adminService';
import StatusChip from '../../components/StatusChip';

const PRODUCT_STATUS_FILTERS = ['', 'PENDING', 'APPROVED', 'REJECTED'];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('PENDING');
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: page - 1, size: 10 };
      if (status) params.status = status;
      if (search.trim()) params.search = search.trim();

      const res = await adminService.listProducts(params);
      const data = res.data.data;
      setProducts(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleStatusUpdate = async (productId, newStatus) => {
    setUpdating(productId);
    try {
      await adminService.updateProductStatus(productId, { status: newStatus });
      toast.success(`Product ${newStatus.toLowerCase()}!`);
      fetchProducts();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update product');
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await adminService.deleteProduct(productId);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete product');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <PageHeader title="Product Approvals" breadcrumbs={[{ label: 'Admin', path: '/admin' }, { label: 'Products' }]} />

        <Box sx={{ mb: 3, p: 2, backgroundColor: 'background.paper', borderRadius: 2, boxShadow: 1, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select value={status} label="Status" onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              <MenuItem value="">All</MenuItem>
              {PRODUCT_STATUS_FILTERS.filter(Boolean).map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            size="small" placeholder="Search products..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); fetchProducts(); } }}
            InputProps={{
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => { setSearch(''); setPage(1); }}><ClearIcon fontSize="small" /></IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
          <Button variant="contained" size="small" onClick={() => { setPage(1); fetchProducts(); }}>Search</Button>
        </Box>

        {loading ? <CardSkeleton count={3} /> : products.length === 0 ? (
          <EmptyState title="No Products Found" description="No products match the current filters." icon={<AgriIcon sx={{ fontSize: 80 }} />} />
        ) : (
          <Stack spacing={2}>
            {products.map((product) => (
              <Card key={product.id} sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" spacing={1}>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>{product.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Farmer: {product.farmer?.fullName || 'Unknown'} • {product.category}
                      </Typography>
                      <Typography variant="body2">
                        ₹{product.pricePerUnit}/{product.unit} • Available: {product.quantityAvailable}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {product.location} • Harvest: {product.harvestDate}
                      </Typography>
                    </Box>
                    <Stack alignItems="flex-end" spacing={1}>
                      <StatusChip status={product.approvalStatus} />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </Typography>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        {product.approvalStatus === 'PENDING' && (
                          <>
                            <Button size="small" variant="contained" color="success" disabled={updating === product.id}
                              onClick={() => handleStatusUpdate(product.id, 'APPROVED')}>
                              {updating === product.id ? '...' : 'Approve'}
                            </Button>
                            <Button size="small" variant="contained" color="error" disabled={updating === product.id}
                              onClick={() => handleStatusUpdate(product.id, 'REJECTED')}>
                              Reject
                            </Button>
                          </>
                        )}
                        <IconButton size="small" color="error" onClick={() => handleDelete(product.id)} title="Delete">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
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
      </Container>
    </motion.div>
  );
}
