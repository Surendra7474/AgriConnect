import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack,
  InputAdornment,
  TablePagination,
} from '@mui/material';
import { Search, Block, CheckCircle, Refresh } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { adminService } from '../../services/adminService';
import PageHeader from '../../components/PageHeader';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import { ROLES, STATUS_LABELS, STATUS_COLORS } from '../../constants';

const ROLE_OPTIONS = [
  { value: '', label: 'All Roles' },
  { value: ROLES.FARMER, label: 'Farmer' },
  { value: ROLES.WORKER, label: 'Worker' },
  { value: ROLES.EQUIPMENT_OWNER, label: 'Equipment Owner' },
  { value: ROLES.BUYER, label: 'Buyer' },
  { value: ROLES.ADMIN, label: 'Admin' },
];

export default function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: rowsPerPage };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter !== '') params.active = statusFilter;

      const res = await adminService.getUsers(params);
      setUsers(res.data.data?.content || []);
      setTotalElements(res.data.data?.totalElements || 0);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleActive = async (userId, currentActive) => {
    try {
      await adminService.updateUserStatus(userId, { active: !currentActive });
      toast.success(`User ${currentActive ? 'deactivated' : 'activated'} successfully`);
      fetchUsers();
    } catch {
      toast.error('Failed to update user status');
    }
  };

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      <PageHeader
        title="Users Management"
        subtitle="Manage all platform users"
        breadcrumbs={[
          { label: 'Home', path: '/dashboard' },
          { label: 'Admin', path: '/admin' },
          { label: 'Users' },
        ]}
        action={
          <Button variant="outlined" startIcon={<Refresh />} onClick={fetchUsers}>
            Refresh
          </Button>
        }
      />

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              placeholder="Search by name or email..."
              size="small"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              sx={{ minWidth: 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select
              label="Role"
              size="small"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(0);
              }}
              sx={{ minWidth: 180 }}
            >
              {ROLE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Status"
              size="small"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      {loading ? (
        <CardSkeleton count={6} />
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Phone</strong></TableCell>
                  <TableCell><strong>Role</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Verified</strong></TableCell>
                  <TableCell><strong>Joined</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Typography variant="body1" color="text.secondary">
                        No users found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {u.fullName}
                        </Typography>
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.phone || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={u.role?.replace('_', ' ')}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={u.active ? 'Active' : 'Inactive'}
                          size="small"
                          color={u.active ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={u.verified ? 'Verified' : 'Unverified'}
                          size="small"
                          color={u.verified ? 'info' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color={u.active ? 'error' : 'success'}
                          onClick={() => handleToggleActive(u.id, u.active)}
                          title={u.active ? 'Deactivate' : 'Activate'}
                        >
                          {u.active ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={totalElements}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </TableContainer>
        </motion.div>
      )}
    </Box>
  );
}
