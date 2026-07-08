import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  Rating,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import { useAuth } from '../../contexts/AuthContext';
import { equipmentService } from '../../services/equipmentService';
import { EQUIPMENT_CATEGORIES, REGIONS } from '../../constants';

const EquipmentList = () => {
  const navigate = useNavigate();
  const { isEquipmentOwner, isAuthenticated } = useAuth();

  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const size = 12;

  const fetchEquipment = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: page - 1, size };
      if (search.trim()) params.search = search.trim();
      if (category) params.category = category;
      if (location) params.location = location;

      const response = await equipmentService.listApproved(params);
      const data = response.data.data;
      setEquipment(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load equipment listings');
      setEquipment([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, location]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEquipment();
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setLocation('');
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters = search || category || location;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <PageHeader
          title="Equipment Marketplace"
          subtitle={`Browse ${totalElements} available equipment listings`}
          breadcrumbs={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Equipment' },
          ]}
        />

        {/* Filters */}
        <Box
          component="form"
          onSubmit={handleSearchSubmit}
          sx={{
            mb: 4,
            p: 3,
            backgroundColor: 'background.paper',
            borderRadius: 3,
            boxShadow: 1,
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={5} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search equipment..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: search && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearch('')}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  label="Category"
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {EQUIPMENT_CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Location</InputLabel>
                <Select
                  value={location}
                  label="Location"
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="">All Locations</MenuItem>
                  {REGIONS.map((reg) => (
                    <MenuItem key={reg} value={reg}>
                      {reg}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={1} md={2}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ height: 40 }}
              >
                Search
              </Button>
            </Grid>
            {hasActiveFilters && (
              <Grid item xs={6} sm={3} md={2}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleClearFilters}
                  startIcon={<ClearIcon />}
                  sx={{ height: 40 }}
                >
                  Clear
                </Button>
              </Grid>
            )}
          </Grid>
        </Box>

        {/* Results */}
        {loading ? (
          <CardSkeleton count={6} />
        ) : equipment.length === 0 ? (
          <EmptyState
            title="No Equipment Found"
            description={
              hasActiveFilters
                ? 'Try adjusting your search filters to find what you need.'
                : 'No equipment has been listed yet. Check back later!'
            }
            icon={<SearchIcon sx={{ fontSize: 80 }} />}
          />
        ) : (
          <>
            <Grid container spacing={3}>
              {equipment.map((item, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 3,
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 6,
                          cursor: 'pointer',
                        },
                      }}
                      onClick={() => navigate(`/equipment/${item.id}`)}
                    >
                      <CardMedia
                        component="div"
                        sx={{
                          height: 180,
                          backgroundColor: 'action.hover',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {item.imageUrls && item.imageUrls.length > 0 ? (
                          <Box
                            component="img"
                            src={item.imageUrls[0]}
                            alt={item.name}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        ) : (
                          <Typography variant="h3" color="text.disabled">
                            🚜
                          </Typography>
                        )}
                      </CardMedia>
                      <CardContent sx={{ flexGrow: 1, pb: 0 }}>
                        <Stack spacing={0.5}>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                            }}
                          >
                            <Typography
                              variant="h6"
                              component="div"
                              noWrap
                              sx={{ fontSize: '1rem', fontWeight: 600 }}
                            >
                              {item.name}
                            </Typography>
                            <Chip
                              label={item.available ? 'Available' : 'Unavailable'}
                              color={item.available ? 'success' : 'default'}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ textTransform: 'capitalize' }}
                          >
                            {item.category}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <LocationIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {item.location}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <MoneyIcon fontSize="small" color="action" />
                            <Typography variant="body2" fontWeight={600} color="primary.main">
                              ₹{item.rentalPricePerDay?.toLocaleString?.() || item.rentalPricePerDay}/day
                            </Typography>
                          </Stack>
                          {item.averageRating > 0 && (
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <Rating
                                value={item.averageRating}
                                readOnly
                                size="small"
                                precision={0.5}
                              />
                              <Typography variant="body2" color="text.secondary">
                                ({item.averageRating?.toFixed?.(1) || item.averageRating})
                              </Typography>
                            </Stack>
                          )}
                        </Stack>
                      </CardContent>
                      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          fullWidth
                          component={Link}
                          to={`/equipment/${item.id}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Details
                        </Button>
                      </CardActions>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </>
        )}

        {/* FAB for Equipment Owners */}
        {isAuthenticated && isEquipmentOwner && (
          <Fab
            color="primary"
            aria-label="list equipment"
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              boxShadow: 4,
            }}
            onClick={() => navigate('/equipment/new')}
          >
            <AddIcon />
          </Fab>
        )}
      </Container>
    </motion.div>
  );
};

export default EquipmentList;
