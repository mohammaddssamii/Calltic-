// Cart.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Snackbar,
  Alert,
  IconButton,
  Divider,
  TextField,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  Collapse,
} from "@mui/material";
import { styled, keyframes } from "@mui/system";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import { motion } from "framer-motion";

// Slide transition for confirm dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// small pop (scale) animation for +/- buttons
const pop = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.12); }
  100% { transform: scale(1); }
`;

// Styled components
const ProductCard = styled(Card)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  alignItems: "center",
  borderRadius: 14,
  padding: theme.spacing(1.5),
  boxShadow: "0 8px 24px rgba(2,6,23,0.08)",
  transition: "transform 220ms ease, box-shadow 220ms ease",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 20px 40px rgba(2,6,23,0.12)",
  },
}));

const QtyButton = styled(IconButton)(({ theme }) => ({
  width: 36,
  height: 36,
  borderRadius: "50%",
  boxShadow: "0 6px 18px rgba(2,6,23,0.08)",
  transition: "transform 160ms ease",
  "&:active": {
    animation: `${pop} 260ms ease`,
  },
}));

const GradientTotalBox = styled(Box)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(2),
  background: "linear-gradient(135deg, rgba(38,166,154,0.12), rgba(3,169,244,0.08))",
  boxShadow: "inset 0 -6px 24px rgba(3,169,244,0.02)",
}));

const EmptyCard = styled(Card)(({ theme }) => ({
  textAlign: "center",
  padding: theme.spacing(6),
  borderRadius: 16,
  boxShadow: "0 12px 36px rgba(2,6,23,0.06)",
}));

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [fulfillment, setFulfillment] = useState("pickup"); // 'pickup' or 'delivery'
  const [pickupType, setPickupType] = useState("dine-in"); // 'dine-in' or 'takeaway'
  const [region, setRegion] = useState(""); // used if delivery
  const [deliveryAddress, setDeliveryAddress] = useState("");


  // Jordan governorates (manual list per request)
  const [regionsList] = useState([
    "Amman",
    "Irbid",
    "Zarqa",
    "Aqaba",
    "Mafraq",
    "Balqa",
    "Madaba",
    "Jerash",
    "Ajloun",
    "Karak",
    "Ma'an",
    "Tafilah",
  ]);

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackCfg, setSnackCfg] = useState({ severity: "success", message: "" });
  const [loading, setLoading] = useState(false);
  const [clearCartDialogOpen, setClearCartDialogOpen] = useState(false);


  const token = localStorage.getItem("token");

  // Fetch cart on mount
  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCart = async () => {
    if (!token) return;
    try {
      const res = await axios.get("http://127.0.0.1:5000/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Expecting res.data.items = [{ product: {...}, quantity }]
      setCartItems(res.data.items || []);
    } catch (err) {
      console.error("fetchCart:", err);
      showSnack("error", "Failed to load cart. Please try again.");
    }
  };

  // handy currency formatter
  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

  // memoized totals
  const subtotal = useMemo(
    () =>
      cartItems.reduce((s, it) => s + (it.product?.price || 0) * (it.quantity || 0), 0),
    [cartItems]
  );

  // Removed tax per request
  const tax = 0;

  // Per request: no delivery fee added to invoice. Keep deliveryFee 0.
  const deliveryFee = 0;

  const total = useMemo(() => +(subtotal + tax + deliveryFee).toFixed(2), [subtotal, tax, deliveryFee]);

  // update quantity on backend and local state
  const updateQuantity = async (productId, newQuantity) => {
    if (!token) {
      showSnack("error", "You must be logged in to modify the cart.");
      return;
    }
    if (newQuantity < 1) {
      // ask confirmation to remove
      handleRemoveConfirm(productId);
      return;
    }
    try {
      setLoading(true);
      await axios.put(
        `http://127.0.0.1:5000/api/cart/${productId}`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // optimistic update
      setCartItems((prev) =>
        prev.map((it) => (it.product._id === productId ? { ...it, quantity: newQuantity } : it))
      );
      showSnack("success", "Quantity updated.");
    } catch (err) {
      console.error("updateQuantity:", err);
      showSnack("error", "Failed to update quantity.");
    } finally {
      setLoading(false);
    }
  };

  // remove item with backend then refresh
  const removeFromCart = async (productId) => {
    if (!token) {
      showSnack("error", "You must be logged in to modify the cart.");
      return;
    }
    try {
      setLoading(true);
      await axios.delete(`http://127.0.0.1:5000/api/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems((prev) => prev.filter((it) => it.product._id !== productId));
      showSnack("info", "Item removed from cart.");
    } catch (err) {
      console.error("removeFromCart:", err);
      showSnack("error", "Failed to remove item.");
    } finally {
      setLoading(false);
      setConfirmDialogOpen(false);
    }
  };

  // show confirm remove dialog
  const handleRemoveConfirm = (productId) => {
    setConfirmDialogOpen(true);
    setToBeRemoved(productId);
  };

  // small piece of state to remember which product to remove
  const [toBeRemoved, setToBeRemoved] = useState(null);

  // show snackbar helper
  const showSnack = (severity, message) => {
    setSnackCfg({ severity, message });
    setSnackOpen(true);
  };

  // Place order: open confirmation dialog (with summary). Only send to backend when user CONFIRMS inside that dialog.
  const [orderPreviewOpen, setOrderPreviewOpen] = useState(false);

  const openOrderPreview = () => {
    // validate customer fields
    if (!customerName.trim() || !customerPhone.trim()) {
      showSnack("error", "Please enter customer name and phone before confirming.");
      return;
    }
    // simple phone validation: at least 10 digits (adjust as needed)
    const digits = customerPhone.replace(/\D/g, "");
    if (digits.length < 10) {
      showSnack("error", "Please enter a valid phone number.");
      return;
    }
    if (fulfillment === "delivery" && !region) {
      showSnack("error", "Please select a delivery region.");
      return;
    }
    if (fulfillment === "delivery" && !deliveryAddress.trim()) {
      showSnack("error", "Please enter a delivery address.");
      return;
    }
    if (cartItems.length === 0) {
      showSnack("error", "Your cart is empty.");
      return;
    }
    setOrderPreviewOpen(true);
  };

  const confirmPlaceOrder = async () => {
    if (!token) {
      showSnack("error", "You must be logged in to place an order.");
      setOrderPreviewOpen(false);
      return;
    }

    const payload = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryAddress: deliveryAddress.trim(),
      items: cartItems.map((it) => ({ productId: it.product._id, quantity: it.quantity })),
      notes: notes.trim(),
      fulfillment, // pickup or delivery
      pickupType: fulfillment === "pickup" ? pickupType : null,
      region: fulfillment === "delivery" ? region : null,
      subtotal,
      tax,
      deliveryFee, // zero in this implementation per request
      total,
    };

    try {
      setLoading(true);
      await axios.post("http://127.0.0.1:5000/api/orders", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // clear cart UI
      setCartItems([]);
      setOrderPreviewOpen(false);
      showSnack("success", "Your order has been placed. Please review details on the Orders page.");
      // optionally navigate to orders page or keep user here
      // window.location.href = "/orders"; // if you want to auto-redirect
    } catch (err) {
      console.error("confirmPlaceOrder:", err);
      showSnack("error", "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // render per-item subtotal text e.g. "$10 × 2 = $20"
  const lineText = (price, qty) => `${formatCurrency(price)} × ${qty} = ${formatCurrency(price * qty)}`;

  // component JSX
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "85vh" }}>
        <Typography variant="h4" align="center" sx={{ mb: 3, fontWeight: 700 }}>
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
            <ShoppingCartCheckoutIcon color="primary" />
            <span>Shopping Cart</span>
          </Stack>
        </Typography>

        <Grid container spacing={3}>
          {/* Left: Cart Items */}
          <Grid item xs={12} md={8}>
            {cartItems.length === 0 ? (
              <EmptyCard>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Your cart is empty
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  Add items from the menu to create your order.
                </Typography>
                {/* Removed Go Shopping button */}
              </EmptyCard>
            ) : (
              <Stack spacing={2}>
                {cartItems.map((it) => (
                  <Collapse key={it.product._id} in timeout={300}>
                    <ProductCard>
                      <CardMedia
                        component="img"
                        image={`http://127.0.0.1:5000/uploads/${it.product.image}`}
                        alt={it.product.name}
                        sx={{ width: 120, height: 90, borderRadius: 1, objectFit: "cover" }}
                      />
                      <CardContent sx={{ padding: 0, flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {it.product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {it.product.description || ""}
                        </Typography>

                        {/* Price line */}
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "primary.dark" }}>
                          {lineText(it.product.price, it.quantity)}
                        </Typography>
                        {/* 👇 TextField خاص بملاحظات المنتج */}
        <TextField
          label="Note"
          variant="outlined"
          size="small"
          fullWidth
          value={it.note || ""} // خزن note لكل منتج
          onChange={(e) => {
            const val = e.target.value;
            setCartItems((prev) =>
              prev.map((x) =>
                x.product._id === it.product._id ? { ...x, note: val } : x
              )
            );
          }}
          onBlur={async () => {
            try {
              await axios.put(
                `http://127.0.0.1:5000/api/cart/${it.product._id}/note`,
                { note: it.note || "" },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              fetchCart(); // رجع الكارت بعد التحديث
            } catch (err) {
              console.error("Error saving note:", err);
              showSnack("error", "Failed to save note.");
            }
          }}
          sx={{ mt: 1 }}
        />
    

                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1 }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <QtyButton
                              aria-label="decrease"
                              onClick={() => updateQuantity(it.product._id, it.quantity - 1)}
                              sx={{ bgcolor: "rgba(255,80,80,0.08)", color: "error.main" }}
                            >
                              <RemoveIcon />
                            </QtyButton>

                            <Chip label={it.quantity} color="default" />

                            <QtyButton
                              aria-label="increase"
                              onClick={() => updateQuantity(it.product._id, it.quantity + 1)}
                              sx={{ bgcolor: "rgba(56,179,124,0.08)", color: "success.main" }}
                            >
                              <AddIcon />
                            </QtyButton>
                          </Stack>

                          <Stack direction="row" spacing={1} alignItems="center">
                            <Tooltip title="Remove item">
                              <IconButton
                                color="error"
                                onClick={() => {
                                  setToBeRemoved(it.product._id);
                                  setConfirmDialogOpen(true);
                                }}
                              >
                                <DeleteOutlineIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Box>
                      </CardContent>
                    </ProductCard>
                  </Collapse>
                ))}
              </Stack>
            )}
          </Grid>

          {/* Right: Order Summary & Customer Info */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 2, borderRadius: 2, boxShadow: "0 12px 36px rgba(2,6,23,0.06)" }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Order Summary
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography color="text.secondary">Subtotal</Typography>
                <Typography>{formatCurrency(subtotal)}</Typography>
              </Box>
              {/* Removed Tax display */}
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography color="text.secondary">Delivery</Typography>
                <Typography>{deliveryFee ? formatCurrency(deliveryFee) : "—"}</Typography>
              </Box>

              <GradientTotalBox sx={{ mt: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Total
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {formatCurrency(total)}
                  </Typography>
                </Box>
              </GradientTotalBox>

              <Divider sx={{ my: 2 }} />

              {/* Fulfillment options */}
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Fulfillment
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Button
                  variant={fulfillment === "pickup" ? "contained" : "outlined"}
                  startIcon={<CheckCircleOutlineIcon />}
                  onClick={() => setFulfillment("pickup")}
                  fullWidth
                  size="small"
                >
                  Pickup
                </Button>
                <Button
                  variant={fulfillment === "delivery" ? "contained" : "outlined"}
                  startIcon={<LocalShippingIcon />}
                  onClick={() => setFulfillment("delivery")}
                  fullWidth
                  size="small"
                >
                  Delivery
                </Button>
              </Stack>

              {fulfillment === "pickup" && (
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel id="pickup-type-label">Pickup Type</InputLabel>
                  <Select
                    labelId="pickup-type-label"
                    value={pickupType}
                    label="Pickup Type"
                    onChange={(e) => setPickupType(e.target.value)}
                  >
                    <MenuItem value="dine-in">Dine In</MenuItem>
                    <MenuItem value="takeaway">Takeaway</MenuItem>
                  </Select>
                </FormControl>
              )}

              {fulfillment === "delivery" && (
                <>
                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel id="region-label">Delivery Governorate</InputLabel>
                    <Select
                      labelId="region-label"
                      value={region}
                      label="Delivery Governorate"
                      onChange={(e) => setRegion(e.target.value)}
                    >
                      {regionsList.map((r) => (
                        <MenuItem key={r} value={r}>
                          {r}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    label="Exact address (enter full location)"
                    fullWidth
                    size="small"
                    sx={{ mb: 2 }}
                    placeholder="Street, building, floor, any landmark..."
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    // note: per request the exact address is entered on the cart page manually — you can bind it to state if you want it saved.
                  />
                  <Typography variant="caption" color="text.secondary">
                    * Delivery cost is handled separately and is not included in the total.
                  </Typography>
                              
                </>
              )}

              {/* Customer info */}
              <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
                Customer Info
              </Typography>
              <TextField
                label="Full name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                fullWidth
                size="small"
                sx={{ mb: 1 }}
                required
              />
              <TextField
                label="Phone number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                fullWidth
                size="small"
                sx={{ mb: 1 }}
                required
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              />

              <TextField
                label="Order notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
                size="small"
                multiline
                rows={2}
                sx={{ mb: 1 }}
              />

              <Button
                variant="contained"
                color="primary"
                startIcon={<ShoppingCartCheckoutIcon />}
                fullWidth
                onClick={openOrderPreview}
                disabled={cartItems.length === 0 || loading}
              >
                Confirm Order
              </Button>
              <Button
  variant="outlined"
  color="error"
  fullWidth
  startIcon={<DeleteOutlineIcon />}
  sx={{ mt: 1 }} // أو mb:1 حسب التصميم
  onClick={() => setClearCartDialogOpen(true)}
  disabled={cartItems.length === 0} // optional: تعطيله إذا الكارت فاضي
>
  Clear Cart
</Button>


              {/* Removed Continue Shopping button */}
            </Card>
          </Grid>
        </Grid>

        {/* Confirm Removal Dialog */}
        <Dialog
          open={confirmDialogOpen}
          onClose={() => {
            setConfirmDialogOpen(false);
            setToBeRemoved(null);
          }}
          TransitionComponent={Transition}
        >
          <DialogTitle sx={{ bgcolor: "error.main", color: "white" }}>Confirm Removal</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to remove this item from the cart?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => removeFromCart(toBeRemoved)}
              startIcon={<DeleteOutlineIcon />}
            >
              Remove
            </Button>
          </DialogActions>
        </Dialog>

        {/* Order Preview / Confirmation Dialog */}
        <Dialog
          open={orderPreviewOpen}
          onClose={() => setOrderPreviewOpen(false)}
          fullWidth
          maxWidth="sm"
          TransitionComponent={Transition}
        >
          <DialogTitle>Review & Confirm Your Order</DialogTitle>
          <DialogContent dividers>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              {fulfillment === "delivery"
                ? `Delivery · ${region || "Region not specified"}`
                : `Pickup · ${pickupType === "dine-in" ? "Dine In" : "Takeaway"}`}
            </Typography>

          <Stack spacing={1} sx={{ mb: 2 }}>
  {cartItems.map((it) => (
    <Box key={it.product._id} sx={{ display: "flex", flexDirection: "column", mb: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography>
          {it.product.name} × {it.quantity}
        </Typography>
        <Typography>{formatCurrency(it.product.price * it.quantity)}</Typography>
      </Box>
      {/* 👇 عرض النوت إذا موجود */}
      {it.note && (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", ml: 1 }}>
          Note: {it.note}
        </Typography>
      )}
    </Box>
  ))}
</Stack>


            <Divider sx={{ my: 1 }} />

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography color="text.secondary">Subtotal</Typography>
              <Typography>{formatCurrency(subtotal)}</Typography>
            </Box>
            {/* Removed Tax display */}
            {deliveryFee > 0 && (
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography color="text.secondary">Delivery</Typography>
                <Typography>{formatCurrency(deliveryFee)}</Typography>
              </Box>
            )}

            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6">{formatCurrency(total)}</Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2">Customer</Typography>
            <Typography>
              {customerName} · {customerPhone}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Fulfillment: {fulfillment === "delivery" ? `Delivery (${region || "—"})` : `Pickup (${pickupType})`}
            </Typography>

            {notes && (
              <>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2">Notes</Typography>
                <Typography color="text.secondary">{notes}</Typography>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOrderPreviewOpen(false)}>Edit</Button>
            <Button
              variant="contained"
              color="primary"
              onClick={confirmPlaceOrder}
              startIcon={<CheckCircleOutlineIcon />}
              disabled={loading || !customerName.trim() || !customerPhone.trim()}
            >
              Place Order
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar (customized Alert bar) */}
        <Snackbar
          open={snackOpen}
          autoHideDuration={4500}
          onClose={() => setSnackOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackOpen(false)}
            severity={snackCfg.severity}
            sx={{ width: "100%", boxShadow: 6, borderRadius: 2 }}
            iconMapping={{
              success: <CheckCircleOutlineIcon />,
              error: <CloseIcon />,
              info: <ShoppingCartCheckoutIcon />,
            }}
          >
            {snackCfg.message}
          </Alert>
        </Snackbar>
        {/* Clear Cart Confirmation Dialog */}
        <Dialog
  open={clearCartDialogOpen}
  onClose={() => setClearCartDialogOpen(false)}
  TransitionComponent={Transition}
>
  <DialogTitle sx={{ bgcolor: "error.main", color: "white" }}>Clear Cart</DialogTitle>
  <DialogContent>
    <Typography>
      Are you sure you want to remove all items from your cart? This action cannot be undone.
    </Typography>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setClearCartDialogOpen(false)}>Cancel</Button>
    <Button
      variant="contained"
      color="error"
      startIcon={<DeleteOutlineIcon />}
      onClick={async () => {
        try {
          setLoading(true);
          await axios.delete("http://127.0.0.1:5000/api/cart", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCartItems([]);
          showSnack("info", "All items have been removed from your cart.");
        } catch (err) {
          console.error("clearCart:", err);
          showSnack("error", "Failed to clear cart. Please try again.");
        } finally {
          setLoading(false);
          setClearCartDialogOpen(false);
        }
      }}
    >
      Clear All
    </Button>
  </DialogActions>
</Dialog>

      </Box>
    </motion.div>
  );
}
