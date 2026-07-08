import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  Box, Container, Typography, TextField, Button, Stack, Card, CardContent,
  MenuItem, FormControlLabel, Switch, Grid, IconButton,
} from '@mui/material';
import { ArrowBack, Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import PageHeader from '../../components/PageHeader';
import { productService } from '../../services/productService';
import { useTranslation } from 'react-i18next';

const CATEGORIES = ['Vegetables', 'Fruits', 'Grains', 'Pulses', 'Spices', 'Dairy', 'Other'];
const UNITS = ['KG', 'QUINTAL', 'TON', 'DOZEN', 'PIECE'];

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '', category: '', description: '', pricePerUnit: '', unit: 'KG',
    quantityAvailable: '', harvestDate: '', location: '', organic: false,
    active: true, imageUrls: [''],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const fetchProduct = async () => {
        try {
          const res = await productService.getById(id);
          const p = res.data.data;
          setForm({
            name: p.name || '', category: p.category || '', description: p.description || '',
            pricePerUnit: p.pricePerUnit || '', unit: p.unit || 'KG', quantityAvailable: p.quantityAvailable || '',
            harvestDate: p.harvestDate || '', location: p.location || '', organic: p.organic || false,
            active: p.active, imageUrls: p.imageUrls?.length ? p.imageUrls : [''],
          });
        } catch { toast.error(t('common.error')); }
      };
      fetchProduct();
    }
  }, [id, isEdit, t]);

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const handleSwitch = (field) => (e) => setForm({ ...form, [field]: e.target.checked });

  const handleImageChange = (index, value) => {
    const updated = [...form.imageUrls];
    updated[index] = value;
    setForm({ ...form, imageUrls: updated });
  };
  const addImage = () => setForm({ ...form, imageUrls: [...form.imageUrls, ''] });
  const removeImage = (index) => {
    if (form.imageUrls.length <= 1) return;
    setForm({ ...form, imageUrls: form.imageUrls.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...form,
        pricePerUnit: parseFloat(form.pricePerUnit),
        quantityAvailable: parseFloat(form.quantityAvailable),
        imageUrls: form.imageUrls.filter((u) => u.trim()),
      };
      if (isEdit) {
        await productService.update(id, data);
        toast.success('Product updated!');
      } else {
        await productService.create(data);
        toast.success('Product listed!');
      }
      navigate('/marketplace/my');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>Back</Button>
        <PageHeader
          title={isEdit ? t('product.editProduct') : t('product.createProduct')}
          breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: isEdit ? t('product.editProduct') : t('product.createProduct') }]}
        />
        <Card sx={{ borderRadius: 3, p: 2 }} component="form" onSubmit={handleSubmit}>
          <CardContent>
            <Stack spacing={3}>
              <TextField label={t('product.name')} value={form.name} onChange={handleChange('name')} required fullWidth />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField label={t('product.category')} select value={form.category} onChange={handleChange('category')} required fullWidth>
                    {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{t(`product.categories.${c}`)}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label={t('product.unit')} select value={form.unit} onChange={handleChange('unit')} required fullWidth>
                    {UNITS.map((u) => <MenuItem key={u} value={u}>{t(`product.units.${u}`)}</MenuItem>)}
                  </TextField>
                </Grid>
              </Grid>
              <TextField label={t('product.description')} value={form.description} onChange={handleChange('description')} multiline rows={3} fullWidth />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField label={t('product.pricePerUnit')} type="number" value={form.pricePerUnit} onChange={handleChange('pricePerUnit')} required fullWidth inputProps={{ min: 0.01, step: 0.01 }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label={t('product.quantityAvailable')} type="number" value={form.quantityAvailable} onChange={handleChange('quantityAvailable')} required fullWidth inputProps={{ min: 0.01, step: 0.01 }} />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField label={t('product.harvestDate')} type="date" value={form.harvestDate} onChange={handleChange('harvestDate')} required fullWidth InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label={t('product.location')} value={form.location} onChange={handleChange('location')} required fullWidth />
                </Grid>
              </Grid>
              <Stack direction="row" spacing={3}>
                <FormControlLabel control={<Switch checked={form.organic} onChange={handleSwitch('organic')} />} label={t('product.organicYes')} />
                <FormControlLabel control={<Switch checked={form.active} onChange={handleSwitch('active')} />} label={t('product.active')} />
              </Stack>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>{t('product.imageUrls')}</Typography>
                {form.imageUrls.map((url, i) => (
                  <Stack key={i} direction="row" spacing={1} sx={{ mb: 1 }}>
                    <TextField size="small" value={url} onChange={(e) => handleImageChange(i, e.target.value)} placeholder="https://..." fullWidth />
                    {form.imageUrls.length > 1 && (
                      <IconButton size="small" color="error" onClick={() => removeImage(i)}><DeleteIcon /></IconButton>
                    )}
                  </Stack>
                ))}
                <Button size="small" startIcon={<AddIcon />} onClick={addImage}>Add Image</Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={() => navigate(-1)}>{t('common.cancel')}</Button>
                <Button type="submit" variant="contained" disabled={loading}>{loading ? t('common.loading') : isEdit ? t('common.save') : t('common.create')}</Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </motion.div>
  );
}
