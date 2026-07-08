import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  TextField,
  MenuItem,
  Button,
  Pagination,
  Stack,
  Chip,
  Rating,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Clear as ClearIcon,
  PersonSearch as PersonSearchIcon,
} from '@mui/icons-material';

import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import { workerService } from '../../services/workerService';
import { REGIONS } from '../../constants';

const WorkerList = () => {
  const navigate = useNavigate();

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const size = 12;

  const fetchWorkers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: page - 1, size };
      if (search.trim()) params.search = search.trim();
      if (location) params.location = location;
      if (availableOnly) params.available = true;

      const response = await workerService.listApproved(params);
      const data = response.data.data;
      setWorkers(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load workers');
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, location, availableOnly]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchWorkers();
  };

  const handleClearFilters = () => {
    setSearch('');
    setLocation('');
    setAvailableOnly(false);
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters = search || location || availableOnly;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <PageHeader
          title="Workers Marketplace"
          subtitle={`Browse ${totalElements} available workers`}
          breadcrumbs={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Workers' },
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
            <Grid item xs={12} sm={4} md={3}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search workers..."
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
            <Grid item xs={12} sm={3} md={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={availableOnly}
                    onChange={(e) => {
                      setAvailableOnly(e.target.checked);
                      setPage(1);
                    }}
                    color="primary"
                  />
                }
                label="Available only"
              />
            </Grid>
            <Grid item xs={6} sm={2} md={2}>
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
        ) : workers.length === 0 ? (
          <EmptyState
            title="No Workers Found"
            description={
              hasActiveFilters
                ? 'Try adjusting your search filters to find available workers.'
                : 'No workers have been registered yet. Check back later!'
            }
            icon={<PersonSearchIcon sx={{ fontSize: 80 }} />}
          />
        ) : (
          <>
            <Grid container spacing={3}>
              {workers.map((worker, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={worker.id}>
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
                      onClick={() => navigate(`/workers/${worker.id}`)}
                    >
                      <CardContent sx={{ flexGrow: 1, pb: 0 }}>
                        <Stack spacing={1}>
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
                              {worker.user?.fullName || 'Unknown Worker'}
                            </Typography>
                            <Chip
                              label={worker.available ? 'Available' : 'Unavailable'}
                              color={worker.available ? 'success' : 'default'}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                          {worker.skills && (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {worker.skills.split(',').slice(0, 3).map((skill, i) => (
                                <Chip
                                  key={i}
                                  label={skill.trim()}
                                  size="small"
                                  variant="filled"
                                  color="primary"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              ))}
                              {worker.skills.split(',').length > 3 && (
                                <Chip
                                  label={`+${worker.skills.split(',').length - 3}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              )}
                            </Box>
                          )}
                          <Stack direction="row" spacing={1} alignItems="center">
                            <LocationIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {worker.location || 'N/A'}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <MoneyIcon fontSize="small" color="action" />
                            <Typography variant="body2" fontWeight={600} color="primary.main">
                              ₹{worker.dailyRate?.toLocaleString?.() || worker.dailyRate}/day
                            </Typography>
                          </Stack>
                          {worker.averageRating > 0 && (
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <Rating
                                value={worker.averageRating}
                                readOnly
                                size="small"
                                precision={0.5}
                              />
                              <Typography variant="body2" color="text.secondary">
                                ({worker.averageRating?.toFixed?.(1) || worker.averageRating})
                              </Typography>
                            </Stack>
                          )}
                        </Stack>
                      </CardContent>
                      <CardActions sx={{ px: 2, pb: 2, pt: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          fullWidth
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/workers/${worker.id}`);
                          }}
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
      </Container>
    </motion.div>
  );
};

export default WorkerList;