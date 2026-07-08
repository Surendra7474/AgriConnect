import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button, MenuItem, Grid,
  LinearProgress, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, Stack, Alert, Chip,
} from '@mui/material';
import { Assessment, Agriculture, TrendingUp, Lightbulb, Spa } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { predictionService } from '../services/predictionService';
import { SOIL_TYPES, WATER_SOURCES, REGIONS } from '../constants';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { TableSkeleton, FormSkeleton } from '../components/LoadingSkeleton';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function Predictions() {
  const { isFarmer } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    if (isFarmer) fetchHistory(0, rowsPerPage);
    else setHistoryLoading(false);
  }, [isFarmer]);

  const fetchHistory = async (p, size) => {
    setHistoryLoading(true);
    try {
      const res = await predictionService.history({ page: p, size });
      const data = res.data.data;
      setHistory(data.content || []);
      setTotalElements(data.totalElements || 0);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const onSubmit = async (formData) => {
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        cropName: formData.cropName,
        areaHectares: parseFloat(formData.areaHectares),
        soilType: formData.soilType,
        waterSource: formData.waterSource,
        region: formData.region,
        investmentAmount: parseFloat(formData.investmentAmount),
      };
      const res = await predictionService.predict(payload);
      setResult(res.data.data);
      toast.success('Prediction completed successfully!');
      fetchHistory(0, rowsPerPage);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Prediction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
    fetchHistory(newPage, rowsPerPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const size = parseInt(event.target.value, 10);
    setRowsPerPage(size);
    setPage(0);
    fetchHistory(0, size);
  };

  if (!isFarmer) {
    return (
      <Box>
        <PageHeader title="Crop Predictions" subtitle="AI-powered crop yield and profit predictions" />
        <EmptyState title="Access Restricted" description="Only farmers can access prediction features." />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Crop Predictions"
        subtitle="Get AI-powered insights on crop yield, profit, and suitability."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Predictions', path: '/predictions' },
        ]}
      />

      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <Grid container spacing={3}>
          {/* Prediction Form */}
          <Grid item xs={12} md={5}>
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                    <Agriculture color="primary" />
                    <Typography variant="h6" fontWeight={700}>New Prediction</Typography>
                  </Stack>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <TextField
                      fullWidth label="Crop Name" margin="normal"
                      {...register('cropName', { required: 'Crop name is required' })}
                      error={!!errors.cropName} helperText={errors.cropName?.message}
                    />
                    <TextField
                      fullWidth label="Area (Hectares)" type="number" margin="normal"
                      inputProps={{ step: '0.01', min: '0.01' }}
                      {...register('areaHectares', { required: 'Area is required', min: { value: 0.01, message: 'Must be > 0' } })}
                      error={!!errors.areaHectares} helperText={errors.areaHectares?.message}
                    />
                    <TextField
                      fullWidth select label="Soil Type" margin="normal"
                      {...register('soilType', { required: 'Soil type is required' })}
                      error={!!errors.soilType} helperText={errors.soilType?.message}
                    >
                      {SOIL_TYPES.map((s) => (
                        <MenuItem key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      fullWidth select label="Water Source" margin="normal"
                      {...register('waterSource', { required: 'Water source is required' })}
                      error={!!errors.waterSource} helperText={errors.waterSource?.message}
                    >
                      {WATER_SOURCES.map((s) => (
                        <MenuItem key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      fullWidth select label="Region" margin="normal"
                      {...register('region', { required: 'Region is required' })}
                      error={!!errors.region} helperText={errors.region?.message}
                    >
                      {REGIONS.map((s) => (
                        <MenuItem key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      fullWidth label="Investment Amount (₹)" type="number" margin="normal"
                      inputProps={{ step: '0.01', min: '0' }}
                      {...register('investmentAmount', { required: 'Investment amount is required', min: { value: 0, message: 'Must be >= 0' } })}
                      error={!!errors.investmentAmount} helperText={errors.investmentAmount?.message}
                    />
                    <Button
                      type="submit" variant="contained" fullWidth size="large"
                      disabled={loading} sx={{ mt: 2, py: 1.5, borderRadius: 2, textTransform: 'none' }}
                    >
                      {loading ? 'Predicting...' : 'Predict'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Prediction Result */}
          <Grid item xs={12} md={7}>
            {loading && (
              <Card><CardContent><FormSkeleton /></CardContent></Card>
            )}
            {result && !loading && (
              <motion.div variants={itemVariants}>
                <Card sx={{ overflow: 'visible' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>Prediction Results</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                          <TrendingUp color="primary" sx={{ fontSize: 32, mb: 1 }} />
                          <Typography variant="h5" fontWeight={800}>{result.estimatedYield ?? '--'}</Typography>
                          <Typography variant="caption" color="text.secondary">Estimated Yield (q/ha)</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                          <Assessment color="success" sx={{ fontSize: 32, mb: 1 }} />
                          <Typography variant="h5" fontWeight={800}>₹{result.estimatedProfit ?? '--'}</Typography>
                          <Typography variant="caption" color="text.secondary">Est. Profit</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>Suitability Score</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min((result.suitabilityScore || 0) * 100, 100)}
                              sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
                            />
                            <Typography variant="body2" fontWeight={700}>
                              {result.suitabilityScore ? `${(result.suitabilityScore * 100).toFixed(0)}%` : '--'}
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    </Grid>

                    {result.riskAnalysis && (
                      <Box mt={2}>
                        <Typography variant="subtitle2" fontWeight={700} gutterBottom>Risk Analysis</Typography>
                        <Alert severity={result.suitabilityScore > 0.7 ? 'success' : result.suitabilityScore > 0.4 ? 'warning' : 'error'}>
                          {result.riskAnalysis}
                        </Alert>
                      </Box>
                    )}

                    <Grid container spacing={2} mt={1}>
                      {result.recommendedCrops && result.recommendedCrops.length > 0 && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                            <Spa fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                            Recommended Crops
                          </Typography>
                          <Stack direction="row" flexWrap="wrap" gap={0.5}>
                            {result.recommendedCrops.map((c, i) => (
                              <Chip key={i} label={c} size="small" color="primary" variant="outlined" />
                            ))}
                          </Stack>
                        </Grid>
                      )}
                      {result.bestPractices && result.bestPractices.length > 0 && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                            <Lightbulb fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                            Best Practices
                          </Typography>
                          <ul style={{ margin: 0, paddingLeft: 20 }}>
                            {result.bestPractices.map((p, i) => (
                              <li key={i}><Typography variant="body2">{p}</Typography></li>
                            ))}
                          </ul>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            {!loading && !result && (
              <Card>
                <CardContent>
                  <EmptyState title="No Prediction Yet" description="Fill the form and click Predict to see results." icon={Assessment} />
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>

        {/* Prediction History */}
        <motion.div variants={itemVariants}>
          <Card sx={{ mt: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Prediction History</Typography>
              {historyLoading ? (
                <TableSkeleton rows={5} cols={5} />
              ) : history.length === 0 ? (
                <EmptyState title="No Predictions Yet" description="Your prediction history will appear here." />
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Crop</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Area (ha)</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Soil Type</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Est. Yield</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Est. Profit</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Suitability</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {history.map((item) => (
                        <TableRow key={item.id} hover>
                          <TableCell>{item.cropName}</TableCell>
                          <TableCell>{item.areaHectares}</TableCell>
                          <TableCell>{item.soilType}</TableCell>
                          <TableCell>{item.estimatedYield ?? '--'}</TableCell>
                          <TableCell>₹{item.estimatedProfit ?? '--'}</TableCell>
                          <TableCell>
                            {item.suitabilityScore != null
                              ? `${(item.suitabilityScore * 100).toFixed(0)}%`
                              : '--'}
                          </TableCell>
                          <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <TablePagination
                    component="div"
                    count={totalElements}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25]}
                  />
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </Box>
  );
}