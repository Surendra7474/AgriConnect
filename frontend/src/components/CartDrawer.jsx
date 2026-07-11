import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Drawer, Box, Typography, Stack, IconButton, Button, Divider,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress,
} from '@mui/material';
import { Close as CloseIcon, Delete as DeleteIcon, ShoppingCart } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useCart } from '../contexts/CartContext';
import { productOrderService } from '../services/productService';
import EmptyState from './EmptyState';

export default function CartDrawer({ open, onClose }) {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart, subtotal, totalItems } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [paymentProofUrl, setPaymentProofUrl] = useState('');
  const [paymentProofError, setPaymentProofError] = useState('');
  const [ordering, setOrdering] = useState(false);

  const handleCheckout = async () => {
    if (!address.trim()) {
      toast.error('Please enter a delivery address');
      return;
    }
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    // Basic URL validation for payment proof
    if (paymentProofUrl.trim() && !paymentProofUrl.trim().match(/^https?:\/\/.+/i)) {
      setPaymentProofError('Please enter a valid URL starting with http:// or https://');
      return;
    }
    setPaymentProofError('');
    setOrdering(true);
    try {
      // Place orders sequentially for each item
      for (const item of items) {
        await productOrderService.placeOrder({
          productId: item.product.id,
          quantity: item.quantity,
          deliveryAddress: address.trim(),
          paymentProofUrl: paymentProofUrl.trim() || undefined,
          notes: 'Order from cart checkout',
        });
      }
      toast.success('All orders placed successfully!');
      clearCart();
      setCheckoutOpen(false);
      onClose();
      navigate('/orders');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to place orders');
    } finally {
      setOrdering(false);
    }
  };

  return (
    <>
      <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 400 } } }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <ShoppingCart color="primary" />
            <Typography variant="h6" fontWeight={700}>Cart ({totalItems})</Typography>
          </Stack>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>
        <Divider />

        {items.length === 0 ? (
          <Box sx={{ mt: 4 }}>
            <EmptyState title="Your cart is empty" description="Browse the marketplace to add items to your cart." icon={<ShoppingCart sx={{ fontSize: 80 }} />} />
          </Box>
        ) : (
          <>
            <Box sx={{ flex: 1, overflow: 'auto', px: 2, py: 1 }}>
              <Stack spacing={2}>
                {items.map(({ product, quantity }) => (
                  <Box key={product.id} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600}>{product.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          ₹{product.pricePerUnit}/unit
                        </Typography>
                      </Box>
                      <IconButton size="small" color="error" onClick={() => removeItem(product.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1 }}>
                      <TextField
                        size="small"
                        type="number"
                        value={quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          if (val > Number(product.quantityAvailable)) {
                            toast.error(`Only ${product.quantityAvailable} available`);
                            return;
                          }
                          updateQuantity(product.id, val);
                        }}
                        inputProps={{ min: 1, max: Number(product.quantityAvailable) }}
                        sx={{ width: 80 }}
                      />
                      <Typography variant="body2" fontWeight={600}>
                        ₹{(Number(product.pricePerUnit) * quantity).toLocaleString()}
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>
            <Divider />
            <Box sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body1">Subtotal</Typography>
                  <Typography variant="h6" fontWeight={700}>₹{subtotal.toLocaleString()}</Typography>
                </Stack>
                <Button variant="contained" fullWidth size="large" onClick={() => setCheckoutOpen(true)}>
                  Proceed to Checkout
                </Button>
                <Button variant="outlined" fullWidth size="small" color="error" onClick={() => { clearCart(); toast.success('Cart cleared'); }}>
                  Clear Cart
                </Button>
              </Stack>
            </Box>
          </>
        )}
      </Drawer>

      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onClose={() => !ordering && setCheckoutOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Checkout</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2">You are ordering {totalItems} items from {items.length} products.</Typography>
            <Typography variant="h6" fontWeight={700}>Total: ₹{subtotal.toLocaleString()}</Typography>
            <TextField
              label="Delivery Address"
              fullWidth
              multiline
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              placeholder="Enter your delivery address"
            />
            <TextField
              label="Payment Proof Image URL"
              fullWidth
              multiline
              rows={2}
              value={paymentProofUrl}
              onChange={(e) => { setPaymentProofUrl(e.target.value); setPaymentProofError(''); }}
              error={!!paymentProofError}
              helperText={paymentProofError || 'Paste the URL of your payment screenshot (UPI/bank transfer proof)'}
              placeholder="https://example.com/payment-screenshot.jpg"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCheckoutOpen(false)} disabled={ordering}>Cancel</Button>
          <Button onClick={handleCheckout} variant="contained" disabled={ordering || !address.trim()}>
            {ordering ? <CircularProgress size={20} /> : 'Place Order'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
