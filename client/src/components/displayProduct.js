import React, { useEffect, useState } from "react";
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
  Drawer,
  IconButton,
  Divider,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide,
  Collapse,
} from "@mui/material";
import { styled, keyframes } from "@mui/system";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

// Slide Transition for Dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Shake animation for Dialog
const shake = keyframes`
  0% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-8px); }
  80% { transform: translateX(8px); }
  100% { transform: translateX(0); }
`;

// Neon Glow animations for different categories
const neonColors = {
  Appetizers: "#0ff",
  Drinks: "#0f0",
  Desserts: "#ff00ff",
  Others: "#ff4500",
};

const neonGlow = (color) => keyframes`
  0% { box-shadow: 0 0 5px ${color}, 0 0 10px ${color}; }
  50% { box-shadow: 0 0 15px ${color}, 0 0 30px ${color}; }
  100% { box-shadow: 0 0 5px ${color}, 0 0 10px ${color}; }
`;

// Styled Components
const StyledCard = styled(Card)(({ theme, glowColor }) => ({
  transition: "transform 0.3s, box-shadow 0.3s",
  borderRadius: 16,
  display: "flex",
  flexDirection: "column",
  "&:hover": {
    transform: "translateY(-5px)",
    animation: `${neonGlow(glowColor)} 1.5s infinite`,
  },
}));

const StyledButton = styled(Button)({
  marginTop: "10px",
  borderRadius: 8,
  fontWeight: "bold",
});

const DisplayProduct = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [products, setProducts] = useState({}); // grouped by category
  const [cart, setCart] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [snackSeverity, setSnackSeverity] = useState("success");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [productToRemove, setProductToRemove] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:5000/api/restaurants");
        setRestaurants(res.data);
      } catch (err) {
        console.error("Error fetching restaurants:", err);
      }
    };
    fetchRestaurants();
  }, []);

  const fetchProducts = async (restaurantId) => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:5000/api/products/restaurant/${restaurantId}`
      );
      const grouped = {};
      res.data.forEach((product) => {
        const categoryName = product.category?.name || "Others";
        if (!grouped[categoryName]) grouped[categoryName] = [];
        grouped[categoryName].push(product);
      });
      setProducts(grouped);
      setSelectedRestaurant(
        restaurants.find((r) => r._id === restaurantId) || null
      );
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const fetchCart = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data.items || []);
    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      await axios.post(
        "http://127.0.0.1:5000/api/cart",
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSnackMessage("Cart updated!");
      setSnackSeverity("success");
      setSnackOpen(true);
      fetchCart();
    } catch (err) {
      console.error("Error adding to cart:", err);
      setSnackMessage("Failed to update cart.");
      setSnackSeverity("error");
      setSnackOpen(true);
    }
  };

  const updateQuantity = async (productId, newQty) => {
    if (newQty <= 0) {
      setProductToRemove(productId);
      setConfirmDialogOpen(true);
      return;
    }
    try {
      await axios.put(
        `http://127.0.0.1:5000/api/cart/${productId}`,
        { quantity: newQty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCart();
    } catch (err) {
      console.error("Error updating quantity:", err);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/api/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackMessage("Item removed from cart!");
      setSnackSeverity("info");
      setSnackOpen(true);
      fetchCart();
    } catch (err) {
      console.error("Error removing from cart:", err);
      setSnackMessage("Failed to remove item.");
      setSnackSeverity("error");
      setSnackOpen(true);
    }
    setConfirmDialogOpen(false);
    setProductToRemove(null);
  };

  // تم تعديل هذه الدالة لتوجيه المستخدم لصفحة الكارت فقط
  const handleConfirmCart = () => {
    setSnackMessage(
      "✅ Your cart has been saved successfully! Please review your order in the Cart page before final confirmation."
    );
    setSnackSeverity("info"); // رسالة info احترافية
    setSnackOpen(true);
  };

  const handleSnackClose = () => setSnackOpen(false);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography
        variant="h4"
        sx={{ marginBottom: 3, fontWeight: "bold", textAlign: "center" }}
      >
        {selectedRestaurant
          ? `${selectedRestaurant.name} - Menu`
          : "Choose a Restaurant"}
      </Typography>

      {/* عرض المطاعم */}
      {!selectedRestaurant && (
        <Grid container spacing={4}>
          {restaurants.map((rest) => (
            <Grid item key={rest._id} xs={12} sm={6} md={4} lg={3}>
              <StyledCard glowColor="#0ff" onClick={() => fetchProducts(rest._id)}>
                <CardMedia
                  component="img"
                  height="200"
                  image={`http://127.0.0.1:5000/uploads/${rest.image}`}
                  alt={rest.name}
                  sx={{ objectFit: "cover" }}
                />
                <CardContent>
                  <Typography variant="h6">{rest.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {rest.address}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {rest.phoneNumber}
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      )}

      {/* عرض المنتجات حسب الكاتيجوري */}
      {selectedRestaurant && (
        <>
          <Button
            variant="outlined"
            sx={{ mb: 2 }}
            onClick={() => setSelectedRestaurant(null)}
          >
            Back to Restaurants
          </Button>

          {Object.entries(products).map(([category, items]) => (
            <Box key={category} sx={{ mb: 5 }}>
              <Typography
                variant="h5"
                sx={{
                  mb: 2,
                  fontWeight: "bold",
                  borderBottom: "2px solid #1976d2",
                  display: "inline-block",
                }}
              >
                {category}
              </Typography>
              <Grid container spacing={4}>
                {items.map((product, index) => (
                  <Grid item key={product._id} xs={12} sm={6} md={4} lg={3}>
                    <Collapse in={true} timeout={400 + index * 100}>
                      <StyledCard glowColor={neonColors[category] || "#ff4500"}>
                        <CardMedia
                          component="img"
                          height="200"
                          image={`http://127.0.0.1:5000/uploads/${product.image}`}
                          alt={product.name}
                          sx={{ objectFit: "cover" }}
                        />
                        <CardContent>
                          <Typography variant="h6">{product.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {product.description}
                          </Typography>
                          <Typography variant="subtitle1" fontWeight="bold">
                            ${product.price}
                          </Typography>
                          <StyledButton
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={() => addToCart(product._id)}
                          >
                            Add to Cart
                          </StyledButton>
                        </CardContent>
                      </StyledCard>
                    </Collapse>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </>
      )}

      {/* أيقونة Cart */}
      <IconButton
        onClick={() => {
          fetchCart();
          setDrawerOpen(true);
        }}
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          backgroundColor: "primary.main",
          color: "white",
          "&:hover": { backgroundColor: "primary.dark" },
        }}
      >
        <Badge
          badgeContent={cart.reduce((acc, item) => acc + item.quantity, 0)}
          color="error"
        >
          <ShoppingCartIcon />
        </Badge>
      </IconButton>

      {/* Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 350, p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Your Cart</Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ my: 2 }} />
          {cart.length === 0 ? (
            <Typography>No items in cart</Typography>
          ) : (
            cart.map((item) => (
              <Box
                key={item.product._id}
                display="flex"
                flexDirection="column"
                sx={{
                  mb: 2,
                  p: 1,
                  borderRadius: 2,
                  border: "1px solid #eee",
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1">{item.product.name}</Typography>
                  <Typography variant="subtitle1">
                    ${item.product.price * item.quantity}
                  </Typography>
                </Box>

                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mt={1}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <IconButton
                      size="small"
                      sx={{
                        bgcolor: "error.light",
                        color: "white",
                        "&:hover": { bgcolor: "error.main" },
                      }}
                      onClick={() =>
                        updateQuantity(item.product._id, item.quantity - 1)
                      }
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <Typography>{item.quantity}</Typography>
                    <IconButton
                      size="small"
                      sx={{
                        bgcolor: "success.light",
                        color: "white",
                        "&:hover": { bgcolor: "success.main" },
                      }}
                      onClick={() =>
                        updateQuantity(item.product._id, item.quantity + 1)
                      }
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => {
                      setProductToRemove(item.product._id);
                      setConfirmDialogOpen(true);
                    }}
                  >
                    Remove
                  </Button>
                </Box>
              </Box>
            ))
          )}
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6">
            Total: $
            {cart.reduce(
              (acc, item) => acc + item.product.price * item.quantity,
              0
            )}
          </Typography>
          {/* زر Confirm Order الجديد */}
          <StyledButton
            variant="contained"
            color="success"
            fullWidth
            sx={{ mt: 2 }}
            onClick={handleConfirmCart} // تم التغيير
          >
            Confirm Order
          </StyledButton>
        </Box>
      </Drawer>

      {/* Animated Confirm Dialog */}
      <Dialog
        open={confirmDialogOpen}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => setConfirmDialogOpen(false)}
        sx={{
          "& .MuiDialog-paper": {
            animation: confirmDialogOpen ? `${shake} 0.5s` : "none",
          },
        }}
      >
        <DialogTitle sx={{ bgcolor: "#f44336", color: "white" }}>
          Confirm Removal
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove this item from your cart?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setConfirmDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => removeFromCart(productToRemove)}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={4000}
        onClose={handleSnackClose}
      >
        <Alert
          onClose={handleSnackClose}
          severity={snackSeverity}
          sx={{ width: "100%" }}
        >
          {snackMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DisplayProduct;
